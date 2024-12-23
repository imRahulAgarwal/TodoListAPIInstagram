import express from "express";
import { rateLimit } from "express-rate-limit";
import { isLoggedIn, isNotLoggedIn } from "../middlewares/authMiddleware.js";
import * as userController from "../controllers/controller.js";
import * as todoController from "../controllers/todoController.js";

const router = express.Router();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100, // 100 Requests / 15 Minutes
    handler: (req, res, next, options) => {
        return res.status(options.statusCode).json({ success: false, message: options.message });
    },
});

router.post("/register", limiter, isNotLoggedIn, userController.register);
router.post("/login", limiter, isNotLoggedIn, userController.login);
router.post("/send/verification/mail", limiter, isNotLoggedIn, userController.sendMail);
router.post("/otp/verification", limiter, isNotLoggedIn, userController.verifyOtp);
router.post("/forgot-password", limiter, isNotLoggedIn, userController.forgotPassword);
router.post("/reset-password/:token", limiter, isNotLoggedIn, userController.resetPassword);

router.use(isLoggedIn);

// Profile related endpoints
router.get("/profile", userController.profile);
router.patch("/profile", limiter, userController.updateProfile);

// Remove the token from frontend after changing the password
router.post("/change-password", limiter, userController.changePassword);

// Todos related endpoints
router.get("/todos", todoController.getTodos);
router.get("/todos/:todoId", todoController.getTodoById);
router.post("/todos", limiter, todoController.createTodo);
router.patch("/todos/status/:todoId", limiter, todoController.updateTodoStatus);
router.put("/todos/:todoId", limiter, todoController.updateTodo);
router.delete("/todos/:todoId", limiter, todoController.deleteTodo);

export default router;
