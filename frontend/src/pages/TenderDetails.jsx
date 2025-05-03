import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Divider, 
  Chip, 
  Paper, 
  Grid, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Container
} from "@mui/material";
import { format } from "date-fns";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Loader from "../components/Loader";
import tenderService from "../services/tenderService";
import useUser from "../hooks/useUser";
import EvaluateSubmissionButton from "../components/EvaluateSubmissionButton";

const TenderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();

  console.log(user);

  useEffect(() => {
    const fetchTender = async () => {
      try {
        const response = await tenderService.getTenderById(id);
        setTender(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTender();
  }, [id]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="80vh"
    >
      <Loader />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading tender details: {error.message || "Unknown error"}
        </Alert>
      </Container>
    );
  }

  const isVendor = user?.role === "vendor";
  const isStaff = user?.role === "staff";
  const isOpen = tender?.status === "open";
  const deadlinePassed = new Date(tender?.deadline) < new Date();
  const canSubmit = isVendor && isOpen && !deadlinePassed;
  
  // Determine actual status display
  const getStatusInfo = () => {
    if (!isOpen) {
      return { label: "CLOSED", color: "error", bgColor: "#FDF2F2", textColor: "#DC2626" };
    }
    
    if (deadlinePassed) {
      return { label: "DEADLINE PASSED", color: "warning", bgColor: "#FEF3C7", textColor: "#D97706" };
    }
    
    return { label: "OPEN", color: "success", bgColor: "#ECFDF5", textColor: "#059669" };
  };
  
  const statusInfo = getStatusInfo();
  
  const handleSubmit = () => {
    navigate(`/tenders/${id}/submit`);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card 
        sx={{ 
          mb: 4, 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
        }}
      >
        {/* Header Section with Title and Status */}
        <Box 
          sx={{ 
            p: 3, 
            borderBottom: '1px solid #E5E7EB',
            background: 'linear-gradient(to right, #f9fafb, #f3f4f6)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                color: '#111827'
              }}
            >
              {tender.title}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#6B7280',
                mt: 1
              }}
            >
              Tender ID: {id.substring(0, 8)}...
            </Typography>
          </Box>
          
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Chip 
              label={statusInfo.label} 
              sx={{ 
                fontWeight: 600,
                color: statusInfo.textColor,
                backgroundColor: statusInfo.bgColor,
                border: `1px solid ${statusInfo.textColor}`,
                fontSize: '0.875rem',
                py: 2,
                px: 1
              }} 
            />
            
            {canSubmit && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleSubmit}
                sx={{
                  ml: 2,
                  backgroundColor: '#2563EB',
                  '&:hover': {
                    backgroundColor: '#1D4ED8',
                  },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '6px',
                  boxShadow: 'none',
                  px: 3,
                  py: 1.5
                }}
              >
                Submit Proposal
              </Button>
            )}
          </Box>
        </Box>
        
        {/* Main Content */}
        <Box sx={{ p: 3,width: '100%' }}>
          <Grid container spacing={1} style={{ width: '100%' }}>
            {/* Left Column */}
            <Grid item xs={12} md={12} style={{ width: '100%' }}>
              {/* Tender Details */}
              <Card 
                variant="outlined" 
                sx={{ 
                  mb: 4, 
                  borderRadius: '6px',
                  borderColor: '#E5E7EB'
                }}
              >
                <Box 
                  sx={{ 
                    p: 2, 
                    borderBottom: '1px solid #E5E7EB',
                    backgroundColor: '#F9FAFB',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <DescriptionIcon sx={{ color: '#4B5563', mr: 1.5 }} />
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#374151'
                    }}
                  >
                    Description
                  </Typography>
                </Box>
                <CardContent>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#4B5563',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {tender.description || "No description provided."}
                  </Typography>
                </CardContent>
              </Card>
              
              {/* Requirements */}
              <Card 
                variant="outlined" 
                sx={{ 
                  mb: 4, 
                  borderRadius: '6px',
                  borderColor: '#E5E7EB'
                }}
              >
                <Box 
                  sx={{ 
                    p: 2, 
                    borderBottom: '1px solid #E5E7EB',
                    backgroundColor: '#F9FAFB',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ListAltIcon sx={{ color: '#4B5563', mr: 1.5 }} />
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#374151'
                    }}
                  >
                    Requirements
                  </Typography>
                </Box>
                <CardContent>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#4B5563',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {tender.requirements || "No specific requirements provided."}
                  </Typography>
                </CardContent>
              </Card>

              {/* Submissions Section */}
              {(isStaff || tender.status === "closed") && tender.submissions && tender.submissions.length > 0 && (
                <Box mt={4}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2,
                      fontWeight: 600,
                      color: '#111827',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Box 
                      component="span" 
                      sx={{ 
                        backgroundColor: '#E5E7EB', 
                        color: '#374151',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 1.5,
                        fontWeight: 700
                      }}
                    >
                      {tender.submissions.length}
                    </Box>
                    Submissions
                  </Typography>
                  
                  <TableContainer 
                    component={Paper} 
                    sx={{ 
                      borderRadius: '6px',
                      boxShadow: 'none',
                      border: '1px solid #E5E7EB'
                    }}
                  >
                    <Table>
                      <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '2px solid #E5E7EB' }}>Vendor</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#374151', borderBottom: '2px solid #E5E7EB' }}>Financial Offer</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#374151', borderBottom: '2px solid #E5E7EB' }}>Accuracy Score</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#374151', borderBottom: '2px solid #E5E7EB' }}>Submitted On</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, color: '#374151', borderBottom: '2px solid #E5E7EB' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tender.submissions.map((submission) => (
                          <TableRow 
                            key={submission._id} 
                            hover
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                              '&:hover': { backgroundColor: '#F9FAFB' }
                            }}
                          >
                            <TableCell sx={{ color: '#4B5563' }}>
                              {submission.vendorId.email || "Unknown Vendor"}
                            </TableCell>
                            <TableCell align="right" sx={{ color: '#4B5563', fontWeight: 500 }}>
                              {tender.currency} {submission.financialOffer.toLocaleString()}
                            </TableCell>
                            <TableCell align="right" sx={{ color: '#6B7280' }}>
                              {submission.accuracyScore ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                  <Box 
                                    sx={{ 
                                      width: 8, 
                                      height: 8, 
                                      borderRadius: '50%', 
                                      bgcolor: submission.accuracyScore > 70 ? '#10B981' : submission.accuracyScore > 40 ? '#F59E0B' : '#EF4444',
                                      mr: 1
                                    }} 
                                  />
                                  <Typography 
                                    variant="body2" 
                                    fontWeight={600}
                                    color={submission.accuracyScore > 70 ? '#10B981' : submission.accuracyScore > 40 ? '#F59E0B' : '#EF4444'}
                                  >
                                    {submission.accuracyScore}%
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary">Not evaluated</Typography>
                              )}
                            </TableCell>
                            <TableCell align="right" sx={{ color: '#6B7280' }}>
                              {format(new Date(submission.submittedAt), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <Button
                                  component={Link}
                                  to={`/submissions/${submission._id}`}
                                  variant="outlined"
                                  size="small"
                                  sx={{ 
                                    textTransform: "none",
                                    borderColor: '#2563EB',
                                    color: '#2563EB',
                                    '&:hover': {
                                      borderColor: '#1D4ED8',
                                      backgroundColor: 'rgba(37, 99, 235, 0.04)'
                                    },
                                    fontWeight: 500,
                                    borderRadius: '4px'
                                  }}
                                >
                                  View Details
                                </Button>
                                {isStaff && (
                                  <EvaluateSubmissionButton 
                                    tender={tender} 
                                    submission={submission} 
                                    onEvaluationComplete={() => {
                                      // Update tender data after evaluation
                                      window.location.reload();
                                    }}
                                  />
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={12} style={{ width: '100%' }}>
              {/* Tender Info Card */}
              <Card 
                variant="outlined" 
                sx={{ 
                  mb: 3, 
                  borderRadius: '6px',
                  borderColor: '#E5E7EB',
                  width: '100%'
                }}
              >
                <Box 
                  sx={{ 
                    p: 2, 
                    borderBottom: '1px solid #E5E7EB',
                    backgroundColor: '#F9FAFB',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%'
                  }}
                >
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#374151'
                    }}
                  >
                    Tender Information
                  </Typography>
                </Box>
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      borderBottom: '1px solid #F3F4F6',
                      p: 2,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <CalendarTodayIcon sx={{ color: '#6B7280', mr: 2, fontSize: 20 }} />
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', fontSize: '0.75rem', mb: 0.5 }}>
                        Deadline
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                        {format(new Date(tender.deadline), "MMMM dd, yyyy 'at' HH:mm")}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box
                    sx={{
                      borderBottom: '1px solid #F3F4F6',
                      p: 2,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <MonetizationOnIcon sx={{ color: '#6B7280', mr: 2, fontSize: 20 }} />
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', fontSize: '0.75rem', mb: 0.5 }}>
                        Currency
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                        {tender.currency}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <AccessTimeIcon sx={{ color: '#6B7280', mr: 2, fontSize: 20 }} />
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', fontSize: '0.75rem', mb: 0.5 }}>
                        Created
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                        {format(new Date(tender.createdAt), "MMMM dd, yyyy")}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              
              {/* Submission Status Card */}
              <Card 
                sx={{ 
                  borderRadius: '6px',
                  border: `1px solid ${
                    statusInfo.color === "success" ? "#10B981" : 
                    statusInfo.color === "warning" ? "#F59E0B" : "#EF4444"
                  }`,
                  mb: 3
                }}
              >
                <Box 
                  sx={{ 
                    p: 2, 
                    borderBottom: `1px solid ${
                      statusInfo.color === "success" ? "#D1FAE5" : 
                      statusInfo.color === "warning" ? "#FEF3C7" : "#FEE2E2"
                    }`,
                    backgroundColor: statusInfo.bgColor,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600,
                      color: statusInfo.textColor
                    }}
                  >
                    Submission Status
                  </Typography>
                </Box>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2
                    }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: statusInfo.textColor,
                        mr: 1.5
                      }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        color: statusInfo.textColor
                      }}
                    >
                      {statusInfo.color === "success" ? "Active" : 
                       statusInfo.color === "warning" ? "Deadline Passed" : "Closed"}
                    </Typography>
                  </Box>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#4B5563',
                      mb: 2
                    }}
                  >
                    {statusInfo.color === "success" ? 
                      "This tender is currently accepting submissions. Submit your proposal before the deadline." : 
                      statusInfo.color === "warning" ? 
                      "The submission deadline for this tender has passed. No new submissions are being accepted." : 
                      "This tender is closed and is no longer accepting any submissions."}
                  </Typography>
                  
                  {canSubmit && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleSubmit}
                      fullWidth
                      sx={{
                        backgroundColor: '#2563EB',
                        '&:hover': {
                          backgroundColor: '#1D4ED8',
                        },
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: '6px',
                        boxShadow: 'none',
                        mt: 1,
                        py: 1.2
                      }}
                    >
                      Submit Proposal
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              {/* Submissions Count if any */}
              {tender.submissions && tender.submissions.length > 0 && (
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: '6px',
                    borderColor: '#E5E7EB',
                    mb: 3
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          color: '#374151'
                        }}
                      >
                        Total Submissions
                      </Typography>
                      
                      <Box
                        sx={{
                          backgroundColor: '#F3F4F6',
                          px: 2,
                          py: 0.5,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: '#4B5563'
                          }}
                        >
                          {tender.submissions.length}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </Box>
      </Card>
    </Container>
  );
};

export default TenderDetails;
