const multer = require("multer");

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, "uploads/");  // save to uploads folder

    },

    filename: function (req, file, cb) {

        cb(null, Date.now() + "_" + file.originalname); // unique filename

    }
});

const fileFilter = (req, file, cb) => {

    if (file.mimetype.startsWith("image/")) {

        cb(null, true);

    } else {

        cb(new Error("Only image files are allowed."), false);

    }
};

const upload = multer({

    storage,

    fileFilter
});

module.exports = upload;