const multer = require("multer");
const { CloudinaryStorage } =
    require("multer-storage-cloudinary");

const cloudinary =
    require("../cloudinary");

const storage =
    new CloudinaryStorage({

        cloudinary,

        params: {

            folder:
                "as-ventures/profiles",

            allowed_formats: [
                "jpg",
                "jpeg",
                "png",
                "webp"
            ],

            transformation: [
                {
                    width: 500,
                    height: 500,
                    crop: "fill",
                    gravity: "face",
                    quality: "auto"
                }
            ]

        }

    });

const fileFilter =
    (req, file, cb) => {

        if (
            file.mimetype
                .startsWith("image/")
        ) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Only image files are allowed."
                ),
                false
            );

        }

    };

const upload =
    multer({

        storage,

        fileFilter,

        limits: {

            fileSize:
                5 * 1024 * 1024

        }

    });

module.exports = upload;