
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

// =========================
// MIDDLEWARE
// =========================

app.use(cors());

app.use(
    express.json({
        limit: "15mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "15mb"
    })
);

// File website ada di folder public
app.use(
    express.static(
        __dirname + "/public"
    )
);

// =========================
// DATABASE NEON
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

        const connection =
            await db.connect();

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
// HALAMAN UTAMA
// =========================

app.get("/", (req, res) => {

    res.sendFile(
        __dirname + "/public/index.html"
    );

});

// =========================
// ADMIN PAGE
// =========================

app.get("/admin", (req, res) => {

    res.sendFile(
        __dirname + "/public/admin.html"
    );

});

// =========================
// GET SETTINGS
// =========================

app.get("/api/settings", async (req, res) => {

    try {

        const result =
            await db.query(
                `
                SELECT
                    id,
                    price,
                    whatsapp_number,
                    mockup_image,
                    updated_at
                FROM settings
                WHERE id = 1
                LIMIT 1
                `
            );

        // Kalau settings belum ada
        if (result.rows.length === 0) {

            return res.json({

                success: true,

                settings: {

                    price: 140000,

                    whatsappNumber: "",

                    mockupImage: ""

                }

            });

        }

        const settings =
            result.rows[0];

        res.json({

            success: true,

            settings: {

                price:
                    settings.price,

                whatsappNumber:
                    settings.whatsapp_number || "",

                mockupImage:
                    settings.mockup_image || ""

            }

        });

    } catch (error) {

        console.error(
            "GET SETTINGS ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Gagal mengambil pengaturan"

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

        // =========================
        // VALIDASI HARGA
        // =========================

        if (
            !price ||
            Number(price) <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Harga tidak valid"

            });

        }

        // =========================
        // VALIDASI FOTO
        // =========================

        let imageData =
            mockupImage || null;

        /*
        Jika ada gambar Base64,
        pastikan masih dalam batas aman.
        */

        if (
            imageData &&
            typeof imageData === "string"
        ) {

            const maxImageSize =
                12 * 1024 * 1024;

            if (
                imageData.length >
                maxImageSize
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Ukuran foto terlalu besar setelah dikompres"

                });

            }

        }

        // =========================
        // SIMPAN DATABASE
        // =========================

        await db.query(
            `
            INSERT INTO settings
                (
                    id,
                    price,
                    whatsapp_number,
                    mockup_image
                )
            VALUES
                (
                    1,
                    $1,
                    $2,
                    $3
                )
            ON CONFLICT (id)
            DO UPDATE SET

                price =
                    EXCLUDED.price,

                whatsapp_number =
                    EXCLUDED.whatsapp_number,

                mockup_image =
                    EXCLUDED.mockup_image,

                updated_at =
                    CURRENT_TIMESTAMP
            `,
            [

                Number(price),

                whatsappNumber
                    ? String(
                        whatsappNumber
                    ).trim()
                    : "",

                imageData

            ]
        );

        console.log(
            "SETTINGS BERHASIL DISIMPAN"
        );

        res.json({

            success: true,

            message:
                "Pengaturan berhasil disimpan"

        });

    } catch (error) {

        console.error(
            "UPDATE SETTINGS ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Gagal menyimpan pengaturan"

        });

    }

});

// =========================
// GET SEMUA PESANAN
// =========================

app.get("/api/orders", async (req, res) => {

    try {

        const result =
            await db.query(
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
                ORDER BY
                    created_at DESC
                `
            );

        res.json({

            success: true,

            orders:
                result.rows

        });

    } catch (error) {

        console.error(
            "GET ORDERS ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Gagal mengambil data pesanan"

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

        // =========================
        // VALIDASI
        // =========================

        if (
            !name ||
            !address ||
            !size ||
            !quantity ||
            !total
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Data pesanan belum lengkap"

            });

        }

        const qty =
            Number(quantity);

        const orderTotal =
            Number(total);

        if (
            qty <= 0 ||
            orderTotal <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Quantity atau total tidak valid"

            });

        }

        // =========================
        // SIMPAN ORDER
        // =========================

        const result =
            await db.query(
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
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6
                    )
                RETURNING id
                `,
                [

                    String(name).trim(),

                    String(address).trim(),

                    buyerWhatsapp
                        ? String(
                            buyerWhatsapp
                        ).trim()
                        : null,

                    String(size).trim(),

                    qty,

                    orderTotal

                ]
            );

        console.log(
            "ORDER BERHASIL DISIMPAN:",
            result.rows[0].id
        );

        res.status(201).json({

            success: true,

            message:
                "Pesanan berhasil disimpan",

            orderId:
                result.rows[0].id

        });

    } catch (error) {

        console.error(
            "CREATE ORDER ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Gagal menyimpan pesanan"

        });

    }

});

// =========================
// HAPUS SEMUA PESANAN
// =========================

app.delete("/api/orders", async (req, res) => {

    try {

        await db.query(
            "DELETE FROM orders"
        );

        res.json({

            success: true,

            message:
                "Semua pesanan berhasil dihapus"

        });

    } catch (error) {

        console.error(
            "DELETE ORDERS ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Gagal menghapus semua pesanan"

        });

    }

});

// =========================
// API 404
// =========================

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API tidak ditemukan"

        });

    }
);

// =========================
// WEBSITE 404
// =========================

app.use(
    (req, res) => {

        res.status(404).send(
            "Halaman tidak ditemukan"
        );

    }
);

// =========================
// START SERVER
// =========================

app.listen(
    PORT,
    "0.0.0.0",
    async () => {

        console.log(
            "================================="
        );

        console.log(
            "DESTROYERSX SERVER"
        );

        console.log(
            `PORT : ${PORT}`
        );

        console.log(
            `URL  : http://localhost:${PORT}`
        );

        console.log(
            "================================="
        );

        await testDatabase();

    }
);

