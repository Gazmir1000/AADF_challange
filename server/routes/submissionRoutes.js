const express = require('express');
const { check } = require('express-validator');
const submissionController = require('../controllers/submissionController');
const { protect, isVendor, isStaff } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/submissions
// @desc    Create a new submission
// @access  Private/Vendor
router.post(
  '/',
  [
    protect,
    isVendor,
    check('tenderId', 'Tender ID is required').isMongoId(),
    check('financialOffer', 'Financial offer is required and must be a number').isNumeric(),
    check('proposedTeam', 'Proposed team is required').isArray({ min: 1 }),
    check('proposedTeam.*.name', 'Team member name is required').notEmpty(),
    check('proposedTeam.*.experiences', 'Team member experience is required').notEmpty(),
    check('proposedTeam.*.documents', 'Team member documents are required').notEmpty(),
    check('declaration', 'Declaration is required').isBoolean().equals('true')
  ],
  submissionController.createSubmission
);

// @route   GET /api/submissions
// @desc    Get all submissions
// @access  Private/Staff
router.get('/', protect, isStaff, submissionController.getSubmissions);

// @route   GET /api/submissions/vendor
// @desc    Get submissions by vendor
// @access  Private/Vendor
router.get('/vendor', protect, isVendor, submissionController.getMySubmissions);

// @route   GET /api/submissions/tender/:id
// @desc    Get submissions by tender
// @access  Private/Staff
router.get('/tender/:id', protect, isStaff, submissionController.getSubmissionsByTender);

// @route   GET /api/submissions/:id
// @desc    Get submission by ID
// @access  Private
router.get('/:id', protect, submissionController.getSubmissionById);

// @route   PUT /api/submissions/:id
// @desc    Update submission
// @access  Private/Vendor
router.put(
  '/:id',
  [
    protect,
    isVendor,
    check('financialOffer', 'Financial offer must be a number').optional().isNumeric(),
    check('proposedTeam', 'Proposed team must be an array').optional().isArray({ min: 1 }),
    check('proposedTeam.*.name', 'Team member name is required').optional().notEmpty(),
    check('proposedTeam.*.experiences', 'Team member experience is required').optional().notEmpty(),
    check('proposedTeam.*.documents', 'Team member documents are required').optional().notEmpty(),
    check('declaration', 'Declaration must be boolean').optional().isBoolean()
  ],
  submissionController.updateSubmission
);

// @route   DELETE /api/submissions/:id
// @desc    Delete submission
// @access  Private/Vendor
router.delete('/:id', protect, isVendor, submissionController.deleteSubmission);

module.exports = router; 