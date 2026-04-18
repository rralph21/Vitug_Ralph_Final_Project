import { Router } from "express";
import { setUserClaims } from "../controllers/adminController";
import { validateRequest } from "../middleware/validate";
import { setUserClaimsSchema } from "../utils/adminValidation";
// import authenticate from "../middleware/authenticate";
// import isAuthorized from "../middleware/authorize"

const adminRoutes: Router = Router();

// no roles defined to set up inital admin user
// upate this route to be protected by admin role after setting up the initial admin user
adminRoutes.post(
    "/admin/setClaims",
    validateRequest(setUserClaimsSchema),
    setUserClaims
);
export default adminRoutes;
