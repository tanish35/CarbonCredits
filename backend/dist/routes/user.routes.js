"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userControllers_1 = require("../controllers/userControllers");
const checkAuth_1 = __importDefault(require("../middleware/checkAuth"));
const router = express_1.default.Router();
router.route("/register").post(userControllers_1.registerUser);
router.route("/login").post(userControllers_1.loginUser);
router.get("/me", checkAuth_1.default, userControllers_1.getUserDetails);
router.post("/profile", checkAuth_1.default, userControllers_1.updateUserProfile);
router.post("/signout", userControllers_1.signOut);
router.get("/details", checkAuth_1.default, userControllers_1.getUserDetails);
router.put("/walletUpdate", checkAuth_1.default, userControllers_1.updateUserWallet);
router.post("/google", userControllers_1.googleLogin);
router.get("/achievements", checkAuth_1.default, userControllers_1.getUserAchievements);
exports.default = router;
