import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

export function generateToken(data, expiresIn = 86400) {
    try {
        let token = jwt.sign(data, JWT_SECRET, { expiresIn: expiresIn * 1000 });
        return token;
    } catch (error) {
        throw error;
    }
}

export function verifyToken(token) {
    try {
        if (token === "null") {
            throw new Error("Token not provided");
        }
        let payload = jwt.verify(token, JWT_SECRET);
        return payload;
    } catch (error) {
        throw error;
    }
}
