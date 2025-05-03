const express = require('express');
const { check } = require('express-validator');
const aiController = require('../controllers/aiController');
const { protect, isStaff } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/ai/evaluate-submission
// @desc    Evaluate a submission using AI
// @access  Private/Staff
router.post(
  '/evaluate-submission',
  [
    protect,
    isStaff,
    check('tender_id', 'Tender ID is required').isMongoId(),
    check('submission_id', 'Submission ID is required').isMongoId()
  ],
  aiController.evaluateSubmission
);

module.exports = router; 