const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

require("dotenv").config();

const authRoutes = require("./authRoutes");
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config");
const protect = require("./authMiddleware");
const productRoutes = require("./productRoutes");
const cartRoutes = require("./cartRoutes");
const paymentRoutes = require("./paymentRoutes");
const orderRoutes = require("./orderRoutes");
const transportRoutes = require("./transportRoutes");
const adminRoutes = require("./adminRoutes");
const farmerDashboardRoutes = require("./farmerDashboardRoutes");


const app = express();

connectDB();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Serve Frontend folder
app.use(express.static(path.join(__dirname, "Frontend")));

app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/payment", paymentRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/transport", transportRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/farmer-dashboard", farmerDashboardRoutes);

//Images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Test Route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: "A&S Ventures Backend Running"
    });
});

app.get("/api/profile", protect, (req, res) => {

    res.json(req.user);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
