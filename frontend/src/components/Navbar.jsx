import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Container,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Modal,
  TextField,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import tenderService from '../services/tenderService';

const CreateTenderModal = ({ open, handleClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Two weeks from now
    status: 'open',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (newDate) => {
    setFormData((prev) => ({
      ...prev,
      deadline: newDate,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Format the date for the API
      const formattedData = {
        ...formData,
        deadline: formData.deadline.toISOString(),
      };
      
      await tenderService.createTender(formattedData);
      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        requirements: '',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'open',
      });
      
      // Close modal after a brief delay
      setTimeout(() => {
        handleClose();
        // Refresh page to show new tender
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Error creating tender:', err);
      setError(err.response?.data?.message || 'Failed to create tender. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Modal style
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 800,
    maxHeight: '90vh',
    overflow: 'auto',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  return (
    <Modal
      open={open}
      onClose={loading ? null : handleClose}
      aria-labelledby="create-tender-modal"
    >
      <Paper sx={modalStyle}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Create New Tender
          </Typography>
          <IconButton onClick={handleClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Tender created successfully!
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Tender Title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="requirements"
                label="Requirements"
                value={formData.requirements}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Deadline"
                  value={formData.deadline}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      disabled: loading
                    }
                  }}
                  minDate={new Date()}
                  disabled={loading}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Tender'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Modal>
  );
};

const Navbar = ({ isLoggedIn, onLogout, user }) => {
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [isStaff, setIsStaff] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // Force user object to always be logged
  console.log('Navbar rendered with user:', JSON.stringify(user));
  console.log('isLoggedIn status:', isLoggedIn);
  
  useEffect(() => {
    // Check if user is staff whenever user prop changes
    if (user) {
      console.log('User object in navbar:', user);
      
      // Comprehensive role detection
      let detectedRole = null;
      
      // Direct role property
      if (user.role) {
        detectedRole = user.role;
        console.log('Found role directly on user object:', detectedRole);
      } 
      // Nested user property with role
      else if (user.user && user.user.role) {
        detectedRole = user.user.role;
        console.log('Found role in nested user object:', detectedRole);
      }
      // Search recursively for role property
      else {
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
        
        detectedRole = findRole(user);
        if (detectedRole) {
          console.log('Found role through deep search:', detectedRole);
        }
      }
      
      // If no role was found, default to 'user'
      if (!detectedRole) {
        console.log('No role found, defaulting to "user"');
        detectedRole = 'user';
      }
      
      // Set isStaff based on detected role
      const staffStatus = detectedRole === 'staff';
      console.log('Setting isStaff to:', staffStatus);
      setIsStaff(staffStatus);
    } else {
      console.log('No user object, setting isStaff to false');
      setIsStaff(false);
    }
  }, [user]);
  
  // Direct check without useState for debugging
  const directStaffCheck = user?.role === 'staff' || (user?.user?.role === 'staff');
  console.log('Direct staff check (bypassing state):', directStaffCheck);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuItemClick = (path) => {
    handleCloseUserMenu();
    navigate(path);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    onLogout();
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
  };

  return (
    <>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Logo */}
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              TENDER APP {isStaff ? '(Staff Mode)' : ''}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Create Tender Button (staff only) */}
              {isLoggedIn && isStaff && (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreateModal}
                  sx={{ mr: 2 }}
                >
                  Create Tender
                </Button>
              )}

              {/* User menu / Login button */}
              {isLoggedIn ? (
                <Box>
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Badge 
                      badgeContent={isStaff ? "S" : "V"} 
                      color={isStaff ? "secondary" : "primary"}
                      overlap="circular"
                    >
                      <Avatar alt="User">
                        <AccountCircleIcon />
                      </Avatar>
                    </Badge>
                  </IconButton>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <MenuItem>
                      <Typography textAlign="center">Role: {user?.role || 'unknown'}</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('/profile')}>
                      <Typography textAlign="center">Profile</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('/dashboard')}>
                      <Typography textAlign="center">Dashboard</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <Typography textAlign="center">Logout</Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Button 
                  color="inherit"
                  variant="outlined"
                  onClick={handleLogin}
                  sx={{ 
                    borderColor: 'white', 
                    '&:hover': { 
                      borderColor: 'white', 
                      backgroundColor: 'rgba(255,255,255,0.1)' 
                    } 
                  }}
                >
                  Sign In
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Create Tender Modal */}
      <CreateTenderModal 
        open={createModalOpen} 
        handleClose={handleCloseCreateModal} 
      />
    </>
  );
};

export default Navbar; 