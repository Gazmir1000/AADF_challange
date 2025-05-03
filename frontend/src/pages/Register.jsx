import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Container,
  Divider,
  alpha,
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAddAlt as RegisterIcon } from '@mui/icons-material';
import { validateForm } from '../utils/validation';
import authService from '../services/authService';

const Register = ({ onLogin }) => {
  const [values, setValues] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    nuis: '',
    address: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm(values);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      // Map the form fields to what the backend expects
      const userData = {
        name: values.username,
        email: values.email,
        password: values.password,
        phone: values.phone,
        NUIS: values.nuis || 'TEMP' + Math.floor(10000 + Math.random() * 90000),
        address: values.address || 'Default Address',
        role: 'vendor'
      };
      
      // Call the auth service to register
      const data = await authService.register(userData);
      
      // Call the onLogin function passed from App component
      onLogin(data.user);
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      setServerError(
        error.response?.data?.message || 
        error.message || 
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      py: 4
    }}>
      <Paper 
        elevation={6} 
        sx={{
          borderRadius: 2,
          py: 4,
          px: { xs: 3, sm: 5 },
          width: '100%',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`
          }
        }}
      >
        <Box 
          sx={{ 
            mb: 3, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center'
          }}
        >
          <RegisterIcon 
            color="primary" 
            sx={{ 
              fontSize: 40,
              mb: 1,
              p: 1,
              borderRadius: '50%',
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            }} 
          />
          <Typography 
            variant="h4" 
            component="h1"
            fontWeight="500"
            color="primary.main"
          >
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Sign up to join our platform
          </Typography>
        </Box>
        
        {serverError && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 1
            }}
          >
            {serverError}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2.5 
          }}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              name="username"
              value={values.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              disabled={loading}
              required
              InputProps={{
                sx: { borderRadius: 1.5 }
              }}
            />
            
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
              required
              InputProps={{
                sx: { borderRadius: 1.5 }
              }}
            />
            
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={values.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password || 'Password must be at least 6 characters'}
              disabled={loading}
              required
              InputProps={{
                sx: { borderRadius: 1.5 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              label="Phone Number"
              variant="outlined"
              fullWidth
              name="phone"
              value={values.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              disabled={loading}
              required
              InputProps={{
                sx: { borderRadius: 1.5 }
              }}
            />
            
            <TextField
              label="NUIS"
              variant="outlined"
              fullWidth
              name="nuis"
              value={values.nuis}
              onChange={handleChange}
              error={!!errors.nuis}
              helperText={errors.nuis}
              disabled={loading}
              InputProps={{
                sx: { borderRadius: 1.5 }
              }}
            />
            
            <TextField
              label="Address"
              variant="outlined"
              fullWidth
              name="address"
              value={values.address}
              onChange={handleChange}
              error={!!errors.address}
              helperText={errors.address}
              disabled={loading}
              InputProps={{
                sx: { borderRadius: 1.5 }
              }}
            />
          </Box>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ 
              mt: 3,
              py: 1.5,
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                boxShadow: (theme) => `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Account'}
          </Button>
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>
          
          <Typography align="center" variant="body2">
            Already have an account?{' '}
            <Link 
              component={RouterLink} 
              to="/login" 
              color="primary"
              fontWeight="500"
              underline="hover"
            >
              Sign In
            </Link>
          </Typography>
        </form>
      </Paper>
    </Container>
  );
};

export default Register; 