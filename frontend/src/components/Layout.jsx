import { AppBar, Toolbar, Typography, IconButton, Container, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children }) => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 600,
            }}
          >
            📸 Sign Vision
          </Typography>
          
          <IconButton
            component={Link}
            to="/"
            color="inherit"
            aria-label="home"
            sx={{ mr: 1 }}
          >
            <HomeIcon />
          </IconButton>
          
          <IconButton
            component={Link}
            to="/history"
            color="inherit"
            aria-label="history"
            sx={{ mr: 1 }}
          >
            <HistoryIcon />
          </IconButton>
          
          <IconButton onClick={toggleDarkMode} color="inherit" aria-label="toggle theme">
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {children}
      </Container>
      
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[900],
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2025 Sign Vision - Multilingual Sign Detection
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;

