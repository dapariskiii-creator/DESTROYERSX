/* =========================================
   DESTROY APPAREL
   PRE-ORDER SYSTEM
========================================= */


/* =========================
   CONFIG
========================= */

// Harga kaos per pcs
const PRICE = 140000;

// GANTI dengan nomor WhatsApp tujuan
// Contoh:
// 081234567890
// menjadi:
// 6281234567890
const WHATSAPP_NUMBER = "6282142787154";


/* =========================
   ELEMENT
========================= */

const orderForm = document.getElementById("orderForm");

const nameInput = document.getElementById("name");
const addressInput = document.getElementById("address");

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

const displayPrice =
    document.getElementById("displayPrice");

const successModal =
    document.getElementById("successModal");

const closeModal =
    document.getElementById("closeModal");

const modalName =
    document.getElementById("modalName");

const modalSize =
    document.getElementById("modalSize");

const modalQuantity =
    document.getElementById("modalQuantity");

const modalTotal =
    document.getElementById("modalTotal");

const whatsappBtn =
    document.getElementById("whatsappBtn");


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


/* =========================
   GENERATE NO FAKTUR
========================= */

function generateInvoiceNumber() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(now.getDate())
            .padStart(2, "0");

    const hours =
        String(now.getHours())
            .padStart(2, "0");

    const minutes =
        String(now.getMinutes())
            .padStart(2, "0");

    const seconds =
        String(now.getSeconds())
            .padStart(2, "0");


    // angka random 6 digit
    const random =
        Math.floor(
            100000 +
            Math.random() * 900000
        );


    return `KSC-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;

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


        /* CALCULATE */

        const totalQty =
            quantity;

        const total =
            PRICE * totalQty;


        /* GENERATE INVOICE */

        const invoiceNumber =
            generateInvoiceNumber();


        /* =========================
           MODAL
        ========================= */

        modalName.textContent =
            name;

        modalSize.textContent =
            selectedSize;

        modalQuantity.textContent =
            `${totalQty} PCS`;

        modalTotal.textContent =
            `Rp ${formatRupiah(total)}`;


        /* =========================
           WHATSAPP MESSAGE
        ========================= */

        const message =
`HALO, SAYA INGIN ORDER KAOS

NO FAKTUR: ${invoiceNumber}
NAMA: ${name}
ALAMAT: ${address}

DETAIL SIZE & QTY:
${selectedSize}: ${quantity} PCS

TOTAL QTY: ${totalQty} PCS
HARGA/PCS: Rp ${formatRupiah(PRICE)}
TOTAL: Rp ${formatRupiah(total)}

Mohon diproses. Terima kasih.`;


        /* =========================
           WHATSAPP URL
        ========================= */

        const whatsappURL =
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;


        /* SET LINK */

        whatsappBtn.href =
            whatsappURL;


        /* OPEN MODAL */

        successModal.classList.add("show");


        document.body.style.overflow =
            "hidden";

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