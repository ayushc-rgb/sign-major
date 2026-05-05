import { createTheme } from '@mui/material/styles';

const baseTypography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h3: { fontWeight: 700, letterSpacing: '-0.5px' },
  h4: { fontWeight: 700, letterSpacing: '-0.5px' },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  subtitle1: { fontWeight: 500 },
  button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.2px' },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1E3A5F',
      light: '#2D5F9A',
      dark: '#122440',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1565C0',
      light: '#4A90D9',
      dark: '#0D47A1',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F4F6F9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A2332',
      secondary: '#4A5568',
    },
    divider: '#E2E8F0',
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
    },
  },
  typography: baseTypography,
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
          padding: '8px 20px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1E3A5F 0%, #1565C0 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #122440 0%, #0D47A1 100%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation3: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)',
        },
        elevation4: {
          boxShadow: '0 2px 6px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#1E3A5F',
          boxShadow: '0 1px 0 rgba(0,0,0,0.12)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4A90D9',
      light: '#74B3F0',
      dark: '#2D5F9A',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#64B5F6',
      light: '#90CAF9',
      dark: '#42A5F5',
      contrastText: '#000000',
    },
    background: {
      default: '#0F1923',
      paper: '#1A2640',
    },
    text: {
      primary: '#E8EDF5',
      secondary: '#94A3B8',
    },
    divider: '#2D3748',
  },
  typography: baseTypography,
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
          padding: '8px 20px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#0F1923',
          boxShadow: '0 1px 0 rgba(255,255,255,0.06)',
        },
      },
    },
  },
});
