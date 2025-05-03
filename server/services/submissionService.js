const Submission = require('../models/submissionModel');
const Tender = require('../models/tenderModel');

// Create a new submission
exports.createSubmission = async (submissionData, vendorId) => {
  // Check if tender exists and is open
  const tender = await Tender.findById(submissionData.tenderId);
  
  if (!tender) {
    throw new Error('Tender not found');
  }
  
  if (tender.status !== 'open') {
    throw new Error('Cannot submit to a closed tender');
  }
  
  if (tender.deadline < new Date()) {
    throw new Error('Tender deadline has passed');
  }

  // Check if vendor has already submitted for this tender
  const existingSubmission = await Submission.findOne({
    tenderId: submissionData.tenderId,
    vendorId
  });

  if (existingSubmission) {
    throw new Error('You have already submitted a proposal for this tender');
  }

  // Create submission
  const submission = await Submission.create({
    ...submissionData,
    vendorId,
    submittedAt: Date.now()
  });

  return submission;
};

// Get all submissions
exports.getAllSubmissions = async (query = {}) => {
  const pageSize = 10;
  const page = Number(query.page) || 1;
  
  let filter = {};
  
  // Filter by tender if specified
  if (query.tenderId) {
    filter.tenderId = query.tenderId;
  }
  
  // Filter by vendor if specified
  if (query.vendorId) {
    filter.vendorId = query.vendorId;
  }

  const count = await Submission.countDocuments(filter);
  const submissions = await Submission.find(filter)
    .populate('tenderId', 'title deadline status')
    .populate('vendorId', 'email')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ submittedAt: -1 });

  return {
    submissions,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  };
};

// Get submission by ID
exports.getSubmissionById = async (id) => {
  const submission = await Submission.findById(id)
    .populate('tenderId', 'title deadline status')
    .populate('vendorId', 'email')
    .populate('evaluation');

  if (submission) {
    return submission;
  } else {
    throw new Error('Submission not found');
  }
};

// Get submissions by vendor
exports.getSubmissionsByVendor = async (vendorId) => {
  return await Submission.find({ vendorId })
    .populate('tenderId', 'title deadline status')
    .sort({ submittedAt: -1 });
};

// Get submissions by tender
exports.getSubmissionsByTender = async (tenderId) => {
  return await Submission.find({ tenderId })
    .populate('vendorId', 'email')
    .populate('evaluation')
    .sort({ submittedAt: -1 });
};

// Update submission
exports.updateSubmission = async (id, submissionData, vendorId) => {
  const submission = await Submission.findById(id);

  if (!submission) {
    throw new Error('Submission not found');
  }

  // Check if vendor owns the submission
  if (submission.vendorId.toString() !== vendorId) {
    throw new Error('Not authorized to update this submission');
  }

  // Check if tender is still open
  const tender = await Tender.findById(submission.tenderId);
  if (tender.status !== 'open' || tender.deadline < new Date()) {
    throw new Error('Cannot update submission for a closed or expired tender');
  }

  // Update fields
  Object.keys(submissionData).forEach(key => {
    submission[key] = submissionData[key];
  });

  return await submission.save();
};

// Delete submission
exports.deleteSubmission = async (id, vendorId) => {
  const submission = await Submission.findById(id);

  if (!submission) {
    throw new Error('Submission not found');
  }

  // Check if vendor owns the submission
  if (submission.vendorId.toString() !== vendorId) {
    throw new Error('Not authorized to delete this submission');
  }

  // Check if tender is still open
  const tender = await Tender.findById(submission.tenderId);
  if (tender.status !== 'open' || tender.deadline < new Date()) {
    throw new Error('Cannot delete submission for a closed or expired tender');
  }

  await submission.remove();
  return { message: 'Submission removed' };
}; 