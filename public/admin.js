const API_URL = "/api";

const DEFAULT_SETTINGS = {
    price: 140000,
    mockupImage: ""
};


// ======================================================
// LOGIN ADMIN
// ======================================================

const adminLoginOverlay =
    document.getElementById("adminLoginOverlay");

const adminLoginForm =
    document.getElementById("adminLoginForm");

const adminUsername =
    document.getElementById("adminUsername");

const adminPassword =
    document.getElementById("adminPassword");

const adminLoginBtn =
    document.getElementById("adminLoginBtn");

const adminLoginError =
    document.getElementById("adminLoginError");


// ======================================================
// TAMPILKAN / SEMBUNYIKAN ADMIN
// ======================================================

function setAdminAccess(loggedIn) {

    if (!adminLoginOverlay) {
        return;
    }

    if (loggedIn) {

        adminLoginOverlay.style.display = "none";

        document.body.classList.remove(
            "admin-locked"
        );

    } else {

        adminLoginOverlay.style.display = "flex";

        document.body.classList.add(
            "admin-locked"
        );

    }
}


// ======================================================
// CEK LOGIN
// ======================================================

async function checkAdminLogin() {

    try {

        const response =
            await fetch(
                `${API_URL}/auth/check`,
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                }
            );

        const data =
            await response.json();

        if (
            data.success &&
            data.loggedIn
        ) {

            setAdminAccess(true);

            await loadSettings();
            await renderOrders();

        } else {

            setAdminAccess(false);

        }

    } catch (error) {

        console.error(
            "AUTH CHECK ERROR:",
            error
        );

        setAdminAccess(false);

    }

}


// ======================================================
// LOGIN
// ======================================================

