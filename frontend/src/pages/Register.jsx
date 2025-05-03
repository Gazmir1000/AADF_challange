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
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { validateForm } from '../utils/validation';
import authService from '../services/authService';

const Register = ({ onLogin }) => {
  const [values, setValues] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
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
        // Default values for required backend fields
        NUIS: 'TEMP' + Math.floor(10000 + Math.random() * 90000),
        address: 'Default Address',
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
    <Box className="auth-container">
      <Paper className="auth-card" elevation={3}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Create Account
        </Typography>
        
        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
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
            margin="normal"
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
            margin="normal"
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
            margin="normal"
            InputProps={{
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
            margin="normal"
          />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
          
          <Typography align="center" variant="body2" sx={{ mt: 2 }}>
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" color="primary">
              Login
            </Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
};

export default Register; 