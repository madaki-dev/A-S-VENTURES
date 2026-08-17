const axios = require("axios");
const Cart = require("./Cart");
const Order = require("./Order");
const Transport = require("./Transport");
const Payment = require("./payment");

// ==========================================
// INITIALIZE PAYMENT
// ==========================================

exports.initializePayment = async (req, res) => {
    try {

        const {
            fullname,
            phone,
            whatsapp,
            state,
            address
        } = req.body;

        // Get email from authenticated user
        const email = req.user.email;

        // Check delivery information
        if (
            !email ||
            !fullname ||
            !phone ||
            !whatsapp ||
            !state ||
            !address
        ) {
            return res.status(400).json({
                message: "Complete delivery information is required."
            });
        }

        // Get buyer cart
        const cart = await Cart.find({
            buyer: req.user._id
        }).populate("product");

        if (cart.length === 0) {
            return res.status(400).json({
                message: "Cart is empty."
            });
        }

        // ==========================================
        // SAVE PRODUCTS IN PAYMENT SNAPSHOT
        // ==========================================


        // ==========================================
        // CALCULATE PRODUCTS TOTAL
        // ==========================================

        let productsTotal = 0;

        const paymentProducts = [];

        for (const item of cart) {

            if (!item.product) {
                continue;
            }

            const quantity = Number(item.quantity);

            const sellingPrice =
                Number(item.product.sellingPrice);

            const farmerPrice =
                Number(item.product.farmerPrice || 0);

            const commission =
                Number(item.product.commission || 0);

            if (!Number.isFinite(quantity) || quantity < 1) {
                return res.status(400).json({
                    message: "Invalid product quantity."
                });
            }

            if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) {
                return res.status(400).json({
                    message:
                        `Invalid selling price for product ${item.product._id}.`
                });
            }

            productsTotal += sellingPrice * quantity;

            paymentProducts.push({
                product: item.product._id,
                quantity,
                farmerPrice,
                commission,
                sellingPrice
            });
        }
        // ==========================================
        // GET TRANSPORT PRICE
        // ==========================================

        const transport = await Transport.findOne({
            state: state
        });

        if (!transport) {
            return res.status(400).json({
                message: "Transportation price not available for this state."
            });
        }

        const transportFee =
            Number(transport.transportPrice);

        if (!Number.isFinite(transportFee) || transportFee < 0) {
            return res.status(400).json({
                message: "Invalid transportation price."
            });
        }

        const totalAmount =
            productsTotal + transportFee;

        if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
            return res.status(400).json({
                message: "Invalid payment amount."
            });
        }
        // ==========================================
        // CREATE TRANSACTION REFERENCE
        // ==========================================

        const tx_ref =
            "AS-" +
            Date.now() +
            "-" +
            req.user._id;

        // ==========================================
        // SAVE PAYMENT INFORMATION
        // ==========================================

        console.log("========== CHECKOUT DEBUG ==========");

        console.log("User ID:", req.user?._id);
        console.log("User email:", req.user?.email);

        console.log("Fullname:", fullname);
        console.log("Phone:", phone);
        console.log("WhatsApp:", whatsapp);
        console.log("State:", state);
        console.log("Address:", address);

        console.log("Cart items:", cart.length);
        console.log("Products total:", productsTotal);
        console.log("Transport fee:", transportFee);
        console.log("Total amount:", totalAmount);

        console.log("Payment products:", paymentProducts);

        console.log("====================================");
        await Payment.create({

            buyer: req.user._id,

            tx_ref,

            amount: totalAmount,

            fullname,

            phone,

            whatsapp,

            state,

            address,

            transportFee,

            products: paymentProducts,

            status: "Pending"

        });

        console.log("========== FLUTTERWAVE KEY CHECK ==========");

        console.log(
            "FLW_SECRET_KEY exists:",
            !!process.env.FLW_SECRET_KEY
        );

        console.log(
            "FLW_SECRET_KEY length:",
            process.env.FLW_SECRET_KEY
                ? process.env.FLW_SECRET_KEY.length
                : 0
        );

        console.log(
            "FLW_SECRET_KEY prefix:",
            process.env.FLW_SECRET_KEY
                ? process.env.FLW_SECRET_KEY.substring(0, 12)
                : "MISSING"
        );

        console.log("============================================");
        // ==========================================
        // SEND PAYMENT TO FLUTTERWAVE
        // ==========================================

        const response = await axios.post(

            "https://api.flutterwave.com/v3/payments",

            {

                tx_ref,

                amount: totalAmount,

                currency: "NGN",

                redirect_url:
                    "https://a-s-ventures.vercel.app/payment-success.html",

                customer: {

                    email,

                    name: fullname,

                    phonenumber: phone

                },

                customizations: {

                    title: "A&S Ventures",

                    description:
                        "Agricultural Marketplace Payment"

                }

            },

            {

                headers: {

                    Authorization:
                        `Bearer ${process.env.FLW_SECRET_KEY}`,

                    "Content-Type":
                        "application/json"

                }

            }

        );

        res.json({

            paymentLink:
                response.data.data.link,

            tx_ref,

            amount:
                totalAmount

        });

    } catch (error) {

        console.error("========== PAYMENT INITIALIZATION ERROR ==========");

        console.error("Message:", error.message);
        console.error("Status:", error.response?.status);
        console.error("Response:", error.response?.data);
        console.error("Stack:", error.stack);

        console.error("===================================================");

        return res.status(500).json({
            message:
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Payment initialization failed."
        });
    }
};


