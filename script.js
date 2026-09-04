/* =========================================
   DESTROYERSX
   BUYER SYSTEM
   DATABASE CONNECTED
========================================= */


/* =========================
   CONFIG
========================= */

const API_URL = "/api";

const DEFAULT_PRICE = 140000;


/* =========================
   ELEMENT
========================= */

const orderForm =
    document.getElementById("orderForm");

const nameInput =
    document.getElementById("name");

const addressInput =
    document.getElementById("address");

const buyerWhatsappInput =
    document.getElementById("buyerWhatsapp");

const mockupImage =
    document.getElementById("mockupImage");

const sizeButtons =
    document.querySelectorAll(".size-btn");

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

let PRICE = DEFAULT_PRICE;


/* =========================
   FORMAT RUPIAH
========================= */

function formatRupiah(number) {

    return new Intl.NumberFormat("id-ID")
        .format(Number(number) || 0);

}


/* =========================
   LOAD SETTINGS
========================= */

async function loadSettings() {

    try {

        const response =
            await fetch(`${API_URL}/settings`);

        if (!response.ok) {

            throw new Error(
                "Gagal mengambil settings"
            );

        }

        const data =
            await response.json();


        if (
            !data.success ||
            !data.settings
        ) {

            throw new Error(
                "Data settings tidak valid"
            );

        }


        /* =========================
           HARGA DARI DATABASE
        ========================= */

        PRICE =
            Number(data.settings.price)
            || DEFAULT_PRICE;


        /* =========================
           UPDATE HARGA
        ========================= */

        if (productPrice) {

            productPrice.textContent =
                formatRupiah(PRICE);

        }


        if (displayPrice) {

            displayPrice.textContent =
                formatRupiah(PRICE);

        }


        /* =========================
           MOCKUP DARI DATABASE
        ========================= */

        if (
            data.settings.mockupImage &&
            mockupImage
        ) {

            mockupImage.src =
                data.settings.mockupImage;

            mockupImage.classList.add(
                "visible"
            );

        } else if (mockupImage) {

            mockupImage.removeAttribute(
                "src"
            );

            mockupImage.classList.remove(
                "visible"
            );

        }


        /* =========================
           UPDATE TOTAL
        ========================= */

        updateOrder();


        console.log(
            "Settings berhasil dimuat dari database"
        );

    } catch (error) {

        console.error(
            "LOAD SETTINGS ERROR:",
            error
        );


        PRICE = DEFAULT_PRICE;

        updateOrder();

    }

}


/* =========================
   UPDATE ORDER
========================= */

function updateOrder() {

    const total =
        PRICE * quantity;


    /* QUANTITY */

    quantityDisplay.textContent =
        quantity;


    /* SIZE */

    summarySize.textContent =
        selectedSize;


    /* QUANTITY SUMMARY */

    summaryQuantity.textContent =
        `${quantity} PCS`;


    /* TOTAL */

    totalPrice.textContent =
        formatRupiah(total);


    /* PRODUCT PRICE */

    if (productPrice) {

        productPrice.textContent =
            formatRupiah(PRICE);

    }


    /* OPTIONAL DISPLAY PRICE */

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

                btn.classList.remove(
                    "active"
                );

            });


            button.classList.add(
                "active"
            );


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
    async function(event) {

        event.preventDefault();


        /* =========================
           GET DATA
        ========================= */

        const name =
            nameInput.value.trim();

        const address =
            addressInput.value.trim();

        const buyerWhatsapp =
            buyerWhatsappInput.value.trim();


        /* =========================
           VALIDATION
        ========================= */

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

            alert(
                "Nomor WhatsApp aktif wajib diisi."
            );

            buyerWhatsappInput.focus();

            return;

        }


        /* =========================
           CALCULATE
        ========================= */

        const totalQty =
            quantity;

        const total =
            PRICE * totalQty;


        /* =========================
           DISABLE BUTTON
        ========================= */

        const submitButton =
            orderForm.querySelector(
                'button[type="submit"]'
            );


        if (submitButton) {

            submitButton.disabled = true;

            submitButton.querySelector(
                "span"
            ).textContent =
                "MENYIMPAN...";

        }


        try {

            /* =========================
               SEND TO DATABASE
            ========================= */

            const response =
                await fetch(
                    `${API_URL}/orders`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name:
                                name,

                            address:
                                address,

                            buyerWhatsapp:
                                buyerWhatsapp,

                            size:
                                selectedSize,

                            quantity:
                                totalQty,

                            total:
                                total

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
                    "Pesanan gagal disimpan"
                );

            }


            /* =========================
               MODAL
            ========================= */

            modalName.textContent =
                name;

            modalAddress.textContent =
                address;

            modalWhatsapp.textContent =
                buyerWhatsapp;

            modalSize.textContent =
                selectedSize;

            modalQuantity.textContent =
                `${totalQty} PCS`;

            modalTotal.textContent =
                `Rp ${formatRupiah(total)}`;


            successModal.classList.add(
                "show"
            );

            document.body.style.overflow =
                "hidden";


            console.log(
                "Pesanan berhasil masuk database. ID:",
                data.orderId
            );


        } catch (error) {

            console.error(
                "CREATE ORDER ERROR:",
                error
            );


            alert(
                error.message ||
                "Gagal menyimpan pesanan."
            );


        } finally {

            /* =========================
               ENABLE BUTTON
            ========================= */

            if (submitButton) {

                submitButton.disabled =
                    false;

                submitButton.querySelector(
                    "span"
                ).textContent =
                    "PESAN SEKARANG";

            }

        }

    }
);


/* =========================
   CLOSE MODAL
========================= */

function closeOrderModal() {

    successModal.classList.remove(
        "show"
    );

    document.body.style.overflow = "";

}


/* =========================
   CLOSE BUTTON
========================= */

closeModal.addEventListener(
    "click",
    closeOrderModal
);


/* =========================
   DONE BUTTON
========================= */

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
            successModal.classList.contains(
                "show"
            )
        ) {

            closeOrderModal();

        }

    }
);


/* =========================
   INITIAL
========================= */

updateOrder();

loadSettings();