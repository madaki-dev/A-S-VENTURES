const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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

    transportFee: {
        type: Number,
        required: true
    },

    totalAmount: {
        type: Number,
        required: true
    },

    transactionId: String,

    status: {
        type: String,
        enum: [
            "Pending",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled"
        ],
        default: "Pending"
    },

    delivery: {

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
        }
    },

    farmerConfirmation: {
        farmerName: { type: String },
        farmerPhone: { type: String },
        accountNumber: { type: String },
        bankName: { type: String },
        accountName: { type: String }
    }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);