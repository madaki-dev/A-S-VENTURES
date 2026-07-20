const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    accountType: {
        type: String,
        enum: ["Farmer", "Buyer"],
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    role: {

        type: String,

        enum: ["Admin", "Farmer", "Buyer"],

        default: "Buyer"

    }
});

module.exports = mongoose.model("User", userSchema);