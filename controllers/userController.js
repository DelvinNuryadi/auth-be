import userModel from "../models/userModel.js";

export const getUserData = async (req, res, next) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        return res.json({
            message: "user retrieved",
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified,
            },
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};
