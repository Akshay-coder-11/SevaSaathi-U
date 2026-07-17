import express from 'express';
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  googleLogin,
  verifyEmail,
  resendVerification,
  getEmailStatus
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/logout', protect, logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.get('/email-status/:email', getEmailStatus);

export default router;
