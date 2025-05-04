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
  Container,
  Modal,
  Backdrop,
  Fade,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from "@mui/material";
import { format } from "date-fns";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PersonIcon from '@mui/icons-material/Person';
import ArticleIcon from '@mui/icons-material/Article';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VerifiedIcon from '@mui/icons-material/Verified';
import Loader from "../components/Loader";
import tenderService from "../services/tenderService";
import submissionService from "../services/submissionService";
import useUser from "../hooks/useUser";

const TenderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const[didUserSubmit,setDidUserSubmit] = useState(false);

  const checkUserSubmission = async () => {
    const response = await submissionService.didUserSubmit(id,user?._id);
    setDidUserSubmit(response.data.hasSubmitted);
  }

  useEffect(() => {
    if(!user){
      return;
    }
    const fetchTender = async () => {
      try {
        const response = await tenderService.getTenderById(id,user?._id);
        setTender(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTender();
    checkUserSubmission();
  }, [id,user]);

  const handleOpenModal = (submission) => {
    setSelectedSubmission(submission);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedSubmission(null), 300); // Clear after animation
  };

  const handleEvaluateSubmission = (submission) => {
    setEvaluating(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Generate random score between 1 and 100
      const randomScore = Math.floor(Math.random() * 100) + 1;
      
      // Update the submission with the new score
      const updatedSubmissions = tender.submissions.map(sub => {
        if (sub._id === submission._id) {
          return { ...sub, accuracyScore: randomScore };
        }
        return sub;
      });
      
      // Update the tender with the new submissions
      setTender({ ...tender, submissions: updatedSubmissions });
      setEvaluating(false);
    }, 1500);
  };

  const handleSelectWinner = (submission) => {
    // For now just log it and close the modal
    console.log("Selected winner:", submission);
    handleCloseModal();
  };

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
  const canSubmit = isVendor && isOpen && !deadlinePassed && !didUserSubmit;
  
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
    navigate(`/submission/${id}`);
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
            
            {isVendor && isOpen && !deadlinePassed && didUserSubmit && (
              <Chip
                icon={<VerifiedIcon sx={{ color: '#10B981 !important' }} />}
                label="You've submitted"
                sx={{
                  ml: 2,
                  fontWeight: 600,
                  color: '#10B981',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #D1FAE5',
                  fontSize: '0.875rem',
                  py: 2,
                  px: 1
                }}
              />
            )}
            
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
                      mb: 3,
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
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
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
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      border: '1px solid #E5E7EB',
                      overflow: 'hidden'
                    }}
                  >
                    <Table>
                      <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: '#374151', borderBottom: '2px solid #E5E7EB', py: 2 }}>Vendor</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#374151', borderBottom: '2px solid #E5E7EB', py: 2 }}>Financial Offer</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#374151', borderBottom: '2px solid #E5E7EB', py: 2 }}>Team Size</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#374151', borderBottom: '2px solid #E5E7EB', py: 2 }}>Accuracy Score</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#374151', borderBottom: '2px solid #E5E7EB', py: 2 }}>Submitted On</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, color: '#374151', borderBottom: '2px solid #E5E7EB', py: 2 }}>Actions</TableCell>
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
                            <TableCell 
                              sx={{ 
                                color: '#4B5563',
                                py: 2,
                                borderBottom: '1px solid #F3F4F6'
                              }}
                            >
                              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body2" fontWeight={600} color="#374151">
                                  {submission.vendorId.name || "Unnamed Vendor"}
                                </Typography>
                                <Typography variant="caption" color="#6B7280">
                                  {submission.vendorId.email || "No email"}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell 
                              align="right" 
                              sx={{ 
                                color: '#4B5563',
                                fontWeight: 600,
                                py: 2,
                                borderBottom: '1px solid #F3F4F6'
                              }}
                            >
                              {tender.currency} {submission.financialOffer.toLocaleString()}
                            </TableCell>
                            <TableCell 
                              align="right" 
                              sx={{ 
                                color: '#4B5563',
                                py: 2,
                                borderBottom: '1px solid #F3F4F6'
                              }}
                            >
                              <Chip 
                                label={submission.proposedTeam?.length || 0} 
                                size="small"
                                sx={{ 
                                  fontWeight: 600,
                                  bgcolor: '#F3F4F6',
                                  color: '#4B5563'
                                }} 
                              />
                            </TableCell>
                            <TableCell 
                              align="right" 
                              sx={{ 
                                py: 2,
                                borderBottom: '1px solid #F3F4F6'
                              }}
                            >
                              {submission.accuracyScore !== null ? (
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
                                <Typography variant="body2" color="#9CA3AF">Not evaluated</Typography>
                              )}
                            </TableCell>
                            <TableCell 
                              align="right" 
                              sx={{ 
                                color: '#6B7280',
                                py: 2,
                                borderBottom: '1px solid #F3F4F6'
                              }}
                            >
                              {format(new Date(submission.submittedAt), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell 
                              align="center"
                              sx={{ 
                                py: 2,
                                borderBottom: '1px solid #F3F4F6'
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <Button
                                  onClick={() => handleOpenModal(submission)}
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
                                    borderRadius: '6px',
                                    py: 0.75,
                                    minWidth: '100px'
                                  }}
                                >
                                  View Details
                                </Button>
                                {isStaff && submission.accuracyScore === null && (
                                  <Button
                                    onClick={() => handleEvaluateSubmission(submission)}
                                    variant="contained"
                                    size="small"
                                    disabled={evaluating}
                                    sx={{ 
                                      textTransform: "none",
                                      backgroundColor: '#059669',
                                      '&:hover': {
                                        backgroundColor: '#047857'
                                      },
                                      fontWeight: 500,
                                      borderRadius: '6px',
                                      py: 0.75,
                                      minWidth: '120px'
                                    }}
                                  >
                                    {evaluating ? (
                                      <>
                                        <CircularProgress size={14} sx={{ color: '#fff', mr: 1 }} />
                                        Evaluating...
                                      </>
                                    ) : "Evaluate with AI"}
                                  </Button>
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

                  {isVendor && isOpen && !deadlinePassed && didUserSubmit && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#ECFDF5',
                        borderRadius: '6px',
                        p: 2,
                        mt: 2,
                        border: '1px solid #D1FAE5'
                      }}
                    >
                      <VerifiedIcon sx={{ color: '#10B981', mr: 1 }} />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: '#10B981'
                        }}
                      >
                        You have successfully submitted your proposal
                      </Typography>
                    </Box>
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
      
      {/* Submission Details Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Fade in={modalOpen}>
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: '10px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
              p: { xs: 3, md: 4 },
              maxWidth: '900px',
              width: '95%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
              '&::-webkit-scrollbar': {
                width: '6px',
                height: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#E5E7EB',
                borderRadius: '6px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#D1D5DB',
              },
              scrollbarWidth: 'thin',
              scrollbarColor: '#E5E7EB transparent',
            }}
          >
            {selectedSubmission && (
              <>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 3,
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                    gap: 2
                  }}
                >
                  <Box>
                    <Typography variant="h5" component="h2" fontWeight={700} color="#111827" sx={{ mb: 0.5 }}>
                      Submission Details
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: '#6B7280' }}>
                      <AccessTimeIcon sx={{ fontSize: 16, mr: 0.75 }} />
                      <Typography variant="body2">
                        Submitted on {format(new Date(selectedSubmission.submittedAt), "MMMM dd, yyyy 'at' HH:mm")}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {selectedSubmission.accuracyScore !== null && (
                    <Box 
                      sx={{ 
                        backgroundColor: selectedSubmission.accuracyScore > 70 ? '#ECFDF5' : 
                                                selectedSubmission.accuracyScore > 40 ? '#FEF3C7' : '#FEE2E2',
                        borderRadius: '8px',
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: '110px'
                      }}
                    >
                      <Typography variant="caption" color="#6B7280" sx={{ mb: 0.5, fontWeight: 500 }}>
                        AI Evaluation
                      </Typography>
                      <Typography 
                        variant="h4" 
                        fontWeight={700} 
                        color={selectedSubmission.accuracyScore > 70 ? '#10B981' : 
                               selectedSubmission.accuracyScore > 40 ? '#F59E0B' : '#EF4444'}
                      >
                        {selectedSubmission.accuracyScore}%
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Card variant="outlined" sx={{ mb: 3, borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                      <Box 
                        sx={{ 
                          p: 2, 
                          borderBottom: '1px solid #E5E7EB',
                          backgroundColor: '#F9FAFB',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <PersonIcon sx={{ color: '#4B5563', mr: 1.5 }} />
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#374151'
                          }}
                        >
                          Vendor Information
                        </Typography>
                      </Box>
                      <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Typography variant="body2" color="#374151" fontWeight={600}>
                              Name
                            </Typography>
                            <Typography variant="body2" color="#6B7280">
                              {selectedSubmission.vendorId.name || "N/A"}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" color="#374151" fontWeight={600}>
                              Email
                            </Typography>
                            <Typography variant="body2" color="#6B7280">
                              {selectedSubmission.vendorId.email || "N/A"}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" color="#374151" fontWeight={600}>
                              Address
                            </Typography>
                            <Typography variant="body2" color="#6B7280">
                              {selectedSubmission.vendorId.address || "N/A"}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" color="#374151" fontWeight={600}>
                              Phone
                            </Typography>
                            <Typography variant="body2" color="#6B7280">
                              {selectedSubmission.vendorId.phone || "N/A"}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" color="#374151" fontWeight={600}>
                              NUIS (Business ID)
                            </Typography>
                            <Typography variant="body2" color="#6B7280">
                              {selectedSubmission.vendorId.NUIS || "N/A"}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" color="#374151" fontWeight={600}>
                              Financial Offer
                            </Typography>
                            <Typography variant="body1" color="#111827" fontWeight={700}>
                              {tender.currency} {selectedSubmission.financialOffer.toLocaleString()}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" color="#374151" fontWeight={600} sx={{ mb: 0.5 }}>
                              Declaration Signed
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CheckCircleIcon sx={{ color: '#10B981', mr: 1, fontSize: 18 }} />
                              <Typography variant="body2" color="#6B7280">
                                {selectedSubmission.declaration ? "Yes" : "No"}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                    
                    {isStaff && tender.status === "closed" && (
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<EmojiEventsIcon />}
                        onClick={() => handleSelectWinner(selectedSubmission)}
                        sx={{
                          backgroundColor: '#2563EB',
                          '&:hover': {
                            backgroundColor: '#1D4ED8',
                          },
                          fontWeight: 600,
                          textTransform: 'none',
                          borderRadius: '8px',
                          py: 1.5,
                          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                        }}
                      >
                        Select as Winner
                      </Button>
                    )}
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        mb: 3, 
                        borderRadius: '8px', 
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        height: '100%'
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
                        <AssignmentIcon sx={{ color: '#4B5563', mr: 1.5 }} />
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#374151'
                          }}
                        >
                          Proposed Team
                        </Typography>
                      </Box>
                      <CardContent sx={{ p: 0 }}>
                        {selectedSubmission.proposedTeam?.length > 0 ? (
                          selectedSubmission.proposedTeam.map((member, index) => (
                            <Box 
                              key={index}
                              sx={{
                                p: 2.5,
                                borderBottom: index < selectedSubmission.proposedTeam.length - 1 ? '1px solid #F3F4F6' : 'none'
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                                <Box 
                                  sx={{ 
                                    width: 40, 
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: '#F3F4F6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 600,
                                    color: '#4B5563',
                                    fontSize: '1rem',
                                    flexShrink: 0,
                                    mr: 2
                                  }}
                                >
                                  {member.name.charAt(0).toUpperCase()}
                                </Box>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight={600} color="#374151">
                                    {member.name}
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    color="#6B7280" 
                                    sx={{ 
                                      mt: 0.5,
                                      whiteSpace: 'pre-line',
                                      fontSize: '0.875rem',
                                      lineHeight: 1.5
                                    }}
                                  >
                                    {member.experiences}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              {member.documents && (
                                <Box sx={{ mt: 1.5, pl: 6 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <ArticleIcon sx={{ color: '#6B7280', fontSize: 18, mr: 0.5 }} />
                                    <Typography variant="body2" color="#4B5563" fontWeight={500}>
                                      {member.documents.includes("[") ? 
                                        `${JSON.parse(member.documents).length} document(s)` : 
                                        "1 document"}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                    {member.documents.includes("[") ? (
                                      JSON.parse(member.documents).map((doc, docIndex) => (
                                        <Button 
                                          key={docIndex}
                                          component="a"
                                          href={doc}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          variant="text"
                                          size="small"
                                          startIcon={<ArticleIcon fontSize="small" />}
                                          sx={{ 
                                            color: '#2563EB', 
                                            textTransform: 'none',
                                            justifyContent: 'flex-start',
                                            p: 0.5,
                                            fontWeight: 400,
                                            '&:hover': {
                                              backgroundColor: 'rgba(37, 99, 235, 0.04)',
                                              textDecoration: 'underline'
                                            }
                                          }}
                                        >
                                          Document {docIndex + 1}
                                        </Button>
                                      ))
                                    ) : (
                                      <Button 
                                        component="a"
                                        href={member.documents.replace(/"/g, '')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="text"
                                        size="small"
                                        startIcon={<ArticleIcon fontSize="small" />}
                                        sx={{ 
                                          color: '#2563EB', 
                                          textTransform: 'none',
                                          justifyContent: 'flex-start',
                                          p: 0.5,
                                          fontWeight: 400,
                                          '&:hover': {
                                            backgroundColor: 'rgba(37, 99, 235, 0.04)',
                                            textDecoration: 'underline'
                                          }
                                        }}
                                      >
                                        Document
                                      </Button>
                                    )}
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          ))
                        ) : (
                          <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="#6B7280">
                              No team members provided
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </Container>
  );
};

export default TenderDetails;
