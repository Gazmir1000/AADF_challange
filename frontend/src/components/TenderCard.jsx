import { motion } from 'framer-motion';
import { Card, CardContent, CardActions, Typography, Button, Box } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate } from 'react-router-dom';

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
    y: -5,
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    transition: { 
      type: 'spring', 
      stiffness: 400,
      damping: 20
    }
  }
};

const TenderCard = ({ tender }) => {
    const navigate = useNavigate();
    
    // Format dates for display
    const formattedCreatedAt = new Date(tender.createdAt).toLocaleDateString();
    const formattedDeadline = new Date(tender.deadline).toLocaleDateString();
    
    // Determine status color and text
    const isOpen = tender.status === 'open';
    const statusColor = isOpen ? '#10B981' : '#EF4444';
    const statusText = isOpen ? 'OPEN' : 'CLOSED';
    const StatusIcon = isOpen ? CheckCircleOutlineIcon : ErrorOutlineIcon;

    // Handle View Details button click
    const handleViewDetails = (e) => {
        e.stopPropagation(); // Prevent event from bubbling up to parent container
        navigate(`/tenders/${tender._id || tender.id}`);
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            style={{ width: '100%', display: 'flex' }}
        >
            <Card sx={{ 
                flex: 1,
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(0,0,0,0.05)',
                position: 'relative',
                bgcolor: 'white'
            }}>
                {/* Modern status badge */}
                <Box sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: isOpen ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: statusColor,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: `1px solid ${isOpen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                }}>
                    <StatusIcon style={{ fontSize: 14, marginRight: 4 }} />
                    {statusText}
                </Box>
                
                <CardContent sx={{ flexGrow: 1, p: 3, bgcolor: 'white' }}>
                    <Typography 
                        variant="h6" 
                        component="h3"
                        gutterBottom
                        sx={{ 
                            fontWeight: '600',
                            mb: 2,
                            height: '3.6em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {tender.title}
                    </Typography>
                    
                    <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                            mb: 2,
                            height: '4.5em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {tender.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                            Posted: {formattedCreatedAt}
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                            Deadline: {formattedDeadline}
                        </Typography>
                    </Box>
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0, bgcolor: 'white' }}>
                    <Button 
                        variant="contained" 
                        fullWidth
                        onClick={handleViewDetails}
                        sx={{ 
                            borderRadius: '8px',
                            textTransform: 'none',
                            background: 'linear-gradient(90deg, #2193b0 0%, #6dd5ed 100%)',
                            boxShadow: '0 4px 10px rgba(33, 147, 176, 0.3)',
                            py: 1,
                        }}
                    >
                        View Details
                    </Button>
                </CardActions>
            </Card>
        </motion.div>
    );
};

export default TenderCard;
