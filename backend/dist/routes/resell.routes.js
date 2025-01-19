"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkAuth_1 = __importDefault(require("../middleware/checkAuth"));
const resellController_1 = require("../controllers/resellController");
const resellRouter = express_1.default.Router();
resellRouter.post("/getResellApproval", resellController_1.getResellApproval);
resellRouter.post("/getEmissionData", checkAuth_1.default, resellController_1.getEmissionData);
resellRouter.post("/setApproval", checkAuth_1.default, resellController_1.setApproval);
// resellRouter.get("/hi", requireAuth, (req, res) => {
//   res.send("Hello from resell router");
// });
exports.default = resellRouter;
