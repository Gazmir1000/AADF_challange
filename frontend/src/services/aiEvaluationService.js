import api from './api';

/**
 * Service for AI-powered evaluation of tender submissions using Google's Gemini
 */
class AIEvaluationService {
  /**
   * Evaluates a submission against the tender requirements
   * 
   * @param {Object} tender - The tender details containing requirements
   * @param {Object} submission - The submission to evaluate
   * @returns {Promise<Object>} - AI evaluation results
   */
  async evaluateSubmission(tender, submission) {
    try {
      console.log('Requesting AI evaluation for submission:', {
        tenderId: tender._id,
        submissionId: submission._id
      });

      // Request evaluation from the backend API which connects to Gemini
      const response = await api.post('/api/ai/evaluate-submission', {
        tender_id: tender._id,
        submission_id: submission._id
      });

      return response.data.data;
    } catch (error) {
      console.error('Error with AI evaluation:', error);
      throw new Error('Failed to perform AI evaluation. Please try again later.');
    }
  }

  /**
   * Batch evaluates multiple submissions for a tender and ranks them
   * 
   * @param {Object} tender - The tender details
   * @param {Array} submissions - Array of submissions to evaluate and rank
   * @returns {Promise<Object>} - Ranked evaluations and summary
   */
  async evaluateAndRankSubmissions(tender, submissions) {
    try {
      console.log('Sending multiple submissions for AI ranking:', { tender, submissionCount: submissions.length });

      // Request batch evaluation from the backend
      const response = await api.post('/ai/rank-submissions', {
        tender_id: tender._id,
        submission_ids: submissions.map(sub => sub._id)
      });

      return response.data;
    } catch (error) {
      console.error('Error with AI ranking:', error);
      throw new Error('Failed to perform AI ranking. Please try again later.');
    }
  }

  /**
   * Generates a structured prompt for the AI to understand what to evaluate
   * 
   * @param {Object} tender - The tender details
   * @param {Object} submission - The submission to evaluate
   * @returns {String} - Structured prompt for Gemini API
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
   * Parses the AI response to ensure it's properly formatted
   * 
   * @param {Object|String} response - Response from the AI
   * @returns {Object} - Structured evaluation data
   */
  parseAIResponse(response) {
    try {
      // If response is already an object, use it directly
      if (typeof response === 'object' && response !== null) {
        return response;
      }

      // If it's a string, try to parse it as JSON
      if (typeof response === 'string') {
        // Extract JSON from the string if it contains text before/after JSON
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(response);
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

export default new AIEvaluationService(); 