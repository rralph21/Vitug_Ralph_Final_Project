import Joi from "joi";

const aptStatuses = ["pending", "open", "full", "delayed", "cancelled"] as const;

const aptStatusSchema = Joi.string().valid(...aptStatuses);

const appointmentIdSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

const createAppointmentPayloadSchema = Joi.object({
    clinic: Joi.string().trim().min(2).required(),
    type: Joi.string().trim().min(2).required(),
    spots: Joi.number().integer().min(0).required(),
    status: aptStatusSchema.required(),
});

const updateAppointmentPayloadSchema = Joi.object({
    clinic: Joi.string().trim().min(2),
    type: Joi.string().trim().min(2),
    spots: Joi.number().integer().min(0),
    status: aptStatusSchema,
}).min(1);

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
