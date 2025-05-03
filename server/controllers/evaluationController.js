const evaluationService = require('../services/evaluationService');
const { validationResult } = require('express-validator');
const socketIO = require('../utils/socketIO');

/**
 * @swagger
 * components:
 *   schemas:
 *     Evaluation:
 *       type: object
 *       required:
 *         - submissionId
 *         - evaluatorId
 *         - score
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated evaluation ID
 *         submissionId:
 *           type: string
 *           description: Reference to submission
 *         evaluatorId:
 *           type: string
 *           description: Reference to staff user
 *         score:
 *           type: number
 *           description: Overall evaluation score (0-100)
 *         comments:
 *           type: string
 *           description: Optional evaluation comments
 *         technicalScore:
 *           type: number
 *           description: Technical evaluation score (0-50)
 *         financialScore:
 *           type: number
 *           description: Financial evaluation score (0-50)
 */

// @desc    Create a new evaluation
// @route   POST /api/evaluations
// @access  Private/Staff
/**
 * @swagger
 * /evaluations:
 *   post:
 *     summary: Create a new evaluation
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - submissionId
 *               - score
 *             properties:
 *               submissionId:
 *                 type: string
 *               score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               comments:
 *                 type: string
 *               technicalScore:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 50
 *               financialScore:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 50
 *     responses:
 *       201:
 *         description: Evaluation created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as staff
 */
exports.createEvaluation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const evaluation = await evaluationService.createEvaluation(req.body, req.user._id);
    
    // Emit socket event for real-time update
    socketIO.emitEvaluationCreated(evaluation);
    
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
/**
 * @swagger
 * /evaluations:
 *   get:
 *     summary: Get all evaluations (staff only)
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tenderId
 *         schema:
 *           type: string
 *         description: Filter by tender ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of evaluations
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as staff
 */
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
/**
 * @swagger
 * /evaluations/{id}:
 *   get:
 *     summary: Get evaluation by ID
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Evaluation ID
 *     responses:
 *       200:
 *         description: Evaluation details
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to view this evaluation
 *       404:
 *         description: Evaluation not found
 */
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
/**
 * @swagger
 * /evaluations/tender/{id}:
 *   get:
 *     summary: Get evaluations by tender ID (staff only)
 *     tags: [Evaluations]
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
 *         description: List of evaluations for the tender
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as staff
 */
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
/**
 * @swagger
 * /evaluations/{id}:
 *   put:
 *     summary: Update an evaluation
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Evaluation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               comments:
 *                 type: string
 *               technicalScore:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 50
 *               financialScore:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 50
 *     responses:
 *       200:
 *         description: Evaluation updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this evaluation
 *       404:
 *         description: Evaluation not found
 */
exports.updateEvaluation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const evaluation = await evaluationService.updateEvaluation(req.params.id, req.body, req.user._id);
    
    // Emit socket event for real-time update
    socketIO.emitEvaluationUpdated(evaluation);
    
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
/**
 * @swagger
 * /evaluations/{id}:
 *   delete:
 *     summary: Delete an evaluation
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Evaluation ID
 *     responses:
 *       200:
 *         description: Evaluation removed successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to delete this evaluation
 *       404:
 *         description: Evaluation not found
 */
exports.deleteEvaluation = async (req, res) => {
  try {
    const evaluation = await evaluationService.getEvaluationById(req.params.id);
    await evaluationService.deleteEvaluation(req.params.id, req.user._id);
    
    // Emit socket event for real-time update
    socketIO.emitEvaluationDeleted(evaluation);
    
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