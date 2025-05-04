const express = require('express');
const { check } = require('express-validator');
const tenderController = require('../controllers/tenderController');
const { protect, isStaff } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tenders
 *   description: Tender management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Tender:
 *       type: object
 *       required:
 *         - title
 *         - deadline
 *         - status
 *         - currency
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated tender ID
 *         title:
 *           type: string
 *           description: Tender title
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: Tender deadline date
 *         status:
 *           type: string
 *           enum: [open, closed]
 *           description: Tender status
 *         description:
 *           type: string
 *           description: Detailed description of the tender
 *         requirements:
 *           type: string
 *           description: Specific tender requirements
 *         currency:
 *           type: string
 *           enum: [ALL, EUR, USD]
 *           description: Currency for the tender (default is ALL)
 */

/**
 * @swagger
 * /api/tenders:
 *   post:
 *     summary: Create a new tender (staff only)
 *     tags: [Tenders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - deadline
 *             properties:
 *               title:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [open, closed]
 *                 default: open
 *               description:
 *                 type: string
 *               requirements:
 *                 type: string
 *               currency:
 *                 type: string
 *                 enum: [ALL, EUR, USD]
 *                 default: ALL
 *     responses:
 *       201:
 *         description: Tender created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as staff
 */
router.post(
  '/',
  [
    protect,
    isStaff,
    check('title', 'Title is required').notEmpty(),
    check('deadline', 'Deadline is required and must be a valid date').isISO8601(),
    check('status', 'Status must be either open or closed').optional().isIn(['open', 'closed']),
    check('currency', 'Currency must be ALL, EUR, or USD').optional().isIn(['ALL', 'EUR', 'USD'])
  ],
  tenderController.createTender
);

/**
 * @swagger
 * /api/tenders/filter:
 *   post:
 *     summary: Filter tenders with search and pagination
 *     tags: [Tenders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               search:
 *                 type: string
 *                 description: Search term for title, description, or requirements
 *               page:
 *                 type: integer
 *                 description: Page number (default is 1)
 *               limit:
 *                 type: integer
 *                 description: Number of results per page (default is 10)
 *               status:
 *                 type: string
 *                 enum: [open, closed]
 *                 description: Filter by tender status (default is 'open')
 *               currency:
 *                 type: string
 *                 enum: [ALL, EUR, USD]
 *                 description: Filter by currency
 *     responses:
 *       200:
 *         description: List of filtered tenders
 *       400:
 *         description: Invalid input data
 */
router.post(
  '/filter',
  [
    check('search', 'Search term must be a string').optional().isString(),
    check('page', 'Page must be a positive number').optional().isInt({ min: 1 }),
    check('limit', 'Limit must be a positive number').optional().isInt({ min: 1 }),
    check('status', 'Status must be either open or closed').optional().isIn(['open', 'closed']),
    check('currency', 'Currency must be ALL, EUR, or USD').optional().isIn(['ALL', 'EUR', 'USD']),
  ],
  tenderController.filterTenders
);

/**
 * @swagger
 * /api/tenders:
 *   get:
 *     summary: Get all tenders
 *     tags: [Tenders]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, closed]
 *         description: Filter by tender status (default is 'open')
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of tenders
 */
router.get('/', tenderController.getTenders);

/**
 * @swagger
 * /api/tenders/{id}:
 *   get:
 *     summary: Get tender by ID
 *     tags: [Tenders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tender ID
 *     responses:
 *       200:
 *         description: Tender details
 *       404:
 *         description: Tender not found
 */
router.get('/:id/:userId', tenderController.getTenderById);

/**
 * @swagger
 * /api/tenders/{id}:
 *   put:
 *     summary: Update a tender (staff only)
 *     tags: [Tenders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tender ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [open, closed]
 *               description:
 *                 type: string
 *               requirements:
 *                 type: string
 *               currency:
 *                 type: string
 *                 enum: [ALL, EUR, USD]
 *     responses:
 *       200:
 *         description: Tender updated successfully
 *       400:
 *         description: Invalid input data or cannot update a closed tender
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as staff
 *       404:
 *         description: Tender not found
 */
router.put(
  '/:id',
  [
    protect,
    isStaff,
    check('title', 'Title is required').optional().notEmpty(),
    check('deadline', 'Deadline must be a valid date').optional().isISO8601(),
    check('status', 'Status must be either open or closed').optional().isIn(['open', 'closed']),
    check('currency', 'Currency must be ALL, EUR, or USD').optional().isIn(['ALL', 'EUR', 'USD']),
  ],
  tenderController.updateTender
);

/**
 * @swagger
 * /api/tenders/{id}/close:
 *   put:
 *     summary: Close a tender (staff only)
 *     tags: [Tenders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tender ID
 *     responses:
 *       200:
 *         description: Tender closed successfully
 *       400:
 *         description: Tender is already closed
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as staff
 *       404:
 *         description: Tender not found
 */
router.put('/:id/close', protect, isStaff, tenderController.closeTender);

/**
 * @swagger
 * /api/tenders/{id}:
 *   delete:
 *     summary: Delete a tender (staff only)
 *     tags: [Tenders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tender ID
 *     responses:
 *       200:
 *         description: Tender removed successfully
 *       400:
 *         description: Cannot delete tender with existing submissions
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as staff
 *       404:
 *         description: Tender not found
 */
router.delete('/:id', protect, isStaff, tenderController.deleteTender);

module.exports = router; 