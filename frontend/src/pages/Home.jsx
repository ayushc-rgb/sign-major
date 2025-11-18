import { useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Button,
  Snackbar,
} from '@mui/material';
import CameraCapture from '../components/CameraCapture';
import FileUpload from '../components/FileUpload';
import ResultDisplay from '../components/ResultDisplay';
import ExportResults from '../components/ExportResults';
import { scanImage } from '../services/api';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const handleImageProcess = async (file) => {
    setLoading(true);
    setError(null);
    setScanResult(null);
    setCurrentImage(file);

    try {
      const result = await scanImage(file);
      
      // Always show results - sign can be detected with or without text
      if (result.sign_detected === false) {
        setError('No sign detected in this image. Please try another image with a visible sign.');
        setCurrentImage(null);
      } else {
        setScanResult(result);
        // Different message based on whether text was found
        if (result.detected_text && result.detected_text.trim() !== '') {
          setSnackbar({ open: true, message: 'Sign detected with text!' });
        } else {
          setSnackbar({ open: true, message: 'Sign identified successfully!' });
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        'Failed to process image. Please try again.'
      );
      setCurrentImage(null);
      console.error('Scan error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewScan = () => {
    setScanResult(null);
    setCurrentImage(null);
    setError(null);
  };

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #434343 0%, #000000 100%)',
          color: 'white',
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Welcome to Sign Vision 🚦
        </Typography>
        <Typography variant="body1">
          Identify any sign by its shape, color, and symbols - with or without text!
        </Typography>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Paper elevation={3} sx={{ p: 4, mb: 3, textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            🔍 Analyzing Sign...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Identifying shape, color, symbols, and text
          </Typography>
        </Paper>
      )}

      {/* Input Section (shown only when no result) */}
      {!loading && !scanResult && (
        <>
          <CameraCapture onCapture={handleImageProcess} disabled={loading} />
          <FileUpload onUpload={handleImageProcess} disabled={loading} />

          {/* Features Info */}
          <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              ✨ Features
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                🚦 Identifies signs by shape, color, symbols, and icons
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                📸 Real-time camera capture and file upload support
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                🌍 Works with or without text - recognizes universal symbols
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                💡 Explains what each sign means
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                🔄 Translates text (when present) to your preferred language
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                🔊 Text-to-speech for accessibility
              </Typography>
              <Typography component="li" variant="body2">
                📥 Export results as JSON or text
              </Typography>
            </Box>
          </Paper>
        </>
      )}

      {/* Results Section */}
      {!loading && scanResult && (
        <>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <ExportResults
              scanResult={scanResult}
              translation={null}
              imageFile={currentImage}
            />
            <Button variant="outlined" onClick={handleNewScan}>
              New Scan
            </Button>
          </Box>
          
          <ResultDisplay scanResult={scanResult} imageFile={currentImage} />
        </>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default Home;

