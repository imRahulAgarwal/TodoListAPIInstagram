import ErrorHandler from "../utils/errorHandler.js";
import asyncHandler from "../utils/asyncHandler.js";
import TodoModel from "../models/todo.js";
import validateObjectId from "../schemas/objectId.js";
import { todoSchema, todoStatusSchema } from "../schemas/todo.js";

// GET /todos
export const getTodos = asyncHandler(async (req, res, next) => {
    let { page = 1, limit = 10, sort = "createdAt", order = "desc", search = "" } = req.query;
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;

    const filter = {};
    if (search) filter.todo = { $regex: search, $options: "i" };

    const todos = await TodoModel.find(filter, { todo: 1, date: 1, status: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ [sort]: order === "desc" ? -1 : 1 });
    const totalCount = await TodoModel.countDocuments(filter);

    if (!todos.length) {
        return next(new ErrorHandler("No todos found", 404));
    }

    let pages = Math.ceil(totalCount / limit);

    return res.status(200).json({
        success: true,
        data: {
            todos,
            page: page > pages ? 1 : page,
            limit,
            total: totalCount,
            pages,
        },
    });
});

// GET /todos/:todoId
export const getTodoById = asyncHandler(async (req, res, next) => {
    const { todoId } = req.params;

    if (!validateObjectId(todoId)) {
        return next(new ErrorHandler("Invalid Todo ID format", 400));
    }

    const todo = await TodoModel.findOne({ _id: todoId, userId: req.user._id }, { todo: 1, status: 1, date: 1 });

    if (!todo) {
        return next(new ErrorHandler("Todo not found", 404));
    }

    return res.status(200).json({ success: true, data: { todo } });
});

// POST /todos
export const createTodo = asyncHandler(async (req, res, next) => {
    const validation = todoSchema.validate(req.body);
    if (validation.error) {
        return next(new ErrorHandler(validation.error.details[0].message, 422));
    }

    const todo = await TodoModel.create({ ...validation.value, userId: req.user._id });
    return res.status(201).json({
        success: true,
        data: {
            todo: {
                id: todo.id,
                todo: todo.todo,
                status: todo.status,
                date: todo.date,
            },
        },
    });
});

// PUT /todos/:todoId
export const updateTodo = asyncHandler(async (req, res, next) => {
    const { todoId } = req.params;

    if (!validateObjectId(todoId)) {
        return next(new ErrorHandler("Invalid Todo ID format", 400));
    }

    const validation = todoSchema.validate(req.body);
    if (validation.error) {
        return next(new ErrorHandler(validation.error.details[0].message, 422));
    }

    const updatedTodo = await TodoModel.findOneAndUpdate(
        { _id: todoId, userId: req.user._id },
        { $set: validation.value },
        { new: true }
    );

    if (!updatedTodo) {
        return next(new ErrorHandler("Todo not found", 404));
    }

    return res.status(200).json({
        success: true,
        data: {
            todo: {
                id: updatedTodo.id,
                todo: updatedTodo.todo,
                status: updatedTodo.status,
                date: updatedTodo.date,
            },
        },
    });
});

// PATCH /todos/status
export const updateTodoStatus = asyncHandler(async (req, res, next) => {
    const { todoId } = req.params;

    if (!validateObjectId(todoId)) {
        return next(new ErrorHandler("Invalid Todo ID format", 400));
    }

    const validation = todoStatusSchema.validate(req.body);
    if (validation.error) {
        return next(new ErrorHandler(validation.error.details[0].message, 400));
    }

    const { status } = validation.value;

    const updatedTodo = await TodoModel.findOneAndUpdate(
        { _id: todoId, userId: req.user._id },
        { $set: { status } },
        { new: true }
    );

    if (!updatedTodo) {
        return next(new ErrorHandler("Todo not found", 404));
    }

    return res.status(200).json({
        success: true,
        data: {
            todo: {
                id: updatedTodo.id,
                todo: updatedTodo.todo,
                status: updatedTodo.status,
                date: updatedTodo.date,
            },
        },
    });
});

// DELETE /todos/:todoId
export const deleteTodo = asyncHandler(async (req, res, next) => {
    const { todoId } = req.params;

    if (!validateObjectId(todoId)) {
        return next(new ErrorHandler("Invalid Todo ID format", 400));
    }

    const deletedTodo = await TodoModel.findOneAndDelete({ _id: todoId, userId: req.user._id });

    if (!deletedTodo) {
        return next(new ErrorHandler("Todo not found", 404));
    }

    return res.status(200).json({
        success: true,
        message: "Todo deleted successfully",
    });
});
