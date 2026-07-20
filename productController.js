const Product = require("./product");
const mongoose = require("mongoose");

exports.createProduct = async (req, res) => {

    try {

        const farmerPrice = Number(req.body.price);

        const commission = farmerPrice * 0.4;

        const sellingPrice = farmerPrice + commission;

        const {
            productName,
            category,
            quantity,
            location,
            description,
            stock
        } = req.body;

        const product = await Product.create({
            farmer: req.user._id,
            productName,
            category,
            quantity,
            location,
            description,
            stock,
            farmerPrice,
            commission,
            sellingPrice,
            image: req.file.filename
        });

        res.status(201).json({

            message: "Product uploaded successfully.",

            product
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getProducts = async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;

        const limit = 12;

        const skip = (page - 1) * limit;

        const keyword = req.query.search

            ? {

                productName: {

                    $regex: req.query.search,

                    $options: "i"

                }

            }

            : {};

        const totalProducts = await Product.countDocuments(keyword);

        const products = await Product.find(keyword)

            .skip(skip)

            .limit(limit)

            .populate("farmer", "fullname phone");

        res.json(products);
    } catch (error) {

        res.status(500).json({

            message: error.message

        });
    }

};