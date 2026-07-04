import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage,
  addAddress,
  getAddresses
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../config/multer.js';

const router = express.Router();

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.put('/changepassword', protect, changePassword);

router.post('/upload', protect, upload.single('profileImage'), uploadProfileImage);

router.route('/addresses')
  .get(protect, getAddresses)
  .post(protect, addAddress);

export default router;
