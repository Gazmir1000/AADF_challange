import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Avatar, 
  Button, 
  TextField, 
  Divider, 
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Paper,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import useUser from '../hooks/useUser';
import userService from '../services/userService';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const ProfileField = ({ icon, label, value, editing, name, onChange, multiline, rows }) => {
  const Icon = icon;
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2.5, 
        borderRadius: 3,
        backgroundColor: theme => theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.light, 0.08),
        border: '1px solid',
        borderColor: theme => theme.palette.mode === 'dark' ? alpha(theme.palette.divider, 0.1) : alpha(theme.palette.primary.main, 0.1),
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: editing ? 'flex-start' : 'center', 
        gap: 2 
      }}>
        <Box 
          sx={{ 
            bgcolor: theme => theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.main, 0.12),
            p: 1.2,
            borderRadius: 2,
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: editing ? 3 : 0 // Move icon down when in edit mode to align with input
          }}
        >
          <Icon />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="subtitle2" 
            color="text.secondary" 
            sx={{ 
              fontWeight: 500,
              mb: 0
            }}
          >
            {label}
          </Typography>
          {editing ? (
            <TextField
              fullWidth
              name={name}
              value={value}
              onChange={onChange}
              variant="outlined"
              size="small"
              multiline={multiline}
              rows={rows || 1}
              sx={{ 
                mt: 0.5,
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  minHeight: multiline ? 'auto' : '40px',
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                    borderWidth: 2
                  }
                },
                '& .MuiInputBase-input': {
                  py: 1.25,
                  px: 1.5,
                  height: multiline ? 'auto' : '18px',
                  lineHeight: 1.2
                }
              }}
            />
          ) : (
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 500,
                wordBreak: 'break-word',
                whiteSpace: multiline ? 'pre-wrap' : 'normal',
                color: value ? 'text.primary' : 'text.secondary',
                fontSize: '0.95rem'
              }}
            >
              {value || 'Not provided'}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

