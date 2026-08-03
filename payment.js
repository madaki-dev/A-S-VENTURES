const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({

    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    tx_ref: {
        type: String,
        required: true,
        unique: true
    },

    transactionId: {
        type: String
    },

    amount: {
        type: Number,
        required: true
    },

    fullname: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    whatsapp: {
        type: String,
        required: true
    },

    state: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    transportFee: {
        type: Number,
        required: true
    },

    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },

            quantity: Number,

            farmerPrice: Number,

            commission: Number,

            sellingPrice: Number
        }
    ],

    status: {
        type: String,
        enum: [
            "Pending",
            "Successful",
            "Failed"
        ],
        default: "Pending"
    }

}, {
    timestamps: true
});

module.exports =
    mongoose.model("Payment", paymentSchema);