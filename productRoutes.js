const express = require("express");

const router =
    express.Router();


const Product =
    require("./product");


const {
    createProduct,
    getProducts
} =
    require("./productController");


const protect =
    require("./authMiddleware");


const farmerOnly =
    require("./farmerMiddleware");


const productUpload =
    require("./Uploads/uploads");



// ===============================
// CREATE PRODUCT
// ===============================

router.post(

    "/",

    protect,

    farmerOnly,

    productUpload.single("image"),

    createProduct

);



// ===============================
// GET ALL PRODUCTS
// ===============================

router.get(

    "/",

    getProducts

);



// ===============================
// GET ONE PRODUCT
// ===============================

router.get(

    "/:id",

    async (req, res) => {

        try {

            const product =
                await Product
                    .findById(
                        req.params.id
                    )
                    .populate(
                        "farmer",
                        "fullName phone"
                    );


            if (!product) {

                return res.status(404).json({

                    message:
                        "Product not found"

                });

            }


            return res.json(
                product
            );


        } catch (error) {

            console.error(
                "GET PRODUCT ERROR:",
                error
            );


            return res.status(500).json({

                message:
                    error.message

            });

        }

    }

);


module.exports = router;