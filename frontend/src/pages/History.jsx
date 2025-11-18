import {
  Box,
  Typography,
  Paper,
} from '@mui/material';
import ScanHistory from '../components/ScanHistory';

const History = () => {
  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              : 'linear-gradient(135deg, #4b4b4b 0%, #1a1a1a 100%)',
          color: 'white',
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold">
          📜 Scan History
        </Typography>
        <Typography variant="body1">
          View and manage your previous scans
        </Typography>
      </Paper>

      <ScanHistory />
    </Box>
  );
};

export default History;

