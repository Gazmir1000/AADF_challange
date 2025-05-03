import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PlaceIcon from '@mui/icons-material/Place';
import tenderService from '../services/tenderService';
import TenderCard from '../components/TenderCard';

// Framer Motion variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 50 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  },
  hover: {
    y: -15,
    boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
    transition: { type: 'spring', stiffness: 300 }
  }
};

const buttonVariants = {
  hover: { 
    scale: 1.05,
    boxShadow: "0 8px 15px rgba(0,0,0,0.2)",
    transition: { 
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: { 
    scale: 0.95 
  }
};

// Dummy tender data
const dummyTenders = [
  {
    id: 1,
    title: 'Construction of New Municipal Building',
    organization: 'City of Metropolis',
    category: 'Construction',
    budget: '$1,500,000 - $2,000,000',
    location: 'Metropolis, USA',
    deadline: '2025-06-15',
    description: 'Seeking qualified contractors for the construction of a new municipal building including offices, meeting rooms, and public service areas.',
  },
  {
    id: 2,
    title: 'IT Infrastructure Upgrade Project',
    organization: 'National Health Services',
    category: 'Information Technology',
    budget: '$500,000 - $750,000',
    location: 'Multiple Locations',
    deadline: '2025-06-30',
    description: 'Complete upgrade of IT infrastructure including network equipment, servers, and workstations across multiple healthcare facilities.',
  },
  {
    id: 3,
    title: 'School Cafeteria Food Services',
    organization: 'Public School District 123',
    category: 'Food & Beverages',
    budget: '$300,000 - $450,000 annually',
    location: 'Springfield, USA',
    deadline: '2025-07-10',
    description: 'Seeking food service providers for 15 public schools to provide nutritious meals for the upcoming academic year.',
  },
  {
    id: 4,
    title: 'Public Transportation Consulting Services',
    organization: 'Metropolitan Transit Authority',
    category: 'Consulting',
    budget: '$100,000 - $200,000',
    location: 'Metropolitan Area',
    deadline: '2025-06-25',
    description: 'Strategic consulting services needed to optimize public transportation routes and schedules to improve efficiency and reduce operational costs.',
  },
  {
    id: 5,
    title: 'Solar Power Installation for Municipal Buildings',
    organization: 'Greenfield City Council',
    category: 'Energy',
    budget: '$800,000 - $1,200,000',
    location: 'Greenfield',
    deadline: '2025-07-20',
    description: 'Installation of solar power systems on 12 municipal buildings to reduce carbon footprint and energy costs.',
  },
  {
    id: 6,
    title: 'Medical Equipment Supply Contract',
    organization: 'Central Hospital',
    category: 'Healthcare',
    budget: '$2,000,000 - $2,500,000',
    location: 'Central City',
    deadline: '2025-08-05',
    description: 'Supply of various medical equipment including diagnostic machines, patient monitoring systems, and surgical tools.',
  },
];

const HomePage = ({ isLoggedIn }) => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch tenders from API
    const fetchTenders = async () => {
      try {
        setLoading(true);
        const response = await tenderService.filterTenders({ status: 'open', page: 1, limit: 50 });
        
        // Handle the actual API response format
        if (response.success && response.data && response.data.tenders) {
          setTenders(response.data.tenders);
        } else {
          setTenders([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tenders:', error);
        setError('Failed to load tenders. Please try again later.');
        setLoading(false);
        
        // If API fails, fallback to dummy data for demo purposes
        setTenders(dummyTenders);
      }
    };

    fetchTenders();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, pt: 0, pb: 6, bgcolor: 'white' }}>
      <Container maxWidth="lg" sx={{ bgcolor: 'white' }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <Paper
            sx={{
              position: 'relative',
              color: '#fff',
              mb: 6,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundImage: 'url(https://source.unsplash.com/random?business)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              mt: 3,
              bgcolor: 'white',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
                background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
              }}
            />
            <Box
              sx={{
                position: 'relative',
                textAlign: 'center',
                py: { xs: 6, md: 10 },
                px: 3,
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <Typography 
                  component="h1" 
                  variant="h3" 
                  color="inherit" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700, 
                    letterSpacing: '0.5px',
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                  }}
                >
                  Find and Apply for Tenders
                </Typography>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Typography 
                  variant="h5" 
                  color="inherit" 
                  paragraph
                  sx={{ 
                    maxWidth: '800px',
                    mx: 'auto',
                    mb: 4,
                    opacity: 0.9
                  }}
                >
                  Your gateway to business opportunities across all sectors and industries
                </Typography>
              </motion.div>
              
             
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/tenders')}
                  sx={{ 
                    mt: 2,
                    px: 4,
                    py: 1.5,
                    borderRadius: '30px',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    background: 'linear-gradient(90deg, #2193b0 0%, #6dd5ed 100%)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  Browse All Tenders
                </Button>
         
            </Box>
          </Paper>
        </motion.div>

        {/* Tenders section */}
        <Box sx={{ mb: 4, bgcolor: 'white' }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                position: 'relative',
                display: 'inline-block',
                mb: 3,
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  width: '60%',
                  height: '4px',
                  bottom: '-8px',
                  left: 0,
                  background: 'linear-gradient(90deg, #2193b0 0%, #6dd5ed 100%)',
                  borderRadius: '2px'
                }
              }}
            >
              Latest Tenders
            </Typography>
          </motion.div>
        </Box>
        
        {/* Loading state */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4, bgcolor: 'white' }}>
            <CircularProgress />
          </Box>
        )}
        
        {/* Error state */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        
        {/* Empty state */}
        {!loading && !error && tenders.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 5, bgcolor: 'white' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tenders available at the moment
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Check back later for new opportunities
            </Typography>
          </Box>
        )}
        
        {/* Tenders grid - updated to match the requested layout */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: 3,
              width: '100%'
            }}
          >
            {tenders.map((tender) => (
              <Box
                key={tender._id || tender.id}
                sx={{
                  width: {
                    xs: '100%',              // 1 card per row on mobile
                    sm: 'calc(50% - 16px)',  // 2 cards per row on tablet, accounting for gap
                    md: 'calc(33.33% - 16px)' // 3 cards per row on desktop, accounting for gap
                  },
                  display: 'flex'
                }}
              >
                <TenderCard tender={tender} />
              </Box>
            ))}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default HomePage; 