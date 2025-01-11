import express from "express";
import requireAuth from "../middleware/checkAuth";
import { getEmissionReduction } from "../controllers/projectVerification.controller";

const router = express.Router();

router.post("/", getEmissionReduction);

export default router;
