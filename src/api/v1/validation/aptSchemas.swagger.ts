/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - id
 *         - clinic
 *         - type
 *         - spots
 *         - status
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         clinic:
 *           type: string
 *           minLength: 2
 *           example: "City Medical Center"
 *         type:
 *           type: string
 *           minLength: 2
 *           example: "General Checkup"
 *         spots:
 *           type: integer
 *           minimum: 0
 *           example: 3
 *         status:
 *           type: string
 *           enum:
 *             - pending
 *             - open
 *             - full
 *             - delayed
 *             - cancelled
 *           example: "open"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-01-10T10:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-01-10T10:00:00.000Z"
 *
 *     CreateAppointmentInput:
 *       type: object
 *       required:
 *         - clinic
 *         - type
 *         - spots
 *         - status
 *       properties:
 *         clinic:
 *           type: string
 *           minLength: 2
 *           example: "North Clinic"
 *         type:
 *           type: string
 *           minLength: 2
 *           example: "Vaccination"
 *         spots:
 *           type: integer
 *           minimum: 0
 *           example: 4
 *         status:
 *           type: string
 *           enum:
 *             - pending
 *             - open
 *             - full
 *             - delayed
 *             - cancelled
 *           example: "open"
 *
 *     WrappedCreateAppointmentInput:
 *       type: object
 *       required:
 *         - item
 *       properties:
 *         item:
 *           $ref: '#/components/schemas/CreateAppointmentInput'
 *
 *     UpdateAppointmentInput:
 *       type: object
 *       description: At least one appointment field must be provided.
 *       properties:
 *         clinic:
 *           type: string
 *           minLength: 2
 *           example: "Updated Clinic"
 *         type:
 *           type: string
 *           minLength: 2
 *           example: "Follow-up"
 *         spots:
 *           type: integer
 *           minimum: 0
 *           example: 2
 *         status:
 *           type: string
 *           enum:
 *             - pending
 *             - open
 *             - full
 *             - delayed
 *             - cancelled
 *           example: "full"
 *
 *     WrappedUpdateAppointmentInput:
 *       type: object
 *       required:
 *         - item
 *       properties:
 *         item:
 *           $ref: '#/components/schemas/UpdateAppointmentInput'
 *
 *     AppointmentResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Appointment created successfully"
 *         data:
 *           $ref: '#/components/schemas/Appointment'
 *
 *     AppointmentListResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Appointment'
 */

export {};
