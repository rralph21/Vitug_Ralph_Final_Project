import Joi from "joi";
import { HTTP_STATUS } from "../src/constant/httpConstants";
import { validateRequest } from "../src/api/v1/middleware/validate";
import authenticate from "../src/api/v1/middleware/authenticate";
import isAuthorized from "../src/api/v1/middleware/authorize";
import errorHandler from "../src/api/v1/middleware/errorHander";
import {
    AppError,
    AuthenticationError,
    AuthorizationError,
} from "../src/api/v1/errors/error";

const mockGetFirebaseAuth = jest.fn();

jest.mock("../src/config/firebaseConfig", () => ({
    getFirebaseAuth: () => mockGetFirebaseAuth(),
}));

type MockResponse = {
    status: jest.Mock;
    json: jest.Mock;
    locals: Record<string, unknown>;
    headersSent: boolean;
};

const createMockResponse = (): MockResponse => {
    const response = {
        status: jest.fn(),
        json: jest.fn(),
        locals: {},
        headersSent: false,
    };

    response.status.mockReturnValue(response);
    response.json.mockReturnValue(response);

    return response;
};

describe("Middleware", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("validateRequest", () => {
        test("sanitizes body fields and calls next for valid input", () => {
            const middleware = validateRequest({
                body: Joi.object({
                    clinic: Joi.string().required(),
                }),
            });
            const req = {
                body: {
                    clinic: "North Clinic",
                    extra: "remove-me",
                },
            };
            const res = createMockResponse();
            const next = jest.fn();

            middleware(req as never, res as never, next);

            expect(req.body).toEqual({ clinic: "North Clinic" });
            expect(next).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
        });

        test("returns 400 when validation fails", () => {
            const middleware = validateRequest({
                params: Joi.object({
                    id: Joi.number().integer().positive().required(),
                }),
            });
            const req = {
                params: {
                    id: "abc",
                },
            };
            const res = createMockResponse();
            const next = jest.fn();

            middleware(req as never, res as never, next);

            expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.stringContaining("Validation error:"),
                })
            );
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("authenticate", () => {
        test("stores uid and role for a valid bearer token", async() => {
            const verifyIdToken = jest.fn().mockResolvedValue({
                uid: "user-123",
                role: "admin",
            });
            mockGetFirebaseAuth.mockReturnValue({ verifyIdToken });

            const req = {
                headers: {
                    authorization: "Bearer good-token",
                },
            };
            const res = createMockResponse();
            const next = jest.fn();

            await authenticate(req as never, res as never, next);

            expect(verifyIdToken).toHaveBeenCalledWith("good-token");
            expect(res.locals.uid).toBe("user-123");
            expect(res.locals.role).toBe("admin");
            expect(next).toHaveBeenCalledWith();
        });

        test("passes an AuthenticationError when the token is missing", async() => {
            mockGetFirebaseAuth.mockReturnValue({
                verifyIdToken: jest.fn(),
            });

            const req = {
                headers: {},
            };
            const res = createMockResponse();
            const next = jest.fn();

            await authenticate(req as never, res as never, next);

            expect(next).toHaveBeenCalledWith(
                expect.any(AuthenticationError)
            );
        });
    });

    describe("isAuthorized", () => {
        test("allows users with an accepted role", () => {
            const middleware = isAuthorized({ hasRole: ["admin"] });
            const req = {
                params: {},
            };
            const res = createMockResponse();
            res.locals.role = "admin";
            const next = jest.fn();

            middleware(req as never, res as never, next);

            expect(next).toHaveBeenCalledWith();
        });

        test("passes an AuthorizationError when the role is not allowed", () => {
            const middleware = isAuthorized({ hasRole: ["admin"] });
            const req = {
                params: {},
            };
            const res = createMockResponse();
            res.locals.role = "user";
            const next = jest.fn();

            middleware(req as never, res as never, next);

            expect(next).toHaveBeenCalledWith(
                expect.any(AuthorizationError)
            );
        });
    });

    describe("errorHandler", () => {
        const originalNodeEnv = process.env.NODE_ENV;

        afterEach(() => {
            process.env.NODE_ENV = originalNodeEnv;
        });

        test("returns the AppError status code and shape", () => {
            process.env.NODE_ENV = "test";
            const res = createMockResponse();
            const next = jest.fn();
            const error = new AuthorizationError("Forbidden", "FORBIDDEN");

            errorHandler(error, {} as never, res as never, next);

            expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        message: "Forbidden",
                        code: "FORBIDDEN",
                    }),
                })
            );
        });

        test("delegates when headers were already sent", () => {
            const res = createMockResponse();
            res.headersSent = true;
            const next = jest.fn();
            const error = new AppError("Boom", "TEST_ERROR", HTTP_STATUS.BAD_REQUEST);

            errorHandler(error, {} as never, res as never, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(res.status).not.toHaveBeenCalled();
        });
    });
});
