import { Router } from "express";
import { setUserClaims } from "../controllers/adminController";
import { validateRequest } from "../middleware/validate";
import { setUserClaimsSchema } from "../utils/adminValidation";
// import authenticate from "../middleware/authenticate";
// import isAuthorized from "../middleware/authorize"

const adminRoutes: Router = Router();

// no roles defined to set up inital admin user
// upate this route to be protected by admin role after setting up the initial admin user
/**
 * @swagger
 * /api/v1/admin/setClaims:
 *   post:
 *     summary: Set Firebase custom claims for a user
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetClaimsRequest'
 *     responses:
 *       200:
 *         description: Claims updated successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Ok
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
adminRoutes.post(
    "/admin/setClaims",
    validateRequest(setUserClaimsSchema),
    setUserClaims
);
export default adminRoutes;
