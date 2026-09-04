/* =========================================
   DESTROYERSX
   ADMIN PANEL
========================================= */


/* =========================
   CONFIG
========================= */

const API_URL = "/api";

const DEFAULT_SETTINGS = {
    price: 140000,
    mockupImage: ""
};


/* =========================
   ELEMENT
========================= */

const settingsForm =
    document.getElementById("settingsForm");

const mockupFile =
    document.getElementById("mockupFile");

const adminMockupPreview =
    document.getElementById("adminMockupPreview");

const mockupEmpty =
    document.getElementById("mockupEmpty");

const adminPrice =
    document.getElementById("adminPrice");

const settingsStatus =
    document.getElementById("settingsStatus");

const ordersTableBody =
    document.getElementById("ordersTableBody");

const orderCount =
    document.getElementById("orderCount");

const clearOrdersBtn =
    document.getElementById("clearOrdersBtn");


/* =========================
   ESCAPE HTML
========================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================
   SHOW PREVIEW
========================= */

function showPreview(image) {

    if (
        image &&
        adminMockupPreview
    ) {

        adminMockupPreview.src = image;

        adminMockupPreview.classList.add(
            "visible"
        );

        if (mockupEmpty) {
            mockupEmpty.hidden = true;
        }

    } else {

        if (adminMockupPreview) {

            adminMockupPreview.removeAttribute(
                "src"
            );

            adminMockupPreview.classList.remove(
                "visible"
            );

        }

        if (mockupEmpty) {
            mockupEmpty.hidden = false;
        }

    }

}


/* =========================
   LOAD SETTINGS
========================= */

async function loadSettings() {

    try {

        const response =
            await fetch(
                `${API_URL}/settings`,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Gagal mengambil pengaturan"
            );

        }


        const data =
            await response.json();


        const settings = {
            ...DEFAULT_SETTINGS,
            ...(data.settings || {})
        };


        /* PRICE */

        adminPrice.value =
            settings.price;


        /* MOCKUP */

        showPreview(
            settings.mockupImage
        );


        console.log(
            "Settings berhasil dimuat."
        );


    } catch (error) {

        console.error(
            "LOAD SETTINGS ERROR:",
            error
        );


        adminPrice.value =
            DEFAULT_SETTINGS.price;


        showPreview(
            DEFAULT_SETTINGS.mockupImage
        );


        settingsStatus.textContent =
            "GAGAL MENGAMBIL PENGATURAN";


        setTimeout(() => {

            settingsStatus.textContent =
                "";

        }, 3000);

    }

}


/* =========================
   COMPRESS IMAGE
========================= */

function compressImage(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload = function(event) {

                const img =
                    new Image();


                img.onload = function() {

                    const MAX_WIDTH = 1200;

                    let width =
                        img.width;

                    let height =
                        img.height;


                    /* RESIZE */

                    if (
                        width >
                        MAX_WIDTH
                    ) {

                        height =
                            Math.round(
                                height *
                                (
                                    MAX_WIDTH /
                                    width
                                )
                            );

                        width =
                            MAX_WIDTH;

                    }


                    const canvas =
                        document.createElement(
                            "canvas"
                        );


                    canvas.width =
                        width;

                    canvas.height =
                        height;


                    const ctx =
                        canvas.getContext(
                            "2d"
                        );


                    ctx.drawImage(
                        img,
                        0,
                        0,
                        width,
                        height
                    );


                    /*
                       JPEG QUALITY
                       0.75 = kualitas bagus
                    */

                    const compressed =
                        canvas.toDataURL(
                            "image/jpeg",
                            0.75
                        );


                    resolve(
                        compressed
                    );

                };


                img.onerror =
                    () => reject(
                        new Error(
                            "Gambar tidak dapat dibaca"
                        )
                    );


                img.src =
                    event.target.result;

            };


            reader.onerror =
                () => reject(
                    new Error(
                        "Gagal membaca file"
                    )
                );


            reader.readAsDataURL(file);

        }
    );

}


/* =========================
   SAVE SETTINGS
========================= */

async function saveSettings(
    price,
    mockupImage
) {

    try {

        settingsStatus.textContent =
            "MENYIMPAN...";


        const response =
            await fetch(
                `${API_URL}/settings`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        price:
                            price,

                        /*
                           Nomor WA PENJUAL
                           SUDAH DIHAPUS
                        */

                        whatsappNumber:
                            "",

                        mockupImage:
                            mockupImage || ""

                    })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Gagal menyimpan"
            );

        }


        showPreview(
            mockupImage
        );


        settingsStatus.textContent =
            "PENGATURAN TERSIMPAN";


        console.log(
            "Settings berhasil disimpan ke MySQL."
        );


        setTimeout(() => {

            settingsStatus.textContent =
                "";

        }, 2500);


    } catch (error) {

        console.error(
            "SAVE SETTINGS ERROR:",
            error
        );


        settingsStatus.textContent =
            "GAGAL MENYIMPAN";


        setTimeout(() => {

            settingsStatus.textContent =
                "";

        }, 3000);

    }

}


/* =========================
   PILIH FOTO
========================= */

