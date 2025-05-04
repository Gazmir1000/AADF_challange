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
  Switch,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const Navbar = ({ isLoggedIn, onLogout, user, toggleDarkMode }) => {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [isStaff, setIsStaff] = useState(false);
  
  const theme = useTheme();
  const navigate = useNavigate();
  
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
    navigate('/create-tender');
  };

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)' 
            : 'linear-gradient(90deg, #2193b0 0%, #6dd5ed 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1 }}>
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
                fontSize: '1.5rem',
                letterSpacing: '0.5px',
                '&:hover': {
                  textDecoration: 'none',
                  color: 'inherit',
                },
              }}
            >
              AADF {isStaff ? '(Staff Mode)' : ''}
            </Typography>   

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Create Tender Button (staff only) */}
              {isLoggedIn && isStaff && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<EmojiNatureIcon />}
                  onClick={handleOpenCreateModal}
                  sx={{ 
                    mr: 2,
                    borderRadius: '20px',
                    px: 2.5,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                    }
                  }}
                >
                  Create Tender
                </Button>
              )}

              {/* User menu / Login button */}
              {isLoggedIn ? (
                <Box>
                  <IconButton 
                    onClick={handleOpenUserMenu} 
                    sx={{ 
                      p: 0.5,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)'
                      } 
                    }}
                  >
                    <Badge 
                      badgeContent={isStaff ? "S" : "V"} 
                      color={isStaff ? "success" : "primary"}
                      overlap="circular"
                    >
                      <Avatar 
                        alt="User" 
                        sx={{ 
                          width: 38, 
                          height: 38,
                          border: '2px solid white'
                        }}
                      >
                        <AccountCircleIcon />
                      </Avatar>
                    </Badge>
                  </IconButton>
                  <Menu
                    sx={{ 
                      mt: '45px',
                      '& .MuiPaper-root': {
                        borderRadius: 2,
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      } 
                    }}
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
                    <MenuItem onClick={() => handleMenuItemClick('/profile')}>
                      <Typography textAlign="center">Profile</Typography>
                    </MenuItem>
                    {isStaff && (
                      <MenuItem onClick={() => handleMenuItemClick('/dashboard')}>
                        <Typography textAlign="center">Dashboard</Typography>
                      </MenuItem>
                    )}
                    <Divider />
                    <MenuItem>
                      {/* <ListItemIcon>
                        {theme.palette.mode === 'dark' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                      </ListItemIcon> */}
                      <ListItemText>Dark Mode</ListItemText>
                      <Box component="span" sx={{ width: 4 }} />
                      <Switch 
                        edge="end"
                        checked={theme.palette.mode === 'dark'}
                        onChange={toggleDarkMode}
                        inputProps={{ 'aria-labelledby': 'dark-mode-switch' }}
                      />
                    </MenuItem>
                    <Divider />
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
                    borderRadius: '20px',
                    textTransform: 'none',
                    px: 3,
                    fontWeight: 600,
                    '&:hover': { 
                      borderColor: 'white', 
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Sign In
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
};

export default Navbar; 