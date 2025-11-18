import { useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Button,
  Snackbar,
  TextField,
  Grid,
  Container,
  Card,
  CardContent,
  Divider,
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import GroupIcon from '@mui/icons-material/Group';
import CodeIcon from '@mui/icons-material/Code';
import CameraCapture from '../components/CameraCapture';
import FileUpload from '../components/FileUpload';
import ResultDisplay from '../components/ResultDisplay';
import ExportResults from '../components/ExportResults';
import Chatbot from '../components/Chatbot';
import { scanImage } from '../services/api';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

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

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setSnackbar({ 
      open: true, 
      message: 'Thank you for your interest! We will contact you soon.' 
    });
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 6 },
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 4,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h60v60H0z" fill="none"/%3E%3Cpath d="M30 30m-20 0a20 20 0 1 0 40 0a20 20 0 1 0-40 0" stroke="rgba(255,255,255,0.1)" fill="none"/%3E%3C/svg%3E")',
              opacity: 0.3,
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h3" 
              gutterBottom 
              fontWeight="bold"
              sx={{ 
                fontSize: { xs: '2rem', md: '3rem' },
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              🚦 Sign Vision
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3,
                fontSize: { xs: '1rem', md: '1.25rem' },
                opacity: 0.95
              }}
            >
              AI-Powered Sign Recognition & Translation
            </Typography>
            <Typography 
              variant="body1"
              sx={{ 
                maxWidth: '700px', 
                mx: 'auto',
                fontSize: { xs: '0.95rem', md: '1.1rem' },
                lineHeight: 1.8
              }}
            >
              Identify any sign by its shape, color, and symbols - with or without text!
            </Typography>
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Chip 
                label="🌍 100+ Languages" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  px: 1
                }} 
              />
              <Chip 
                label="🤖 AI-Powered" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  px: 1
                }} 
              />
              <Chip 
                label="⚡ Real-time" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  px: 1
                }} 
              />
            </Box>
          </Box>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Paper 
            elevation={3} 
            sx={{ 
              p: 5, 
              mb: 3, 
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}
          >
            <CircularProgress 
              size={70} 
              sx={{ 
                mb: 3,
                color: '#667eea'
              }} 
            />
            <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
              🔍 Analyzing Sign...
            </Typography>
            <Typography variant="body1" color="text.secondary">
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
            <Card 
              elevation={2} 
              sx={{ 
                mt: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  fontWeight="bold"
                  color="primary"
                  sx={{ mb: 3 }}
                >
                  ✨ Why Choose Sign Vision?
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Box 
                        sx={{ 
                          minWidth: 40, 
                          height: 40, 
                          borderRadius: 2, 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}
                      >
                        <Typography fontSize="1.5rem">🚦</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Visual Recognition
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Identifies signs by shape, color, symbols, and icons
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Box 
                        sx={{ 
                          minWidth: 40, 
                          height: 40, 
                          borderRadius: 2, 
                          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}
                      >
                        <Typography fontSize="1.5rem">📸</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Multiple Input Methods
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Real-time camera capture and file upload support
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Box 
                        sx={{ 
                          minWidth: 40, 
                          height: 40, 
                          borderRadius: 2, 
                          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}
                      >
                        <Typography fontSize="1.5rem">🌍</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Universal Compatibility
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Works with or without text - recognizes international symbols
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Box 
                        sx={{ 
                          minWidth: 40, 
                          height: 40, 
                          borderRadius: 2, 
                          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}
                      >
                        <Typography fontSize="1.5rem">💡</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Intelligent Insights
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Explains what each sign means with detailed context
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Box 
                        sx={{ 
                          minWidth: 40, 
                          height: 40, 
                          borderRadius: 2, 
                          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}
                      >
                        <Typography fontSize="1.5rem">🔄</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Multi-language Translation
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Translates text (when present) to your preferred language
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Box 
                        sx={{ 
                          minWidth: 40, 
                          height: 40, 
                          borderRadius: 2, 
                          background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}
                      >
                        <Typography fontSize="1.5rem">🔊</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Accessibility Features
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Text-to-speech and export options for everyone
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
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
            
            {/* Chatbot - only visible when results are shown */}
            <Chatbot signData={scanResult} />
          </>
        )}

        {/* Join Us Section */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Card
            elevation={4}
            sx={{
              borderRadius: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <GroupIcon sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Join Sign Vision Community
                </Typography>
                <Typography variant="body1" sx={{ maxWidth: '600px', mx: 'auto', opacity: 0.95 }}>
                  Be part of our mission to make signs accessible to everyone, everywhere. 
                  Share your feedback, ideas, or just say hello!
                </Typography>
              </Box>

              <Box
                component="form"
                onSubmit={handleFormSubmit}
                sx={{
                  maxWidth: '600px',
                  mx: 'auto',
                  backgroundColor: 'white',
                  p: 4,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      variant="outlined"
                      InputLabelProps={{ style: { color: '#666' } }}
                      sx={{ 
                        backgroundColor: '#f9f9f9',
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#ddd' },
                          '&:hover fieldset': { borderColor: '#667eea' },
                          '&.Mui-focused fieldset': { borderColor: '#667eea' },
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      variant="outlined"
                      InputLabelProps={{ style: { color: '#666' } }}
                      sx={{ 
                        backgroundColor: '#f9f9f9',
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#ddd' },
                          '&:hover fieldset': { borderColor: '#667eea' },
                          '&.Mui-focused fieldset': { borderColor: '#667eea' },
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Your Message"
                      name="message"
                      multiline
                      rows={4}
                      value={formData.message}
                      onChange={handleFormChange}
                      variant="outlined"
                      placeholder="Tell us about your interest in Sign Vision, ideas for improvement, or how you'd like to contribute..."
                      InputLabelProps={{ style: { color: '#666' } }}
                      sx={{ 
                        backgroundColor: '#f9f9f9',
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#ddd' },
                          '&:hover fieldset': { borderColor: '#667eea' },
                          '&.Mui-focused fieldset': { borderColor: '#667eea' },
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      endIcon={<SendIcon />}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Developer Credits */}
        <Box sx={{ mt: 4, mb: 2 }}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 3,
              backgroundColor: 'white',
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Box sx={{ mb: 3 }}>
                <CodeIcon sx={{ fontSize: 50, color: '#667eea', mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#667eea' }} gutterBottom>
                  Meet Our Team
                </Typography>
                <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
                  Passionate developers building the future of sign recognition
                </Typography>
              </Box>

              <Divider sx={{ mb: 3, borderColor: '#e0e0e0' }} />

              <Grid container spacing={2} justifyContent="center">
                {[
                  { name: 'Ayush Chauhan', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                  { name: 'Devesh', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
                  { name: 'Anshul Saini', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
                  { name: 'Shivam Singh', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
                ].map((developer, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        background: developer.gradient,
                        color: 'white',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                        },
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', md: '1.1rem' } }}>
                        {developer.name}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
                        Developer
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  © 2025 Sign Vision. Made with ❤️ for a more accessible world.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Success Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ open: false, message: '' })}
          message={snackbar.message}
        />
      </Container>
    </Box>
  );
};

export default Home;

