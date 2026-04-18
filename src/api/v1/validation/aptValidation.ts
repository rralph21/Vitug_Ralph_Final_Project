import Joi from "joi";

const aptStatuses = ["pending", "open", "full", "delayed", "cancelled"] as const;

const aptStatusSchema = Joi.string().valid(...aptStatuses);

const appointmentIdSchema = Joi.object({
    id: Joi.number().integer().positive().max(50).required().messages({
        "any.required": '"id" is required',
        "number.base": '"id" must be a number',
        "number.integer": '"id" must be an integer',
        "number.positive": '"id" must be a positive number',
        "number.max": '"id" must be less than or equal to 50',
    }),
});

const createAppointmentPayloadSchema = Joi.object({
    clinic: Joi.string().trim().min(2).required().messages({
        "any.required": '"clinic" is required',
        "string.base": '"clinic" must be a string',
        "string.empty": '"clinic" is required',
        "string.min": '"clinic" length must be at least 2 characters long',
    }),
    type: Joi.string().trim().min(2).required().messages({
        "any.required": '"type" is required',
        "string.base": '"type" must be a string',
        "string.empty": '"type" is required',
        "string.min": '"type" length must be at least 2 characters long',
    }),
    spots: Joi.number().integer().min(0).required().messages({
        "any.required": '"spots" is required',
        "number.base": '"spots" must be a number',
        "number.integer": '"spots" must be an integer',
        "number.min": '"spots" must be greater than or equal to 0',
    }),
    status: aptStatusSchema.required().messages({
        "any.required": '"status" is required',
        "string.base": '"status" must be a string',
        "any.only": `"status" must be one of [${aptStatuses.join(", ")}]`,
    }),
});

const updateAppointmentPayloadSchema = Joi.object({
    clinic: Joi.string().trim().min(2).messages({
        "string.base": '"clinic" must be a string',
        "string.min": '"clinic" length must be at least 2 characters long',
    }),
    type: Joi.string().trim().min(2).messages({
        "string.base": '"type" must be a string',
        "string.min": '"type" length must be at least 2 characters long',
    }),
    spots: Joi.number().integer().min(0).messages({
        "number.base": '"spots" must be a number',
        "number.integer": '"spots" must be an integer',
        "number.min": '"spots" must be greater than or equal to 0',
    }),
    status: aptStatusSchema.messages({
        "string.base": '"status" must be a string',
        "any.only": `"status" must be one of [${aptStatuses.join(", ")}]`,
    }),
})
    .min(1)
    .messages({
        "object.min": "At least one appointment field must be provided",
    });

const wrappedBody = (schema: Joi.ObjectSchema) =>
    Joi.object({
        item: schema.required(),
    });

export const createAptSchema = {
    body: Joi.alternatives().try(
        createAppointmentPayloadSchema,
        wrappedBody(createAppointmentPayloadSchema)
    ),
};

export const updateAptSchema = {
    params: appointmentIdSchema,
    body: Joi.alternatives().try(
        updateAppointmentPayloadSchema,
        wrappedBody(updateAppointmentPayloadSchema)
    ),
};

export const aptIdSchema = {
    params: appointmentIdSchema,
};
