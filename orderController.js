const Order = require("./Order");
const Cart = require("./Cart");

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

            .populate("products.product")
            .populate("buyer", "fullName email");

        const sales = [];

        order.forEach(order => {

            order.products.forEach(item => {

                if (
                    item.product &&
                    item.product.farmer.toString() === req.user._id.toString()
                ) {

                    sales.push({

                        buyer: order.buyer.fullName,

                        product: item.product.productName,

                        quantity: item.quantity,

                        amount: item.sellingPrice * item.quantity,

                        date: order.createdAt

                    });
                }
            });
        });
        res.json(sales);
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
        const { farmerName, farmerPhone, accountNumber, bankName, accountName } = req.body;
        if (!farmerName || !farmerPhone || !accountNumber || !bankName || !accountName) {
            return res.status(400).json({ message: "Farmer details required." });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.farmerConfirmation = { farmerName, farmerPhone, accountNumber, bankName, accountName };
        await order.save();

        res.json({ message: "Farmer details confirmed", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
