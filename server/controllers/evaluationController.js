const evaluationService = require('../services/evaluationService');
const { validationResult } = require('express-validator');

// @desc    Create a new evaluation
// @route   POST /api/evaluations
// @access  Private/Staff
exports.createEvaluation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const evaluation = await evaluationService.createEvaluation(req.body, req.user._id);
    
    res.status(201).json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all evaluations
// @route   GET /api/evaluations
// @access  Private/Staff
exports.getEvaluations = async (req, res) => {
  try {
    const result = await evaluationService.getAllEvaluations(req.query);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get evaluation by ID
// @route   GET /api/evaluations/:id
// @access  Private
exports.getEvaluationById = async (req, res) => {
  try {
    const evaluation = await evaluationService.getEvaluationById(req.params.id);
    
    // If user is vendor, check if they own the submission
    if (req.user.role === 'vendor') {
      const submissionVendorId = evaluation.submissionId.vendorId.toString();
      if (submissionVendorId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this evaluation'
        });
      }
    }
    
    res.json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get evaluations by tender
// @route   GET /api/evaluations/tender/:id
// @access  Private/Staff
exports.getEvaluationsByTender = async (req, res) => {
  try {
    const evaluations = await evaluationService.getEvaluationsByTender(req.params.id);
    
    res.json({
      success: true,
      data: evaluations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update evaluation
// @route   PUT /api/evaluations/:id
// @access  Private/Staff
exports.updateEvaluation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const evaluation = await evaluationService.updateEvaluation(req.params.id, req.body, req.user._id);
    
    res.json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete evaluation
// @route   DELETE /api/evaluations/:id
// @access  Private/Staff
exports.deleteEvaluation = async (req, res) => {
  try {
    await evaluationService.deleteEvaluation(req.params.id, req.user._id);
    
    res.json({
      success: true,
      message: 'Evaluation removed'
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
}; 