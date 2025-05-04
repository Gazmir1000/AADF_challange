import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to manage user authentication and profile data
 */
const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const initialLoadDone = useRef(false);

  /**
   * Load user data from localStorage
   */
  const loadUser = useCallback(() => {
    try {
      setLoading(true);
      const userJson = localStorage.getItem('user');
      const token = localStorage.getItem('userToken');

      if (userJson && token) {
        try {
          const userData = JSON.parse(userJson);
          setUser(userData);
        } catch (e) {
          console.error('Failed to parse user data from localStorage', e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user data');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update user data in state and localStorage
   */
  const updateUserData = useCallback((userData) => {
    try {
      // Merge with existing user data
      setUser(prevUser => {
        const updatedUser = prevUser ? { ...prevUser, ...userData } : userData;

        // Make sure not to remove the role
        if (prevUser?.role && !updatedUser.role) {
          updatedUser.role = prevUser.role;
        }

        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));

        return updatedUser;
      });

      return true;
    } catch (err) {
      console.error('Error updating user data:', err);
      setError('Failed to update user data');
      return false;
    }
  }, []);

  /**
   * Login and store user data
   */
  const login = useCallback((userData, token) => {
    try {
      // Store user data
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userToken', token);

      // Update state
      setUser(userData);
      setError(null);

      return true;
    } catch (err) {
      console.error('Error during login:', err);
      setError('Login failed');
      return false;
    }
  }, []);

  /**
   * Logout and clear user data
   */
  const logout = useCallback(() => {
    try {
      // Clear storage
      localStorage.removeItem('user');
      localStorage.removeItem('userToken');

      // Update state
      setUser(null);
      setError(null);

      // Redirect to login
      navigate('/login');

      return true;
    } catch (err) {
      console.error('Error during logout:', err);
      setError('Logout failed');
      return false;
    }
  }, [navigate]);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback(() => {
    const hasUser = !!user;
    const hasToken = !!localStorage.getItem('userToken');
    return hasUser && hasToken;
  }, [user]);

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  /**
   * Load user data on component mount - only once
   */
  useEffect(() => {
    if (!initialLoadDone.current) {
      loadUser();
      initialLoadDone.current = true;
    }
  }, [loadUser]);

  // Memoized derived values
  const isStaff = user?.role === 'staff';
  const isVendor = user?.role === 'vendor';

  return {
    user,
    loading,
    error,
    login,
    logout,
    updateUserData,
    isAuthenticated,
    hasRole,
    isStaff,
    isVendor,
    loadUser,
  };
};

export default useUser; 