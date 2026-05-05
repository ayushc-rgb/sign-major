import { AppBar, Toolbar, Typography, IconButton, Container, Box, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';
import TrafficIcon from '@mui/icons-material/Traffic';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children }) => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              color: 'inherit',
              flexGrow: 1,
            }}
          >
            <TrafficIcon sx={{ fontSize: 22, opacity: 0.9 }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, letterSpacing: '-0.3px', fontSize: '1.1rem', color: '#F5F0E8' }}
            >
              Sign Vision
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              component={Link}
              to="/"
              color="inherit"
              aria-label="home"
              size="small"
              sx={{ opacity: 0.85, '&:hover': { opacity: 1 } }}
            >
              <HomeIcon fontSize="small" />
            </IconButton>

            <IconButton
              component={Link}
              to="/history"
              color="inherit"
              aria-label="history"
              size="small"
              sx={{ opacity: 0.85, '&:hover': { opacity: 1 } }}
            >
              <HistoryIcon fontSize="small" />
            </IconButton>

            <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'rgba(255,255,255,0.2)', height: 20, alignSelf: 'center' }} />

            <IconButton
              onClick={toggleDarkMode}
              color="inherit"
              aria-label="toggle theme"
              size="small"
              sx={{ opacity: 0.85, '&:hover': { opacity: 1 } }}
            >
              {darkMode ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {children}
      </Container>

      <Box
        component="footer"
        sx={{
          py: 2.5,
          px: 2,
          mt: 'auto',
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: '0.8rem' }}>
            © 2025 Sign Vision — AI-Powered Sign Recognition
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
