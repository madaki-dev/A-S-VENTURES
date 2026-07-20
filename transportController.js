const Transport = require("./Transport");

exports.createTransport = async (req, res) => {

    try {

        const transport = await Transport.create(req.body);

        res.status(201).json(transport);

    } catch (error) {

        res.status(500).json({

            message: error.message

        });
    }
};

exports.getTransport = async (req, res) => {

    try {

        const transport = await Transport.find();

        res.json(transport);

    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }
};

// Get All States

exports.getTransportPrices = async (req, res) => {

    try {

        const prices = await Transport.find().sort({

            state: 1

        });

        res.json(prices);

    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};

// Update Price

exports.updateTransportPrice = async (req, res) => {

    try {

        const transport = await Transport.findByIdAndUpdate(

            req.params.id,

            {

                transportPrice: req.body.transportPrice

            },

            {

                new: true

            }

        );

        res.json(transport);

    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};