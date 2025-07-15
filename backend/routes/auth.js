import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  createAdmin
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateAddress
} from '../middleware/validation.js';
import User from '../models/User.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/create-admin', createAdmin); // Special endpoint for admin creation

// Debug endpoint for production troubleshooting
router.get('/debug', async (req, res) => {
  try {
    const adminUsers = await User.find({ role: 'admin' }).select('name email role createdAt');
    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      environment: process.env.NODE_ENV,
      database: 'connected',
      adminUsers: adminUsers.map(user => ({
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      })),
      totalUsers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Debug endpoint error',
      error: error.message
    });
  }
});

// Protected routes
router.use(protect); // All routes below this middleware are protected

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/profile', validateProfileUpdate, updateProfile);
router.put('/change-password', validatePasswordChange, changePassword);

// Address management
router.post('/address', validateAddress, addAddress);
router.put('/address/:addressId', validateAddress, updateAddress);
router.delete('/address/:addressId', deleteAddress);

export default router;