mockupFile.addEventListener(
    "change",
    async function() {

        const file =
            mockupFile.files[0];


        if (!file) {
            return;
        }


        /* =========================
           CEK TYPE
        ========================= */

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "File harus berupa gambar."
            );

            mockupFile.value =
                "";

            return;

        }


        /* =========================
           BATAS FILE ASLI
        ========================= */

        const maxOriginalSize =
            10 * 1024 * 1024;


        if (
            file.size >
            maxOriginalSize
        ) {

            alert(
                "Foto terlalu besar. Maksimal 10 MB."
            );

            mockupFile.value =
                "";

            return;

        }


        try {

            settingsStatus.textContent =
                "MEMPROSES FOTO...";


            const compressedImage =
                await compressImage(
                    file
                );


            showPreview(
                compressedImage
            );


            settingsStatus.textContent =
                "FOTO SIAP DISIMPAN";


            setTimeout(() => {

                settingsStatus.textContent =
                    "";

            }, 2000);


        } catch (error) {

            console.error(
                "COMPRESS IMAGE ERROR:",
                error
            );


            alert(
                "Gagal memproses foto."
            );

            mockupFile.value =
                "";

            settingsStatus.textContent =
                "";

        }

    }
);


/* =========================
   SUBMIT SETTINGS
========================= */

settingsForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const price =
            Number(
                adminPrice.value
            );


        if (
            !price ||
            price <= 0
        ) {

            alert(
                "Harga kaos tidak valid."
            );

            adminPrice.focus();

            return;

        }


        /* =========================
           AMBIL MOCKUP
        ========================= */

        let mockupImage = "";


        if (
            adminMockupPreview &&
            adminMockupPreview.src
        ) {

            mockupImage =
                adminMockupPreview.src;

        }


        /* =========================
           SUBMIT
        ========================= */

        const submitButton =
            settingsForm.querySelector(
                'button[type="submit"]'
            );


        if (submitButton) {

            submitButton.disabled =
                true;

            submitButton.innerHTML =
                'MENYIMPAN... <span class="arrow">→</span>';

        }


        try {

            await saveSettings(
                price,
                mockupImage
            );

        } finally {

            if (submitButton) {

                submitButton.disabled =
                    false;

                submitButton.innerHTML =
                    'SIMPAN PENGATURAN <span class="arrow">→</span>';

            }

        }

    }
);


/* =========================
   RENDER ORDERS
========================= */

async function renderOrders() {

    try {

        const response =
            await fetch(
                `${API_URL}/orders`,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Gagal mengambil pesanan"
            );

        }


        const data =
            await response.json();


        const orders =
            data.orders || [];


        orderCount.textContent =
            `${orders.length} PESANAN TERSIMPAN`;


        if (
            orders.length === 0
        ) {

            ordersTableBody.innerHTML =
                `
                <tr class="empty-orders">

                    <td colspan="7">
                        BELUM ADA PESANAN
                    </td>

                </tr>
                `;

            return;

        }


        ordersTableBody.innerHTML =
            orders.map(order => `

                <tr>

                    <td>
                        ${escapeHtml(
                            order.name
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            order.address
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            order.buyer_whatsapp || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            order.size
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            order.quantity
                        )}
                    </td>

                    <td>
                        Rp ${
                            Number(
                                order.total
                            ).toLocaleString(
                                "id-ID"
                            )
                        }
                    </td>

                    <td>
                        ${formatDate(
                            order.created_at
                        )}
                    </td>

                </tr>

            `).join("");


    } catch (error) {

        console.error(
            "LOAD ORDERS ERROR:",
            error
        );


        orderCount.textContent =
            "GAGAL MEMUAT PESANAN";


        ordersTableBody.innerHTML =
            `
            <tr class="empty-orders">

                <td colspan="7">
                    GAGAL MENGAMBIL DATA PESANAN
                </td>

            </tr>
            `;

    }

}


/* =========================
   FORMAT DATE
========================= */

function formatDate(
    dateValue
) {

    if (!dateValue) {
        return "-";
    }


    const date =
        new Date(dateValue);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleString(
        "id-ID"
    );

}


/* =========================
   DELETE ORDERS
========================= */

clearOrdersBtn.addEventListener(
    "click",
    async function() {

        const confirmed =
            confirm(
                "Hapus semua data pesanan dari database?"
            );


        if (!confirmed) {
            return;
        }


        try {

            clearOrdersBtn.disabled =
                true;

            clearOrdersBtn.textContent =
                "MENGHAPUS...";


            const response =
                await fetch(
                    `${API_URL}/orders`,
                    {
                        method: "DELETE"
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Gagal menghapus pesanan"
                );

            }


            await renderOrders();


            alert(
                "Semua pesanan berhasil dihapus."
            );


        } catch (error) {

            console.error(
                "DELETE ORDERS ERROR:",
                error
            );


            alert(
                "Gagal menghapus data pesanan."
            );


        } finally {

            clearOrdersBtn.disabled =
                false;

            clearOrdersBtn.textContent =
                "HAPUS SEMUA";

        }

    }
);


/* =========================
   INITIAL LOAD
========================= */

loadSettings();

renderOrders();