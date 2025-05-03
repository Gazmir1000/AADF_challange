import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      console.log(`Adding auth token to ${config.method.toUpperCase()} request to ${config.url}`);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(`No auth token available for ${config.method.toUpperCase()} request to ${config.url}`);
    }

    // Log the headers being sent
    console.log('Request headers:', JSON.stringify(config.headers));

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.config?.headers
    });

    // Handle session expiration
    if (error.response && error.response.status === 401) {
      console.warn('401 Unauthorized error - clearing auth state');
      // Clear invalid token and redirect to login
      localStorage.removeItem('userToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = `/login?redirect=${window.location.pathname}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api; 