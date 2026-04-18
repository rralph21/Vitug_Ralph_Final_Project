import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Medical Appointment API",
            version: "1.0.0",
            description:
                "Swagger documentation for the medical appointment backend API.",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Local server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                HealthResponse: {
                    type: "object",
                    properties: {
                        status: { type: "string", example: "OK" },
                        uptime: { type: "number", example: 12.34 },
                        timestamp: {
                            type: "string",
                            format: "date-time",
                        },
                        version: { type: "string", example: "1.0.0" },
                    },
                },
                SetClaimsRequest: {
                    type: "object",
                    required: ["uid", "claims"],
                    properties: {
                        uid: {
                            type: "string",
                            example: "firebase-user-id",
                        },
                        claims: {
                            type: "object",
                            properties: {
                                role: {
                                    type: "string",
                                    enum: ["doctor", "manager", "user", "admin"],
                                    example: "admin",
                                },
                            },
                        },
                    },
                },
                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        error: {
                            type: "object",
                            properties: {
                                message: {
                                    type: "string",
                                    example: "Validation error",
                                },
                                code: {
                                    type: "string",
                                    example: "BAD_REQUEST",
                                },
                            },
                        },
                        timestamp: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },
            },
        },
    },
    apis: [
        "./src/app.ts",
        "./src/api/v1/routes/*.ts",
        "./src/api/v1/validation/aptSchemas.swagger.ts",
    ],
};

export const generateSwaggerSpec = (): object => swaggerJsdoc(swaggerOptions);
