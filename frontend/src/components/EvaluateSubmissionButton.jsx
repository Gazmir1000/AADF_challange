import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import aiEvaluationService from '../services/aiEvaluationService';
import AIEvaluationCard from './AIEvaluationCard';

/**
 * Button component that triggers AI evaluation of a submission
 */
const EvaluateSubmissionButton = ({ tender, submission, onEvaluationComplete }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleEvaluate = async () => {
    setOpen(true);
    setLoading(true);
    setError(null);
    setEvaluation(null);

    try {
      // Call the AI evaluation service
      const result = await aiEvaluationService.evaluateSubmission(tender, submission);
      setEvaluation(result);
      
      // If there's a callback, call it with the evaluation result
      if (onEvaluationComplete) {
        onEvaluationComplete(result);
      }
    } catch (err) {
      console.error('Evaluation failed:', err);
      setError(err.message || 'Evaluation failed. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AssessmentIcon />}
        onClick={handleEvaluate}
        sx={{ 
          my: 1,
          borderRadius: '20px',
          px: 3,
          py: 1,
          textTransform: 'none',
          boxShadow: 2,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3,
          }
        }}
      >
        Evaluate with AI
      </Button>

      <Dialog
        open={open}
        onClose={loading ? undefined : handleClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          AI Evaluation
          {loading && <LinearProgress sx={{ mt: 1 }} />}
        </DialogTitle>
        
        <DialogContent>
          {loading ? (
            <DialogContentText>
              <Typography gutterBottom>
                The AI is analyzing this submission against the tender requirements...
              </Typography>
              <Typography variant="caption" color="text.secondary">
                This may take up to 30 seconds.
              </Typography>
            </DialogContentText>
          ) : evaluation ? (
            <AIEvaluationCard evaluation={evaluation} />
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : null}
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={handleClose} 
            color="primary"
            disabled={loading}
          >
            {evaluation ? 'Close' : 'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EvaluateSubmissionButton; 