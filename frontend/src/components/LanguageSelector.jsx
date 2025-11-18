import { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { getLanguages } from '../services/api';

const LanguageSelector = ({ value, onChange, disabled }) => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const data = await getLanguages();
        setLanguages(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load languages');
        setLoading(false);
        console.error('Language fetch error:', err);
      }
    };

    fetchLanguages();
  }, []);

  const filteredLanguages = languages.filter((lang) =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel id="language-select-label">Target Language</InputLabel>
      <Select
        labelId="language-select-label"
        value={value}
        label="Target Language"
        onChange={(e) => onChange(e.target.value)}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 400,
            },
          },
        }}
      >
        <Box sx={{ p: 1, position: 'sticky', top: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search languages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </Box>
        
        {filteredLanguages.map((lang) => (
          <MenuItem key={lang.code} value={lang.code}>
            {lang.name} ({lang.code})
          </MenuItem>
        ))}
        
        {filteredLanguages.length === 0 && (
          <MenuItem disabled>No languages found</MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;

