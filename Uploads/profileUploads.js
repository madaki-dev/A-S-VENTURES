const multer = require("multer");
const cloudinary = require("../cloudinary");


// ==========================================
// MULTER MEMORY STORAGE
// ==========================================

const storage = multer.memoryStorage();


// ==========================================
// FILE FILTER
// ==========================================

const fileFilter = (req, file, cb) => {

    if (
        file.mimetype &&
        file.mimetype.startsWith("image/")
    ) {

        cb(null, true);

    } else {

        cb(
            new Error("Only image files are allowed."),
            false
        );

    }

};


// ==========================================
// MULTER
// ==========================================

const upload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});


// ==========================================
// UPLOAD PROFILE IMAGE TO CLOUDINARY
// ==========================================

const uploadProfileToCloudinary =
    async (req, res, next) => {

        try {

            if (!req.file) {
                return next();
            }

            const result =
                await new Promise((resolve, reject) => {

                    const stream =
                        cloudinary.uploader.upload_stream(

                            {
                                folder:
                                    "as-ventures/profiles",

                                transformation: [
                                    {
                                        width: 500,
                                        height: 500,
                                        crop: "fill",
                                        gravity: "face",
                                        quality: "auto"
                                    }
                                ]
                            },

                            (error, result) => {

                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result);
                                }

                            }

                        );

                    stream.end(req.file.buffer);

                });


            req.file.path =
                result.secure_url;

            req.file.filename =
                result.public_id;

            req.file.cloudinaryUrl =
                result.secure_url;

            req.file.public_id =
                result.public_id;


            next();

        } catch (error) {

            console.error(
                "PROFILE CLOUDINARY ERROR:",
                error
            );

            return res.status(500).json({

                message:
                    "Profile image upload to Cloudinary failed."

            });

        }

    };


module.exports = {
    upload,
    uploadProfileToCloudinary
};