const Order = require("./Order");

// Dashboard Summary
exports.getDashboard = async (req, res) => {

    try {

        const orders = await Order.find()
            .populate("buyer", "fullname phone whatsapp")
            .populate({
                path: "products.product",
                populate: {
                    path: "farmer",
                    select: "fullname phone"
                }
            });

        let totalSales = 0;
        let totalCommission = 0;

        orders.forEach(order => {

            totalSales += order.totalAmount;

            order.products.forEach(item => {

                if (item.commission) {
                    totalCommission += item.commission * item.quantity;
                }

            });

        });

        res.json({

            totalSales,

            totalOrders: orders.length,

            commissionEarned: totalCommission

        });

    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};



// Get All Orders

exports.getAllOrders = async (req, res) => {

    try {

        const orders = await Order.find()

            .populate("buyer", "fullname email phone")

            .populate({

                path: "products.product",

                populate: {

                    path: "farmer",

                    select: "fullname phone"

                }

            });

        const formattedOrders = orders.map(order => {

            return {

                orderId: order._id,

                buyer: order.buyer,

                status: order.status,

                transactionId: order.transactionId,

                date: order.createdAt,

                totalPaid: order.totalAmount,

                delivery: order.delivery,

                products: order.products.map(item => ({

                    product: item.product.productName,

                    farmer: item.product.farmer.fullname,

                    quantity: item.quantity,

                    farmerPrice: item.farmerPrice,

                    commission: item.commission,

                    transport: item.transport,

                    sellingPrice: item.sellingPrice

                }))

            };

        });

        res.json(formattedOrders);

    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};