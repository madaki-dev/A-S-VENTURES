const express = require("express");

const router = express.Router();

const {

    createTransport,

    getTransport,

    getTransportPrices,

    getTransportPriceByState,

    updateTransportPrice

} = require("./transportController");

router.post("/", createTransport);

router.get("/", getTransport);

router.get("/prices", getTransportPrices);

router.get("/prices/:state", async (req, res) => {

    try {

        const Transport = require("./Transport");

        const transport =
            await Transport.findOne({
                state: req.params.state
            });

        if (!transport) {

            return res.status(404).json({
                message:
                    "Transport price not found."
            });

        }

        res.json(transport);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

router.patch("/:id", updateTransportPrice);

module.exports = router;