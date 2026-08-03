const Product = require("./product");


// ===============================
// CREATE PRODUCT
// ===============================

exports.createProduct = async (req, res) => {

    try {

        const farmerPrice = Number(req.body.price);

        if (!farmerPrice || farmerPrice <= 0) {

            return res.status(400).json({
                message: "Please enter a valid product price."
            });

        }


        // A&S 10% commission
        const commission = farmerPrice * 0.10;


        // Farmer price + 10% commission
        const sellingPrice = farmerPrice + commission;


        const {
            productName,
            category,
            quantity,
            location,
            description,
            stock
        } = req.body;


        if (!req.file) {

            return res.status(400).json({
                message: "Product image is required."
            });

        }


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

        console.error(
            "CREATE PRODUCT ERROR:",
            error
        );

        res.status(500).json({

            message: error.message

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