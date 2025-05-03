const express = require('express');
const { check } = require('express-validator');
const evaluationController = require('../controllers/evaluationController');
const { protect, isStaff } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/evaluations
// @desc    Create a new evaluation
// @access  Private/Staff
router.post(
  '/',
  [
    protect,
    isStaff,
    check('submissionId', 'Submission ID is required').isMongoId(),
    check('score', 'Score is required and must be between 0 and 100').isFloat({ min: 0, max: 100 }),
    check('technicalScore', 'Technical score must be between 0 and 50').optional().isFloat({ min: 0, max: 50 }),
    check('financialScore', 'Financial score must be between 0 and 50').optional().isFloat({ min: 0, max: 50 })
  ],
  evaluationController.createEvaluation
);

// @route   GET /api/evaluations
// @desc    Get all evaluations
// @access  Private/Staff
router.get('/', protect, isStaff, evaluationController.getEvaluations);

// @route   GET /api/evaluations/tender/:id
// @desc    Get evaluations by tender
// @access  Private/Staff
router.get('/tender/:id', protect, isStaff, evaluationController.getEvaluationsByTender);

// @route   GET /api/evaluations/:id
// @desc    Get evaluation by ID
// @access  Private
router.get('/:id', protect, evaluationController.getEvaluationById);

// @route   PUT /api/evaluations/:id
// @desc    Update evaluation
// @access  Private/Staff
router.put(
  '/:id',
  [
    protect,
    isStaff,
    check('score', 'Score must be between 0 and 100').optional().isFloat({ min: 0, max: 100 }),
    check('technicalScore', 'Technical score must be between 0 and 50').optional().isFloat({ min: 0, max: 50 }),
    check('financialScore', 'Financial score must be between 0 and 50').optional().isFloat({ min: 0, max: 50 })
  ],
  evaluationController.updateEvaluation
);

// @route   DELETE /api/evaluations/:id
// @desc    Delete evaluation
// @access  Private/Staff
router.delete('/:id', protect, isStaff, evaluationController.deleteEvaluation);

module.exports = router; 