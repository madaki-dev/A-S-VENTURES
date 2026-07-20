const Cart = require("./Cart");
const Product = require("./product");

//Add Product To Cart

exports.addToCart = async (req, res) => {

    try {

        const { productId, quantity } = req.body;

        const product = await Product.findById(productId);

        if (!product) {

            return res.status(404).json({

                message: "Product not found"

            });

        }

        const exists = await Cart.findOne({
            buyer: req.user._id,
            product: productId
        });

        if (exists) {

            exists.quantity += quantity || 1;

            await exists.save();

            return res.json({
                message: "Cart updated"
            });
        }

        await Cart.create({

            buyer: req.user._id,

            product: productId,

            quantity: quantity || 1
        });

        res.status(201).json({

            message: "Added to cart"

        });
    } catch (error) {

        res.status(500).json({

            message: error.message

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