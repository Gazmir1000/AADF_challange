import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Box } from '@mui/material'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Register from './pages/Register'
import TenderDetails from './pages/TenderDetails'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const location = useLocation()

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Layout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
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
                  <p>Welcome to your dashboard!</p>
                  <button 
                    onClick={handleLogout}
                    className="logout-button"
                  >
                    Logout
                  </button>
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
          
          {/* For showing all tenders (we would create this page in a real app) */}
          <Route 
            path="/tenders" 
            element={<Navigate to="/" />} 
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Box>
  )
}

export default App
