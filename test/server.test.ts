import { AddressInfo } from "net";
import { Server } from "http";
import app from "../src/app";
import { HTTP_STATUS } from "../src/constant/httpConstants";

describe("Application routes", () => {
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

    test("returns the root status message", async() => {
        const response = await fetch(`${baseUrl}/`);
        const body = await response.text();

        expect(response.status).toBe(HTTP_STATUS.OK);
        expect(body).toBe("It's Online!!");
    });

    test("returns health information", async() => {
        const response = await fetch(`${baseUrl}/api/v1/health`);
        const body = await response.json();

        expect(response.status).toBe(HTTP_STATUS.OK);
        expect(body).toEqual(expect.objectContaining({
            status: "OK",
            version: "1.0.0",
        }));
        expect(typeof body.uptime).toBe("number");
        expect(typeof body.timestamp).toBe("string");
    });

    test("serves swagger ui", async() => {
        const response = await fetch(`${baseUrl}/api-docs/`);
        const body = await response.text();

        expect(response.status).toBe(HTTP_STATUS.OK);
        expect(body).toContain("Swagger UI");
    });

    test("serves the OpenAPI json document", async() => {
        const response = await fetch(`${baseUrl}/api-docs.json`);
        const body = await response.json();

        expect(response.status).toBe(HTTP_STATUS.OK);
        expect(body).toEqual(expect.objectContaining({
            openapi: "3.0.0",
            info: expect.objectContaining({
                title: "Medical Appointment API",
            }),
            paths: expect.objectContaining({
                "/": expect.any(Object),
                "/api-docs": expect.any(Object),
                "/api-docs.json": expect.any(Object),
                "/api/v1/apts": expect.any(Object),
                "/api/v1/apts/{id}": expect.any(Object),
                "/api/v1/admin/setClaims": expect.any(Object),
                "/api/v1/health": expect.any(Object),
            }),
        }));
    });
});
