import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import aptRoutes from "./api/v1/routes/aptRoutes";
import {
    accessLogger,
    errorLogger,
    consoleLogger,
} from "./api/v1/middleware/logger";
import errorHandler from "./api/v1/middleware/errorHander";
import { apiHelmetConfig } from "./config/helmetConfig";
import { getCorsOptions } from "./config/corsConfig";
import adminRoutes from "./api/v1/routes/adminRoutes";
import { setupSwagger } from "./config/swagger";


const corsOptions = getCorsOptions();

// Initialize Express application
const app: Express = express();


// Apply security headers first (before any routes)
app.use(apiHelmetConfig);


// Logging middleware should run early so all requests are captured.
app.use(accessLogger);
app.use(errorLogger);

if (process.env.NODE_ENV !== "production") {
    app.use(consoleLogger);
}

app.use(express.json());


// Apply CORS middleware with options
app.use(cors(getCorsOptions()));


// Handle preflight requests for all routes
app.options("/{*splat}", cors(corsOptions));

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
/**
 * @swagger
 * /:
 *   get:
 *     summary: Root status message
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Simple online status message
 *         content:
 *           text/plain:
 *             schema:
 *               $ref: '#/components/schemas/RootResponse'
 */
app.get("/", (req, res) => {
    res.send("It's Online!!");
});

// Global error handling middleware (MUST be applied last)
app.use(errorHandler);

export default app;
