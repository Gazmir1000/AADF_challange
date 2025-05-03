const submissionService = require('../services/submissionService');
const { validationResult } = require('express-validator');

// @desc    Create a new submission
// @route   POST /api/submissions
// @access  Private/Vendor
exports.createSubmission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const submission = await submissionService.createSubmission(req.body, req.user._id);
    
    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all submissions
// @route   GET /api/submissions
// @access  Private/Staff
exports.getSubmissions = async (req, res) => {
  try {
    const result = await submissionService.getAllSubmissions(req.query);
    
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

// @desc    Get submission by ID
// @route   GET /api/submissions/:id
// @access  Private
exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await submissionService.getSubmissionById(req.params.id);
    
    // Check if user is authorized to view the submission
    if (req.user.role === 'vendor' && submission.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this submission'
      });
    }
    
    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get submissions by vendor
// @route   GET /api/submissions/vendor
// @access  Private/Vendor
exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await submissionService.getSubmissionsByVendor(req.user._id);
    
    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get submissions by tender
// @route   GET /api/submissions/tender/:id
// @access  Private/Staff
exports.getSubmissionsByTender = async (req, res) => {
  try {
    const submissions = await submissionService.getSubmissionsByTender(req.params.id);
    
    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update submission
// @route   PUT /api/submissions/:id
// @access  Private/Vendor
exports.updateSubmission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const submission = await submissionService.updateSubmission(req.params.id, req.body, req.user._id);
    
    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private/Vendor
exports.deleteSubmission = async (req, res) => {
  try {
    await submissionService.deleteSubmission(req.params.id, req.user._id);
    
    res.json({
      success: true,
      message: 'Submission removed'
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
}; 