import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './App/App';

const theme = createTheme({
  typography: {
    fontFamily: '"Rubik", sans-serif',
    h3: {
      fontSize: '40px',
      fontWeight: 800
    },
    h4: {
      fontSize: '24px',
      fontWeight: 600
    },
    h5: {
      fontSize: '20px',
      fontWeight: 300
    },
    body1: {
      fontSize: '20px',
      fontWeight: 400
    },
    body2: {
      fontSize: '15px',
      fontWeight: 400,
      fontStyle: "italic"
    },
    h6: {
      fontSize: '24px',
      fontWeight: 700
    }
  },
  palette: {
    primary: { main: '#4b6ea5' },
    secondary: { main: '#ce93d8' }
  }
});


const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);