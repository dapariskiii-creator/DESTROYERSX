
/* =========================================
   DESTROYERSX
   BUYER SYSTEM
   MULTI SIZE ORDER
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

const sizeQtyButtons =
    document.querySelectorAll(".size-qty-btn");

const selectedSizeInput =
    document.getElementById("selectedSize");

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
   STATE UKURAN
========================= */

const sizeQuantities = {

    S: 0,

    M: 0,

    L: 1,

    XL: 0,

    XXL: 0

};


let PRICE = DEFAULT_PRICE;


/* =========================
   FORMAT RUPIAH
========================= */

function formatRupiah(number) {

    return new Intl.NumberFormat("id-ID")
        .format(Number(number) || 0);

}


/* =========================
   TOTAL SEMUA KAOS
========================= */

function getTotalQuantity() {

    return Object.values(sizeQuantities)
        .reduce(
            (total, quantity) => {

                return total + quantity;

            },
            0
        );

}


/* =========================
   DETAIL UKURAN
========================= */

function getSizeText() {

    const selectedSizes = [];


    Object.entries(sizeQuantities)
        .forEach(
            ([size, quantity]) => {

                if (quantity > 0) {

                    selectedSizes.push(
                        `${size} × ${quantity}`
                    );

                }

            }
        );


    if (selectedSizes.length === 0) {

        return "-";

    }


    return selectedSizes.join(", ");

}


/* =========================
   UPDATE ORDER
========================= */

function updateOrder() {


    /* TOTAL QUANTITY */

    const totalQuantity =
        getTotalQuantity();


    /* DETAIL SIZE */

    const sizeText =
        getSizeText();


    /* TOTAL HARGA */

    const total =
        PRICE * totalQuantity;


    /* =========================
       UPDATE JUMLAH TIAP SIZE
    ========================= */

    Object.keys(sizeQuantities)
        .forEach(
            size => {

                const element =
                    document.getElementById(
                        `qty-${size}`
                    );


                if (element) {

                    element.textContent =
                        sizeQuantities[size];

                }

            }
        );


    /* =========================
       SUMMARY SIZE
    ========================= */

    if (summarySize) {

        summarySize.textContent =
            sizeText;

    }


    /* =========================
       SUMMARY QUANTITY
    ========================= */

    if (summaryQuantity) {

        summaryQuantity.textContent =
            `${totalQuantity} PCS`;

    }


    /* =========================
       TOTAL HARGA
    ========================= */

    if (totalPrice) {

        totalPrice.textContent =
            formatRupiah(total);

    }


    /* =========================
       HARGA PRODUK
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
       HIDDEN INPUT
    ========================= */

    if (selectedSizeInput) {

        selectedSizeInput.value =
            sizeText;

    }

}


/* =========================
   TOMBOL + / -
========================= */

sizeQtyButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function() {


                const size =
                    this.dataset.size;


                const action =
                    this.dataset.action;


                /* =========================
                   CEK SIZE
                ========================= */

                if (
                    !Object.prototype
                        .hasOwnProperty
                        .call(
                            sizeQuantities,
                            size
                        )
                ) {

                    return;

                }


                /* =========================
                   TAMBAH
                ========================= */

                if (
                    action === "plus"
                ) {


                    const totalNow =
                        getTotalQuantity();


                    if (totalNow >= 20) {

                        alert(
                            "Maksimal pembelian adalah 20 kaos."
                        );

                        return;

                    }


                    sizeQuantities[size]++;

                }


                /* =========================
                   KURANG
                ========================= */

                if (
                    action === "minus"
                ) {


                    if (
                        sizeQuantities[size] > 0
                    ) {

                        sizeQuantities[size]--;

                    }

                }


                updateOrder();

            }
        );

    }
);


/* =========================
   LOAD SETTINGS DATABASE
========================= */

async function loadSettings() {

    try {


        const response =
            await fetch(
                `${API_URL}/settings`
            );


        if (!response.ok) {

            throw new Error(
                "Gagal mengambil settings."
            );

        }


        const data =
            await response.json();


        if (
            !data.success ||
            !data.settings
        ) {

            throw new Error(
                "Data settings tidak valid."
            );

        }


        /* =========================
           HARGA
        ========================= */

        PRICE =
            Number(
                data.settings.price
            ) || DEFAULT_PRICE;


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
           MOCKUP
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
           UPDATE
        ========================= */

        updateOrder();


        console.log(
            "Settings berhasil dimuat dari database."
        );


    } catch (error) {


        console.error(
            "LOAD SETTINGS ERROR:",
            error
        );


        PRICE =
            DEFAULT_PRICE;


        updateOrder();

    }

}


