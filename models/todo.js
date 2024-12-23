import { Schema, Types, model } from "mongoose";

const todoSchema = new Schema(
    {
        todo: String,
        date: Date,
        status: {
            type: String,
            enum: ["Completed", "Progress", "Pending"],
            default: "Pending",
        },
        userId: { type: Types.ObjectId, ref: "users" },
    },
    { timestamps: true, versionKey: false }
);

const TodoModel = model("todos", todoSchema);

export default TodoModel;
