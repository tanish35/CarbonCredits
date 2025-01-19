"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkAuth_1 = __importDefault(require("../middleware/checkAuth"));
const projectVerification_controller_1 = require("../controllers/projectVerification.controller");
const router = express_1.default.Router();
router.post("/", projectVerification_controller_1.getEmissionReduction);
router.post("/achievements", checkAuth_1.default, projectVerification_controller_1.addAchievement);
exports.default = router;
