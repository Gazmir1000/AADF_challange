import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Box } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Register from './pages/Register'
import TenderDetails from './pages/TenderDetails'
import CreateTender from './pages/CreateTender'
import authService from './services/authService'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()

  useEffect(() => {
    // Check if user is logged in on app load
    const checkAuthStatus = () => {
      const loggedIn = authService.isLoggedIn()
      setIsLoggedIn(loggedIn)
      
      if (loggedIn) {
        const currentUser = authService.getCurrentUser()
        console.log('Current user from authService:', currentUser)
        
        // Ensure we set the role correctly
        if (currentUser) {
          // Force the role property to be directly on the user object
          if (currentUser.user && currentUser.user.role && !currentUser.role) {
            currentUser.role = currentUser.user.role
            console.log('Fixed user object by copying role property:', currentUser)
          }
          
          // Set the user in state
          setUser(currentUser)
          
          // Log what we detect about the role
          const detectedRole = currentUser.role || (currentUser.user && currentUser.user.role)
          console.log('Detected role in App component:', detectedRole)
        }
      }
    }
    
    checkAuthStatus()
  }, [])

  const handleLogin = (userData) => {
    console.log('Login handler called with:', userData)
    setIsLoggedIn(true)
    setUser(userData)
  }

  const handleLogout = () => {
    authService.logout()
    setIsLoggedIn(false)
    setUser(null)
  }

  console.log('App rendering with user:', user)
  console.log('Is logged in:', isLoggedIn)

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Layout isLoggedIn={isLoggedIn} onLogout={handleLogout} user={user}>
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
                  <div className="dashboard-container">
                    <h1>Dashboard</h1>
                    <p>Welcome to your dashboard, {user?.name || 'User'}!</p>
                  </div>
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
            
            {/* For showing all tenders (we would create this page in a real app) */}
            <Route 
              path="/tenders" 
              element={<Navigate to="/" />} 
            />

            {/* User profile */}
            <Route
              path="/profile"
              element={
                isLoggedIn ? 
                  <div className="profile-container">
                    <h1>Profile</h1>
                    <p>This would be the user profile page</p>
                  </div> : 
                  <Navigate to="/login" state={{ from: '/profile' }} />
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Box>
    </LocalizationProvider>
  )
}

export default App
