import { Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children, isLoggedIn, onLogout }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} />
      <Box sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout; 