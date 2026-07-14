import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage,
  addAddress,
  getAddresses,
  getAllUsers,
  toggleUserSuspension,
  verifyProvider,
  getProviders,
  deleteUser
} from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../config/multer.js';

const router = express.Router();

router.get('/providers', getProviders);

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.put('/changepassword', protect, changePassword);

router.post('/upload', protect, upload.single('profileImage'), uploadProfileImage);

router.route('/addresses')
  .get(protect, getAddresses)
  .post(protect, addAddress);

// Admin Routes
router.get('/admin/users', protect, authorizeRoles('admin'), getAllUsers);
router.put('/admin/suspend/:id', protect, authorizeRoles('admin'), toggleUserSuspension);
router.put('/admin/verify/:id', protect, authorizeRoles('admin'), verifyProvider);
router.delete('/admin/delete/:id', protect, authorizeRoles('admin'), deleteUser);

export default router;
