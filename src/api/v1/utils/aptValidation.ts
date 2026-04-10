import Joi from "joi";

export const createLoanSchema = {
    body: Joi.object({
        applicant: Joi.string().trim().min(2).required(),
        amount: Joi.number().positive().required(),
        status: Joi.string()
            .valid("pending", "open", "full", "delayed", "cancelled")
            .required(),
    }),
};

export const updateLoanSchema = {
    body: Joi.object({
        applicant: Joi.string().trim().min(2).optional(),
        amount: Joi.number().positive().optional(),
        status: Joi.string()
            .valid("pending", "open", "full", "delayed", "cancelled")
            .optional(),
    }).min(1),
    params: Joi.object({
        id: Joi.number().integer().positive().required(),
    }),
};

export const loanIdSchema = {
    params: Joi.object({
        id: Joi.number().integer().positive().required(),
    }),
};