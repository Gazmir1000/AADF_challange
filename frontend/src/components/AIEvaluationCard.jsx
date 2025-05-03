import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  useTheme
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

/**
 * Component for displaying AI evaluation results
 */
const AIEvaluationCard = ({ evaluation, isLoading }) => {
  const theme = useTheme();
  
  if (isLoading) {
    return (
      <Card 
        variant="outlined" 
        sx={{ 
          mb: 3, 
          borderRadius: '8px',
          borderColor: theme.palette.divider
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            AI Evaluation in Progress
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Our AI is analyzing this submission against the tender requirements...
          </Typography>
          <LinearProgress sx={{ mt: 2, mb: 1 }} />
        </CardContent>
      </Card>
    );
  }
  
  if (!evaluation || evaluation.error) {
    return (
      <Card 
        variant="outlined" 
        sx={{ 
          mb: 3, 
          borderRadius: '8px',
          borderColor: theme.palette.error.light
        }}
      >
        <CardContent>
          <Typography variant="h6" color="error" gutterBottom>
            AI Evaluation Unavailable
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {evaluation?.message || "There was an error generating the AI evaluation. Please try again later."}
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  // Extract data from evaluation object
  const { 
    requirements_match, 
    financial_analysis, 
    strengths, 
    weaknesses, 
    overall_fit_score,
    recommendation,
    summary,
    improvement_suggestions
  } = evaluation.evaluation || evaluation;
  
  // Determine colors based on scores
  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981'; // Good - green
    if (score >= 60) return '#F59E0B'; // Moderate - amber
    return '#EF4444'; // Poor - red
  };
  
  const overallScoreColor = getScoreColor(overall_fit_score);
  
  // Determine recommendation styling
  const getRecommendationStyle = (rec) => {
    const lowerRec = rec.toLowerCase();
    if (lowerRec.includes('accept')) {
      return { color: '#10B981', bgColor: '#D1FAE5' };
    }
    if (lowerRec.includes('reject')) {
      return { color: '#EF4444', bgColor: '#FEE2E2' };
    }
    return { color: '#F59E0B', bgColor: '#FEF3C7' };
  };
  
  const recommendationStyle = getRecommendationStyle(recommendation);
  
  return (
    <Card 
      sx={{ 
        mb: 3, 
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          borderBottom: '1px solid',
          borderColor: theme.palette.divider,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)'
        }}
      >
        <Box display="flex" alignItems="center">
          <TipsAndUpdatesIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            AI Evaluation
          </Typography>
        </Box>
        <Chip 
          label={recommendation} 
          sx={{ 
            fontWeight: 600,
            color: recommendationStyle.color,
            backgroundColor: recommendationStyle.bgColor,
            border: `1px solid ${recommendationStyle.color}`,
            fontSize: '0.75rem',
            textTransform: 'uppercase'
          }} 
        />
      </Box>
      
      {/* Content */}
      <CardContent sx={{ pt: 3 }}>
        {/* Overall Score */}
        <Box 
          sx={{ 
            p: 2, 
            mb: 3, 
            border: '1px solid',
            borderColor: theme.palette.divider,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.05)' : 'rgba(25, 118, 210, 0.02)'
          }}
        >
          <Box 
            sx={{ 
              width: { xs: '100%', sm: 120 }, 
              height: { xs: 120, sm: 120 },
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box 
              sx={{ 
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                position: 'absolute',
                background: `conic-gradient(${overallScoreColor} ${overall_fit_score}%, #e0e0e0 0)`,
                transform: 'rotate(-90deg)'
              }} 
            />
            <Box 
              sx={{ 
                width: '80%',
                height: '80%',
                borderRadius: '50%',
                bgcolor: theme.palette.background.paper,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: 'inset 0 0 8px rgba(0,0,0,0.1)'
              }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: overallScoreColor 
                }}
              >
                {overall_fit_score}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ fontWeight: 600, mb: 1 }}
            >
              Overall Fit Score
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {summary}
            </Typography>
          </Box>
        </Box>
        
        {/* Detailed Scores */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: 600, mb: 2 }}
          >
            Evaluation Metrics
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            {/* Requirements Match */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                flex: 1,
                border: '1px solid',
                borderColor: theme.palette.divider,
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <AssignmentTurnedInIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Requirements Match
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ flexGrow: 1, mr: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={requirements_match.score} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getScoreColor(requirements_match.score)
                      }
                    }} 
                  />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {requirements_match.score}%
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                {requirements_match.explanation}
              </Typography>
            </Paper>
            
            {/* Financial Analysis */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                flex: 1,
                border: '1px solid',
                borderColor: theme.palette.divider,
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <MonetizationOnIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Financial Value
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ flexGrow: 1, mr: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={financial_analysis.value_rating} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getScoreColor(financial_analysis.value_rating)
                      }
                    }} 
                  />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {financial_analysis.value_rating}%
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                {financial_analysis.explanation}
              </Typography>
            </Paper>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Strengths and Weaknesses */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
          {/* Strengths */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <SentimentSatisfiedAltIcon sx={{ mr: 1, color: '#10B981' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Strengths
              </Typography>
            </Box>
            
            <List dense sx={{ bgcolor: '#ECFDF5', borderRadius: 2, overflow: 'hidden' }}>
              {strengths.map((strength, index) => (
                <ListItem key={index} sx={{ px: 2, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: '#10B981' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={strength} 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
          
          {/* Weaknesses */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <SentimentVeryDissatisfiedIcon sx={{ mr: 1, color: '#EF4444' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Weaknesses
              </Typography>
            </Box>
            
            <List dense sx={{ bgcolor: '#FEE2E2', borderRadius: 2, overflow: 'hidden' }}>
              {weaknesses.map((weakness, index) => (
                <ListItem key={index} sx={{ px: 2, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <ErrorIcon fontSize="small" sx={{ color: '#EF4444' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={weakness} 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
        
        {/* Improvement Suggestions */}
        {improvement_suggestions && improvement_suggestions.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <TipsAndUpdatesIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Improvement Suggestions
              </Typography>
            </Box>
            
            <List dense sx={{ 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 167, 38, 0.08)' : '#FFF7ED', 
              borderRadius: 2,
              border: '1px dashed',
              borderColor: theme.palette.warning.main,
              overflow: 'hidden' 
            }}>
              {improvement_suggestions.map((suggestion, index) => (
                <ListItem key={index} sx={{ px: 2, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <TipsAndUpdatesIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={suggestion} 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AIEvaluationCard; 