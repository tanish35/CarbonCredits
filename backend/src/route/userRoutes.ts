import express from 'express';
import { getUserDetails, loginUser, registerUser, resendURL, updateUserWallet } from '../controllers/userControllers';
import requireAuth from '../milddleware/checkAuth';
const router = express.Router();

router.route('/regiter').post(registerUser);
router.route('/resend').post(resendURL);
router.route('/login').post(loginUser);
router.get('/me',requireAuth, getUserDetails);
router.put('/wallet',requireAuth,updateUserWallet);
export default router;