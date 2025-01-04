import express from "express";
import {
  getUserDetails,
  loginUser,
  registerUser,
  updateUserWallet,
  googleLogin,
} from "../controllers/userControllers";
import requireAuth from "../milddleware/checkAuth";
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.get("/me", requireAuth, getUserDetails);
router.put("/walletUpdate", requireAuth, updateUserWallet);
router.post("/google", googleLogin);

export default router;