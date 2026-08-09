const Cart = require("./Cart");
const Product = require("./product");


// ==============================
// ADD TO CART
// ==============================

exports.addToCart = async (req, res) => {

    try {

        const {
            productId,
            quantity
        } = req.body;

        if (!productId) {

            return res.status(400).json({
                message:
                    "Product ID is required."
            });
        }

        const product =
            await Product.findById(
                productId
            );

        if (!product) {

            return res.status(404).json({
                message:
                    "Product not found."
            });
        }

        const qty =
            Number(quantity) || 1;

        if (qty < 1) {

            return res.status(400).json({
                message:
                    "Quantity must be at least 1."
            });
        }

        const exists =
            await Cart.findOne({
                buyer: req.user._id,
                product: productId
            });

        if (exists) {

            exists.quantity += qty;

            await exists.save();

            return res.json({
                message:
                    "Cart updated successfully."
            });
        }

        await Cart.create({

            buyer:
                req.user._id,

            product:
                productId,

            quantity:
                qty

        });

        return res.status(201).json({

            message:
                "Product added to cart."

        });

    } catch (error) {

        console.error(
            "ADD TO CART ERROR:",
            error
        );

        res.status(500).json({

            message:
                error.message

        });
    }
};

//Get Cart

exports.getCart = async (req, res) => {

    try {

        const cart = await Cart.find({

            buyer: req.user._id
        }).populate("product");
        res.json(cart);

    } catch (error) {

        res.status(500).json({

            message: error.message

        });
    }
};

//Remove Item

exports.removeItem = async (req, res) => {

    try {

        await Cart.findByIdAndDelete(req.params.id);

        res.json({

            message: "Item removed"

        });
    } catch (error) {

        res.status(500).json({

            message: error.message

        });
    }
};