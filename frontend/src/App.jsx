import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Register from './pages/Register'
import TenderDetails from './pages/TenderDetails'
import CreateTender from './pages/CreateTender'
import AllTenders from './pages/AllTenders'
import authService from './services/authService'
import './App.css'
import Submission from './pages/Submission'
import ProfilePage from './pages/ProfilePage'
import Dashboard from './pages/Dashboard'
import useUser from './hooks/useUser'

function App() {
  // Use our custom useUser hook for auth state management
  const { user, login: loginUser, logout: logoutUser, updateUserData } = useUser();
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [darkMode, setDarkMode] = useState(() => {
    // Check if user preference exists in localStorage
    const savedMode = localStorage.getItem('darkMode')
    return savedMode === 'true'
  })

  const location = useLocation()

  // Set authentication status on mount and when token changes
  useEffect(() => {
    const checkAuth = () => {
      const hasToken = !!localStorage.getItem('userToken');
      setIsLoggedIn(hasToken);
    };
    
    // Check initially
    checkAuth();
    
    // Set up a listener for local storage changes
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // Original auth check for backward compatibility
  useEffect(() => {
    // Check if user is logged in on app load
    const checkAuthStatus = () => {
      const loggedIn = authService.isLoggedIn();
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        const currentUser = authService.getCurrentUser();
        
        // If we have a user, update our hook's state with it
        if (currentUser) {
          updateUserData(currentUser);
        }
      }
    }

    checkAuthStatus();
  }, [updateUserData]);

  const handleLogin = (userData) => {
    // Extract token if available in userData
    let token = null;
    
    // Try to find token at various levels in the response
    if (userData.token) {
      token = userData.token;
    } else if (userData.data && userData.data.token) {
      token = userData.data.token;
    }
    
    if (!token) {
      console.warn('No token found in login response!');
    }
    
    // Set logged in state
    setIsLoggedIn(true);
    
    // Call our custom hook's login
    loginUser(userData, token);
  }

  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
  }

  // Create theme based on current mode
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      ...(darkMode ? {
        // Dark mode customizations
        primary: {
          main: '#90caf9',
          dark: '#5d8ec2',
          light: '#c3fdff',
          contrastText: '#0a1929',
        },
        secondary: {
          main: '#f48fb1',
          dark: '#bf5f82',
          light: '#ffc1e3',
          contrastText: '#3e2723',
        },
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
        text: {
          primary: '#e0e0e0',
          secondary: '#aaaaaa',
        },
        divider: 'rgba(255, 255, 255, 0.12)',
        action: {
          active: '#ffffff',
          hover: 'rgba(255, 255, 255, 0.08)',
          selected: 'rgba(255, 255, 255, 0.16)',
          disabled: 'rgba(255, 255, 255, 0.3)',
          disabledBackground: 'rgba(255, 255, 255, 0.12)',
        }
      } : {
        // Light mode customizations
        primary: {
          main: '#2193b0',
          dark: '#00788c',
          light: '#62c1d3',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#e91e63',
          dark: '#b0003a',
          light: '#ff6090',
          contrastText: '#ffffff',
        },
        background: {
          default: '#f5f7fa',
          paper: '#ffffff',
        },
        text: {
          primary: '#333333',
          secondary: '#666666',
        },
      }),
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 600,
        fontSize: '2.5rem',
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
        lineHeight: 1.2,
      },
      h3: {
        fontWeight: 500,
        fontSize: '1.5rem',
        lineHeight: 1.2,
      },
      h4: {
        fontWeight: 500,
        fontSize: '1.25rem',
        lineHeight: 1.2,
      },
      button: {
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
          },
          contained: () => ({
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            }
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            boxShadow: theme.palette.mode === 'dark'
              ? '0 5px 15px rgba(0,0,0,0.4)'
              : '0 2px 10px rgba(0,0,0,0.08)',
            borderRadius: '12px',
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: () => ({
            backgroundImage: 'none',
          }),
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            boxShadow: theme.palette.mode === 'dark'
              ? '0 2px 8px rgba(0,0,0,0.5)'
              : '0 1px 4px rgba(0,0,0,0.1)',
          }),
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: ({ theme }) => ({
            width: 42,
            height: 26,
            padding: 0,
            '& .MuiSwitch-switchBase': {
              padding: 0,
              margin: 2,
              '&.Mui-checked': {
                transform: 'translateX(16px)',
                color: '#fff',
                '& + .MuiSwitch-track': {
                  opacity: 1,
                  backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#2193b0',
                },
              },
            },
            '& .MuiSwitch-thumb': {
              width: 22,
              height: 22,
              borderRadius: '50%',
            },
            '& .MuiSwitch-track': {
              borderRadius: 26 / 2,
              opacity: 1,
              backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
              boxSizing: 'border-box',
            },
          }),
        },
      },
    },
  })

  // Toggle dark mode function
  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode
      localStorage.setItem('darkMode', newMode.toString())
      return newMode
    })
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: theme.palette.background.default,
          color: theme.palette.text.primary,
          transition: 'background-color 0.3s ease, color 0.3s ease'
        }}>
          <Layout
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
            user={user}
            toggleDarkMode={toggleDarkMode}
          >
            <Routes>
              {/* Main home page - always accessible */}
              <Route
                path="/"
                element={<HomePage isLoggedIn={isLoggedIn} />}
              />

              {/* Auth routes */}
              <Route
                path="/login"
                element={
                  isLoggedIn ?
                    <Navigate to={location.state?.from || '/'} /> :
                    <Login onLogin={handleLogin} />
                }
              />
              <Route
                path="/register"
                element={
                  isLoggedIn ?
                    <Navigate to={location.state?.from || '/'} /> :
                    <Register onLogin={handleLogin} />
                }
              />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  isLoggedIn ? (
                    <Dashboard />
                  ) : (
                    <Navigate to="/login" state={{ from: '/dashboard' }} />
                  )
                }
              />
              <Route
                path="/tenders/:id"
                element={
                  isLoggedIn ?
                    <TenderDetails /> :
                    <Navigate to="/login" state={{ from: location.pathname }} />
                }
              />

              {/* Create tender route (staff only) */}
              <Route
                path="/create-tender"
                element={
                  isLoggedIn ?
                    user?.role === 'staff' ? <CreateTender /> : <Navigate to="/" /> :
                    <Navigate to="/login" state={{ from: '/create-tender' }} />
                }
              />

              <Route
                path="/submission/:id"
                element={
                  isLoggedIn ? <Submission /> : <Navigate to="/login" state={{ from: location.pathname }} />
                }
              />

              {/* All tenders page */}
              <Route
                path="/tenders"
                element={<AllTenders />}
              />

              {/* User profile */}
              <Route
                path="/profile"
                element={
                  isLoggedIn ? 
                    <ProfilePage /> : 
                    <Navigate to="/login" state={{ from: '/profile' }} />
                }
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default App
