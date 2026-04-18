import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/error";
import { HTTP_STATUS } from "../../../constant/httpConstants";
import { errorResponse } from "../models/responseModel";

/**
 * Global error handling middleware for an Express application.
 * Catches all errors passed to next() and formats them into a consistent response format.
 *
 * This middleware:
 * - Handles all AppError subclasses (AuthenticationError, AuthorizationError, etc.)
 * - Provides consistent error response format using errorResponse()
 * - Logs errors for debugging and monitoring
 * - Handles unexpected errors gracefully
 * - Prevents error details from leaking in production
 *
 * @param err - The error object passed from previous middleware or route handlers
 * @param req - Express request object
 * @param res - Express response object
 * @param _next - Express next function (unused but required for Express error middleware signature)
 */
const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!err) {
        console.error("Error: null or undefined error received");
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
            errorResponse("An unexpected error occurred", "UNKNOWN_ERROR")
        );
        return;
    }

    if (res.headersSent) {
        next(err);
        return;
    }

    const normalizedError = err instanceof Error ? err : new Error(String(err));

    // Log the error message for debugging
    console.error(`Error: ${normalizedError.message}`);

    // Log stack trace for non-production environments
    if (process.env.NODE_ENV !== "production") {
        console.error(`Stack: ${normalizedError.stack}`);
    }

    if (normalizedError instanceof AppError) {
        // Handle our custom application errors with their specific status codes
        res.status(normalizedError.statusCode).json(
            errorResponse(normalizedError.message, normalizedError.code)
        );
    } else {
        // Handle unexpected errors (programming errors, third-party library errors, etc.)
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
            errorResponse("An unexpected error occurred", "UNKNOWN_ERROR")
        );
    }
};

export default errorHandler;
