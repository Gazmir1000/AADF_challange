const aiService = require('../services/aiService');
const { validationResult } = require('express-validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     AIEvaluation:
 *       type: object
 *       properties:
 *         evaluation:
 *           type: object
 *           properties:
 *             requirements_match:
 *               type: object
 *               properties:
 *                 score:
 *                   type: number
 *                   description: Score from 0-100
 *                 explanation:
 *                   type: string
 *                   description: Explanation of the score
 *             financial_analysis:
 *               type: object
 *               properties:
 *                 value_rating:
 *                   type: number
 *                   description: Score from 0-100
 *                 explanation:
 *                   type: string
 *                   description: Explanation of the rating
 *             strengths:
 *               type: array
 *               items:
 *                 type: string
 *             weaknesses:
 *               type: array
 *               items:
 *                 type: string
 *             overall_fit_score:
 *               type: number
 *               description: Overall fit score from 0-100
 *             recommendation:
 *               type: string
 *               description: AI recommendation (accept/reject/consider)
 *             summary:
 *               type: string
 *               description: Brief summary of evaluation
 *             improvement_suggestions:
 *               type: array
 *               items:
 *                 type: string
 */

// @desc    Evaluate a submission using AI
// @route   POST /api/ai/evaluate-submission
// @access  Private/Staff
exports.evaluateSubmission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { submission_id, tender_id } = req.body;

    // Log the request
    console.log(`AI evaluation requested for submission ${submission_id} of tender ${tender_id}`);

    // Call the AI service
    const evaluation = await aiService.evaluateSubmission(tender_id, submission_id);

    res.json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    console.error('AI evaluation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Rank multiple submissions using AI
// @route   POST /api/ai/rank-submissions
// @access  Private/Staff
exports.rankSubmissions = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { tender_id, submission_ids } = req.body;

    // Validate input
    if (!tender_id || !submission_ids || !Array.isArray(submission_ids)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input. Please provide tender_id and an array of submission_ids.'
      });
    }

    // Log the request
    console.log(`AI ranking requested for ${submission_ids.length} submissions of tender ${tender_id}`);

    // Call the AI service
    const rankings = await aiService.rankSubmissions(tender_id, submission_ids);

    res.json({
      success: true,
      data: rankings
    });
  } catch (error) {
    console.error('AI ranking error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 