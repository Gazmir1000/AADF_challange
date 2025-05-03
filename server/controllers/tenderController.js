const tenderService = require('../services/tenderService');
const { validationResult } = require('express-validator');

// @desc    Create a new tender
// @route   POST /api/tenders
// @access  Private/Staff
exports.createTender = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const tender = await tenderService.createTender(req.body);
    
    res.status(201).json({
      success: true,
      data: tender
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all tenders
// @route   GET /api/tenders
// @access  Public
exports.getTenders = async (req, res) => {
  try {
    const result = await tenderService.getAllTenders(req.query);
    
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

// @desc    Get tender by ID
// @route   GET /api/tenders/:id
// @access  Public
exports.getTenderById = async (req, res) => {
  try {
    const tender = await tenderService.getTenderById(req.params.id);
    
    res.json({
      success: true,
      data: tender
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update tender
// @route   PUT /api/tenders/:id
// @access  Private/Staff
exports.updateTender = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const tender = await tenderService.updateTender(req.params.id, req.body);
    
    res.json({
      success: true,
      data: tender
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Close tender
// @route   PUT /api/tenders/:id/close
// @access  Private/Staff
exports.closeTender = async (req, res) => {
  try {
    const tender = await tenderService.closeTender(req.params.id);
    
    res.json({
      success: true,
      data: tender
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete tender
// @route   DELETE /api/tenders/:id
// @access  Private/Staff
exports.deleteTender = async (req, res) => {
  try {
    await tenderService.deleteTender(req.params.id);
    
    res.json({
      success: true,
      message: 'Tender removed'
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
}; 