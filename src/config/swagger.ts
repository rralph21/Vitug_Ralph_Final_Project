import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { generateSwaggerSpec } from "./swaggerConfig";

export const setupSwagger = (app: Express): void => {
    const swaggerSpec = generateSwaggerSpec();

    /**
     * @swagger
     * /api-docs:
     *   get:
     *     summary: Swagger UI
     *     tags:
     *       - Documentation
     *     responses:
     *       200:
     *         description: Interactive Swagger UI page
     *         content:
     *           text/html:
     *             schema:
     *               type: string
     */
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    /**
     * @swagger
     * /api-docs.json:
     *   get:
     *     summary: OpenAPI JSON document
     *     tags:
     *       - Documentation
     *     responses:
     *       200:
     *         description: Raw OpenAPI JSON specification
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     */
    app.get("/api-docs.json", (_req, res) => {
        res.json(swaggerSpec);
    });
};
