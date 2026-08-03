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

// Get transport price for a specific state
exports.getTransportPriceByState = async (req, res) => {

    try {

        const state = req.params.state;

        const transport = await Transport.findOne({
            state: {
                $regex: `^${state}$`,
                $options: "i"
            }
        });

        if (!transport) {

            return res.status(404).json({
                message: "Transport price not found for this state."
            });

        }

        res.json(transport);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};