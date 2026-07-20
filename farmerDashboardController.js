const Product = require("./product");
const Order = require("./Order");

// Dashboard Summary
exports.getDashboard = async (req, res) => {

    try {

        const farmerId = req.user._id;

        const products = await Product.find({
            farmer: farmerId
        });

        const orders = await Order.find()
            .populate("buyer", "fullname phone")
            .populate({
                path: "products.product",
                populate: {
                    path: "farmer"
                }
            });

        let revenue = 0;
        let totalOrders = 0;

        const farmerOrders = [];

        orders.forEach(order => {

            order.products.forEach(item => {

                if (
                    item.product &&
                    item.product.farmer &&
                    item.product.farmer._id.toString() === farmerId.toString()
                ) {

                    totalOrders++;

                    revenue += item.farmerPrice * item.quantity;

                    farmerOrders.push({

                        orderId: order._id,

                        buyer: order.buyer,

                        delivery: order.delivery,

                        product: item.product.productName,

                        quantity: item.quantity,

                        farmerPrice: item.farmerPrice,

                        commission: item.commission,

                        transport: item.transport,

                        buyerPaid: item.sellingPrice * item.quantity + item.transport,

                        status: order.status,

                        date: order.createdAt

                    });

                }

            });

        });

        res.json({

            productsUploaded: products.length,

            ordersReceived: totalOrders,

            revenue,

            orders: farmerOrders

        });

    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};

exports.updateStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate({ path: "products.product", populate: { path: "farmer" } });

        if (!order) return res.status(404).json({ message: "Order not found" });

        const farmerId = req.user._id.toString();
        const ownsOrder = order.products.some(item =>
            item.product && item.product.farmer &&
            item.product.farmer._id.toString() === farmerId
        );

        if (!ownsOrder) {
            return res.status(403).json({ message: "You cannot update this order." });
        }

        order.status = req.body.status;
        await order.save();

        res.json({ message: "Order status updated", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
