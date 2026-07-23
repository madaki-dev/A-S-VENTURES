const User = require("./User");

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const user = await User.findById(req.user._id);
        user.profileImage = req.file.filename;
        await user.save();

        res.json({ message: "Profile image updated", filename: req.file.filename });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
