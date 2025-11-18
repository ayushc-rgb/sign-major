import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Scan API
export const scanImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/scan', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Translate API
export const translateText = async (text, targetLanguage, sourceLanguage = null, scanId = null) => {
  const response = await api.post('/translate', {
    text,
    target_language: targetLanguage,
    source_language: sourceLanguage,
    scan_id: scanId,
  });
  
  return response.data;
};

// Languages API
export const getLanguages = async () => {
  const response = await api.get('/languages');
  return response.data.languages;
};

// History API
export const getHistory = async (page = 1, pageSize = 10, language = null) => {
  const params = { page, page_size: pageSize };
  if (language) {
    params.language = language;
  }
  
  const response = await api.get('/history', { params });
  return response.data;
};

export const getScan = async (scanId) => {
  const response = await api.get(`/scan/${scanId}`);
  return response.data;
};

export const deleteScan = async (scanId) => {
  const response = await api.delete(`/history/${scanId}`);
  return response.data;
};

// Chatbot API
export const chatWithBot = async (message, signContext) => {
  const response = await api.post('/chat', {
    message,
    sign_context: signContext,
  });
  return response.data;
};

export default api;

