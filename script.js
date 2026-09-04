/* =========================================
   DESTROY APPAREL
   PRE-ORDER SYSTEM
========================================= */


/* =========================
   CONFIG
========================= */

const DEFAULT_SETTINGS = {
    price: 140000,
    whatsappNumber: "6282142787154",
    mockupImage: ""
};

function getSettings() {
    try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem("destroyersx_settings")) };
    } catch (error) {
        return { ...DEFAULT_SETTINGS };
    }
}

const settings = getSettings();
const PRICE = Number(settings.price) || DEFAULT_SETTINGS.price;

const ORDERS_STORAGE_KEY = "destroyersx_orders";


/* =========================
   ELEMENT
========================= */

const orderForm = document.getElementById("orderForm");

const nameInput = document.getElementById("name");
const addressInput = document.getElementById("address");
const buyerWhatsappInput = document.getElementById("buyerWhatsapp");
const mockupImage = document.getElementById("mockupImage");

const sizeButtons = document.querySelectorAll(".size-btn");

const selectedSizeInput =
    document.getElementById("selectedSize");

const minusBtn =
    document.getElementById("minusBtn");

const plusBtn =
    document.getElementById("plusBtn");

const quantityDisplay =
    document.getElementById("quantity");

const summarySize =
    document.getElementById("summarySize");

const summaryQuantity =
    document.getElementById("summaryQuantity");

const totalPrice =
    document.getElementById("totalPrice");

const productPrice =
    document.getElementById("productPrice");

const displayPrice =
    document.getElementById("displayPrice");

const successModal =
    document.getElementById("successModal");

const closeModal =
    document.getElementById("closeModal");

const modalName =
    document.getElementById("modalName");

const modalAddress =
    document.getElementById("modalAddress");

const modalWhatsapp =
    document.getElementById("modalWhatsapp");

const modalSize =
    document.getElementById("modalSize");

const modalQuantity =
    document.getElementById("modalQuantity");

const modalTotal =
    document.getElementById("modalTotal");

const modalDone =
    document.getElementById("modalDone");

/* =========================
   STATE
========================= */

let quantity = 1;
let selectedSize = "L";


/* =========================
   FORMAT RUPIAH
========================= */

function formatRupiah(number) {

    return new Intl.NumberFormat("id-ID")
        .format(number);

}


function getSavedOrders() {
    try {
        return JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function saveOrder(order) {
    const orders = getSavedOrders();
    orders.unshift(order);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}


/* =========================
   UPDATE ORDER
========================= */

function updateOrder() {

    const total =
        PRICE * quantity;


    quantityDisplay.textContent =
        quantity;


    summarySize.textContent =
        selectedSize;


    summaryQuantity.textContent =
        `${quantity} PCS`;


    totalPrice.textContent =
        formatRupiah(total);

    if (productPrice) {
        productPrice.textContent =
            formatRupiah(PRICE);
    }


    if (displayPrice) {

        displayPrice.textContent =
            formatRupiah(PRICE);

    }

}


/* =========================
   SIZE BUTTON
========================= */

sizeButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            sizeButtons.forEach(btn => {

                btn.classList.remove("active");

            });


            button.classList.add("active");


            selectedSize =
                button.dataset.size;


            if (selectedSizeInput) {

                selectedSizeInput.value =
                    selectedSize;

            }


            updateOrder();

        }
    );

});


/* =========================
   PLUS
========================= */

plusBtn.addEventListener(
    "click",
    () => {

        if (quantity < 20) {

            quantity++;

            updateOrder();

        }

    }
);


/* =========================
   MINUS
========================= */

minusBtn.addEventListener(
    "click",
    () => {

        if (quantity > 1) {

            quantity--;

            updateOrder();

        }

    }
);


/* =========================
   SUBMIT ORDER
========================= */

orderForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        /* GET DATA */

        const name =
            nameInput.value.trim();

        const address =
            addressInput.value.trim();

        const buyerWhatsapp =
            buyerWhatsappInput.value.trim();


        /* VALIDATION */

        if (!name) {

            alert(
                "Nama lengkap wajib diisi."
            );

            nameInput.focus();

            return;

        }


        if (!address) {

            alert(
                "Alamat pengiriman wajib diisi."
            );

            addressInput.focus();

            return;

        }

        if (!buyerWhatsapp) {
            alert("Nomor WhatsApp aktif wajib diisi.");
            buyerWhatsappInput.focus();
            return;
        }


        /* CALCULATE */

        const totalQty =
            quantity;

        const total =
            PRICE * totalQty;


        saveOrder({
            name,
            address,
            buyerWhatsapp,
            size: selectedSize,
            quantity: totalQty,
            total,
            createdAt: new Date().toISOString()
        });


        modalName.textContent = name;
        modalAddress.textContent = address;
        modalWhatsapp.textContent = buyerWhatsapp;
        modalSize.textContent = selectedSize;
        modalQuantity.textContent = `${totalQty} PCS`;
        modalTotal.textContent = `Rp ${formatRupiah(total)}`;

        successModal.classList.add("show");
        document.body.style.overflow = "hidden";

    }
);


/* =========================
   CLOSE MODAL
========================= */

function closeOrderModal() {

    successModal.classList.remove("show");

    document.body.style.overflow = "";

}


closeModal.addEventListener(
    "click",
    closeOrderModal
);

modalDone.addEventListener(
    "click",
    closeOrderModal
);

/* =========================
   CLOSE OUTSIDE
========================= */

successModal.addEventListener(
    "click",
    function(event) {

        if (
            event.target ===
            successModal
        ) {

            closeOrderModal();

        }

    }
);


/* =========================
   ESC
========================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape" &&
            successModal.classList.contains("show")
        ) {

            closeOrderModal();

        }

    }
);


/* =========================
   INITIAL
========================= */

updateOrder();

if (settings.mockupImage && mockupImage) {
    mockupImage.src = settings.mockupImage;
    mockupImage.classList.add("visible");
}