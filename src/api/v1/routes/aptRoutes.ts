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
} from "../utils/aptValidation";

const router = Router();


router.get("/apts", getAllApts);
router.get("/apts/:id", validateRequest(aptIdSchema), getAptById);
router.post("/apts", validateRequest(createAptSchema), createApt);
router.put("/apts/:id", validateRequest(updateAptSchema), updateApt);
router.delete("/apts/:id", validateRequest(aptIdSchema), deleteApt);



export default router;
