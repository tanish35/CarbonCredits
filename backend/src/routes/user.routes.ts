import express from "express";
import {
  getUserDetails,
  loginUser,
  registerUser,
  updateUserWallet,
  googleLogin,
  signOut,
  updateUserProfile,
  getUserAchievements,
} from "../controllers/userControllers";
import requireAuth from "../middleware/checkAuth";
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.get("/me", requireAuth, getUserDetails);
router.post("/profile", requireAuth, updateUserProfile);
router.post("/signout", signOut);
router.get("/details", requireAuth, getUserDetails);
router.put("/walletUpdate", requireAuth, updateUserWallet);
router.post("/google", googleLogin);
router.get("/achievements", requireAuth, getUserAchievements);

export default router;
