import { createTheme, alpha } from '@mui/material/styles';

// Material You Design Tokens
const shape = {
  borderRadius: 16, // Base border radius for cards and containers
  pill: 9999, // For buttons and chips
};

const typography = {
  fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontWeight: 600, fontSize: '3.5rem', lineHeight: 1.2, letterSpacing: '-0.02em' },
  h2: { fontWeight: 600, fontSize: '2.75rem', lineHeight: 1.2, letterSpacing: '-0.01em' },
  h3: { fontWeight: 600, fontSize: '2.25rem', lineHeight: 1.3 },
  h4: { fontWeight: 500, fontSize: '1.75rem', lineHeight: 1.4 },
  h5: { fontWeight: 500, fontSize: '1.5rem', lineHeight: 1.5 },
  h6: { fontWeight: 500, fontSize: '1.25rem', lineHeight: 1.6 },
  subtitle1: { fontSize: '1rem', lineHeight: 1.75, letterSpacing: '0.009em' },
  subtitle2: { fontSize: '0.875rem', lineHeight: 1.57, fontWeight: 500 },
  body1: { fontSize: '1rem', lineHeight: 1.5 },
  body2: { fontSize: '0.875rem', lineHeight: 1.43 },
  button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.02em' },
};

// Elevation System (Shadows)
const shadows = [
  'none',
  '0px 1px 2px rgba(0, 0, 0, 0.08), 0px 0px 2px rgba(0, 0, 0, 0.04)', // Level 1
  '0px 2px 4px rgba(0, 0, 0, 0.08), 0px 1px 6px rgba(0, 0, 0, 0.04)', // Level 2
  '0px 4px 8px rgba(0, 0, 0, 0.10), 0px 2px 8px rgba(0, 0, 0, 0.06)', // Level 3
  '0px 6px 12px rgba(0, 0, 0, 0.12), 0px 4px 12px rgba(0, 0, 0, 0.08)', // Level 4
  '0px 8px 16px rgba(0, 0, 0, 0.14), 0px 6px 16px rgba(0, 0, 0, 0.10)', // Level 5
  ...Array(19).fill('none'), // Fill rest to match MUI expectation
];

const darkShadows = [
  'none',
  '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 0px 2px rgba(0, 0, 0, 0.2)',
  '0px 2px 4px rgba(0, 0, 0, 0.3), 0px 1px 6px rgba(0, 0, 0, 0.2)',
  '0px 4px 8px rgba(0, 0, 0, 0.4), 0px 2px 8px rgba(0, 0, 0, 0.3)',
  '0px 6px 12px rgba(0, 0, 0, 0.5), 0px 4px 12px rgba(0, 0, 0, 0.4)',
  '0px 8px 16px rgba(0, 0, 0, 0.6), 0px 6px 16px rgba(0, 0, 0, 0.5)',
  ...Array(19).fill('none'),
];

const getComponentOverrides = (mode, palette) => ({
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: shape.pill,
        padding: '10px 24px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: mode === 'dark' ? darkShadows[2] : shadows[2],
          transform: 'translateY(-1px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
      outlined: {
        borderWidth: '1px',
        '&:hover': {
          borderWidth: '1px',
          backgroundColor: alpha(palette.primary.main, 0.08),
        },
      },
      text: {
        '&:hover': {
          backgroundColor: alpha(palette.primary.main, 0.08),
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: shape.borderRadius,
        backgroundImage: 'none',
        backgroundColor: palette.background.paper,
        border: `1px solid ${alpha(palette.divider, 0.1)}`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: mode === 'dark' ? darkShadows[3] : shadows[3],
          borderColor: alpha(palette.primary.main, 0.2),
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
      elevation1: {
        boxShadow: mode === 'dark' ? darkShadows[1] : shadows[1],
      },
      elevation2: {
        boxShadow: mode === 'dark' ? darkShadows[2] : shadows[2],
      },
      elevation3: {
        boxShadow: mode === 'dark' ? darkShadows[3] : shadows[3],
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: alpha(palette.background.paper, 0.8),
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${alpha(palette.divider, 0.1)}`,
        boxShadow: 'none',
        color: palette.text.primary,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
      },
      filled: {
        backgroundColor: alpha(palette.primary.main, 0.1),
        color: palette.primary.main,
        '&:hover': {
          backgroundColor: alpha(palette.primary.main, 0.2),
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 12,
          transition: 'all 0.2s ease',
          '&:hover fieldset': {
            borderColor: palette.primary.main,
          },
          '&.Mui-focused fieldset': {
            borderWidth: 2,
          },
        },
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
    },
  },
});

// Light Theme Palette
const lightPalette = {
  mode: 'light',
  primary: {
    main: '#6750A4', // Material You Purple
    light: '#EADDFF',
    dark: '#21005D',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#625B71',
    light: '#E8DEF8',
    dark: '#1D192B',
    contrastText: '#FFFFFF',
  },
  tertiary: {
    main: '#7D5260',
    light: '#FFD8E4',
    dark: '#31111D',
  },
  error: {
    main: '#B3261E',
    light: '#F9DEDC',
    dark: '#410E0B',
  },
  background: {
    default: '#FFFBFE',
    paper: '#FFFFFF',
    subtle: '#F7F2FA',
  },
  text: {
    primary: '#1C1B1F',
    secondary: '#49454F',
    disabled: '#1C1B1F61', // 38% opacity
  },
  divider: '#CAC4D0',
};

// Dark Theme Palette
const darkPalette = {
  mode: 'dark',
  primary: {
    main: '#D0BCFF',
    light: '#EADDFF',
    dark: '#381E72',
    contrastText: '#381E72',
  },
  secondary: {
    main: '#CCC2DC',
    light: '#E8DEF8',
    dark: '#332D41',
    contrastText: '#332D41',
  },
  tertiary: {
    main: '#EFB8C8',
    light: '#FFD8E4',
    dark: '#492532',
  },
  error: {
    main: '#F2B8B5',
    light: '#8C1D18',
    dark: '#601410',
  },
  background: {
    default: '#1C1B1F',
    paper: '#1C1B1F',
    subtle: '#25232A',
  },
  text: {
    primary: '#E6E1E5',
    secondary: '#CAC4D0',
    disabled: '#E6E1E561',
  },
  divider: '#49454F',
};

const lightTheme = createTheme({
  palette: lightPalette,
  shape,
  typography,
  shadows,
  components: getComponentOverrides('light', lightPalette),
});

const darkTheme = createTheme({
  palette: darkPalette,
  shape,
  typography,
  shadows: darkShadows,
  components: getComponentOverrides('dark', darkPalette),
});

export { lightTheme, darkTheme };
