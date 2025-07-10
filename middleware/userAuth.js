import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        const error = new Error("Not authenticated");
        error.statusCode = 401;
        return next(error);
    }
    try {
        const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!tokenDecoded.id) {
            const error = new Error("Not Authorized");
            error.statusCode = 401;
            throw error;
        }
        req.userId = tokenDecoded.id;
        next();
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

export default userAuth;
