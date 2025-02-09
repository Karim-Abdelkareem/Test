import { promisify } from "util";
import User from "../Models/User.model.js";
import ApiError from "../Utills/ApiError.js";
import jwt from "jsonwebtoken";

export const protectedRoutes = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ status: "fail", message: "Must provide a valid token!" });
        }

        const token = authHeader.split(" ")[1]; // Extract the token

        if (!token) {
            return res.status(401).json({ status: "fail", message: "Token missing!" });
        }

        // Verify Token
        const payload = await promisify(jwt.verify)(token, process.env.JWT_KEY);

        if (!payload || !payload._id) {
            return res.status(403).json({ status: "fail", message: "Invalid token payload!" });
        }

        // Fetch user from DB
        const user = await User.findById(payload._id);

        if (!user) {
            return res.status(404).json({ status: "fail", message: `No user found with ID: ${payload._id}` });
        }

        // Attach user data to the request
        req.user = user;
        req.role = user.role;
        req._id = user._id;

        next();
    } catch (error) {
        console.error("JWT Error:", error);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired. Please log in again.", action: "LOGIN_REQUIRED" });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(403).json({ error: "Invalid Token" });
        }

        next(new ApiError("Authentication Error", 500));
    }
};


export const restrictedTo = (...roles) => {
  // Must Return Function
    return function (req, res, next) {
        if (!roles.includes(req.role)) {
            return res.status(403).json({
                message: "You're Not Authorized",
        });
        } else {
            next();
        }
    };
};

// Middleware to Restrict Access to Admin or Super-Admin
export const restrictToAdminOrSuperAdmin = (req, res, next) => {
    const { role } = req;
    
        if (!["admin", "super-admin"].includes(role)) {
        return res.status(403).json({
            status: "fail",
            message: "You Are Not Autorized !",
        });
        }
    
        next();
};