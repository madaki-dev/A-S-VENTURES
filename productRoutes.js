const express = require("express");

const router = express.Router();

const {

    createProduct,

    getProducts
} = require("./productController");

const protect = require("./authMiddleware");

const farmerOnly = require("./farmerMiddleware");

const upload = require("./Uploads/uploads");

router.post(

    "/",

    protect,

    farmerOnly,

    upload.single("image"),

    createProduct

);

router.get("/", getProducts);

router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("farmer", "fullName phone");
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;