import express, { Express } from "express";

// Initialize Express application
const app: Express = express();


app.use(express.json());

// Sample healt check
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

export default app;