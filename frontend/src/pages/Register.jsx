import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  Grid,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { validateForm } from '../utils/validation';

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
      // In a real app, you would make an API call here
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values),
      // });
      
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Registration failed');
      // }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the onLogin function passed from App component
      onLogin();
    } catch (error) {
      setServerError(error.message || 'Something went wrong. Please try again.');
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
            helperText={errors.password}
            disabled={loading}
            required
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
          />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
          
          <Typography align="center" variant="body2">
            Already have an account?{' '}
            <Link component={RouterLink} to="/" color="primary">
              Login
            </Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
};

export default Register; 