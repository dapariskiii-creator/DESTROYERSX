const SETTINGS_KEY = "destroyersx_settings";
const ORDERS_KEY = "destroyersx_orders";
const defaults = {
    price: 140000,
    whatsappNumber: "6282142787154",
    mockupImage: ""
};

const settingsForm = document.getElementById("settingsForm");
const mockupFile = document.getElementById("mockupFile");
const adminMockupPreview = document.getElementById("adminMockupPreview");
const mockupEmpty = document.getElementById("mockupEmpty");
const adminPrice = document.getElementById("adminPrice");
const sellerWhatsapp = document.getElementById("sellerWhatsapp");
const settingsStatus = document.getElementById("settingsStatus");
const ordersTableBody = document.getElementById("ordersTableBody");
const orderCount = document.getElementById("orderCount");
const clearOrdersBtn = document.getElementById("clearOrdersBtn");

function readSettings() {
    try {
        return { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) };
    } catch (error) {
        return { ...defaults };
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showPreview(image) {
    if (image) {
        adminMockupPreview.src = image;
        adminMockupPreview.classList.add("visible");
        mockupEmpty.hidden = true;
    } else {
        adminMockupPreview.removeAttribute("src");
        adminMockupPreview.classList.remove("visible");
        mockupEmpty.hidden = false;
    }
}

function renderOrders() {
    let orders = [];
    try {
        orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    } catch (error) {
        orders = [];
    }

    orderCount.textContent = `${orders.length} PESANAN TERSIMPAN`;
    ordersTableBody.innerHTML = orders.length ? orders.map(order => `
        <tr>
            <td>${escapeHtml(order.name)}</td>
            <td>${escapeHtml(order.address)}</td>
            <td>${escapeHtml(order.buyerWhatsapp || "-")}</td>
            <td>${escapeHtml(order.size)}</td>
            <td>${escapeHtml(order.quantity)}</td>
            <td>Rp ${Number(order.total).toLocaleString("id-ID")}</td>
            <td>${new Date(order.createdAt).toLocaleString("id-ID")}</td>
        </tr>
    `).join("") : '<tr class="empty-orders"><td colspan="7">BELUM ADA PESANAN</td></tr>';
}

const currentSettings = readSettings();
adminPrice.value = currentSettings.price;
sellerWhatsapp.value = currentSettings.whatsappNumber;
showPreview(currentSettings.mockupImage);

mockupFile.addEventListener("change", function() {
    const file = mockupFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => showPreview(reader.result));
    reader.readAsDataURL(file);
});

settingsForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const existing = readSettings();
    const nextSettings = {
        price: Number(adminPrice.value),
        whatsappNumber: sellerWhatsapp.value.trim(),
        mockupImage: existing.mockupImage
    };

    if (mockupFile.files[0]) {
        const reader = new FileReader();
        reader.addEventListener("load", () => saveSettings({ ...nextSettings, mockupImage: reader.result }));
        reader.readAsDataURL(mockupFile.files[0]);
    } else {
        saveSettings(nextSettings);
    }
});

function saveSettings(nextSettings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
    showPreview(nextSettings.mockupImage);
    settingsStatus.textContent = "PENGATURAN TERSIMPAN";
    setTimeout(() => { settingsStatus.textContent = ""; }, 2500);
}

clearOrdersBtn.addEventListener("click", function() {
    if (localStorage.getItem(ORDERS_KEY) && confirm("Hapus semua data pesanan?")) {
        localStorage.removeItem(ORDERS_KEY);
        renderOrders();
    }
});

renderOrders();
