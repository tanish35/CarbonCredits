import express from "express";
import requireAuth from "../middleware/checkAuth";

import {
  getResellApproval,
  getEmissionData,
  setApproval,
} from "../controllers/resellController";

const resellRouter = express.Router();

resellRouter.post("/getResellApproval", getResellApproval);

resellRouter.post("/getEmissionData", requireAuth, getEmissionData);
resellRouter.post("/setApproval", requireAuth, setApproval);
// resellRouter.get("/hi", requireAuth, (req, res) => {
//   res.send("Hello from resell router");
// });

export default resellRouter;
