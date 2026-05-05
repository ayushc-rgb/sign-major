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
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import TranslateIcon from '@mui/icons-material/Translate';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';
import PublicIcon from '@mui/icons-material/Public';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import CameraCapture from '../components/CameraCapture';
import FileUpload from '../components/FileUpload';
import ResultDisplay from '../components/ResultDisplay';
import ExportResults from '../components/ExportResults';
import Chatbot from '../components/Chatbot';
import { scanImage } from '../services/api';

const features = [
  {
    icon: <VisibilityIcon />,
    title: 'Visual Recognition',
    description: 'Identifies signs by shape, color, symbols, and icons — even without text.',
  },
  {
    icon: <PhotoCameraIcon />,
    title: 'Multiple Input Methods',
    description: 'Use your camera in real time or upload an image from your device.',
  },
  {
    icon: <PublicIcon />,
    title: 'Universal Compatibility',
    description: 'Recognizes international symbols across regions and languages.',
  },
  {
    icon: <LightbulbOutlinedIcon />,
    title: 'Intelligent Insights',
    description: 'Explains what each sign means with context and safety guidance.',
  },
  {
    icon: <TranslateIcon />,
    title: 'Multi-language Translation',
    description: 'Translates sign text into over 100 languages when present.',
  },
  {
    icon: <VolumeUpOutlinedIcon />,
    title: 'Accessibility Features',
    description: 'Text-to-speech and export options to support every user.',
  },
];

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [showChatbot, setShowChatbot] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleImageProcess = async (file) => {
    setLoading(true);
    setError(null);
    setScanResult(null);
    setCurrentImage(file);
    setShowChatbot(true);

    try {
      const result = await scanImage(file);
      if (result.sign_detected === false) {
        setError('No sign detected in this image. Please try another image with a visible sign.');
        setCurrentImage(null);
      } else {
        setScanResult(result);
        const msg = result.detected_text?.trim()
          ? 'Sign detected with text!'
          : 'Sign identified successfully!';
        setSnackbar({ open: true, message: msg });
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process image. Please try again.');
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
    setShowChatbot(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSnackbar({ open: true, message: 'Thank you! We will be in touch soon.' });
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg">

        {/* Hero */}
        <Box sx={{ pt: { xs: 4, md: 6 }, pb: 4, mb: 2 }}>
          <Typography
            variant="h3"
            gutterBottom
            sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' }, color: (theme) => theme.palette.mode === 'dark' ? '#CBD5E1' : '#1E293B' }}
          >
            Sign Vision
          </Typography>
          <Typography
            variant="h6"
            style={{ color: '#475569' }}
            sx={{ fontWeight: 400, maxWidth: 560, lineHeight: 1.6 }}
          >
            Point your camera at any sign and instantly understand what it means — in any language.
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Paper elevation={0} sx={{ p: 5, mb: 3, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
            <CircularProgress size={48} sx={{ mb: 2 }} color="primary" />
            <Typography variant="h6" color="text.primary" gutterBottom>
              Analyzing sign...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Identifying shape, color, symbols, and text
            </Typography>
          </Paper>
        )}

        {/* Input Section */}
        {!loading && !scanResult && (
          <>
            <CameraCapture onCapture={handleImageProcess} disabled={loading} />
            <FileUpload onUpload={handleImageProcess} disabled={loading} />

            {/* Features */}
            <Card elevation={0} sx={{ mt: 5, border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography variant="h6" gutterBottom color="text.primary" sx={{ mb: 3 }}>
                  What Sign Vision can do
                </Typography>
                <Grid container spacing={3}>
                  {features.map((f) => (
                    <Grid item xs={12} sm={6} md={4} key={f.title}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Box
                          sx={{
                            color: 'primary.main',
                            mt: 0.3,
                            flexShrink: 0,
                          }}
                        >
                          {f.icon}
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            {f.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                            {f.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </>
        )}

        {/* Results */}
        {!loading && scanResult && (
          <>
            <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <ExportResults scanResult={scanResult} translation={null} imageFile={currentImage} />
              <Button variant="outlined" onClick={handleNewScan}>
                New Scan
              </Button>
            </Box>
            <ResultDisplay scanResult={scanResult} imageFile={currentImage} />
            {showChatbot && (
              <Chatbot signData={scanResult} onClose={() => setShowChatbot(false)} />
            )}
          </>
        )}

        {/* Contact Section */}
        <Box sx={{ mt: 8, mb: 4 }}>
          <Divider sx={{ mb: 6 }} />
          <Grid container spacing={6} alignItems="flex-start">
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <PeopleOutlineIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h6" fontWeight={700}>
                  Get in touch
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" lineHeight={1.8} sx={{ mb: 3 }}>
                We're building Sign Vision to make the world more accessible. If you have ideas,
                feedback, or just want to say hello — we'd love to hear from you.
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Built by Ayush Chauhan, Devesh, Anshul Saini & Shivam Singh
              </Typography>
            </Grid>

            <Grid item xs={12} md={7}>
              <Box component="form" onSubmit={handleFormSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Message"
                      name="message"
                      multiline
                      rows={4}
                      value={formData.message}
                      onChange={handleFormChange}
                      placeholder="Tell us your thoughts, feature ideas, or how you'd like to contribute..."
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      endIcon={<SendIcon />}
                      sx={{ px: 4 }}
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Box>

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