// ==========================================
// VERIFY PAYMENT
// ==========================================

exports.verifyPayment = async (req, res) => {

    try {

        const transactionId =
            req.params.id;

        // ==========================================
        // VERIFY WITH FLUTTERWAVE
        // ==========================================

        const response = await axios.get(

            `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,

            {

                headers: {

                    Authorization:
                        `Bearer ${process.env.FLW_SECRET_KEY}`

                }

            }

        );

        const payment =
            response.data.data;

        // ==========================================
        // CHECK PAYMENT
        // ==========================================

        if (
            payment.status !== "successful" ||
            payment.currency !== "NGN"
        ) {

            return res.status(400).json({

                message:
                    "Payment was not successful."

            });

        }

        // ==========================================
        // FIND SAVED PAYMENT
        // ==========================================

        const tx_ref =
            payment.tx_ref;

        const savedPayment =
            await Payment.findOne({
                tx_ref
            });

        if (!savedPayment) {

            return res.status(404).json({

                message:
                    "Payment information not found."

            });

        }

        // ==========================================
        // CHECK BUYER
        // ==========================================

        if (
            savedPayment.buyer.toString() !==
            req.user._id.toString()
        ) {

            return res.status(403).json({

                message:
                    "This payment does not belong to you."

            });

        }

        // ==========================================
        // PREVENT DUPLICATE ORDER
        // ==========================================

        const existingOrder =
            await Order.findOne({

                transactionId:
                    String(payment.id)

            });

        if (existingOrder) {

            return res.json({

                message:
                    "Order already exists.",

                order:
                    existingOrder

            });

        }

        // ==========================================
        // GET CART
        // ==========================================

        const cart =
            await Cart.find({

                buyer:
                    req.user._id

            }).populate("product");

        if (cart.length === 0) {

            return res.status(400).json({

                message:
                    "Cart is empty."

            });

        }

        // ==========================================
        // CHECK PAYMENT AMOUNT
        // ==========================================

        if (
            Number(payment.amount) !==
            Number(savedPayment.amount)
        ) {

            return res.status(400).json({

                message:
                    "Payment amount does not match order total.",

                expected:
                    savedPayment.amount,

                paid:
                    payment.amount

            });

        }

        // ==========================================
        // BUILD ORDER PRODUCTS
        // ==========================================

        let productsTotal = 0;

        const products = [];

        cart.forEach(item => {

            if (!item.product) return;

            const product =
                item.product;

            const quantity =
                Number(item.quantity);

            const farmerPrice =
                Number(product.farmerPrice);

            const commission =
                Number(product.commission);

            const sellingPrice =
                Number(product.sellingPrice);

            productsTotal +=
                sellingPrice * quantity;

            products.push({

                product:
                    product._id,

                quantity,

                farmerPrice,

                commission,

                sellingPrice

            });

        });

        // ==========================================
        // FINAL TOTAL
        // ==========================================

        const totalAmount =
            productsTotal +
            Number(savedPayment.transportFee);

        // ==========================================
        // CREATE ORDER
        // ==========================================

        const order =
            await Order.create({

                buyer:
                    req.user._id,

                products,

                totalAmount,

                transactionId:
                    String(payment.id),

                status:
                    "Processing",

                delivery: {

                    fullname:
                        savedPayment.fullname,

                    phone:
                        savedPayment.phone,

                    whatsapp:
                        savedPayment.whatsapp,

                    state:
                        savedPayment.state,

                    address:
                        savedPayment.address

                }

            });

        // ==========================================
        // MARK PAYMENT AS SUCCESSFUL
        // ==========================================

        savedPayment.status =
            "Successful";

        savedPayment.transactionId =
            String(payment.id);

        await savedPayment.save();

        // ==========================================
        // CLEAR CART
        // ==========================================

        await Cart.deleteMany({

            buyer:
                req.user._id

        });

        // ==========================================
        // RESPONSE
        // ==========================================

        res.json({

            message:
                "Payment verified and order created successfully.",

            order

        });

    } catch (error) {

        console.error(
            "VERIFY PAYMENT ERROR:",
            error.response?.data ||
            error.message
        );

        res.status(500).json({

            message:
                error.response?.data ||
                error.message

        });

    }

};