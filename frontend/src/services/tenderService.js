import api from './api';

// Get all tenders with optional status filter and pagination
const getTenders = async (status = 'open', page = 1) => {
  const response = await api.get('/tenders', {
    params: { status, page }
  });
  return response.data;
};

// Get tender by ID
const getTenderById = async (id) => {
  const response = await api.get(`/tenders/${id}`);
  return response.data;
};

// Create a new tender (staff only)
const createTender = async (tenderData) => {
  console.log('Creating tender with data:', tenderData);

  try {
    // Get token from localStorage
    const token = localStorage.getItem('userToken');
    console.log('Token for tender creation:', token ? 'Token exists' : 'No token found');
    console.log(token);
    if (!token) {
      // throw new Error('Authentication token not found. Please log in again.');
      console.log("no token");
    }

    // Create headers with authorization
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Make the API call with explicit headers
    const response = await api.post('/tenders', tenderData, { headers });
    console.log(response.data);
    console.log('Tender creation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating tender:', error.response?.data || error.message);
    // throw error;
  }
};

// Update a tender (staff only)
const updateTender = async (id, tenderData) => {
  const response = await api.put(`/tenders/${id}`, tenderData);
  return response.data;
};

// Close a tender (staff only)
const closeTender = async (id) => {
  const response = await api.put(`/tenders/${id}/close`);
  return response.data;
};

// Delete a tender (staff only)
const deleteTender = async (id) => {
  const response = await api.delete(`/tenders/${id}`);
  return response.data;
};

const tenderService = {
  getTenders,
  getTenderById,
  createTender,
  updateTender,
  closeTender,
  deleteTender
};

export default tenderService; 