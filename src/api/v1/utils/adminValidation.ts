import Joi from "joi";

const roles = ["doctor", "manager", "user", "admin"] as const;

export const setUserClaimsSchema = {
    body: Joi.object({
        uid: Joi.string().trim().required(),
        claims: Joi.object({
            role: Joi.string().valid(...roles),
        })
            .min(1)
            .required()
            .unknown(true),
    }),
};
