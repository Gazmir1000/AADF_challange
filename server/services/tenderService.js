const Tender = require('../models/tenderModel');
const User = require('../models/userModel');
const Submission = require('../models/submissionModel');
exports.createTender = async (tenderData) => {
  return await Tender.create(tenderData);
};

// Get all tenders
exports.getAllTenders = async (query = {}) => {
  const pageSize = 10;
  const page = Number(query.page) || 1;
  const status = query.status || null;

  // Build filter
  const filter = {};
  
  // Add status filter if provided
  if (status) {
    filter.status = status;
  }

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

// Filter tenders with search and pagination
exports.filterTenders = async (filterOptions) => {
  const {
    search = '',
    page = 1,
    limit = 10,
    status = null,
  } = filterOptions;

  // Build filter object
  const filter = {};
  
  // Add status filter if provided
  if (status) {
    filter.status = status;
  }

  // Add search filter if provided
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { requirements: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const pageNumber = Number(page);
  const pageSize = Number(limit);

  // Get total count for pagination
  const count = await Tender.countDocuments(filter);
  
  // Get filtered tenders
  const tenders = await Tender.find(filter)
    .limit(pageSize)
    .skip(pageSize * (pageNumber - 1))
    .sort({ createdAt: -1 });

  return {
    tenders,
    page: pageNumber,
    pages: Math.ceil(count / pageSize),
    total: count
  };
};

// Get tender by ID
exports.getTenderById = async (id,userId) => {
  const userRole =userId ? await User.findById(userId).select('role') : "vendor";
  const tender = await Tender.findById(id).populate({
    path: 'submissions',
    select: 'vendorId financialOffer submittedAt'
  });

  if(userRole.role === 'staff' || tender.status === 'closed'){
    const submissions = await Submission.find({
      tenderId: id
    }).populate('vendorId');
    tender.submissions = submissions;
  }
 
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

  await tender.deleteOne();
  return { message: 'Tender removed' };
}; 