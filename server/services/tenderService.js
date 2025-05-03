const Tender = require('../models/tenderModel');

// Create a new tender
exports.createTender = async (tenderData) => {
  return await Tender.create(tenderData);
};

// Get all tenders
exports.getAllTenders = async (query = {}) => {
  const pageSize = 10;
  const page = Number(query.page) || 1;
  const status = query.status || 'open';

  const filter = { status };

  const count = await Tender.countDocuments(filter);
  const tenders = await Tender.find(filter)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  return {
    tenders,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  };
};

// Get tender by ID
exports.getTenderById = async (id) => {
  const tender = await Tender.findById(id).populate({
    path: 'submissions',
    select: 'vendorId financialOffer submittedAt'
  });

  if (tender) {
    return tender;
  } else {
    throw new Error('Tender not found');
  }
};

// Update tender
exports.updateTender = async (id, tenderData) => {
  const tender = await Tender.findById(id);

  if (!tender) {
    throw new Error('Tender not found');
  }

  // If tender is closed, don't allow updates
  if (tender.status === 'closed') {
    throw new Error('Cannot update a closed tender');
  }

  // Update fields
  Object.keys(tenderData).forEach(key => {
    tender[key] = tenderData[key];
  });

  return await tender.save();
};

// Close tender
exports.closeTender = async (id) => {
  const tender = await Tender.findById(id);

  if (!tender) {
    throw new Error('Tender not found');
  }

  if (tender.status === 'closed') {
    throw new Error('Tender is already closed');
  }

  tender.status = 'closed';
  return await tender.save();
};

// Delete tender
exports.deleteTender = async (id) => {
  const tender = await Tender.findById(id);

  if (!tender) {
    throw new Error('Tender not found');
  }

  // Check if tender has submissions
  const submissionsCount = await tender.submissions.countDocuments();
  if (submissionsCount > 0) {
    throw new Error('Cannot delete tender with existing submissions');
  }

  await tender.remove();
  return { message: 'Tender removed' };
}; 