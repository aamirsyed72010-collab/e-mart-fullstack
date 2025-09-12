import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3b82f6', // blue-500
    },
    secondary: {
      main: '#ef4444', // red-500
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#4b5563',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00f7ff', // cyan
    },
    secondary: {
      main: '#ff00ff', // magenta
    },
    background: {
      default: '#1a1a2e',
      paper: '#2a2a4a',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#a0a0a0',
    },
  },
});

export { lightTheme, darkTheme };
