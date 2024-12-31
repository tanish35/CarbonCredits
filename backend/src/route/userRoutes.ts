import express from 'express';
import { deleteUserWallet, getUserDetails, loginUser, registerUser, resendURL, updateUserWallet } from '../controllers/userControllers';
import requireAuth from '../milddleware/checkAuth';
const router = express.Router();

router.route('/regiter').post(registerUser);
router.route('/resend').post(resendURL);
router.route('/login').post(loginUser);
router.get('/me',requireAuth, getUserDetails);
router.put('/walletUpdate',requireAuth,updateUserWallet);
router.put('/walletDelete',requireAuth,deleteUserWallet);
export default router;