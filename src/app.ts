import express, { Express } from "express";
import dotenv from "dotenv";
dotenv.config();

import aptRoutes from "./api/v1/routes/aptRoutes";
import {
    accessLogger,
    errorLogger,
    consoleLogger,
} from "./api/v1/middleware/logger";
import errorHandler from "./api/v1/middleware/errorHander";

import adminRoutes from "./api/v1/routes/adminRoutes";
import { setupSwagger } from "./config/swagger";


// Initialize Express application
const app: Express = express();

// Logging middleware should run early so all requests are captured.
app.use(accessLogger);
app.use(errorLogger);

if (process.env.NODE_ENV !== "production") {
    app.use(consoleLogger);
}

app.use(express.json());

setupSwagger(app);

app.use("/api/v1", aptRoutes);
app.use("/api/v1", adminRoutes);

// Sample health check
/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: API health information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
app.get("/api/v1/health", (req, res) => {
    res.json({
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: "1.0.0",
    });
});


// Define a route
app.get("/", (req, res) => {
    res.send("It's Online!!");
});

// Global error handling middleware (MUST be applied last)
app.use(errorHandler);

export default app;
