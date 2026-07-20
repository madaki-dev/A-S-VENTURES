const Order = require("./Order");
const Cart = require("./Cart");

exports.createOrder = async (req, res) => {

    try {

        const cart = await Cart.find({
            buyer: req.user._id
        }).populate("product");

        if (cart.length === 0) {

            return res.status(400).json({

                message: "Cart is empty."

            });
        }

        const { fullname, phone, whatsapp, state, address, transactionId } = req.body;
        if (!fullname || !phone || !whatsapp || !state || !address) {
            return res.status(400).json({ message: "Delivery details required." });
        }

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

        const order = await Order.create({

            buyer: req.user._id,

            products,

            totalAmount: total,

            transactionId: req.body.transactionId,

            status: "Pending"
        });

        await Cart.deleteMany({
            buyer: req.user._id
        });

        res.status(201).json({

            message: "Order placed successfully.",

            order

        });
    } catch (error) {

        res.status(500).json({

            message: error.message

        });
    }
};

//Get Buyer's Orders

exports.getMyOrders = async (req, res) => {

    try {

        const orders = await Order.find({

            buyer: req.user._id

        }).populate("products.product");

        res.json(orders);
    } catch (error) {

        res.status(500).json({

            message: error.message

        });
    }
};

//Farmer Dashboard

exports.getFarmerSales = async (req, res) => {

    try {

        const order = await Order.find()

            .populate("products.products")
            .populate("buyer", "fullname email");

        const sales = [];

        order.forEach(order => {

            order.products.forEach(item => {

                if (
                    item.product &&
                    item.product.farmer.toString() === req.user._id.toString()
                ) {

                    sales.push({

                        buyer: order.buyer.fullname,

                        product: item.product.productName,

                        quantity: item.quantity,

                        amount: item.price * item.quantity,

                        date: order.createdAt

                    });
                }
            });
        });
    } catch (error) {

        res.status(500).json({

            message: error.message

        });
    }
};

//Update Order Status

exports.updateOrderStatus = async (req, res) => {

    try {

        const order = await Order.findById(req.params.id)

            .populate({

                path: "products.product",

                populate: {

                    path: "farmer"

                }

            });

        if (!order) {

            return res.status(404).json({

                message: "Order not found"

            });

        }

        const farmerId = req.user._id.toString();

        const ownsOrder = order.products.some(item => {

            return item.product &&
                item.product.farmer &&
                item.product.farmer._id.toString() === farmerId;

        });

        if (!ownsOrder) {

            return res.status(403).json({

                message: "You cannot update this order."

            });

        }

        order.status = req.body.status;

        await order.save();

        res.json({
            message: "Order status updated",
            order
        });
    } catch (error) {

        res.status(500).json({

            message: error.message

        });
    }
};

exports.confirmFarmerDetails = async (req, res) => {
    try {
        const { farmerName, farmerPhone, accountNumber } = req.body;
        if (!farmerName || !farmerPhone || !accountNumber) {
            return res.status(400).json({ message: "Farmer details required." });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.farmerConfirmation = { farmerName, farmerPhone, accountNumber };
        await order.save();

        res.json({ message: "Farmer details confirmed", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
