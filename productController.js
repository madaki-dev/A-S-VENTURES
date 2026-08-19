const Product = require("./product");

// ===============================
// CREATE PRODUCT
// ===============================

exports.createProduct = async (req, res) => {
    try {

        const {
            productName,
            category,
            quantity,
            location,
            description
        } = req.body;

        // ===============================
        // VALIDATION
        // ===============================

        if (
            !productName ||
            !category ||
            !quantity ||
            !location ||
            !description
        ) {
            return res.status(400).json({
                message: "Please complete all product information."
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Product image is required."
            });
        }

        const quantityNumber = Number(quantity);

        if (
            !Number.isFinite(quantityNumber) ||
            quantityNumber <= 0
        ) {
            return res.status(400).json({
                message: "Please enter a valid quantity."
            });
        }

        // ===============================
        // FARMER PRICE
        // ===============================

        const farmerPrice = Number(req.body.price);

        if (
            !Number.isFinite(farmerPrice) ||
            farmerPrice <= 0
        ) {
            return res.status(400).json({
                message: "Please enter a valid product price."
            });
        }

        // ===============================
        // A&S 10% COMMISSION
        // ===============================

        const commission = farmerPrice * 0.10;

        const sellingPrice =
            farmerPrice + commission;

        // ===============================
        // CREATE PRODUCT
        // ===============================

        const product = await Product.create({

            farmer: req.user._id,

            productName,

            category,

            quantity: quantityNumber,

            stock: quantityNumber,

            location,

            description,

            farmerPrice,

            commission,

            sellingPrice,

            image: req.file.filename

        });

        // ===============================
        // RESPONSE
        // ===============================

        res.status(201).json({

            message: "Product uploaded successfully.",

            product

        });

    } catch (error) {

        console.error(
            "CREATE PRODUCT ERROR:",
            error
        );

        res.status(500).json({
            message:
                error.message ||
                "Failed to create product."
        });
    }
};


// ===============================
// GET PRODUCTS
// ===============================

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

        const totalProducts =
            await Product.countDocuments(keyword);

        const products = await Product.find(keyword)
            .skip(skip)
            .limit(limit)
            .populate("farmer", "fullName phone");

        // Send pagination information in headers
        res.set("X-Current-Page", page);
        res.set(
            "X-Total-Pages",
            Math.ceil(totalProducts / limit)
        );

        // Keep the response as an ARRAY
        res.json(products);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message
        });

    }
};