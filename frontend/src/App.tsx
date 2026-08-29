import { useEffect, useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { onUnauthorized } from './api/client';
import { EmployeesPage } from './pages/EmployeesPage';
import { LoginPage } from './pages/LoginPage';
import { isAuthenticated } from './services/authService';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0b5cab',
    },
    secondary: {
      main: '#1b7a4e',
    },
  },
});

function App() {
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated());

  useEffect(() => onUnauthorized(() => setAuthenticated(false)), []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {authenticated ? (
        <EmployeesPage onLogout={() => setAuthenticated(false)} />
      ) : (
        <LoginPage onLoginSuccess={() => setAuthenticated(true)} />
      )}
    </ThemeProvider>
  );
}

export default App;
