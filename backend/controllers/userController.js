import mongoose from 'mongoose';
import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import bcrypt from 'bcryptjs';

// @desc    Get current logged in user profile
// @route   GET /api/user/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res, next) => {
  // req.user is loaded by protect middleware
  let user = req.user;

  if (mongoose.connection.readyState === 1) {
    try {
      const freshUser = await User.findById(user._id || user.id);
      if (freshUser) {
        user = freshUser;
      }
    } catch (err) {}
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      addresses: user.addresses || [],
      profileImage: user.profileImage || '',
      providerDetails: user.providerDetails
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, address, providerDetails } = req.body;
  const userId = req.user._id || req.user.id;

  let user;
  if (mongoose.connection.readyState === 1) {
    try {
      user = await User.findById(userId);
    } catch (err) {}
  }

  if (!user) {
    // If not found in Mongo, update req.user object for local preview demo
    req.user.name = name || req.user.name;
    req.user.phone = phone || req.user.phone;
    req.user.address = address || req.user.address;
    if (req.user.role === 'provider' && providerDetails) {
      req.user.providerDetails = {
        ...req.user.providerDetails,
        ...providerDetails
      };
    }
    user = req.user;
  } else {
    // MongoDB Save
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    if (user.role === 'provider' && providerDetails) {
      user.providerDetails = {
        category: providerDetails.category || user.providerDetails?.category,
        skills: Array.isArray(providerDetails.skills) ? providerDetails.skills : user.providerDetails?.skills || [],
        rate: Number(providerDetails.rate) || user.providerDetails?.rate || 200,
        bio: providerDetails.bio || user.providerDetails?.bio || '',
        availability: providerDetails.availability || user.providerDetails?.availability || 'available',
        rating: user.providerDetails?.rating || 5.0,
        ratingsCount: user.providerDetails?.ratingsCount || 0,
        completedJobs: user.providerDetails?.completedJobs || 0,
        earnings: user.providerDetails?.earnings || 0,
        isVerified: user.providerDetails?.isVerified || false
      };
    }

    await user.save();
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      profileImage: user.profileImage,
      providerDetails: user.providerDetails
    }
  });
});

// @desc    Change user account password
// @route   PUT /api/user/changepassword
// @access  Private
export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorResponse('Please specify both current and new passwords', 400));
  }

  const userId = req.user._id || req.user.id;
  let user;
  if (mongoose.connection.readyState === 1) {
    try {
      user = await User.findById(userId).select('+password');
    } catch (err) {}
  }

  if (!user) {
    // For demo preloaded session verification
    return res.status(200).json({
      success: true,
      message: 'Password override simulated successfully for preview session!'
    });
  }

  // Verify current password match
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return next(new ErrorResponse('Current password does not match our records', 400));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    data: 'Password modified successfully.'
  });
});

// @desc    Upload profile image
// @route   POST /api/user/upload
// @access  Private
export const uploadProfileImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a valid image file', 400));
  }

  const userId = req.user._id || req.user.id;
  const imagePath = `/uploads/profiles/${req.file.filename}`;

  let user;
  if (mongoose.connection.readyState === 1) {
    try {
      user = await User.findById(userId);
    } catch (err) {}
  }

  if (!user) {
    req.user.profileImage = imagePath;
    user = req.user;
  } else {
    user.profileImage = imagePath;
    await user.save();
  }

  res.status(200).json({
    success: true,
    profileImage: imagePath,
    message: 'Profile image uploaded successfully'
  });
});

// @desc    Add shipping / doorstep delivery address (Phase 3)
// @route   POST /api/user/addresses
// @access  Private
export const addAddress = asyncHandler(async (req, res, next) => {
  const { street, city, state, zipCode, isDefault } = req.body;
  const userId = req.user._id || req.user.id;

  let user;
  if (mongoose.connection.readyState === 1) {
    try {
      user = await User.findById(userId);
    } catch (err) {}
  }

  const newAddress = { street, city, state, zipCode, isDefault: !!isDefault };

  if (!user) {
    if (!req.user.addresses) req.user.addresses = [];
    req.user.addresses.push(newAddress);
    user = req.user;
  } else {
    if (isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }
    user.addresses.push(newAddress);
    await user.save();
  }

  res.status(201).json({
    success: true,
    addresses: user.addresses
  });
});

// @desc    Get user address list
// @route   GET /api/user/addresses
// @access  Private
export const getAddresses = asyncHandler(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  let user;
  if (mongoose.connection.readyState === 1) {
    try {
      user = await User.findById(userId);
    } catch (err) {}
  }

  const addresses = user ? user.addresses : (req.user.addresses || []);

  res.status(200).json({
    success: true,
    addresses
  });
});
