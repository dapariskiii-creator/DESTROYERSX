const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const app = express();

// =========================
// KONFIGURASI SERVER
// =========================

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// =========================
// KONEKSI MYSQL
// =========================

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "destroyersx",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// =========================
// TEST DATABASE
// =========================

async function testDatabase() {
    try {
        const connection = await db.getConnection();

        console.log("=================================");
        console.log("MYSQL BERHASIL TERHUBUNG");
        console.log("Database : destroyersx");
        console.log("=================================");

        connection.release();
    } catch (error) {
        console.error("=================================");
        console.error("MYSQL GAGAL TERHUBUNG");
        console.error(error.message);
        console.error("=================================");
    }
}

// =========================
// HALAMAN TEST SERVER
// =========================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "DESTROYERSX API ONLINE"
    });
});

// =========================
// GET SETTINGS
// =========================

app.get("/api/settings", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM settings WHERE id = 1 LIMIT 1"
        );

        if (rows.length === 0) {
            return res.json({
                success: true,
                settings: {
                    price: 140000,
                    whatsappNumber: "",
                    mockupImage: ""
                }
            });
        }

        const settings = rows[0];

        res.json({
            success: true,
            settings: {
                price: settings.price,
                whatsappNumber: "",
                mockupImage: settings.mockup_image || ""
            }
        });

    } catch (error) {
        console.error("GET SETTINGS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil pengaturan"
        });
    }
});

// =========================
// UPDATE SETTINGS
// =========================

app.put("/api/settings", async (req, res) => {
    try {
        const {
            price,
            mockupImage
        } = req.body;

        console.log("UPDATE SETTINGS REQUEST:");
        console.log("Harga:", price);
        console.log("Ada foto:", !!mockupImage);

        if (!price || Number(price) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Harga tidak valid"
            });
        }

        await db.query(
            `
            INSERT INTO settings
                (id, price, whatsapp_number, mockup_image)
            VALUES
                (1, ?, '', ?)
            ON DUPLICATE KEY UPDATE
                price = VALUES(price),
                whatsapp_number = '',
                mockup_image = VALUES(mockup_image)
            `,
            [
                Number(price),
                mockupImage || null
            ]
        );

        console.log("PENGATURAN BERHASIL DISIMPAN");

        res.json({
            success: true,
            message: "Pengaturan berhasil disimpan"
        });

    } catch (error) {
        console.error("UPDATE SETTINGS ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// =========================
// GET SEMUA PESANAN
// =========================

app.get("/api/orders", async (req, res) => {
    try {
        const [rows] = await db.query(
            `
            SELECT
                id,
                name,
                address,
                buyer_whatsapp,
                size,
                quantity,
                total,
                created_at
            FROM orders
            ORDER BY created_at DESC
            `
        );

        res.json({
            success: true,
            orders: rows
        });

    } catch (error) {
        console.error("GET ORDERS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil data pesanan"
        });
    }
});

// =========================
// TAMBAH PESANAN
// =========================

app.post("/api/orders", async (req, res) => {
    try {
        const {
            name,
            address,
            buyerWhatsapp,
            size,
            quantity,
            total
        } = req.body;

        if (!name || !address || !size || !quantity || !total) {
            return res.status(400).json({
                success: false,
                message: "Data pesanan belum lengkap"
            });
        }

        const qty = Number(quantity);
        const orderTotal = Number(total);

        if (qty <= 0 || orderTotal <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity atau total tidak valid"
            });
        }

        const [result] = await db.query(
            `
            INSERT INTO orders
                (
                    name,
                    address,
                    buyer_whatsapp,
                    size,
                    quantity,
                    total
                )
            VALUES
                (?, ?, ?, ?, ?, ?)
            `,
            [
                name.trim(),
                address.trim(),
                buyerWhatsapp ? buyerWhatsapp.trim() : null,
                size.trim(),
                qty,
                orderTotal
            ]
        );

        res.status(201).json({
            success: true,
            message: "Pesanan berhasil disimpan",
            orderId: result.insertId
        });

    } catch (error) {
        console.error("CREATE ORDER ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Gagal menyimpan pesanan"
        });
    }
});

// =========================
// HAPUS SEMUA PESANAN
// =========================

app.delete("/api/orders", async (req, res) => {
    try {
        await db.query("DELETE FROM orders");

        res.json({
            success: true,
            message: "Semua pesanan berhasil dihapus"
        });

    } catch (error) {
        console.error("DELETE ORDERS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Gagal menghapus semua pesanan"
        });
    }
});

// =========================
// ERROR HANDLER
// =========================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API tidak ditemukan"
    });
});

// =========================
// JALANKAN SERVER
// =========================

app.listen(PORT, "0.0.0.0", async () => {
    console.log("=================================");
    console.log("DESTROYERSX SERVER");
    console.log(`PORT : ${PORT}`);
    console.log(`URL  : http://localhost:${PORT}`);
    console.log("=================================");

    await testDatabase();
});