async function loginAdmin(event) {

    event.preventDefault();


    const username =
        adminUsername.value.trim();

    const password =
        adminPassword.value;


    if (!username || !password) {

        showLoginError(
            "Username dan password wajib diisi."
        );

        return;

    }


    adminLoginBtn.disabled = true;

    adminLoginBtn.textContent =
        "MEMERIKSA...";

    adminLoginError.textContent = "";

    adminLoginError.classList.remove(
        "show"
    );


    try {

        const response =
            await fetch(
                `${API_URL}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        username,
                        password
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
                "Username atau password salah."
            );

        }


        // LOGIN BERHASIL

        adminUsername.value = "";

        adminPassword.value = "";

        adminLoginError.textContent = "";

        adminLoginError.classList.remove(
            "show"
        );


        // BUKA DASHBOARD

        setAdminAccess(true);


        // LOAD DATA ADMIN

        await loadSettings();

        await renderOrders();


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        showLoginError(
            error.message ||
            "Login gagal."
        );

    } finally {

        adminLoginBtn.disabled = false;

        adminLoginBtn.textContent =
            "MASUK KE ADMIN →";

    }

}


// ======================================================
// ERROR LOGIN
// ======================================================

function showLoginError(message) {

    if (!adminLoginError) {
        return;
    }

    adminLoginError.textContent =
        message;

    adminLoginError.classList.add(
        "show"
    );

}


// ======================================================
// FORM LOGIN
// ======================================================

if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        loginAdmin
    );

}


// ======================================================
// SETTINGS
// ======================================================

const settingsForm =
    document.getElementById("settingsForm");

const adminPrice =
    document.getElementById("adminPrice");

const mockupFile =
    document.getElementById("mockupFile");

const adminMockupPreview =
    document.getElementById("adminMockupPreview");

const mockupEmpty =
    document.getElementById("mockupEmpty");

const settingsStatus =
    document.getElementById("settingsStatus");


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text ?? "";

    return div.innerHTML;

}


// ======================================================
// PREVIEW GAMBAR
// ======================================================

function showPreview(image) {

    if (!image) {

        adminMockupPreview.src = "";

        adminMockupPreview.style.display =
            "none";

        mockupEmpty.style.display =
            "block";

        return;
    }


    adminMockupPreview.src =
        image;

    adminMockupPreview.style.display =
        "block";

    mockupEmpty.style.display =
        "none";

}


// ======================================================
// LOAD SETTINGS
// ======================================================

async function loadSettings() {

    try {

        const response =
            await fetch(
                `${API_URL}/settings`,
                {
                    credentials: "include"
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "Gagal mengambil settings"
            );

        }


        const settings =
            data.settings ||
            DEFAULT_SETTINGS;


        adminPrice.value =
            settings.price ||
            DEFAULT_SETTINGS.price;


        showPreview(
            settings.mockupImage || ""
        );


    } catch (error) {

        console.error(
            "LOAD SETTINGS ERROR:",
            error
        );


        adminPrice.value =
            DEFAULT_SETTINGS.price;


        showPreview("");


        if (settingsStatus) {

            settingsStatus.textContent =
                "Gagal mengambil pengaturan dari database.";

            settingsStatus.classList.add(
                "error"
            );

        }

    }

}


// ======================================================
// COMPRESS IMAGE
// ======================================================

function compressImage(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload =
                event => {

                    const img =
                        new Image();


                    img.onload =
                        () => {

                            const canvas =
                                document.createElement(
                                    "canvas"
                                );


                            const maxWidth =
                                900;


                            let width =
                                img.width;

                            let height =
                                img.height;


                            if (
                                width >
                                maxWidth
                            ) {

                                height =
                                    Math.round(
                                        (
                                            height *
                                            maxWidth
                                        ) / width
                                    );

                                width =
                                    maxWidth;

                            }


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


                            const compressed =
                                canvas.toDataURL(
                                    "image/jpeg",
                                    0.55
                                );


                            resolve(
                                compressed
                            );

                        };


                    img.onerror =
                        () => {

                            reject(
                                new Error(
                                    "Gagal membaca gambar."
                                )
                            );

                        };


                    img.src =
                        event.target.result;

                };


            reader.onerror =
                () => {

                    reject(
                        new Error(
                            "Gagal membaca file."
                        )
                    );

                };


            reader.readAsDataURL(file);

        }
    );

}


// ======================================================
// SAVE SETTINGS
// ======================================================

async function saveSettings(event) {

    event.preventDefault();


    settingsStatus.textContent =
        "Menyimpan...";

    settingsStatus.classList.remove(
        "error"
    );


    try {

        const price =
            Number(
                adminPrice.value
            );


        if (
            !price ||
            price <= 0
        ) {

            throw new Error(
                "Harga tidak valid."
            );

        }


        let mockupImage =
            adminMockupPreview.src ||
            "";


        if (
            mockupImage.startsWith("http")
        ) {

            // Gambar lama tetap digunakan

        } else if (
            !mockupImage.startsWith(
                "data:image"
            )
        ) {

            mockupImage = "";

        }


        const response =
            await fetch(
                `${API_URL}/settings`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({

                        price,

                        mockupImage

                    })

                }
            );


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "Gagal menyimpan settings"
            );

        }


        settingsStatus.textContent =
            "Pengaturan berhasil disimpan.";

        settingsStatus.classList.remove(
            "error"
        );


    } catch (error) {

        console.error(
            "SAVE SETTINGS ERROR:",
            error
        );


        settingsStatus.textContent =
            error.message ||
            "Gagal menyimpan pengaturan.";

        settingsStatus.classList.add(
            "error"
        );

    }

}


// ======================================================
// PILIH GAMBAR
// ======================================================

if (mockupFile) {

    mockupFile.addEventListener(
        "change",
        async () => {

            const file =
                mockupFile.files[0];


            if (!file) {
                return;
            }


            try {

                settingsStatus.textContent =
                    "Memproses gambar...";

                settingsStatus.classList.remove(
                    "error"
                );


                const compressedImage =
                    await compressImage(
                        file
                    );


                showPreview(
                    compressedImage
                );


                settingsStatus.textContent =
                    "Gambar siap disimpan.";


            } catch (error) {

                console.error(
                    "IMAGE ERROR:",
                    error
                );


                settingsStatus.textContent =
                    "Gagal memproses gambar.";

                settingsStatus.classList.add(
                    "error"
                );

            }

        }
    );

}


// ======================================================
// FORM SETTINGS
// ======================================================

if (settingsForm) {

    settingsForm.addEventListener(
        "submit",
        saveSettings
    );

}


// ======================================================
// PESANAN
// ======================================================

async function renderOrders() {

    const ordersTableBody =
        document.getElementById(
            "ordersTableBody"
        );


    const orderCount =
        document.getElementById(
            "orderCount"
        );


    try {

        const response =
            await fetch(
                `${API_URL}/orders`,
                {
                    credentials: "include"
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "Gagal mengambil pesanan."
            );

        }


        const orders =
            data.orders || [];


        orderCount.textContent =
            `${orders.length} PESANAN TERSIMPAN`;


        if (
            orders.length === 0
        ) {

            ordersTableBody.innerHTML = `
                <tr class="empty-orders">

                    <td colspan="7">
                        BELUM ADA PESANAN
                    </td>

                </tr>
            `;

            return;

        }


        ordersTableBody.innerHTML =
            orders
                .map(order => {

                    const total =
                        Number(
                            order.total || 0
                        );


                    return `
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
                                    order.buyer_whatsapp ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    order.size
                                )}
                            </td>

                            <td>
                                ${order.quantity}
                            </td>

                            <td>
                                Rp ${total.toLocaleString(
                                    "id-ID"
                                )}
                            </td>

                            <td>
                                ${formatDate(
                                    order.created_at
                                )}
                            </td>

                        </tr>
                    `;

                })
                .join("");


    } catch (error) {

        console.error(
            "LOAD ORDERS ERROR:",
            error
        );


        orderCount.textContent =
            "GAGAL MENGAMBIL DATA";


        ordersTableBody.innerHTML = `
            <tr class="empty-orders">

                <td colspan="7">
                    GAGAL MENGAMBIL PESANAN
                </td>

            </tr>
        `;

    }

}


// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }


    const date =
        new Date(dateString);


    return date.toLocaleString(
        "id-ID",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );

}


// ======================================================
// DELETE ORDERS
// ======================================================

const clearOrdersBtn =
    document.getElementById(
        "clearOrdersBtn"
    );


if (clearOrdersBtn) {

    clearOrdersBtn.addEventListener(
        "click",
        async () => {

            const confirmDelete =
                confirm(
                    "Yakin ingin menghapus SEMUA pesanan?"
                );


            if (!confirmDelete) {
                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/orders`,
                        {
                            method: "DELETE",
                            credentials: "include"
                        }
                    );


                const data =
                    await response.json();


                if (!data.success) {

                    throw new Error(
                        data.message ||
                        "Gagal menghapus pesanan."
                    );

                }


                await renderOrders();


            } catch (error) {

                console.error(
                    "DELETE ORDERS ERROR:",
                    error
                );


                alert(
                    error.message ||
                    "Gagal menghapus semua pesanan."
                );

            }

        }
    );

}


// ======================================================
// MULAI
// ======================================================

checkAdminLogin();