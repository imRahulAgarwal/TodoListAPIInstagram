import Joi from "joi";

export const registerSchema = Joi.object({
    name: Joi.string().min(2).max(30).trim().required().label("Name"),
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .trim()
        .label("Email"),
    password: Joi.string().min(6).required().trim().label("Password"),
    confirmPassword: Joi.string().equal(Joi.ref("password")).trim().required().label("Confirm Password"),
}).options({ stripUnknown: true });

export const loginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .trim()
        .label("Email"),
    password: Joi.string().min(6).trim().required().label("Password"),
}).options({ stripUnknown: true });

export const validateEmail = Joi.string().email().trim().lowercase().required().label("Email");

export const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().trim().min(6).required().label("Old Password"),
    newPassword: Joi.string().trim().min(6).required().label("New Password"),
    confirmPassword: Joi.string().equal(Joi.ref("newPassword")).trim().required().label("Confirm Password").messages({
        "any.only": "Passwords are not same",
    }),
}).options({ stripUnknown: true });

export const resetPasswordSchema = Joi.object({
    newPassword: Joi.string().trim().min(6).required().label("New Password"),
    confirmPassword: Joi.string().equal(Joi.ref("newPassword")).trim().required().label("Confirm Password").messages({
        "any.only": "Passwords are not same",
    }),
}).options({ stripUnknown: true });

export const profileSchema = Joi.object({
    name: Joi.string().min(2).max(30).trim().required().label("Name"),
}).options({ stripUnknown: true });
