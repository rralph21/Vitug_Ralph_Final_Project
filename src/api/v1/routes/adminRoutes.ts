import { Router } from "express"
import { 
    getAllApts, 
    createApt, 
    updateApt, 
    deleteApt 
} from "../controllers/aptControllers";

const router = Router();

router.get("/apts", getAllApts);
router.post("/apts", createApt);
router.put("/apts/:id", updateApt);
router.delete("/apts/:id", deleteApt);

export default router;