import Joi from "joi";

export const todoSchema = Joi.object({
    todo: Joi.string().min(1).required(),
    date: Joi.date().required(),
}).options({ stripUnknown: true });

export const todoStatusSchema = Joi.object({
    status: Joi.string().valid("Completed", "Progress", "Pending").required(),
}).options({ stripUnknown: true });
