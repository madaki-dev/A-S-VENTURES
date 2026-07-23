const express = require("express");
const router = express.Router();
const { getProfile, uploadProfileImage } = require("./profileController");
const protect = require("./authMiddleware");
const multer = require("multer");

// configure multer for uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

router.get("/", protect, getProfile);
router.post("/upload-profile", protect, upload.single("image"), uploadProfileImage);

module.exports = router;
