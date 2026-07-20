const axios = require("axios");
const Cart = require("./Cart");
const Order = require("./Order");

exports.initializePayment = async (req, res) => {

    try {

        const { amount, email } = req.body;

        const response = await axios.post(

            "https://api.flutterwave.com/v3/payments",

            {

                tx_ref: "TX-" + Date.now(),

                amount,

                currency: "NGN",

                redirect_url: "http://localhost:3000/payment-success.html",

                customer: {

                    email

                },

                customizations: {

                    title: "A&S Ventures",

                    description: "Marketplace Payment"

                }
            },

            {

                headers: {

                    Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`

                }
            }
        );

        res.json({

            paymentLink: response.data.data.link

        });
    } catch (error) {

        res.status(500).json({

            message: error.response?.data || error.message

        });
    }
};

//Verify Payment

exports.verifyPayment = async (req, res) => {

    try {

        const transaction_id = req.params.id;

        const response = await axios.get(

            `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,

            {

                headers: {

                    Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`

                }
            }
        );

        const payment = response.data.data;

        if (payment.status !== "successful") {

            return res.status(400).json({

                message: "Payment Failed"

            });
        }

        const cart = await Cart.find({

            buyer: req.user._id

        }).populate("product");

        let total = 0;

        const products = [];

        cart.forEach(item => {

            total += item.product.price * item.quantity;

            products.push({

                product: item.product._id,

                quantity: item.quantity,

                price: item.product.price

            });
        });

        if (payment.amount !== total) {

            return res.status(400).json({

                message: "Amount mismatch"

            });
        }

        const exists = await Order.findOne({

            transactionId

        });

        if (exists) {

            return res.json({

                message: "Order already exists"

            });
        }

        const order = await Order.create({

            buyer: req.user._id,

            products,

            totalAmount: total,

            transactionId,

            status: "Paid"

        });

        await Cart.deleteMany({

            buyer: req.user._id

        });

        res.json({

            message: "Payment Verified",

            order

        });

    } catch (error) {

        res.status(500).json({

            message: error.message

        });
    }
};