const User = require("./User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

exports.register = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            password,
            confirmPassword,
            accountType
        } = req.body;

        if (password !== confirmPassword) {

            return res.status(400).json({
                message: "Passwords do not match."
            });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            phone,
            accountType
        });

        const safeUser = {

            _id: user._id,

            fullName: user.fullName,

            email: user.email,

            phone: user.phone,

            accountType: user.accountType,

        };

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        res.status(201).json({
            message: "Account Created",
            token,
            user: safeUser
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//LOGIN
exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Invalid Email"
            });
        }


        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Incorrect Password"
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login Successful",
            token,
            user
        });
    }

    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};