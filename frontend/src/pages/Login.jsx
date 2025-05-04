import { useState, useEffect, useCallback } from 'react';
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
  Container,
  Divider,
  alpha,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
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
    // Initial setup
    if (authService.isLoggedIn()) {
      navigate(redirect);
    }
  }, [navigate, redirect]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  }, [errors]);

  const handleClickShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleSubmit = useCallback(async (e) => {
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
  }, [values, onLogin, navigate, redirect]);

  return (
    <Container maxWidth="sm" sx={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
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
          <LoginIcon 
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
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Sign in to continue to your account
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
            sx={{ mb: 2.5 }}
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
            helperText={errors.password}
            disabled={loading}
            sx={{ mb: 1 }}
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
          
      
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ 
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
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>
          
          <Typography align="center" variant="body2" sx={{ mt: 2 }}>
            Don't have an account?{' '}
            <Link 
              component={RouterLink} 
              to="/register" 
              color="primary"
              fontWeight="500"
              underline="hover"
            >
              Sign up
            </Link>
          </Typography>
        </form>
      </Paper>
    </Container>
  );
};

export default Login; 