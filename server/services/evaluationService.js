const Evaluation = require('../models/evaluationModel');
const Submission = require('../models/submissionModel');
const Tender = require('../models/tenderModel');

// Create a new evaluation
exports.createEvaluation = async (evaluationData, evaluatorId) => {
  const { submissionId, score, comments, technicalScore, financialScore } = evaluationData;

  // Check if submission exists
  const submission = await Submission.findById(submissionId).populate('tenderId');
  
  if (!submission) {
    throw new Error('Submission not found');
  }
  
  // Check if tender is closed for evaluation
  if (submission.tenderId.status !== 'closed') {
    throw new Error('Tender must be closed before evaluating submissions');
  }
  
  // Check if submission has already been evaluated
  const existingEvaluation = await Evaluation.findOne({ submissionId });
  
  if (existingEvaluation) {
    throw new Error('This submission has already been evaluated');
  }
  
  // Create evaluation
  const evaluation = await Evaluation.create({
    submissionId,
    evaluatorId,
    score,
    comments,
    technicalScore,
    financialScore
  });
  
  return evaluation;
};

// Get all evaluations
exports.getAllEvaluations = async (query = {}) => {
  const pageSize = 10;
  const page = Number(query.page) || 1;
  
  let filter = {};
  
  // Filter by tender if specified
  if (query.tenderId) {
    // First get submission IDs for this tender
    const submissions = await Submission.find({ tenderId: query.tenderId }).select('_id');
    const submissionIds = submissions.map(s => s._id);
    filter.submissionId = { $in: submissionIds };
  }
  
  // Filter by evaluator if specified
  if (query.evaluatorId) {
    filter.evaluatorId = query.evaluatorId;
  }

  const count = await Evaluation.countDocuments(filter);
  const evaluations = await Evaluation.find(filter)
    .populate({
      path: 'submissionId',
      select: 'tenderId vendorId financialOffer',
      populate: [
        { path: 'tenderId', select: 'title status' },
        { path: 'vendorId', select: 'email' }
      ]
    })
    .populate('evaluatorId', 'email')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  return {
    evaluations,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  };
};

// Get evaluation by ID
exports.getEvaluationById = async (id) => {
  const evaluation = await Evaluation.findById(id)
    .populate({
      path: 'submissionId',
      select: 'tenderId vendorId financialOffer proposedTeam',
      populate: [
        { path: 'tenderId', select: 'title status' },
        { path: 'vendorId', select: 'email' }
      ]
    })
    .populate('evaluatorId', 'email');

  if (evaluation) {
    return evaluation;
  } else {
    throw new Error('Evaluation not found');
  }
};

// Get evaluations by tender
exports.getEvaluationsByTender = async (tenderId) => {
  // First get submission IDs for this tender
  const submissions = await Submission.find({ tenderId }).select('_id');
  const submissionIds = submissions.map(s => s._id);

  return await Evaluation.find({ submissionId: { $in: submissionIds } })
    .populate({
      path: 'submissionId',
      select: 'vendorId financialOffer',
      populate: { path: 'vendorId', select: 'email' }
    })
    .populate('evaluatorId', 'email')
    .sort({ score: -1 });
};

// Update evaluation
exports.updateEvaluation = async (id, evaluationData, evaluatorId) => {
  const evaluation = await Evaluation.findById(id);

  if (!evaluation) {
    throw new Error('Evaluation not found');
  }

  // Check if evaluator owns the evaluation
  if (evaluation.evaluatorId.toString() !== evaluatorId) {
    throw new Error('Not authorized to update this evaluation');
  }

  // Update fields
  Object.keys(evaluationData).forEach(key => {
    evaluation[key] = evaluationData[key];
  });

  return await evaluation.save();
};

// Delete evaluation
exports.deleteEvaluation = async (id, evaluatorId) => {
  const evaluation = await Evaluation.findById(id);

  if (!evaluation) {
    throw new Error('Evaluation not found');
  }

  // Check if evaluator owns the evaluation
  if (evaluation.evaluatorId.toString() !== evaluatorId) {
    throw new Error('Not authorized to delete this evaluation');
  }

  await evaluation.remove();
  return { message: 'Evaluation removed' };
}; 