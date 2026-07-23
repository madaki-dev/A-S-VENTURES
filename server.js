const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

require("dotenv").config();

const authRoutes = require("./Backend/authRoutes");
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./Backend/config");
const protect = require("./Backend/authMiddleware");
const productRoutes = require("./Backend/productRoutes");
const cartRoutes = require("./Backend/cartRoutes");
const paymentRoutes = require("./Backend/paymentRoutes");
const orderRoutes = require("./Backend/orderRoutes");
const transportRoutes = require("./Backend/transportRoutes");
const adminRoutes = require("./Backend/adminRoutes");
const farmerDashboardRoutes = require("./Backend/farmerDashboardRoutes");
const profileRoutes = require("./profileRoutes");


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

app.use("/api/profile", profileRoutes);

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
