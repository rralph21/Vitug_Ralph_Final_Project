import { AddressInfo } from "net";
import { Server } from "http";
import app from "../src/app";
import { HTTP_STATUS } from "../src/constant/httpConstants";
import type { Appointment } from "../src/api/v1/models/aptStatus";
import type { CreateAppointmentInput } from "../src/api/v1/models/createApt";
import type { UpdateAppointmentInput } from "../src/api/v1/models/updateApt";
import * as aptServices from "../src/api/v1/services/aptServices";

const mockVerifyIdToken = jest.fn();

jest.mock("../src/api/v1/services/aptServices");
jest.mock("../src/config/firebaseConfig", () => ({
    getFirebaseAuth: () => ({
        verifyIdToken: mockVerifyIdToken,
    }),
    getFirebaseDb: jest.fn(),
}));

const mockedAptServices = jest.mocked(aptServices);
const authHeaders = { Authorization: "Bearer test-token" };
const jsonHeaders = {
    "Content-Type": "application/json",
    ...authHeaders,
};

const buildAppointment = (overrides: Partial<Appointment> = {}): Appointment => ({
    id: 1,
    clinic: "City Medical Center",
    type: "General Checkup",
    spots: 1,
    status: "open",
    createdAt: "2025-01-10T10:00:00.000Z",
    updatedAt: "2025-01-10T10:00:00.000Z",
    ...overrides,
});

