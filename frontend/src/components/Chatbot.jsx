import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Collapse,
  Button,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import { chatWithBot } from '../services/api';

const Chatbot = ({ signData, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your Sign Vision AI assistant. I can answer any questions about the sign you just scanned. Feel free to ask me anything!`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestedQuestions = [
    "What does this sign mean?",
    "Where would I typically see this sign?",
    "Are there any safety concerns?",
    "What should I do when I see this sign?",
  ];

  const handleSend = async (question = null) => {
    const messageText = question || input.trim();
    if (!messageText || loading) return;

    // Add user message
    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send to backend with sign context
      const response = await chatWithBot(messageText, signData);
      
      // Add bot response
      const botMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      // Extract error message
      let errorText = 'Sorry, I encountered an error. Please try again.';
      if (error.response?.data?.detail) {
        errorText = `Error: ${error.response.data.detail}`;
      } else if (error.message) {
        errorText = `Error: ${error.message}`;
      }
      
      const errorMessage = {
        role: 'assistant',
        content: errorText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: { xs: '90%', sm: '400px' },
        maxHeight: expanded ? '600px' : '60px',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        zIndex: 1000,
        background: 'linear-gradient(135deg, #1E3A5F 0%, #1565C0 100%)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ backgroundColor: 'white', color: '#1E3A5F' }}>
            <SmartToyIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" color="white">
              Sign Assistant
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Ask me anything!
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton sx={{ color: 'white' }} onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
          {onClose && (
            <IconButton sx={{ color: 'white' }} onClick={(e) => { e.stopPropagation(); onClose(); }}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Chat Content */}
      <Collapse in={expanded}>
        <Box
          sx={{
            height: '400px',
            backgroundColor: 'white',
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 1,
              }}
            >
              {message.role === 'assistant' && (
                <Avatar sx={{ backgroundColor: '#1E3A5F', width: 32, height: 32 }}>
                  <SmartToyIcon fontSize="small" />
                </Avatar>
              )}
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '75%',
                  backgroundColor: message.role === 'user' ? '#1E3A5F' : '#f5f5f5',
                  color: message.role === 'user' ? 'white' : 'black',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    opacity: 0.7,
                    fontSize: '0.65rem',
                  }}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Paper>
              {message.role === 'user' && (
                <Avatar sx={{ backgroundColor: '#1565C0', width: 32, height: 32 }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
              )}
            </Box>
          ))}
          
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ backgroundColor: '#1E3A5F', width: 32, height: 32 }}>
                <SmartToyIcon fontSize="small" />
              </Avatar>
              <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                <CircularProgress size={20} sx={{ color: '#1E3A5F' }} />
              </Paper>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <Box sx={{ p: 2, backgroundColor: '#f9f9f9', borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Quick questions:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {suggestedQuestions.map((question, index) => (
                <Chip
                  key={index}
                  label={question}
                  onClick={() => handleSend(question)}
                  size="small"
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#1E3A5F',
                      color: 'white',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Input */}
        <Box
          sx={{
            p: 2,
            backgroundColor: 'white',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            gap: 1,
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Ask about this sign..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
          />
          <IconButton
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            sx={{
              backgroundColor: '#1E3A5F',
              color: 'white',
              '&:hover': {
                backgroundColor: '#0D47A1',
              },
              '&:disabled': {
                backgroundColor: '#e0e0e0',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default Chatbot;

