import { verifyToken } from "../utils/token.js";
import User from "../models/user.js";
import ErrorHandler from "../utils/errorHandler.js";

// Helper function to retrieve stored token synchronously from the database
async function getUserDataFromDatabase(userId) {
    try {
        let user = await User.findOne({ _id: userId, isDeleted: false, isVerified: true });

        if (!user) {
            return null;
        }

        return user;
    } catch (err) {
        console.error("Error retrieving token from database:", err);
        return null;
    }
}

// Middleware to check if the user is not logged in
export async function isNotLoggedIn(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
        // No token provided, proceed to next (user is not logged in)
        return next();
    }
    try {
        // Synchronously verify token
        const payload = verifyToken(token);
        // Use the helper function to retrieve user data from the database
        const user = await getUserDataFromDatabase(payload.id);
        if (user) {
            // User is logged in
            return res.status(200).json({ success: false, message: "User is logged in" });
        }
    } catch (err) {
        // Token verification failed or not found in DB, proceed (user not logged in)
    }

    // If no redirect, proceed to the next middleware
    return next();
}

// Middleware to check if the user is logged in
export async function isLoggedIn(req, res, next) {
    try {
        const token = req.headers["authorization"]?.split(" ")[1];
        if (!token) {
            // No token provided, redirect to login page
            return next(new ErrorHandler("Token not provided", 401));
        }

        // Synchronously verify token
        const payload = verifyToken(token);
        const user = await getUserDataFromDatabase(payload.id);
        if (user) {
            // Token is valid and exists in DB, proceed
            req.user = user; // Storing decoded info for use in other routes
            return next();
        }
    } catch (err) {
        // Token verification failed or not found in DB, redirect to login page
    }

    // If no token found or invalid, redirect to login
    return res.status(401).json({ success: false, message: "User is not logged in" });
}
