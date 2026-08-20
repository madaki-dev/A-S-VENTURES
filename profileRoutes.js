const express = require("express");

const router =
    express.Router();

const protect =
    require("./authMiddleware");

const {
    getProfile,
    uploadProfileImage
} = require("./profileController");

const upload =
    require("./Uploads/profileUploads");


// ==============================
// GET PROFILE
// ==============================

router.get(
    "/",
    protect,
    getProfile
);


// ==============================
// UPLOAD PROFILE IMAGE
// ==============================

router.post(
    "/upload-profile",
    protect,
    upload.single("image"),
    uploadProfileImage
);


module.exports = router;