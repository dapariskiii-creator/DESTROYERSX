
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

// ======================================================
// KONFIGURASI ADMIN
// ======================================================

const ADMIN_USERNAME =
    process.env.ADMIN_USERNAME || "destroyersx";

const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD || "abeeyazid";

const ADMIN_SESSION_SECRET =
    process.env.ADMIN_SESSION_SECRET ||
    "DESTROYERSX_SECRET_2026_SUPER_AMAN_987654321";

const ADMIN_COOKIE_NAME = "admin_token";

const ADMIN_SESSION_MAX_AGE =
    8 * 60 * 60;

// ======================================================
// MIDDLEWARE
// ======================================================

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

// ======================================================
// STATIC WEBSITE
// ======================================================

app.use(
    express.static(
        __dirname + "/public"
    )
);

// ======================================================
// DATABASE NEON
// ======================================================

const db = new Pool({
    connectionString:
        process.env.DATABASE_URL,

    ssl: {
        rejectUnauthorized: false
    },

    max: 5,

    idleTimeoutMillis: 30000,

    connectionTimeoutMillis: 10000
});

// ======================================================
// HANDLE DATABASE ERROR
// ======================================================

db.on("error", (error) => {

    console.error(
        "DATABASE POOL ERROR:",
        error.message
    );

});

// ======================================================
// TEST DATABASE
// ======================================================

async function testDatabase() {

    try {

        const result =
            await db.query(
                "SELECT NOW() AS waktu"
            );

        console.log(
            "================================="
        );

        console.log(
            "NEON BERHASIL TERHUBUNG"
        );

        console.log(
            "Database : Neon PostgreSQL"
        );

        console.log(
            "Waktu DB :",
            result.rows[0].waktu
        );

        console.log(
            "================================="
        );

    } catch (error) {

        console.error(
            "================================="
        );

        console.error(
            "NEON GAGAL TERHUBUNG"
        );

        console.error(
            error.message
        );

        console.error(
            "================================="
        );

    }

}

// ======================================================
// COOKIE HELPER
// ======================================================

function parseCookies(req) {

    const cookies = {};

    const header =
        req.headers.cookie;

    if (!header) {
        return cookies;
    }

    header
        .split(";")
        .forEach((cookie) => {

            const index =
                cookie.indexOf("=");

            if (index === -1) {
                return;
            }

            const key =
                cookie
                    .slice(0, index)
                    .trim();

            const value =
                cookie
                    .slice(index + 1)
                    .trim();

            cookies[key] =
                decodeURIComponent(value);

        });

    return cookies;

}

// ======================================================
// BUAT TOKEN ADMIN
// ======================================================

function createAdminToken() {

    const timestamp =
        Math.floor(
            Date.now() / 1000
        );

    const data =
        `admin:${timestamp}`;

    const signature =
        crypto
            .createHmac(
                "sha256",
                ADMIN_SESSION_SECRET
            )
            .update(data)
            .digest("hex");

    return `${data}:${signature}`;

}

// ======================================================
// CEK TOKEN ADMIN
// ======================================================

function verifyAdminToken(token) {

    if (!token) {
        return false;
    }

    const parts =
        token.split(":");

    if (parts.length !== 3) {
        return false;
    }

    const role =
        parts[0];

    const timestamp =
        Number(parts[1]);

    const signature =
        parts[2];

    if (
        role !== "admin" ||
        !timestamp ||
        !signature
    ) {
        return false;
    }

    const now =
        Math.floor(
            Date.now() / 1000
        );

    if (
        now - timestamp >
        ADMIN_SESSION_MAX_AGE
    ) {
        return false;
    }

    if (
        timestamp > now + 60
    ) {
        return false;
    }

    const data =
        `admin:${timestamp}`;

    const expectedSignature =
        crypto
            .createHmac(
                "sha256",
                ADMIN_SESSION_SECRET
            )
            .update(data)
            .digest("hex");

    try {

        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );

    } catch {

        return false;

    }

}

// ======================================================
// MIDDLEWARE PROTEKSI ADMIN
// ======================================================

function requireAdmin(req, res, next) {

    const cookies =
        parseCookies(req);

    const token =
        cookies[ADMIN_COOKIE_NAME];

    if (
        !verifyAdminToken(token)
    ) {

        return res.status(401).json({

            success: false,

            message:
                "Akses admin diperlukan."

        });

    }

    next();

}

// ======================================================
// LOGIN ADMIN
// ======================================================

app.post(
    "/api/login",
    (req, res) => {

        try {

            const {
                username,
                password
            } = req.body;

            if (
                !username ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Username dan password wajib diisi."

                });

            }

            const validUsername =
                String(username).trim() ===
                ADMIN_USERNAME;

            const validPassword =
                String(password) ===
                ADMIN_PASSWORD;

            if (
                !validUsername ||
                !validPassword
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Username atau password salah."

                });

            }

            const token =
                createAdminToken();

            const isProduction =
                process.env.NODE_ENV ===
                "production";

            res.setHeader(
                "Set-Cookie",
                [
                    `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}`,
                    "HttpOnly",
                    "Path=/",
                    "SameSite=Lax",
                    `Max-Age=${ADMIN_SESSION_MAX_AGE}`,
                    isProduction
                        ? "Secure"
                        : ""
                ]
                    .filter(Boolean)
                    .join("; ")
            );

            console.log(
                "ADMIN LOGIN BERHASIL"
            );

            return res.json({

                success: true,

                message:
                    "Login admin berhasil."

            });

        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error.message
            );

            return res.status(500).json({

                success: false,

                message:
                    "Terjadi kesalahan server."

            });

        }

    }
);

