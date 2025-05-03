const express = require('express');
const { check } = require('express-validator');
const tenderController = require('../controllers/tenderController');
const { protect, isStaff } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/tenders
// @desc    Create a new tender
// @access  Private/Staff
router.post(
  '/',
  [
    protect,
    isStaff,
    check('title', 'Title is required').notEmpty(),
    check('deadline', 'Deadline is required and must be a valid date').isISO8601(),
    check('status', 'Status must be either open or closed').optional().isIn(['open', 'closed'])
  ],
  tenderController.createTender
);

// @route   GET /api/tenders
// @desc    Get all tenders
// @access  Public
router.get('/', tenderController.getTenders);

// @route   GET /api/tenders/:id
// @desc    Get tender by ID
// @access  Public
router.get('/:id', tenderController.getTenderById);

// @route   PUT /api/tenders/:id
// @desc    Update tender
// @access  Private/Staff
router.put(
  '/:id',
  [
    protect,
    isStaff,
    check('title', 'Title is required').optional().notEmpty(),
    check('deadline', 'Deadline must be a valid date').optional().isISO8601(),
    check('status', 'Status must be either open or closed').optional().isIn(['open', 'closed'])
  ],
  tenderController.updateTender
);

// @route   PUT /api/tenders/:id/close
// @desc    Close tender
// @access  Private/Staff
router.put('/:id/close', protect, isStaff, tenderController.closeTender);

// @route   DELETE /api/tenders/:id
// @desc    Delete tender
// @access  Private/Staff
router.delete('/:id', protect, isStaff, tenderController.deleteTender);

module.exports = router; 