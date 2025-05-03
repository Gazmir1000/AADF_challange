import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  TextField, 
  Paper, 
  Divider, 
  Stack, 
  Alert, 
  Checkbox, 
  FormControlLabel,
  Grid,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  Card,
  CardContent,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  CheckCircleOutline as CheckIcon,
  Info as InfoIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import TeamMemberForm from '../components/TeamMemberForm';
import submissionService from '../services/submissionService';
import authService from '../services/authService';

const Submission = () => {
  const { id: tenderId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [submission, setSubmission] = useState({
    tenderId: tenderId,
    financialOffer: '',
    proposedTeam: [{ name: '', experiences: '', documents: '[]' }],
    declaration: false
  });
  
  // Get the current logged in user
  const user = authService.getCurrentUser();
  
  // Check if user is vendor
  useEffect(() => {
    if (user && user.role !== 'vendor') {
      setError('Only vendors can make submissions');
      setLoading(false);
    } else {
      // Load tender details
      const fetchTender = async () => {
        try {
          const response = await fetch(`/api/tenders/${tenderId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to load tender details');
          }
          
          const data = await response.json();
          
          if (data.success && data.data) {
            setTender(data.data);
          } else {
            throw new Error(data.message || 'Failed to load tender');
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchTender();
    }
  }, [tenderId]); // Removed user dependency to prevent infinite loop
  
  // Steps for the submission process
  const steps = ['Tender Details', 'Team Information', 'Financial Offer', 'Review & Submit'];
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
    window.scrollTo(0, 0);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    window.scrollTo(0, 0);
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSubmission(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleAddTeamMember = () => {
    setSubmission(prev => ({
      ...prev,
      proposedTeam: [
        ...prev.proposedTeam,
        { name: '', experiences: '', documents: '[]' }
      ]
    }));
  };
  
  const handleRemoveTeamMember = (index) => {
    if (submission.proposedTeam.length <= 1) {
      setError('At least one team member is required');
      return;
    }
    
    setSubmission(prev => ({
      ...prev,
      proposedTeam: prev.proposedTeam.filter((_, i) => i !== index)
    }));
  };
  
  const handleTeamMemberUpdate = (index, updatedMember) => {
    setSubmission(prev => ({
      ...prev,
      proposedTeam: prev.proposedTeam.map((member, i) => 
        i === index ? updatedMember : member
      )
    }));
  };
  
  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Validate required fields
      if (!submission.financialOffer) {
        setError('Please enter a financial offer');
        setSaving(false);
        return;
      }
      
      // Check if all team members have the required fields
      const invalidTeamMember = submission.proposedTeam.find(
        member => !member.name || !member.experiences || member.documents === '[]'
      );
      
      if (invalidTeamMember) {
        setError('Please complete all team member information including uploading documents');
        setSaving(false);
        return;
      }
      
      if (!submission.declaration) {
        setError('You must agree to the declaration');
        setSaving(false);
        return;
      }
      
      // Submit the data with the documents as strings - don't parse them
      const response = await submissionService.createSubmission({
        ...submission,
        tenderId: tender._id
      });
      
      setSuccess(true);
      setSaving(false);
      
      // Redirect to submissions list after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit');
      setSaving(false);
    }
  };
  
  // Check if current step is complete
  const isStepComplete = (step) => {
    switch (step) {
      case 0: // Tender Details
        return tender !== null;
      case 1: // Team Information
        return submission.proposedTeam.every(
          member => member.name && member.experiences && member.documents !== '[]'
        );
      case 2: // Financial Offer
        return !!submission.financialOffer;
      case 3: // Review & Submit
        return submission.declaration;
      default:
        return false;
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !tender) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          mb: 4, 
          borderRadius: 2,
          background: (theme) => `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.2)} 100%)`,
          boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <DescriptionIcon 
            color="primary" 
            sx={{ 
              fontSize: 36, 
              mr: 2,
              p: 1,
              borderRadius: '50%',
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            }} 
          />
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              fontWeight="500" 
              color="primary"
              sx={{ mb: 0.5 }}
            >
              Submit Proposal
            </Typography>
            {tender && (
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                {tender.title}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 4 }}
          icon={<CheckIcon fontSize="inherit" />}
        >
          Your submission has been successfully sent! Redirecting...
        </Alert>
      )}
      
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel 
        sx={{ 
          mb: 4,
          '& .MuiStepLabel-root .Mui-completed': {
            color: 'success.main',
          },
          '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel': {
            color: 'grey.700',
          },
        }}
      >
        {steps.map((label, index) => (
          <Step key={label} completed={isStepComplete(index)}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 2, md: 4 }, 
          borderRadius: 2
        }}
      >
        {activeStep === 0 && tender && (
          <Box>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="500" color="primary">
              Tender Details
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Card 
              variant="outlined" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.grey[500], 0.1)}`,
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3} direction="column">
                  

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        Deadline
                      </Typography>
                      <Typography variant="h6" component="div" fontWeight="500">
                        {formatDate(tender.deadline)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card 
              variant="outlined" 
              sx={{ 
                borderRadius: 2,
                boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.grey[500], 0.1)}` 
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Description & Requirements
                </Typography>
                
                <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                  Description
                </Typography>
                <Typography variant="body1" paragraph>
                  {tender.description || 'No description provided.'}
                </Typography>
                
                <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                  Requirements
                </Typography>
                <Typography variant="body1">
                  {tender.requirements || 'No specific requirements provided.'}
                </Typography>

        
              </CardContent>
            </Card>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepComplete(0)}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Continue
              </Button>
            </Box>
          </Box>
        )}
        
        {activeStep === 1 && (
          <Box>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="500" color="primary">
              Proposed Team
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <InfoIcon fontSize="small" />
                <Typography variant="body2">
                  Please provide details of the team members who will be involved in this project.
                  Each team member must have supporting documents (maximum 3 per person).
                </Typography>
              </Stack>
            </Alert>
            
            {submission.proposedTeam.map((member, index) => (
              <TeamMemberForm
                key={index}
                member={member}
                index={index}
                onUpdate={handleTeamMemberUpdate}
                onRemove={handleRemoveTeamMember}
              />
            ))}
            
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddTeamMember}
              sx={{ mt: 2 }}
            >
              Add Team Member
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepComplete(1)}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Continue
              </Button>
            </Box>
          </Box>
        )}
        
        {activeStep === 2 && (
          <Box>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="500" color="primary">
              Financial Offer
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <InfoIcon fontSize="small" />
                <Typography variant="body2">
                  Please provide your financial offer for this tender. The amount should be in {tender?.currency || 'the specified currency'}.
                </Typography>
              </Stack>
            </Alert>
            
            <TextField
              fullWidth
              label="Financial Offer"
              name="financialOffer"
              type="number"
              value={submission.financialOffer}
              onChange={handleInputChange}
              required
              variant="outlined"
              InputProps={{
                startAdornment: tender?.currency && (
                  <InputAdornment position="start">{tender.currency}</InputAdornment>
                ),
              }}
              helperText="Enter the total amount you are offering for this tender"
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepComplete(2)}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Continue
              </Button>
            </Box>
          </Box>
        )}
        
        {activeStep === 3 && (
          <Box>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="500" color="primary">
              Review & Submit
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
              mb: 3
            }}>
              <Card 
                variant="outlined"
                sx={{ 
                  flex: 1,
                  width: { xs: '100%', md: '50%' },
                  boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.grey[500], 0.1)}` 
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Tender Information
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Title
                    </Typography>
                    <Typography variant="body1">
                      {tender?.title}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Deadline
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(tender?.deadline)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              
              <Card 
                variant="outlined"
                sx={{ 
                  flex: 1,
                  width: { xs: '100%', md: '50%' },
                  boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.grey[500], 0.1)}` 
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Your Offer
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Financial Offer
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {tender?.currency} {submission.financialOffer}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Team Size
                    </Typography>
                    <Typography variant="body1">
                      {submission.proposedTeam.length} member{submission.proposedTeam.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Card 
                variant="outlined"
                sx={{ 
                  width: '100%',
                  boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.grey[500], 0.1)}` 
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Team Members
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {submission.proposedTeam.map((member, index) => (
                      <Grid item xs={12} sm={12} md={12} key={index} width={{width: '100%'}}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {member.name || `Team Member ${index + 1}`}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {member.experiences.length > 100 
                                ? `${member.experiences.substring(0, 100)}...` 
                                : member.experiences || 'No experience details provided'}
                            </Typography>
                            
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {(() => {
                                try {
                                  const docs = JSON.parse(member.documents);
                                  return `${docs.length} document${docs.length !== 1 ? 's' : ''} attached`;
                                } catch (e) {
                                  return 'Documents attached';
                                }
                              })()}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Box>
            
            <Box 
              sx={{ 
                mt: 4,
                p: 2,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                transform: submission.declaration ? 'scale(1.02)' : 'scale(1)',
                boxShadow: (theme) => submission.declaration 
                  ? `0 8px 24px ${alpha(theme.palette.success.main, 0.2)}` 
                  : 'none',
                backgroundColor: (theme) => submission.declaration 
                  ? alpha(theme.palette.success.light, 0.1) 
                  : 'transparent',
                border: (theme) => submission.declaration 
                  ? `1px solid ${alpha(theme.palette.success.main, 0.3)}` 
                  : 'none',
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    name="declaration"
                    checked={submission.declaration}
                    onChange={handleInputChange}
                    color="success"
                    sx={{ 
                      '&.Mui-checked': {
                        transform: 'scale(1.2)',
                        transition: 'transform 0.2s ease-in-out'
                      }
                    }}
                  />
                }
                label={
                  <Typography 
                    variant="body2"
                    sx={{
                      fontWeight: submission.declaration ? 500 : 400,
                      color: (theme) => submission.declaration ? theme.palette.success.dark : 'text.secondary',
                    }}
                  >
                    I hereby declare that all the information provided in this submission is true and accurate. 
                    I understand that providing false information may result in disqualification from the tender process.
                  </Typography>
                }
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={saving || !isStepComplete(3)}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  transform: submission.declaration ? 'translateY(-4px)' : 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: (theme) => submission.declaration 
                    ? `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}` 
                    : null,
                }}
              >
                {saving ? 'Submitting...' : 'Submit Proposal'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Submission;
