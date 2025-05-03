const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const { protect, isStaff } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/users
// @desc    Register a new user
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('role', 'Role must be either vendor or staff').isIn(['vendor', 'staff'])
  ],
  userController.registerUser
);

// @route   POST /api/users/login
// @desc    Login user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  userController.loginUser
);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, userController.getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    protect,
    check('email', 'Please include a valid email').optional().isEmail(),
    check('password', 'Password must be at least 6 characters').optional().isLength({ min: 6 })
  ],
  userController.updateUserProfile
);

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Staff
router.get('/', protect, isStaff, userController.getUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Staff
router.get('/:id', protect, isStaff, userController.getUserById);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private/Staff
router.put(
  '/:id',
  [
    protect,
    isStaff,
    check('email', 'Please include a valid email').optional().isEmail(),
    check('password', 'Password must be at least 6 characters').optional().isLength({ min: 6 }),
    check('role', 'Role must be either vendor or staff').optional().isIn(['vendor', 'staff'])
  ],
  userController.updateUser
);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Staff
router.delete('/:id', protect, isStaff, userController.deleteUser);

module.exports = router; 