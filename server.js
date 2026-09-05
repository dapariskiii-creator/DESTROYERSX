
const express = require("express");
const { Pool } = require("pg");
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
// KONEKSI NEON POSTGRESQL
// =========================

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// =========================
// TEST DATABASE
// =========================

async function testDatabase() {
    try {
        const connection = await db.connect();

        console.log("=================================");
        console.log("NEON BERHASIL TERHUBUNG");
        console.log("Database : Neon PostgreSQL");
        console.log("=================================");

        connection.release();
    } catch (error) {
        console.error("=================================");
        console.error("NEON GAGAL TERHUBUNG");
        console.error(error.message);
        console.error("=================================");
    }
}

// =========================
// HALAMAN TEST SERVER
// =========================

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// =========================
// GET SETTINGS
// =========================

app.get("/api/settings", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM settings WHERE id = 1 LIMIT 1"
        );

        if (result.rows.length === 0) {
            return res.json({
                success: true,
                settings: {
                    price: 140000,
                    whatsappNumber: "6282142787154",
                    mockupImage: ""
                }
            });
        }

        const settings = result.rows[0];

        res.json({
            success: true,
            settings: {
                price: settings.price,
                whatsappNumber: settings.whatsapp_number,
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
            whatsappNumber,
            mockupImage
        } = req.body;

        if (!price || Number(price) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Harga tidak valid"
            });
        }

        if (!whatsappNumber) {
            return res.status(400).json({
                success: false,
                message: "Nomor WhatsApp wajib diisi"
            });
        }

        await db.query(
            `
            INSERT INTO settings
                (id, price, whatsapp_number, mockup_image)
            VALUES
                (1, $1, $2, $3)
            ON CONFLICT (id)
            DO UPDATE SET
                price = EXCLUDED.price,
                whatsapp_number = EXCLUDED.whatsapp_number,
                mockup_image = EXCLUDED.mockup_image
            `,
            [
                Number(price),
                whatsappNumber.trim(),
                mockupImage || null
            ]
        );

        res.json({
            success: true,
            message: "Pengaturan berhasil disimpan"
        });

    } catch (error) {
        console.error("UPDATE SETTINGS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Gagal menyimpan pengaturan"
        });
    }
});

// =========================
// GET SEMUA PESANAN
// =========================

app.get("/api/orders", async (req, res) => {
    try {
        const result = await db.query(
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
            orders: result.rows
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

        const result = await db.query(
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
                ($1, $2, $3, $4, $5, $6)
            RETURNING id
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
            orderId: result.rows[0].id
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

