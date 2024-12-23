const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Send JSON response
    res.status(statusCode).json({ success: false, error: message });
};

export default errorMiddleware;
