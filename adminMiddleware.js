const adminOnly = (req, res, next) => {

    if (!req.user) {

        return res.status(401).json({

            message: "Not Authorized"

        });

    }

    if (req.user.role !== "Admin") {

        return res.status(403).json({

            message: "Admin Access Only"

        });

    }

    next();

};

module.exports = adminOnly;