describe("Appointment routes", () => {
    let server: Server;
    let baseUrl: string;

    beforeAll(async() => {
        server = app.listen(0);

        await new Promise<void>((resolve) => {
            server.on("listening", () => {
                const { port } = server.address() as AddressInfo;
                baseUrl = `http://127.0.0.1:${port}`;
                resolve();
            });
        });
    });

    afterAll(async() => {
        await new Promise<void>((resolve, reject) => {
            server.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            });
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockVerifyIdToken.mockResolvedValue({
            uid: "test-user",
            role: "admin",
        });
    });

    const request = async(path: string, init?: RequestInit) => fetch(`${baseUrl}${path}`, init);

    describe("GET /api/v1/apts", () => {
        test("returns all appointments", async() => {
            // Arrange
            const appointments = [buildAppointment(), buildAppointment({ id: 2, type: "Specialist Consultation" })];
            mockedAptServices.getAllAptsAsync.mockResolvedValue(appointments);

            // Act
            const response = await request("/api/v1/apts");
            const body = await response.json();

            // Assert
            expect(response.status).toBe(HTTP_STATUS.OK);
            expect(body).toEqual(appointments);
            expect(mockedAptServices.getAllAptsAsync).toHaveBeenCalledTimes(1);
        });

        test("returns an empty array when no appointments exist", async() => {
            // Arrange
            mockedAptServices.getAllAptsAsync.mockResolvedValue([]);

            // Act
            const response = await request("/api/v1/apts");
            const body = await response.json();

            // Assert
            expect(response.status).toBe(HTTP_STATUS.OK);
            expect(body).toEqual([]);
            expect(mockedAptServices.getAllAptsAsync).toHaveBeenCalledTimes(1);
        });
    });

    describe("GET /api/v1/apts/:id", () => {
        test("returns the appointment for a valid id", async() => {
            // Arrange
            const appointment = buildAppointment({ id: 7, status: "pending" });
            mockedAptServices.getAptByIdAsync.mockResolvedValue(appointment);

            // Act
            const response = await request("/api/v1/apts/7", {
                headers: authHeaders,
            });
            const body = await response.json();

            // Assert
            expect(response.status).toBe(HTTP_STATUS.OK);
            expect(body).toEqual({
                message: "Appointment is collected",
                data: appointment,
            });
            expect(mockedAptServices.getAptByIdAsync).toHaveBeenCalledWith(7);
        });

        test("returns 404 when the appointment is missing", async() => {
            // Arrange
            mockedAptServices.getAptByIdAsync.mockResolvedValue(undefined as never);

            // Act
            const response = await request("/api/v1/apts/99", {
                headers: authHeaders,
            });
            const body = await response.json();

            // Assert
            expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
            expect(body).toEqual({ message: "Appointment not found" });
            expect(mockedAptServices.getAptByIdAsync).toHaveBeenCalledWith(99);
        });
    });

    describe("POST /api/v1/apts", () => {
        test("creates a new appointment", async() => {
            // Arrange
            const item: CreateAppointmentInput = {
                clinic: "North Clinic",
                type: "Vaccination",
                spots: 4,
                status: "open",
            };
            const payload = {
                item,
            };
            const createdAppointment = buildAppointment({ id: 10, ...payload.item });
            mockedAptServices.createAptAsync.mockResolvedValue(createdAppointment);

            // Act
            const response = await request("/api/v1/apts", {
                method: "POST",
                headers: jsonHeaders,
                body: JSON.stringify(payload),
            });
            const body = await response.json();

            // Assert
            expect(response.status).toBe(HTTP_STATUS.CREATED);
            expect(body).toEqual({
                message: "Appointment created successfully",
                data: createdAppointment,
            });
            expect(mockedAptServices.createAptAsync).toHaveBeenCalledWith(payload.item);
        });

        test("creates an appointment with a different status", async() => {
            // Arrange
            const item: CreateAppointmentInput = {
                clinic: "West Clinic",
                type: "Follow-up",
                spots: 0,
                status: "delayed",
            };
            const payload = {
                item,
            };
            const createdAppointment = buildAppointment({ id: 11, ...payload.item });
            mockedAptServices.createAptAsync.mockResolvedValue(createdAppointment);

            // Act
            const response = await request("/api/v1/apts", {
                method: "POST",
                headers: jsonHeaders,
                body: JSON.stringify(payload),
            });
            const body = await response.json();

            // Assert
            expect(response.status).toBe(HTTP_STATUS.CREATED);
            expect(body.data.status).toBe("delayed");
            expect(mockedAptServices.createAptAsync).toHaveBeenCalledWith(payload.item);
        });

        test("returns 400 for an invalid appointment payload", async() => {
            // Act
            const response = await request("/api/v1/apts", {
                method: "POST",
                headers: jsonHeaders,
                body: JSON.stringify({
                    item: {
                        clinic: "A",
                        type: "Vaccination",
                        spots: -1,
                        status: "invalid",
                    },
                }),
            });
            const body = await response.json();

            // Assert
            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
            expect(body.error).toContain("Validation error:");
            expect(mockedAptServices.createAptAsync).not.toHaveBeenCalled();
        });
    });

    describe("PUT /api/v1/apts/:id", () => {
        test("updates an appointment by id", async() => {
            // Arrange
            const item: UpdateAppointmentInput = {
                clinic: "Updated Clinic",
                status: "full",
            };
            const payload = {
                item,
            };
            const updatedAppointment = buildAppointment({ id: 3, ...payload.item });
            mockedAptServices.updateAptAsync.mockResolvedValue(updatedAppointment);
            mockVerifyIdToken.mockResolvedValue({
                uid: "doctor-user",
                role: "doctor",
            });

            // Act
            const response = await request("/api/v1/apts/3", {
                method: "PUT",
                headers: jsonHeaders,
                body: JSON.stringify(payload),
            });
            const body = await response.json();

            // Assert
            expect(response.status).toBe(HTTP_STATUS.OK);
            expect(body).toEqual({
                message: "Appointment updated successfully",
                data: updatedAppointment,
            });
            expect(mockedAptServices.updateAptAsync).toHaveBeenCalledWith(3, payload.item);
        });

        test("supports partial updates", async() => {
            // Arrange
            const item: UpdateAppointmentInput = {
                spots: 2,
            };
            const payload = {
                item,
            };
            const updatedAppointment = buildAppointment({ id: 5, spots: 2 });
            mockedAptServices.updateAptAsync.mockResolvedValue(updatedAppointment);
            mockVerifyIdToken.mockResolvedValue({
                uid: "doctor-user",
                role: "doctor",
            });

            // Act
            const response = await request("/api/v1/apts/5", {
                method: "PUT",
                headers: jsonHeaders,
                body: JSON.stringify(payload),
            });
            const body = await response.json();

            // Assert
            expect(response.status).toBe(HTTP_STATUS.OK);
            expect(body.data.spots).toBe(2);
            expect(mockedAptServices.updateAptAsync).toHaveBeenCalledWith(5, payload.item);
        });

        test("returns 400 for an invalid appointment id", async() => {
            // Arrange
            mockVerifyIdToken.mockResolvedValue({
                uid: "doctor-user",
                role: "doctor",
            });

            // Act
            const response = await request("/api/v1/apts/not-a-number", {
                method: "PUT",
                headers: jsonHeaders,
                body: JSON.stringify({
                    item: {
                        spots: 2,
                    },
                }),
            });
            const body = await response.json();

            // Assert
            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
            expect(body.error).toContain("Validation error:");
            expect(mockedAptServices.updateAptAsync).not.toHaveBeenCalled();
        });
    });

    describe("DELETE /api/v1/apts/:id", () => {
        test("deletes an appointment by id", async() => {
            // Arrange
            const deletedAppointment = buildAppointment({ id: 4 });
            mockedAptServices.deleteAptAsync.mockResolvedValue(deletedAppointment);

            // Act
            const response = await request("/api/v1/apts/4", {
                method: "DELETE",
                headers: authHeaders,
            });
            const body = await response.json();

            // Assert
            expect(response.status).toBe(HTTP_STATUS.IM_A_TEAPOT);
            expect(body).toEqual({
                message: "Appointment deleted successfully",
                data: deletedAppointment,
            });
            expect(mockedAptServices.deleteAptAsync).toHaveBeenCalledWith(4);
        });

        test("still responds with a delete message for another valid id", async() => {
            // Arrange
            const deletedAppointment = buildAppointment({ id: 8 });
            mockedAptServices.deleteAptAsync.mockResolvedValue(deletedAppointment);

            // Act
            const response = await request("/api/v1/apts/8", {
                method: "DELETE",
                headers: authHeaders,
            });
            const body = await response.json();

            // Assert
            expect(response.status).toBe(HTTP_STATUS.IM_A_TEAPOT);
            expect(body.message).toBe("Appointment deleted successfully");
            expect(mockedAptServices.deleteAptAsync).toHaveBeenCalledWith(8);
        });
    });
});
