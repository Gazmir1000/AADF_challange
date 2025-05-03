const submissionService = require('../services/submissionService');
const { validationResult } = require('express-validator');
const socketIO = require('../utils/socketIO');

/**
 * @swagger
 * components:
 *   schemas:
 *     Submission:
 *       type: object
 *       required:
 *         - tenderId
 *         - vendorId
 *         - financialOffer
 *         - proposedTeam
 *         - declaration
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated submission ID
 *         tenderId:
 *           type: string
 *           description: Reference to tender
 *         vendorId:
 *           type: string
 *           description: Reference to vendor user
 *         financialOffer:
 *           type: number
 *           description: Financial offer amount
 *         proposedTeam:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               experiences:
 *                 type: string
 *               documents:
 *                 type: string
 *         declaration:
 *           type: boolean
 *           description: Vendor's declaration of compliance
 *         submittedAt:
 *           type: string
 *           format: date-time
 *           description: Submission timestamp
 */

// @desc    Create a new submission
// @route   POST /api/submissions
// @access  Private/Vendor
/**
 * @swagger
 * /submissions:
 *   post:
 *     summary: Create a new submission
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenderId
 *               - financialOffer
 *               - proposedTeam
 *               - declaration
 *             properties:
 *               tenderId:
 *                 type: string
 *               financialOffer:
 *                 type: number
 *               proposedTeam:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     experiences:
 *                       type: string
 *                     documents:
 *                       type: string
 *               declaration:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Submission created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as vendor
 */
exports.createSubmission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const submission = await submissionService.createSubmission(req.body, req.user._id);
    
    // Emit socket event for real-time update
    socketIO.emitSubmissionCreated(submission);
    
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
/**
 * @swagger
 * /submissions:
 *   get:
 *     summary: Get all submissions (staff only)
 *     tags: [Submissions]
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
 *         description: List of submissions
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as staff
 */
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
/**
 * @swagger
 * /submissions/{id}:
 *   get:
 *     summary: Get submission by ID
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Submission ID
 *     responses:
 *       200:
 *         description: Submission details
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to view this submission
 *       404:
 *         description: Submission not found
 */
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
/**
 * @swagger
 * /submissions/vendor:
 *   get:
 *     summary: Get submissions by the authenticated vendor
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vendor's submissions
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as vendor
 */
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
/**
 * @swagger
 * /submissions/tender/{id}:
 *   get:
 *     summary: Get submissions by tender ID (staff only)
 *     tags: [Submissions]
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
 *         description: List of submissions for the tender
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as staff
 */
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
/**
 * @swagger
 * /submissions/{id}:
 *   put:
 *     summary: Update a submission
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Submission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               financialOffer:
 *                 type: number
 *               proposedTeam:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     experiences:
 *                       type: string
 *                     documents:
 *                       type: string
 *               declaration:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Submission updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this submission
 *       404:
 *         description: Submission not found
 */
exports.updateSubmission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const submission = await submissionService.updateSubmission(req.params.id, req.body, req.user._id);
    
    // Emit socket event for real-time update
    socketIO.emitSubmissionUpdated(submission);
    
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
/**
 * @swagger
 * /submissions/{id}:
 *   delete:
 *     summary: Delete a submission
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Submission ID
 *     responses:
 *       200:
 *         description: Submission removed successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to delete this submission
 *       404:
 *         description: Submission not found
 */
exports.deleteSubmission = async (req, res) => {
  try {
    const submission = await submissionService.getSubmissionById(req.params.id);
    await submissionService.deleteSubmission(req.params.id, req.user._id);
    
    // Emit socket event for real-time update
    socketIO.emitSubmissionDeleted(submission);
    
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