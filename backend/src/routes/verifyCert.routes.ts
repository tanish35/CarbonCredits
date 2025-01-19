import express from "express";
import requireAuth from "../middleware/checkAuth";
import { addAchievement, getEmissionReduction } from "../controllers/projectVerification.controller";

const router = express.Router();

router.post("/", getEmissionReduction);
router.post("/achievements",requireAuth, addAchievement);

export default router;
