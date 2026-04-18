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
 *     tags:
 *       - Appointments
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
 *       404:
 *         description: Appointment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundResponse'
 */
router.get("/apts/:id", validateRequest(aptIdSchema), authenticate, getAptById);

/**
 * @swagger
 * /api/v1/apts:
 *   post:
 *     summary: Create a new appointment
 *     tags:
 *       - Appointments
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
 */
router.post("/apts", validateRequest(createAptSchema), authenticate, createApt);

/**
 * @swagger
 * /api/v1/apts/{id}:
 *   put:
 *     summary: Update an appointment by id
 *     tags:
 *       - Appointments
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
 */
router.put("/apts/:id", validateRequest(updateAptSchema), authenticate, updateApt);

/**
 * @swagger
 * /api/v1/apts/{id}:
 *   delete:
 *     summary: Delete an appointment by id
 *     tags:
 *       - Appointments
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
 */
router.delete("/apts/:id", validateRequest(aptIdSchema), authenticate, deleteApt);



export default router;
