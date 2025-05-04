import api from './api';

// Get all submissions (staff only)
const getSubmissions = async () => {
  const response = await api.get('/submissions');
  return response.data;
};

// Get vendor's own submissions (vendor only)
const getMySubmissions = async () => {
  const response = await api.get('/submissions/vendor');
  return response.data;
};

// Get submissions by tender (staff only)
const getSubmissionsByTender = async (tenderId) => {
  const response = await api.get(`/submissions/tender/${tenderId}`);
  return response.data;
};

// Get submission by ID
const getSubmissionById = async (id) => {
  const response = await api.get(`/submissions/${id}`);
  return response.data;
};

// Create a new submission (vendor only)
const createSubmission = async (submissionData) => {
  const response = await api.post('/submissions', submissionData);
  return response.data;
};

// Update a submission (vendor only)
const updateSubmission = async (id, submissionData) => {
  const response = await api.put(`/submissions/${id}`, submissionData);
  return response.data;
};

// Delete a submission (vendor only)
const deleteSubmission = async (id) => {
  const response = await api.delete(`/submissions/${id}`);
  return response.data;
};

const didUserSubmit = async (tenderId,userId) => {
  const response = await api.get(`/submissions/check/${tenderId}/${userId}`);
  return response.data;
};

const submissionService = {
  getSubmissions,
  getMySubmissions,
  getSubmissionsByTender,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  deleteSubmission,
  didUserSubmit
};

export default submissionService; 