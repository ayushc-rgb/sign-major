import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Alert,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import CloseIcon from '@mui/icons-material/Close';

const CameraCapture = ({ onCapture, disabled }) => {
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });

      setStream(mediaStream);
      setCameraActive(true);
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, cameraActive]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        onCapture(file);
        stopCamera();
      }
    }, 'image/jpeg', 0.95);
  };

  useEffect(() => {
    if (cameraActive && facingMode) {
      startCamera();
    }
  }, [facingMode]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        📸 Camera Capture
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!cameraActive ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PhotoCameraIcon />}
            onClick={startCamera}
            disabled={disabled}
          >
            Start Camera
          </Button>
        </Box>
      ) : (
        <Box>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: '640px',
              margin: '0 auto',
              backgroundColor: '#000',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: '100%',
                display: 'block',
              }}
            />
            
            <IconButton
              onClick={stopCamera}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>

            <IconButton
              onClick={switchCamera}
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
              }}
            >
              <CameraswitchIcon />
            </IconButton>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={capturePhoto}
              startIcon={<PhotoCameraIcon />}
              disabled={disabled}
            >
              Capture Photo
            </Button>
          </Box>
        </Box>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Paper>
  );
};

export default CameraCapture;

