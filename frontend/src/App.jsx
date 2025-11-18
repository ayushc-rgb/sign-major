import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MUIThemeProvider, CssBaseline } from '@mui/material';
import { useTheme } from './context/ThemeContext';
import { lightTheme, darkTheme } from './theme';
import Layout from './components/Layout';
import Home from './pages/Home';
import History from './pages/History';

function App() {
  const { darkMode } = useTheme();

  return (
    <MUIThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </Layout>
      </Router>
    </MUIThemeProvider>
  );
}

export default App;

