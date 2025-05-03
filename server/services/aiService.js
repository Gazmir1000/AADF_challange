const { GoogleGenerativeAI } = require('@google/generative-ai');
const Submission = require('../models/submissionModel');
const Tender = require('../models/tenderModel');

/**
 * Service for AI-powered evaluation of tender submissions using Google's Gemini
 */
class AIService {
  constructor() {
    // Initialize the Gemini API with the API key from environment variables
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY not found in environment variables. AI evaluation will not work.');
    } else {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }
  }

  /**
   * Evaluates a submission against tender requirements using Gemini
   * @param {string} tenderId - ID of the tender
   * @param {string} submissionId - ID of the submission
   * @returns {Promise<Object>} Evaluation results with accuracy score
   */
  async evaluateSubmission(tenderId, submissionId) {
    try {
      // Check if Gemini API is configured
      if (!this.genAI) {
        throw new Error('Gemini API not configured. Check GEMINI_API_KEY environment variable.');
      }

      // Fetch the tender and submission data
      const tender = await Tender.findById(tenderId);
      const submission = await Submission.findById(submissionId);

      if (!tender || !submission) {
        throw new Error('Tender or submission not found');
      }

      // Generate the evaluation prompt
      const evaluationPrompt = this.generateEvaluationPrompt(tender, submission);

      // Call Gemini API
      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: evaluationPrompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096,
        }
      });

      // Extract and parse the response
      const responseText = result.response.text();
      const evaluation = this.parseAIResponse(responseText);

      // Update submission with accuracy score (overall_fit_score)
      if (evaluation && evaluation.evaluation && evaluation.evaluation.overall_fit_score) {
        await Submission.findByIdAndUpdate(submissionId, {
          accuracyScore: evaluation.evaluation.overall_fit_score,
          aiEvaluation: evaluation
        });
      }

      return evaluation;
    } catch (error) {
      console.error('AI evaluation error:', error);
      throw new Error(`AI evaluation failed: ${error.message}`);
    }
  }

  /**
   * Evaluates and ranks multiple submissions for a tender
   * @param {string} tenderId - ID of the tender
   * @param {Array<string>} submissionIds - Array of submission IDs to evaluate
   * @returns {Promise<Object>} Ranked evaluations
   */
  async rankSubmissions(tenderId, submissionIds) {
    try {
      // Check if Gemini API is configured
      if (!this.genAI) {
        throw new Error('Gemini API not configured. Check GEMINI_API_KEY environment variable.');
      }

      // Fetch the tender and submissions data
      const tender = await Tender.findById(tenderId);
      const submissions = await Submission.find({
        _id: { $in: submissionIds },
        tenderId: tenderId
      });

      if (!tender || submissions.length === 0) {
        throw new Error('Tender or submissions not found');
      }

      // Create a prompt for ranking multiple submissions
      const rankingPrompt = this.generateRankingPrompt(tender, submissions);

      // Call Gemini API
      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: rankingPrompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
        }
      });

      // Extract and parse the response
      const responseText = result.response.text();
      return this.parseAIResponse(responseText);
    } catch (error) {
      console.error('AI ranking error:', error);
      throw new Error(`AI ranking failed: ${error.message}`);
    }
  }

  /**
   * Generates a structured prompt for the AI to evaluate a single submission
   * @param {Object} tender - Tender details
   * @param {Object} submission - Submission to evaluate
   * @returns {string} Structured prompt
   */
  generateEvaluationPrompt(tender, submission) {
    return `
Please evaluate this submission for a tender and provide a detailed analysis in JSON format.

TENDER DETAILS:
Title: ${tender.title}
Description: ${tender.description}
Requirements: ${tender.requirements}

SUBMISSION:
Vendor: ${submission.vendorName || 'Anonymous'}
Financial Offer: ${submission.financialOffer} ${tender.currency}
Proposal: ${submission.proposal}
Additional Notes: ${submission.notes || 'None'}

INSTRUCTIONS:
1. Evaluate how well the submission meets the tender requirements
2. Analyze the financial offer relative to expected value
3. Identify any strengths and weaknesses
4. Provide a fit score from 0-100
5. Return your evaluation in the following JSON format:

{
  "evaluation": {
    "requirements_match": {
      "score": <0-100>,
      "explanation": "<explanation>"
    },
    "financial_analysis": {
      "value_rating": <0-100>,
      "explanation": "<explanation>"
    },
    "strengths": ["<strength1>", "<strength2>", ...],
    "weaknesses": ["<weakness1>", "<weakness2>", ...],
    "overall_fit_score": <0-100>,
    "recommendation": "<accept/reject/consider with changes>",
    "summary": "<brief summary of evaluation>",
    "improvement_suggestions": ["<suggestion1>", "<suggestion2>", ...]
  }
}
`;
  }

  /**
   * Generates a structured prompt for ranking multiple submissions
   * @param {Object} tender - Tender details
   * @param {Array} submissions - Array of submissions to rank
   * @returns {string} Structured prompt
   */
  generateRankingPrompt(tender, submissions) {
    let submissionsText = '';

    submissions.forEach((sub, index) => {
      submissionsText += `
SUBMISSION #${index + 1} (ID: ${sub._id}):
Vendor: ${sub.vendorName || 'Anonymous'}
Financial Offer: ${sub.financialOffer} ${tender.currency}
Proposal: ${sub.proposal}
Additional Notes: ${sub.notes || 'None'}

`;
    });

    return `
Please evaluate and rank the following submissions for a tender. Provide a detailed analysis in JSON format.

TENDER DETAILS:
Title: ${tender.title}
Description: ${tender.description}
Requirements: ${tender.requirements}

${submissionsText}

INSTRUCTIONS:
1. Evaluate each submission against the tender requirements
2. Rank the submissions from best to worst fit
3. Provide an overall analysis
4. Return your evaluation in the following JSON format:

{
  "rankings": [
    {
      "submission_id": "<submission_id>",
      "rank": <rank_number>,
      "overall_fit_score": <0-100>,
      "strengths": ["<strength1>", "<strength2>", ...],
      "weaknesses": ["<weakness1>", "<weakness2>", ...],
      "recommendation": "<recommendation>"
    },
    ...
  ],
  "analysis": {
    "summary": "<overall_analysis>",
    "best_submission_id": "<id_of_best_submission>",
    "comparison_notes": "<notes_comparing_submissions>"
  }
}
`;
  }

  /**
   * Parses the AI response to ensure it's properly formatted
   * @param {string} response - Response from the AI
   * @returns {Object} Structured evaluation data
   */
  parseAIResponse(response) {
    try {
      // If it's a string, try to parse it as JSON
      if (typeof response === 'string') {
        // Extract JSON from the string if it contains text before/after JSON
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(response);
      }

      // If response is already an object, use it directly
      if (typeof response === 'object' && response !== null) {
        return response;
      }

      throw new Error('Invalid response format from AI');
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        error: true,
        message: 'Failed to parse AI evaluation results',
        raw_response: response
      };
    }
  }
}

module.exports = new AIService(); 