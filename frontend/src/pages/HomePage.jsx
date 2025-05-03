import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    // Simulate API call
    const fetchTenders = async () => {
      try {
        // In a real application, you would fetch data from an API
        // const response = await fetch('/api/tenders');
        // const data = await response.json();
        
        // Simulating network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setTenders(dummyTenders);
        setLoading(false);
      } catch (_) {
        // Using underscore to indicate that we're not using the error parameter
        setError('Failed to load tenders. Please try again later.');
        setLoading(false);
      }
    };

    fetchTenders();
  }, []);

  const handleTenderClick = (tenderId) => {
    if (isLoggedIn) {
      navigate(`/tenders/${tenderId}`);
    } else {
      navigate('/login', { state: { from: `/tenders/${tenderId}` } });
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth="lg">
        {/* Hero section */}
        <Paper
          sx={{
            position: 'relative',
            backgroundColor: 'grey.800',
            color: '#fff',
            mb: 4,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: 'url(https://source.unsplash.com/random?business)',
            p: { xs: 3, md: 6 },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              left: 0,
              backgroundColor: 'rgba(0,0,0,.5)',
            }}
          />
          <Box
            sx={{
              position: 'relative',
              textAlign: 'center',
              py: 5,
            }}
          >
            <Typography component="h1" variant="h3" color="inherit" gutterBottom>
              Find and Apply for Tenders Worldwide
            </Typography>
            <Typography variant="h5" color="inherit" paragraph>
              Your gateway to business opportunities across all sectors and industries
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/tenders')}
              sx={{ mt: 2 }}
            >
              Browse All Tenders
            </Button>
          </Box>
        </Paper>

        {/* Tenders section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Latest Tenders
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {tenders.map((tender) => (
                <Grid item key={tender.id} xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="h2" noWrap>
                        {tender.title}
                      </Typography>
                      <Box display="flex" alignItems="center" mb={1}>
                        <BusinessIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {tender.organization}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={1}>
                        <PlaceIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {tender.location}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={1}>
                        <MonetizationOnIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {tender.budget}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={2}>
                        <CalendarTodayIcon fontSize="small" color="error" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="error.main">
                          Deadline: {formatDate(tender.deadline)}
                        </Typography>
                      </Box>
                      <Chip 
                        label={tender.category} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ mb: 2 }} 
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        minHeight: '3em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {tender.description}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        onClick={() => handleTenderClick(tender.id)}
                        fullWidth
                      >
                        {isLoggedIn ? 'View Details' : 'Sign in to View'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Box display="flex" justifyContent="center" mt={4}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/tenders')}
            >
              View All Tenders
            </Button>
          </Box>
        </Box>

        {/* Additional sections can be added here */}
        <Box sx={{ my: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Why Choose Our Platform?
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Comprehensive Listings
              </Typography>
              <Typography variant="body1">
                Access thousands of tenders from government agencies, private companies, and international organizations.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Easy Application Process
              </Typography>
              <Typography variant="body1">
                Streamlined application process that saves you time and resources when submitting tender proposals.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Advanced Notifications
              </Typography>
              <Typography variant="body1">
                Receive personalized alerts for new tenders that match your business profile and interests.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage; 