const ProfilePage = () => {
  const { user, updateUserData } = useUser();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const theme = useTheme();

  // Check authentication only on mount - don't cause re-renders
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/login', { state: { from: '/profile' } });
    }
  }, [navigate]);

  // Fetch profile data separately - using a stable function reference
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Try to get the current user from auth service
      let userData = null;
      
      // Method 1: Try using the current user context
      if (user) {
        userData = user;
      }
      
      // Method 2: Try getting from auth service
      if (!userData) {
        try {
          userData = authService.getCurrentUser();
        } catch (err) {
          console.warn('Error getting user from authService:', err);
        }
      }
      
      // Method 3: Try fetching fresh from API
      if (!userData) {
        try {
          const result = await userService.getUserProfile();
          userData = result;
        } catch (error) {
          console.warn('Could not fetch fresh profile data:', error);
        }
      }
      
      // If we have user data, parse it
      if (userData) {
        // Find role in potentially nested structure
        let role = userData.role;
        if (!role && userData.user && userData.user.role) {
          role = userData.user.role;
        }
        
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          company: userData.company || '',
          address: userData.address || '',
          role: role || 'user',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to load profile data',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error in profile data loading:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load profile data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [user, updateUserData]);

  // Only fetch on mount and when the fetch function changes
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      // Update user data in the backend
      await userService.updateUserProfile(profileData);
      
      // Update user data in context
      updateUserData(profileData);
      
      setIsEditing(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      setSnackbar({
        open: true,
        message: `Failed to update profile: ${err.message || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  }, [profileData, updateUserData]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const handleResetPassword = useCallback(() => {
    setSnackbar({
      open: true,
      message: 'Password reset instructions sent to your email',
      severity: 'info'
    });
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress size={40} />
        </Box>
      </Container>
    );
  }

  if (!profileData) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Alert severity="error">Failed to load profile data</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        mb: 4
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 3 
        }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: theme.palette.primary.main,
              boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.2)}`,
              fontSize: '2rem'
            }}
          >
            {profileData.name ? profileData.name.charAt(0).toUpperCase() : <PersonIcon fontSize="large" />}
          </Avatar>
          
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {profileData.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <Chip 
                label={profileData.role.toUpperCase()}
                color="primary"
                size="small"
                sx={{ 
                  fontWeight: 'bold',
                  height: 24
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {profileData.email}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Box>
          {!isEditing ? (
            <Button 
              variant="contained" 
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
              sx={{ 
                borderRadius: 6,
                textTransform: 'none',
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
                px: 3,
                py: 1,
                minWidth: '140px',
                fontWeight: 500
              }}
            >
              Edit Profile
            </Button>
          ) : (
            <Stack direction="row" spacing={1.5}>
              <Button 
                variant="contained" 
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{ 
                  borderRadius: 6,
                  textTransform: 'none',
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
                  px: 3,
                  py: 1,
                  minWidth: '100px',
                  fontWeight: 500
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button 
                variant="outlined" 
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => setIsEditing(false)}
                disabled={saving}
                sx={{ 
                  borderRadius: 6,
                  textTransform: 'none',
                  px: 2,
                  py: 1,
                  minWidth: '100px',
                  fontWeight: 500
                }}
              >
                Cancel
              </Button>
            </Stack>
          )}
        </Box>
      </Box>
      
      {/* Profile Fields Section */}
      <Box sx={{ mb: 4 }}>
 
        <Typography 
          variant="h6" 
          color="primary" 
          fontWeight="500"
          sx={{
            mb: 3,
            ml: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <PersonIcon fontSize="small" />
          Profile Information
        </Typography>
  
        <Stack spacing={2.5}>
          <ProfileField 
            icon={PersonIcon}
            label="Full Name"
            value={profileData.name}
            editing={isEditing}
            name="name"
            onChange={handleChange}
          />
          
          <ProfileField 
            icon={EmailIcon}
            label="Email Address"
            value={profileData.email}
            editing={isEditing}
            name="email"
            onChange={handleChange}
          />
          
          <ProfileField 
            icon={PhoneIcon}
            label="Phone Number"
            value={profileData.phone}
            editing={isEditing}
            name="phone"
            onChange={handleChange}
          />
          
          <ProfileField 
            icon={BusinessIcon}
            label="Company"
            value={profileData.company}
            editing={isEditing}
            name="company"
            onChange={handleChange}
          />
          
          <ProfileField 
            icon={LocationIcon}
            label="Address"
            value={profileData.address}
            editing={isEditing}
            name="address"
            onChange={handleChange}
            multiline
            rows={2}
          />
        </Stack>
      </Box>
      
      {/* Password Reset */}
      <Box sx={{ mb: 2 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2.5, 
            borderRadius: 3,
            backgroundColor: theme => 
              theme.palette.mode === 'dark' 
                ? alpha(theme.palette.secondary.main, 0.08) 
                : alpha(theme.palette.secondary.light, 0.1),
            border: '1px solid',
            borderColor: theme => 
              theme.palette.mode === 'dark' 
                ? alpha(theme.palette.divider, 0.1) 
                : alpha(theme.palette.secondary.main, 0.2),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box 
              sx={{ 
                bgcolor: theme => 
                  theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.secondary.main, 0.2) 
                    : alpha(theme.palette.secondary.main, 0.12),
                p: 1.2,
                borderRadius: 2,
                color: 'secondary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <KeyIcon />
            </Box>
            <Box>
              <Typography 
                variant="subtitle1" 
                sx={{ fontWeight: 500 }}
              >
                Password Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Change your password or reset if forgotten
              </Typography>
            </Box>
          </Box>
          
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={handleResetPassword}
            disabled={isEditing}
            sx={{ 
              borderRadius: 6,
              textTransform: 'none',
              opacity: isEditing ? 0.6 : 1
            }}
          >
            Reset Password
          </Button>
        </Paper>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage; 