/* =========================
   SUBMIT ORDER
========================= */

if (orderForm) {


    orderForm.addEventListener(
        "submit",
        async function(event) {


            event.preventDefault();


            /* =========================
               DATA PEMBELI
            ========================= */

            const name =
                nameInput.value.trim();


            const address =
                addressInput.value.trim();


            const buyerWhatsapp =
                buyerWhatsappInput.value.trim();


            /* =========================
               DATA SIZE
            ========================= */

            const totalQty =
                getTotalQuantity();


            const sizeText =
                getSizeText();


            /* =========================
               VALIDASI NAMA
            ========================= */

            if (!name) {

                alert(
                    "Nama lengkap wajib diisi."
                );

                nameInput.focus();

                return;

            }


            /* =========================
               VALIDASI ALAMAT
            ========================= */

            if (!address) {

                alert(
                    "Alamat pengiriman wajib diisi."
                );

                addressInput.focus();

                return;

            }


            /* =========================
               VALIDASI WHATSAPP
            ========================= */

            if (!buyerWhatsapp) {

                alert(
                    "Nomor WhatsApp aktif wajib diisi."
                );

                buyerWhatsappInput.focus();

                return;

            }


            /* =========================
               VALIDASI SIZE
            ========================= */

            if (totalQty <= 0) {

                alert(
                    "Silakan pilih minimal 1 kaos."
                );

                return;

            }


            /* =========================
               HITUNG TOTAL
            ========================= */

            const total =
                PRICE * totalQty;


            /* =========================
               BUTTON
            ========================= */

            const submitButton =
                orderForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {


                submitButton.disabled =
                    true;


                const buttonText =
                    submitButton.querySelector(
                        "span"
                    );


                if (buttonText) {

                    buttonText.textContent =
                        "MENYIMPAN...";

                }

            }


            try {


                /* =========================
                   KIRIM DATABASE
                ========================= */

                const response =
                    await fetch(
                        `${API_URL}/orders`,
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    name:
                                        name,

                                    address:
                                        address,

                                    buyerWhatsapp:
                                        buyerWhatsapp,

                                    size:
                                        sizeText,

                                    quantity:
                                        totalQty,

                                    total:
                                        total

                                })

                        }
                    );


                const data =
                    await response.json();


                /* =========================
                   CEK RESPONSE
                ========================= */

                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Pesanan gagal disimpan."
                    );

                }


                /* =========================
                   MODAL
                ========================= */

                if (modalName) {

                    modalName.textContent =
                        name;

                }


                if (modalAddress) {

                    modalAddress.textContent =
                        address;

                }


                if (modalWhatsapp) {

                    modalWhatsapp.textContent =
                        buyerWhatsapp;

                }


                if (modalSize) {

                    modalSize.textContent =
                        sizeText;

                }


                if (modalQuantity) {

                    modalQuantity.textContent =
                        `${totalQty} PCS`;

                }


                if (modalTotal) {

                    modalTotal.textContent =
                        `Rp ${formatRupiah(total)}`;

                }


                /* =========================
                   SHOW MODAL
                ========================= */

                if (successModal) {

                    successModal.classList.add(
                        "show"
                    );

                    document.body.style.overflow =
                        "hidden";

                }


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


                    const buttonText =
                        submitButton.querySelector(
                            "span"
                        );


                    if (buttonText) {

                        buttonText.textContent =
                            "PESAN SEKARANG";

                    }

                }

            }

        }
    );

}


/* =========================
   CLOSE MODAL
========================= */

function closeOrderModal() {


    if (successModal) {

        successModal.classList.remove(
            "show"
        );

    }


    document.body.style.overflow =
        "";

}


/* =========================
   CLOSE BUTTON
========================= */

if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeOrderModal
    );

}


/* =========================
   DONE BUTTON
========================= */

if (modalDone) {

    modalDone.addEventListener(
        "click",
        closeOrderModal
    );

}


/* =========================
   CLOSE OUTSIDE
========================= */

if (successModal) {


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

}


/* =========================
   ESC
========================= */

document.addEventListener(
    "keydown",
    function(event) {


        if (
            event.key === "Escape" &&
            successModal &&
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

