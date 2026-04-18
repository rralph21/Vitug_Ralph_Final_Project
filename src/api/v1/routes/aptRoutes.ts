import { Router } from "express";
import {
    getAllApts,
    createApt,
    updateApt,
    deleteApt,
    getAptById,
} from "../controllers/aptControllers";
import { validateRequest } from "../middleware/validate";
import {
    aptIdSchema,
    createAptSchema,
    updateAptSchema,
} from "../validation/aptValidation";
import authenticate from "../middleware/authenticate";
import isAuthorized from "../middleware/authorize";

const router = Router();

/**
 * @swagger
 * /api/v1/apts:
 *   get:
 *     summary: Get all appointments
 *     tags:
 *       - Appointments
 *     responses:
 *       200:
 *         description: List of appointments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentListResponse'
 */
router.get("/apts", getAllApts);

/**
 * @swagger
 * /api/v1/apts/{id}:
 *   get:
 *     summary: Get an appointment by id
 *     description: Requires a Firebase bearer token. Allowed roles: admin, user, doctor, manager.
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Appointment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentResponse'
 *       401:
 *         description: Missing or invalid Firebase bearer token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *       403:
 *         description: Authenticated user does not have an allowed role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenResponse'
 *       404:
 *         description: Appointment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundResponse'
 */
router.get("/apts/:id", authenticate, isAuthorized({hasRole: ["admin" , "user", "doctor", "manager"]}), validateRequest(aptIdSchema),  getAptById);

/**
 * @swagger
 * /api/v1/apts:
 *   post:
 *     summary: Create a new appointment
 *     description: Requires a Firebase bearer token. Allowed roles: admin, doctor, manager.
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/CreateAppointmentInput'
 *               - $ref: '#/components/schemas/WrappedCreateAppointmentInput'
 *     responses:
 *       201:
 *         description: Appointment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid Firebase bearer token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *       403:
 *         description: Authenticated user does not have an allowed role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenResponse'
 */
router.post("/apts", authenticate, isAuthorized({hasRole: ["admin" , "doctor", "manager"]}), validateRequest(createAptSchema), createApt);

/**
 * @swagger
 * /api/v1/apts/{id}:
 *   put:
 *     summary: Update an appointment by id
 *     description: Requires a Firebase bearer token. Allowed roles: doctor, manager.
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/UpdateAppointmentInput'
 *               - $ref: '#/components/schemas/WrappedUpdateAppointmentInput'
 *     responses:
 *       200:
 *         description: Appointment updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid Firebase bearer token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *       403:
 *         description: Authenticated user does not have an allowed role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenResponse'
 */
router.put("/apts/:id", authenticate,isAuthorized({hasRole: [ "doctor", "manager"]}), validateRequest(updateAptSchema), updateApt);

/**
 * @swagger
 * /api/v1/apts/{id}:
 *   delete:
 *     summary: Delete an appointment by id
 *     description: Requires a Firebase bearer token. Allowed roles: admin, manager.
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       418:
 *         description: Appointment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid Firebase bearer token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *       403:
 *         description: Authenticated user does not have an allowed role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenResponse'
 */
router.delete("/apts/:id", authenticate, isAuthorized({hasRole: ["admin", "manager"]}), validateRequest(aptIdSchema), deleteApt);



export default router;
