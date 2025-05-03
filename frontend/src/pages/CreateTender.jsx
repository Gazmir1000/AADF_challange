import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Stack,
  Chip,
  Card,
  CardContent,
  IconButton,
  Avatar,
  Tooltip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaidIcon from '@mui/icons-material/Paid';
import TodayIcon from '@mui/icons-material/Today';
import tenderService from '../services/tenderService';

const CreateTender = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Two weeks from now
    status: 'open',
    currency: 'EUR', // Default currency
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
        currency: 'EUR',
      });
      
      // Redirect after a brief delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Error creating tender:', err);
      setError(err.response?.data?.message || 'Failed to create tender. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          borderRadius: 3,
          background: '#ffffff',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight="700"
            sx={{ 
              background: 'linear-gradient(90deg, #3a7bd5, #1565c0)', 
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 1px 1px rgba(255,255,255,0.5)'
            }}
          >
            Create New Tender
          </Typography>
          <Chip 
            label="New" 
            color="primary" 
            size="medium" 
            sx={{ 
              borderRadius: '6px',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #3a7bd5, #1565c0)',
            }}
          />
        </Box>
        
        <Divider sx={{ mb: 4, opacity: 0.6 }} />

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(211, 47, 47, 0.1)'
            }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(46, 125, 50, 0.1)' 
            }}
          >
            Tender created successfully!
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            {/* Title Section */}
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 2, 
                overflow: 'visible',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="600" 
                  color="primary" 
                  gutterBottom
                >
                  Basic Information
                </Typography>
                
                <TextField
                  name="title"
                  label="Tender Title"
                  placeholder="Enter a descriptive title for your tender"
                  value={formData.title}
                  onChange={handleChange}
                  fullWidth
                  required
                  disabled={loading}
                  variant="outlined"
                  sx={{ mt: 2 }}
                  InputProps={{
                    sx: { 
                      borderRadius: 2,
                      background: '#ffffff'
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Description Section */}
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 2, 
                overflow: 'visible',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="600" 
                  color="primary" 
                  gutterBottom
                >
                  Detailed Description
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Provide a comprehensive description of the tender. Be detailed and specific.
                </Typography>
                
                <TextField
                  name="description"
                  label="Description"
                  placeholder="Describe the tender in detail including scope, objectives, and other relevant information"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={6}
                  required
                  disabled={loading}
                  variant="outlined"
                  InputProps={{
                    sx: { 
                      borderRadius: 2,
                      background: '#ffffff'
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Requirements Section */}
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 2, 
                overflow: 'visible',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="600" 
                  color="primary" 
                  gutterBottom
                >
                  Requirements
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  List all requirements and qualifications needed for this tender.
                </Typography>
                
                <TextField
                  name="requirements"
                  label="Requirements"
                  placeholder="List all requirements, qualifications, and conditions for this tender"
                  value={formData.requirements}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={6}
                  required
                  disabled={loading}
                  variant="outlined"
                  InputProps={{
                    sx: { 
                      borderRadius: 2,
                      background: '#ffffff'
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Settings Section */}
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 2, 
                overflow: 'visible',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="600" 
                  color="primary" 
                  gutterBottom
                >
                  Tender Settings
                </Typography>
                
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ position: 'relative' }}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Deadline"
                          value={formData.deadline}
                          onChange={handleDateChange}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              required: true,
                              disabled: loading,
                              InputProps: {
                                startAdornment: (
                                  <CalendarMonthIcon 
                                    color="primary" 
                                    sx={{ mr: 1, opacity: 0.7 }} 
                                  />
                                ),
                                sx: { 
                                  borderRadius: 2,
                                  background: '#ffffff',
                                  transition: 'all 0.2s ease-in-out',
                                  '&:hover': {
                                    boxShadow: '0 4px 8px rgba(21, 101, 192, 0.1)',
                                  },
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(0, 0, 0, 0.1)',
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#1565c0',
                                  }
                                }
                              }
                            }
                          }}
                          minDate={new Date()}
                          disabled={loading}
                        />
                      </LocalizationProvider>
                      <Tooltip title="Deadline for tender submissions" placement="top" arrow>
                        <Avatar 
                          sx={{ 
                            position: 'absolute', 
                            top: -15, 
                            right: -10, 
                            width: 32, 
                            height: 32, 
                            background: 'linear-gradient(45deg, #42a5f5, #1976d2)',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                          }}
                        >
                          D
                        </Avatar>
                      </Tooltip>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box sx={{ position: 'relative' }}>
                      <FormControl fullWidth disabled={loading}>
                        <InputLabel>Status</InputLabel>
                        <Select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          label="Status"
                          startAdornment={
                            <TodayIcon 
                              color="primary" 
                              sx={{ mr: 1, ml: 1, opacity: 0.7 }} 
                            />
                          }
                          sx={{ 
                            borderRadius: 2,
                            background: '#ffffff',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              boxShadow: '0 4px 8px rgba(21, 101, 192, 0.1)',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(0, 0, 0, 0.1)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#1565c0',
                            }
                          }}
                        >
                          <MenuItem value="open">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Chip 
                                label="Open" 
                                size="small" 
                                color="success" 
                                sx={{ borderRadius: '4px', mr: 1 }} 
                              />
                              <Typography variant="body2">Active for bidding</Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="closed">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Chip 
                                label="Closed" 
                                size="small" 
                                color="error" 
                                sx={{ borderRadius: '4px', mr: 1 }} 
                              />
                              <Typography variant="body2">Not accepting bids</Typography>
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                      <Tooltip title="Current status of the tender" placement="top" arrow>
                        <Avatar 
                          sx={{ 
                            position: 'absolute', 
                            top: -15, 
                            right: -10, 
                            width: 32, 
                            height: 32, 
                            background: 'linear-gradient(45deg, #66bb6a, #43a047)',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                          }}
                        >
                          S
                        </Avatar>
                      </Tooltip>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box sx={{ position: 'relative' }}>
                      <FormControl fullWidth disabled={loading}>
                        <InputLabel>Currency</InputLabel>
                        <Select
                          name="currency"
                          value={formData.currency}
                          onChange={handleChange}
                          label="Currency"
                          startAdornment={
                            <PaidIcon 
                              color="primary" 
                              sx={{ mr: 1, ml: 1, opacity: 0.7 }} 
                            />
                          }
                          sx={{ 
                            borderRadius: 2,
                            background: '#ffffff',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              boxShadow: '0 4px 8px rgba(21, 101, 192, 0.1)',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(0, 0, 0, 0.1)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#1565c0',
                            }
                          }}
                        >
                          <MenuItem value="EUR">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.9rem', bgcolor: '#1565c0' }}>€</Avatar>
                              <Typography variant="body2">Euro</Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="ALL">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.9rem', bgcolor: '#d32f2f' }}>L</Avatar>
                              <Typography variant="body2">Albanian Lek</Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="USD">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.9rem', bgcolor: '#2e7d32' }}>$</Avatar>
                              <Typography variant="body2">US Dollar</Typography>
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                      <Tooltip title="Currency for this tender" placement="top" arrow>
                        <Avatar 
                          sx={{ 
                            position: 'absolute', 
                            top: -15, 
                            right: -10, 
                            width: 32, 
                            height: 32, 
                            background: 'linear-gradient(45deg, #f44336, #d32f2f)',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                          }}
                        >
                          C
                        </Avatar>
                      </Tooltip>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate(-1)}
                  disabled={loading}
                  sx={{ 
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={loading}
                  sx={{ 
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    background: 'linear-gradient(90deg, #3a7bd5, #1565c0)',
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 15px rgba(21, 101, 192, 0.25)'
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Tender'}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateTender; 