// ======================================================
// CEK LOGIN ADMIN
// ======================================================

app.get(
    "/api/auth/check",
    (req, res) => {

        const cookies =
            parseCookies(req);

        const token =
            cookies[ADMIN_COOKIE_NAME];

        const loggedIn =
            verifyAdminToken(token);

        res.json({

            success: true,

            loggedIn

        });

    }
);

// ======================================================
// LOGOUT ADMIN
// ======================================================

app.post(
    "/api/logout",
    (req, res) => {

        res.setHeader(
            "Set-Cookie",
            `${ADMIN_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`
        );

        res.json({

            success: true,

            message:
                "Logout berhasil."

        });

    }
);

// ======================================================
// HALAMAN UTAMA
// ======================================================

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            __dirname +
            "/public/index.html"
        );

    }
);

// ======================================================
// ADMIN PAGE
// ======================================================

app.get(
    "/admin",
    (req, res) => {

        res.sendFile(
            __dirname +
            "/public/admin.html"
        );

    }
);

// ======================================================
// GET SETTINGS
// PUBLIC
// ======================================================

app.get(
    "/api/settings",
    async (req, res) => {

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

            if (
                result.rows.length === 0
            ) {

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
                        settings.whatsapp_number ||
                        "",

                    mockupImage:
                        settings.mockup_image ||
                        ""

                }

            });

        } catch (error) {

            console.error(
                "GET SETTINGS ERROR:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    "Gagal mengambil pengaturan."

            });

        }

    }
);

// ======================================================
// UPDATE SETTINGS
// ADMIN ONLY
// ======================================================

app.put(
    "/api/settings",
    requireAdmin,
    async (req, res) => {

        try {

            const {
                price,
                whatsappNumber,
                mockupImage
            } = req.body;

            if (
                price === undefined ||
                price === null ||
                Number(price) <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Harga tidak valid."

                });

            }

            let imageData =
                mockupImage || null;

            if (
                imageData &&
                typeof imageData ===
                    "string"
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
                            "Ukuran foto terlalu besar."

                    });

                }

            }

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
                    "Pengaturan berhasil disimpan."

            });

        } catch (error) {

            console.error(
                "UPDATE SETTINGS ERROR:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    "Gagal menyimpan pengaturan."

            });

        }

    }
);

// ======================================================
// GET SEMUA PESANAN
// ADMIN ONLY
// ======================================================

app.get(
    "/api/orders",
    requireAdmin,
    async (req, res) => {

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
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    "Gagal mengambil data pesanan."

            });

        }

    }
);

// ======================================================
// TAMBAH PESANAN
// PUBLIC
// ======================================================

app.post(
    "/api/orders",
    async (req, res) => {

        try {

            const {
                name,
                address,
                buyerWhatsapp,
                size,
                quantity,
                total
            } = req.body;

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
                        "Data pesanan belum lengkap."

                });

            }

            const qty =
                Number(quantity);

            const orderTotal =
                Number(total);

            if (
                !Number.isFinite(qty) ||
                !Number.isFinite(orderTotal) ||
                qty <= 0 ||
                orderTotal <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Quantity atau total tidak valid."

                });

            }

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
                    "Pesanan berhasil disimpan.",

                orderId:
                    result.rows[0].id

            });

        } catch (error) {

            console.error(
                "CREATE ORDER ERROR:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    "Gagal menyimpan pesanan."

            });

        }

    }
);

// ======================================================
// HAPUS SEMUA PESANAN
// ADMIN ONLY
// ======================================================

app.delete(
    "/api/orders",
    requireAdmin,
    async (req, res) => {

        try {

            await db.query(
                "DELETE FROM orders"
            );

            res.json({

                success: true,

                message:
                    "Semua pesanan berhasil dihapus."

            });

        } catch (error) {

            console.error(
                "DELETE ORDERS ERROR:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    "Gagal menghapus semua pesanan."

            });

        }

    }
);

// ======================================================
// API 404
// ======================================================

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API tidak ditemukan."

        });

    }
);

// ======================================================
// WEBSITE 404
// ======================================================

app.use(
    (req, res) => {

        res.status(404).send(
            "Halaman tidak ditemukan."
        );

    }
);

// ======================================================
// START SERVER
// ======================================================

const server =
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

// ======================================================
// HANDLE SERVER ERROR
// ======================================================

server.on(
    "error",
    (error) => {

        console.error(
            "SERVER ERROR:",
            error.message
        );

    }
);

// ======================================================
// GRACEFUL SHUTDOWN
// ======================================================

async function shutdown() {

    console.log(
        "Menutup server..."
    );

    try {

        await db.end();

        console.log(
            "Database pool ditutup."
        );

    } catch (error) {

        console.error(
            "Gagal menutup database:",
            error.message
        );

    }

    process.exit(0);

}

process.on(
    "SIGINT",
    shutdown
);

process.on(
    "SIGTERM",
    shutdown
);

