import api from './api';

// Login user
const login = async (email, password) => {
  const response = await api.post('/users/login', { email, password });
  console.log('Login response:', response.data);

  if (response.data) {
    // Response structure might be { success: true, data: { user info with token } }
    const responseData = response.data.data || response.data;

    // Find and store token - could be at different levels depending on API response
    let token = null;

    // Try to find token at various levels in the response
    if (responseData.token) {
      token = responseData.token;
    } else if (response.data.token) {
      token = response.data.token;
    } else if (responseData.data && responseData.data.token) {
      token = responseData.data.token;
    }

    if (token) {
      console.log('Token found, storing in localStorage');
      localStorage.setItem('userToken', token);
    } else {
      console.warn('No token found in response!', response.data);
    }

    // Store user data - adapt based on backend response structure
    const userData = responseData.user || responseData;
    localStorage.setItem('user', JSON.stringify(userData));

    // Debug
    console.log('Stored user data:', userData);
    console.log('Token in localStorage:', localStorage.getItem('userToken'));
    console.log('User in localStorage:', localStorage.getItem('user'));

    return responseData;
  }

  return response.data;
};

// Register user
const register = async (userData) => {
  const response = await api.post('/users', userData);
  console.log('Register response:', response.data);

  if (response.data) {
    // Response structure might be { success: true, data: { user info with token } }
    const responseData = response.data.data || response.data;

    // Find and store token - could be at different levels depending on API response
    let token = null;

    // Try to find token at various levels in the response
    if (responseData.token) {
      token = responseData.token;
    } else if (response.data.token) {
      token = response.data.token;
    } else if (responseData.data && responseData.data.token) {
      token = responseData.data.token;
    }

    if (token) {
      console.log('Token found, storing in localStorage');
      localStorage.setItem('userToken', token);
    } else {
      console.warn('No token found in response!', response.data);
    }

    // Store user data - adapt based on backend response structure
    const userInfo = responseData.user || responseData;
    localStorage.setItem('user', JSON.stringify(userInfo));

    // Debug
    console.log('Stored user data after registration:', userInfo);
    console.log('Token in localStorage:', localStorage.getItem('userToken'));

    return responseData;
  }

  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('user');
};

// Get user profile
const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

// Update user profile
const updateUserProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }

  return response.data;
};

// Check if user is logged in
const isLoggedIn = () => {
  return !!localStorage.getItem('userToken');
};

// Get current user
const getCurrentUser = () => {
  const userData = localStorage.getItem('user');
  console.log('Getting current user from localStorage:', userData);

  if (!userData) return null;

  try {
    const parsedUser = JSON.parse(userData);

    // Normalize the user object to ensure role is at the top level
    if (parsedUser.user && parsedUser.user.role && !parsedUser.role) {
      parsedUser.role = parsedUser.user.role;
    }

    // Additional check - if we have a role in any nested structure, make sure it's at top level
    if (!parsedUser.role && typeof parsedUser === 'object') {
      // Search for role in the object
      const findRole = (obj) => {
        for (const key in obj) {
          if (key === 'role' && typeof obj[key] === 'string') {
            return obj[key];
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            const nestedRole = findRole(obj[key]);
            if (nestedRole) return nestedRole;
          }
        }
        return null;
      };

      const foundRole = findRole(parsedUser);
      if (foundRole) {
        parsedUser.role = foundRole;
      }
    }

    console.log('Normalized user object:', parsedUser);
    return parsedUser;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

const authService = {
  login,
  register,
  logout,
  getUserProfile,
  updateUserProfile,
  isLoggedIn,
  getCurrentUser
};

export default authService; 