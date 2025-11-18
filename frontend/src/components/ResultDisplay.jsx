import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LanguageSelector from './LanguageSelector';
import TextToSpeech from './TextToSpeech';
import { translateText } from '../services/api';

const ResultDisplay = ({ scanResult, imageFile }) => {
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [translation, setTranslation] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (imageFile && scanResult && canvasRef.current && imageRef.current) {
      drawAnnotations();
    }
  }, [imageFile, scanResult]);

  const drawAnnotations = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;

    if (!canvas || !image || !scanResult.bounding_boxes) return;

    const ctx = canvas.getContext('2d');
    
    // Wait for image to load
    const img = new Image();
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Draw bounding boxes
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(33, 150, 243, 0.1)';

      scanResult.bounding_boxes.forEach((box) => {
        if (box.vertices && box.vertices.length >= 4) {
          ctx.beginPath();
          ctx.moveTo(box.vertices[0].x, box.vertices[0].y);
          
          for (let i = 1; i < box.vertices.length; i++) {
            ctx.lineTo(box.vertices[i].x, box.vertices[i].y);
          }
          
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      });
    };

    img.src = URL.createObjectURL(imageFile);
  };

  const handleTranslate = async () => {
    if (!scanResult.detected_text || !targetLanguage) return;

    setTranslating(true);
    setError(null);

    try {
      const result = await translateText(
        scanResult.detected_text,
        targetLanguage,
        scanResult.detected_language,
        scanResult.id
      );
      setTranslation(result);
    } catch (err) {
      setError('Failed to translate text. Please try again.');
      console.error('Translation error:', err);
    } finally {
      setTranslating(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'success';
    if (confidence >= 0.7) return 'warning';
    return 'error';
  };

  if (!scanResult) return null;

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        🚦 Sign Detection Results
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Sign Detection Status */}
      {scanResult.sign_detected !== undefined && (
        <Alert 
          severity={scanResult.sign_detected ? "success" : "info"} 
          sx={{ mb: 2 }}
          icon={scanResult.sign_detected ? <CheckCircleIcon /> : null}
        >
          {scanResult.sign_detected 
            ? `✓ Sign detected: ${scanResult.sign_type || 'Unknown type'}`
            : 'No sign detected in this image'}
        </Alert>
      )}

      {/* Sign Information Card */}
      {scanResult.sign_detected && (scanResult.sign_description || scanResult.meaning || scanResult.visual_elements) && (
        <Card 
          sx={{ 
            mb: 3, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
          }}
        >
          <CardContent>
            <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              🚦 Sign Identification
            </Typography>
            
            {scanResult.sign_type && (
              <Box sx={{ mb: 3 }}>
                <Chip 
                  label={scanResult.sign_type.toUpperCase()} 
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#667eea',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    mr: 1, 
                    mb: 1 
                  }}
                  size="medium"
                />
                <Chip
                  label={`${(scanResult.confidence_score * 100).toFixed(0)}% Confidence`}
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: getConfidenceColor(scanResult.confidence_score) === 'success' ? '#4caf50' : 
                           getConfidenceColor(scanResult.confidence_score) === 'warning' ? '#ff9800' : '#f44336',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}
                  size="medium"
                />
              </Box>
            )}

            {scanResult.sign_description && (
              <Box 
                sx={{ 
                  mb: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  p: 2.5,
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 1.5,
                    fontSize: '0.95rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    opacity: 0.9
                  }}
                >
                  📋 Description
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontSize: '1.05rem',
                    lineHeight: 1.7
                  }}
                >
                  {scanResult.sign_description}
                </Typography>
              </Box>
            )}

            {scanResult.meaning && (
              <Box 
                sx={{ 
                  mb: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  color: '#333',
                  p: 3,
                  borderRadius: 2,
                  borderLeft: '6px solid #ffd700',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 1.5,
                    fontSize: '1rem',
                    color: '#667eea',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  💡 What This Sign Means
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontSize: '1.1rem',
                    lineHeight: 1.8,
                    fontWeight: 500
                  }}
                >
                  {scanResult.meaning}
                </Typography>
              </Box>
            )}

            {scanResult.visual_elements && (
              <Box
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 1,
                    fontSize: '0.9rem',
                    opacity: 0.9
                  }}
                >
                  🎨 Visual Details
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontStyle: 'italic',
                    opacity: 0.95,
                    lineHeight: 1.6
                  }}
                >
                  {scanResult.visual_elements}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Image with annotations */}
      {imageFile && (
        <Box sx={{ mb: 3, position: 'relative' }}>
          <Typography variant="subtitle2" gutterBottom>
            Detected Text Regions:
          </Typography>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: '800px',
              margin: '0 auto',
              borderRadius: 2,
              overflow: 'hidden',
              backgroundColor: '#000',
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
            <img
              ref={imageRef}
              style={{ display: 'none' }}
              alt="Original"
            />
          </Box>
        </Box>
      )}

      {/* Detected Text Card - Only show if there's text */}
      {scanResult.detected_text && scanResult.detected_text.trim() !== '' && (
        <>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="div">
                  📝 Detected Text
                </Typography>
                <Box>
                  <Chip
                    label={`${scanResult.detected_language.toUpperCase()}`}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`${(scanResult.confidence_score * 100).toFixed(1)}% confidence`}
                    color={getConfidenceColor(scanResult.confidence_score)}
                    size="small"
                  />
                </Box>
              </Box>

              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  backgroundColor: 'action.hover',
                  p: 2,
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                {scanResult.detected_text}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => handleCopy(scanResult.detected_text)}
                  color={copied ? 'success' : 'default'}
                >
                  {copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                </IconButton>
                <TextToSpeech text={scanResult.detected_text} language={scanResult.detected_language} />
              </Box>
            </CardContent>
          </Card>

          <Divider sx={{ my: 3 }} />

          {/* Translation Section - Only show if there's text */}
          <Box>
            <Typography variant="h6" gutterBottom>
              🌐 Translate
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-end' }}>
              <Box sx={{ flex: 1 }}>
                <LanguageSelector
                  value={targetLanguage}
                  onChange={setTargetLanguage}
                  disabled={translating}
                />
              </Box>
              <Button
                variant="contained"
                startIcon={translating ? <CircularProgress size={20} /> : <TranslateIcon />}
                onClick={handleTranslate}
                disabled={translating || !scanResult.detected_text}
              >
                {translating ? 'Translating...' : 'Translate'}
              </Button>
            </Box>

            {translation && (
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      Translated Text
                    </Typography>
                    <Chip
                      label={translation.target_language.toUpperCase()}
                      size="small"
                      color="primary"
                    />
                  </Box>

                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      backgroundColor: 'action.hover',
                      p: 2,
                      borderRadius: 1,
                      mb: 2,
                    }}
                  >
                    {translation.translated_text}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(translation.translated_text)}
                      color={copied ? 'success' : 'default'}
                    >
                      {copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                    </IconButton>
                    <TextToSpeech text={translation.translated_text} language={translation.target_language} />
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </>
      )}

      {/* Message if no text on sign */}
      {(!scanResult.detected_text || scanResult.detected_text.trim() === '') && scanResult.sign_detected && (
        <Alert severity="info" sx={{ mt: 2 }}>
          ℹ️ This sign was identified by its visual characteristics (shape, color, symbols). No text was detected.
        </Alert>
      )}
    </Paper>
  );
};

export default ResultDisplay;

