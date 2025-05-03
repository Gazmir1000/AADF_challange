import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PlaceIcon from '@mui/icons-material/Place';
import DescriptionIcon from '@mui/icons-material/Description';
import CategoryIcon from '@mui/icons-material/Category';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// This would come from your API in a real application
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
    details: `
      <p>The City of Metropolis is soliciting proposals from qualified construction firms for the design and construction of a new municipal building.</p>
      
      <h3>Project Scope:</h3>
      <ul>
        <li>Design and construction of a 50,000 square foot, three-story municipal building</li>
        <li>Office spaces for approximately 150 employees</li>
        <li>Multiple meeting rooms and conference facilities</li>
        <li>Public service areas and reception</li>
        <li>Parking facilities for staff and visitors</li>
        <li>Landscaping and exterior site work</li>
      </ul>
      
      <h3>Requirements:</h3>
      <ul>
        <li>Minimum 10 years experience in commercial construction</li>
        <li>Previous experience with government buildings</li>
        <li>Compliance with all local building codes and regulations</li>
        <li>LEED certification experience preferred</li>
        <li>Ability to complete project within 24 months of contract award</li>
      </ul>
      
      <h3>Submission Requirements:</h3>
      <ul>
        <li>Detailed project proposal</li>
        <li>Cost estimates and timeline</li>
        <li>Company portfolio and qualifications</li>
        <li>References from similar projects</li>
        <li>Proof of insurance and bonding capacity</li>
      </ul>
    `,
    documents: [
      { name: 'Request for Proposal', size: '2.5 MB' },
      { name: 'Site Plans', size: '15 MB' },
      { name: 'Building Requirements', size: '1.2 MB' },
      { name: 'Contract Terms', size: '500 KB' },
    ],
    contactPerson: 'John Smith',
    contactEmail: 'jsmith@metropolis.gov',
    contactPhone: '(123) 456-7890',
  },
  // Other tender details would be here...
];

const TenderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate API call
    const fetchTenderDetails = async () => {
      try {
        // In a real application, you would fetch data from an API
        // const response = await fetch(`/api/tenders/${id}`);
        // const data = await response.json();
        
        // Simulating network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const foundTender = dummyTenders.find(t => t.id === parseInt(id));
        
        if (foundTender) {
          setTender(foundTender);
        } else {
          setError('Tender not found');
        }
        
        setLoading(false);
      } catch (_) {
        // We're not using the error parameter, so we can use _ to ignore it
        setError('Failed to load tender details. Please try again later.');
        setLoading(false);
      }
    };

    fetchTenderDetails();
  }, [id]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!tender) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ my: 2 }}>
          Tender with ID {id} not found
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {tender.title}
        </Typography>
        
        <Chip 
          label={tender.category} 
          color="primary" 
          icon={<CategoryIcon />}
          sx={{ mb: 2 }} 
        />
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center">
              <BusinessIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">
                <strong>Organization:</strong><br />
                {tender.organization}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center">
              <PlaceIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">
                <strong>Location:</strong><br />
                {tender.location}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center">
              <MonetizationOnIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">
                <strong>Budget:</strong><br />
                {tender.budget}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center">
              <CalendarTodayIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="body1" color="error.main">
                <strong>Deadline:</strong><br />
                {formatDate(tender.deadline)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h5" gutterBottom>
          Description
        </Typography>
        <Typography variant="body1" paragraph>
          {tender.description}
        </Typography>
        
        <Typography variant="h5" gutterBottom>
          Details
        </Typography>
        <Box 
          dangerouslySetInnerHTML={{ __html: tender.details }} 
          sx={{ 
            '& p': { mb: 2 },
            '& h3': { mt: 3, mb: 1 },
            '& ul': { mb: 2, pl: 4 },
            '& li': { mb: 0.5 }
          }}
        />
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h5" gutterBottom>
          Documents
        </Typography>
        <List>
          {tender.documents.map((doc, index) => (
            <ListItem key={index} button>
              <ListItemIcon>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText 
                primary={doc.name} 
                secondary={`Size: ${doc.size}`} 
              />
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h5" gutterBottom>
          Contact Information
        </Typography>
        <Typography variant="body1">
          <strong>Contact Person:</strong> {tender.contactPerson}
        </Typography>
        <Typography variant="body1">
          <strong>Email:</strong> {tender.contactEmail}
        </Typography>
        <Typography variant="body1">
          <strong>Phone:</strong> {tender.contactPhone}
        </Typography>
      </Paper>
      
      <Box display="flex" justifyContent="center" mt={4}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
        >
          Apply for Tender
        </Button>
      </Box>
    </Container>
  );
};

export default TenderDetails; 