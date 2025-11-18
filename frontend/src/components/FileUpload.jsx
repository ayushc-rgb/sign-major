import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';

const FileUpload = ({ onUpload, disabled, multiple = false }) => {
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File is too large. Maximum size is 10MB.');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload an image (JPEG, PNG, WebP).');
      } else {
        setError('Failed to upload file. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      if (multiple) {
        acceptedFiles.forEach(file => onUpload(file));
      } else {
        onUpload(acceptedFiles[0]);
      }
    }
  }, [onUpload, multiple]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple,
    disabled,
  });

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        📁 Upload Image
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragReject
            ? 'error.main'
            : isDragActive
            ? 'primary.main'
            : 'divider',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: isDragActive
            ? 'action.hover'
            : 'background.paper',
          transition: 'all 0.3s ease',
          opacity: disabled ? 0.6 : 1,
          '&:hover': {
            borderColor: disabled ? 'divider' : 'primary.main',
            backgroundColor: disabled ? 'background.paper' : 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        
        {isDragActive ? (
          <Box>
            <CloudUploadIcon
              sx={{ fontSize: 64, color: 'primary.main', mb: 2 }}
            />
            <Typography variant="h6" color="primary">
              Drop image here...
            </Typography>
          </Box>
        ) : (
          <Box>
            <ImageIcon
              sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
            />
            <Typography variant="h6" gutterBottom>
              Drag & drop an image here
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              or
            </Typography>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              sx={{ mt: 2 }}
              disabled={disabled}
            >
              Browse Files
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 2 }}>
              Supports: JPEG, PNG, WebP (Max 10MB)
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default FileUpload;

