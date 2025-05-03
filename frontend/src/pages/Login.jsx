import { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
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
import { validateLoginForm } from '../utils/validation';
import authService from '../services/authService';

const Login = ({ onLogin }) => {
  const [values, setValues] = useState({
    email: 'admin@aadf.com',
    password: 'your_secure_password',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.state?.from || '/';

  useEffect(() => {
    console.log('Testing with credentials:', values);
  }, []);

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
    const formErrors = validateLoginForm(values);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      // Call the auth service to login
      const data = await authService.login(values.email, values.password);
      console.log('Login response:', data);
      
      // Normalize user data to ensure it has a consistent structure
      let userData = data.user || data;
      
      // Ensure role property is directly on the userData object
      if (userData.user && userData.user.role && !userData.role) {
        userData.role = userData.user.role;
      }
      
      // Recursive search for role if not found at top level
      if (!userData.role) {
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
        
        const foundRole = findRole(userData);
        if (foundRole) {
          userData.role = foundRole;
        }
      }
      
      console.log('Normalized user data for App:', userData);
      
      // Ensure token is available in local storage for API calls
      if (data.token && !localStorage.getItem('userToken')) {
        localStorage.setItem('userToken', data.token);
      }
      
      // Call the onLogin function passed from App component with the user data
      onLogin(userData);

      // Redirect to the intended page or home
      navigate(redirect);
    } catch (error) {
      console.error('Login error:', error);
      setServerError(
        error.response?.data?.message || 
        error.message || 
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="auth-container">
      <Paper className="auth-card" elevation={3}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Login
        </Typography>
        
        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
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
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
          
          <Typography align="center" variant="body2">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register" color="primary">
              Sign up
            </Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
};

export default Login; 