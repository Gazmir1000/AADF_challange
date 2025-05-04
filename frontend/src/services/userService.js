import api from './api';

/**
 * Service for user-related API operations
 */
class UserService {
  /**
   * Get the current user's profile
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile() {
    try {
      const response = await api.get('/users/profile');
      // Handle different API response structures
      const userData = response.data.data || response.data;

      // Normalize the response to ensure consistent structure
      const normalizedUser = this.normalizeUserData(userData);

      return normalizedUser;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Update the current user's profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated user profile
   */
  async updateUserProfile(profileData) {
    try {
      // Remove the role field to prevent users from changing their role
      // eslint-disable-next-line no-unused-vars
      const { role, ...updateData } = profileData;

      const response = await api.put('/users/profile', updateData);
      const userData = response.data.data || response.data;

      // Update the user in localStorage with the new data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...this.normalizeUserData(userData) };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return this.normalizeUserData(userData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Normalize user data to ensure consistent structure
   * @param {Object} userData - User data from API or storage
   * @returns {Object} - Normalized user data
   */
  normalizeUserData(userData) {
    if (!userData) return {};

    const normalizedUser = { ...userData };

    // Ensure role is at the top level
    if (userData.user && userData.user.role && !normalizedUser.role) {
      normalizedUser.role = userData.user.role;
    }

    return normalizedUser;
  }

  /**
   * Change the user's password
   * @param {Object} passwordData - Object containing current and new password
   * @returns {Promise<Object>} Success message
   */
  async changePassword(passwordData) {
    try {
      const response = await api.put('/users/password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Update the user's profile picture
   * @param {File} imageFile - The image file to upload
   * @returns {Promise<Object>} Updated user with new profile picture URL
   */
  async updateProfilePicture(imageFile) {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('profilePicture', imageFile);

      const response = await api.post('/users/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   * @returns {Promise<Array>} List of users
   */
  async getAllUsers() {
    try {
      const response = await api.get('/users');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }
}

export default new UserService(); 