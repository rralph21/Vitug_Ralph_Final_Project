import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { generateSwaggerSpec } from "./swaggerConfig";

export const setupSwagger = (app: Express): void => {
    const swaggerSpec = generateSwaggerSpec();

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get("/api-docs.json", (_req, res) => {
        res.json(swaggerSpec);
    });
};
