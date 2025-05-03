import { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Typography, 
  Button, 
  IconButton, 
  Card, 
  CardContent, 
  Stack, 
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon, 
  ListItemSecondaryAction
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  FileUpload as FileUploadIcon,
  InsertDriveFile as FileIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import useFirebaseUpload from '../hooks/useFirebaseUpload';

const TeamMemberForm = ({ member, index, onUpdate, onRemove }) => {
  const [teamMember, setTeamMember] = useState(member || { name: '', experiences: '', documents: '' });
  const [fileUrls, setFileUrls] = useState([]);
  const { uploadFile, uploadProgress, isUploading, error } = useFirebaseUpload();
  
  // Parse existing documents if they exist
  useEffect(() => {
    if (member && member.documents) {
      try {
        const parsedDocs = JSON.parse(member.documents);
        if (Array.isArray(parsedDocs)) {
          setFileUrls(parsedDocs);
        }
      } catch (e) {
        // If not valid JSON, treat it as a single URL
        setFileUrls([member.documents]);
      }
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedMember = { ...teamMember, [name]: value };
    setTeamMember(updatedMember);
    onUpdate(index, updatedMember);
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Check if adding this file would exceed the 3-file limit
    if (fileUrls.length >= 3) {
      alert('Maximum 3 documents allowed per team member');
      return;
    }
    
    try {
      // Upload file immediately after selection
      const url = await uploadFile(selectedFile, `team-members/${teamMember.name.replace(/\s+/g, '-')}`);
      
      if (url) {
        const newFileUrls = [...fileUrls, url];
        setFileUrls(newFileUrls);
        
        // Update the team member's documents field with the file URLs
        const updatedMember = { 
          ...teamMember, 
          documents: JSON.stringify(newFileUrls)
        };
        
        setTeamMember(updatedMember);
        onUpdate(index, updatedMember);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
    
    // Reset the file input to allow uploading the same file again
    e.target.value = '';
  };

  const handleRemoveFile = (urlToRemove) => {
    const updatedUrls = fileUrls.filter(url => url !== urlToRemove);
    setFileUrls(updatedUrls);
    
    const updatedMember = {
      ...teamMember,
      documents: JSON.stringify(updatedUrls)
    };
    
    setTeamMember(updatedMember);
    onUpdate(index, updatedMember);
  };

  // Get file name from URL
  const getFileName = (url) => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const urlObj = new URL(decodedUrl);
      const pathSegments = urlObj.pathname.split('/');
      const fileName = pathSegments[pathSegments.length - 1];
      
      // Remove any query parameters
      return fileName.split('?')[0];
    } catch (e) {
      return 'Document';
    }
  };

  return (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="div">
            Team Member {index + 1}
          </Typography>
          <IconButton 
            onClick={() => onRemove(index)} 
            color="error" 
            aria-label="remove team member"
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
        
        <Divider sx={{ mb: 3 }} />
        
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={teamMember.name}
            onChange={handleChange}
            required
            variant="outlined"
          />
          
          <TextField
            fullWidth
            label="Experience & Qualifications"
            name="experiences"
            value={teamMember.experiences}
            onChange={handleChange}
            required
            multiline
            rows={4}
            variant="outlined"
            placeholder="Describe relevant experience, qualifications, and roles this person will play in the project..."
          />
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Documents ({fileUrls.length}/3)
            </Typography>
            
            {fileUrls.length > 0 && (
              <List dense sx={{ mb: 2 }}>
                {fileUrls.map((url, i) => (
                  <ListItem 
                    key={i}
                    sx={{ 
                      bgcolor: 'background.paper', 
                      borderRadius: 1,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <ListItemIcon>
                      <FileIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={getFileName(url)}
                      secondary={
                        <Button 
                          size="small" 
                          href={url} 
                          target="_blank" 
                          rel="noopener"
                          sx={{ fontSize: '0.75rem' }}
                        >
                          View Document
                        </Button>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        onClick={() => handleRemoveFile(url)}
                        size="small"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
            
            {isUploading && (
              <Box sx={{ width: '100%', mb: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="caption" display="block" textAlign="center" mt={1}>
                  Uploading: {Math.round(uploadProgress)}%
                </Typography>
              </Box>
            )}
            
            {error && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                Error: {error}
              </Typography>
            )}
            
            {fileUrls.length < 3 && (
              <Button
                variant="outlined"
                component="label"
                startIcon={<FileUploadIcon />}
                disabled={isUploading || fileUrls.length >= 3}
              >
                Select File
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </Button>
            )}
            
            <Typography variant="caption" display="block" mt={1} color="text.secondary">
              Upload up to 3 documents (CV, certificates, diplomas, etc.)
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TeamMemberForm; 