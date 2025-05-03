const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const { protect, isStaff } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - NUIS
 *         - email
 *         - phone
 *         - address
 *         - password
 *         - role
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated user ID
 *         name:
 *           type: string
 *           description: User's full name
 *         NUIS:
 *           type: string
 *           description: Unique identification number for business/individual
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         phone:
 *           type: string
 *           description: User's phone number
 *         address:
 *           type: string
 *           description: User's physical address
 *         role:
 *           type: string
 *           enum: [vendor, staff]
 *           description: User's role in the system
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - NUIS
 *               - email
 *               - phone
 *               - address
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               NUIS:
 *                 type: string
 *                 description: Unique identification number for business/individual
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *               address:
 *                 type: string
 *                 description: User's physical address
 *               password:
 *                 type: string
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: [vendor, staff]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input data
 */
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('NUIS', 'NUIS is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phone', 'Phone number is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('role', 'Role must be either vendor or staff').isIn(['vendor', 'staff'])
  ],
  userController.registerUser
);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Authenticate user and get token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  userController.loginUser
);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user's own profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Not authenticated
 */
router.get('/profile', protect, userController.getUserProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user's own profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               NUIS:
 *                 type: string
 *                 description: Unique identification number for business/individual
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *               address:
 *                 type: string
 *                 description: User's physical address
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 */
router.put(
  '/profile',
  [
    protect,
    check('name', 'Name is required').optional().not().isEmpty(),
    check('NUIS', 'NUIS is required').optional().not().isEmpty(),
    check('email', 'Please include a valid email').optional().isEmail(),
    check('phone', 'Phone number is required').optional().not().isEmpty(),
    check('address', 'Address is required').optional().not().isEmpty(),
    check('password', 'Password must be at least 6 characters').optional().isLength({ min: 6 })
  ],
  userController.updateUserProfile
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (staff only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as staff
 */
router.get('/', protect, isStaff, userController.getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (staff only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as staff
 *       404:
 *         description: User not found
 */
router.get('/:id', protect, isStaff, userController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update any user (staff only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               NUIS:
 *                 type: string
 *                 description: Unique identification number for business/individual
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *               address:
 *                 type: string
 *                 description: User's physical address
 *               password:
 *                 type: string
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: [vendor, staff]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as staff
 *       404:
 *         description: User not found
 */
router.put(
  '/:id',
  [
    protect,
    isStaff,
    check('name', 'Name is required').optional().not().isEmpty(),
    check('NUIS', 'NUIS is required').optional().not().isEmpty(),
    check('email', 'Please include a valid email').optional().isEmail(),
    check('phone', 'Phone number is required').optional().not().isEmpty(),
    check('address', 'Address is required').optional().not().isEmpty(),
    check('password', 'Password must be at least 6 characters').optional().isLength({ min: 6 }),
    check('role', 'Role must be either vendor or staff').optional().isIn(['vendor', 'staff'])
  ],
  userController.updateUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (staff only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User removed successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as staff
 *       404:
 *         description: User not found
 */
router.delete('/:id', protect, isStaff, userController.deleteUser);

module.exports = router; 