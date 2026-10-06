import { createTheme, type ThemeOptions } from '@mui/material/styles';

import { palette, FOCUS_RING_COLOR } from './palette';

const FOCUS_OUTLINE_WIDTH = 2; // px
const FOCUS_OUTLINE_OFFSET = 2; // px

// A single visible focus ring for every keyboard-focused interactive control.
// Driven by :focus-visible so it shows for keyboard users without appearing on
// pointer clicks. The colour is passed per mode so each theme can meet contrast.
function focusVisibleOverrides(mode: 'light' | 'dark'): ThemeOptions['components'] {
  const ringColor = mode === 'dark' ? FOCUS_RING_COLOR.dark : FOCUS_RING_COLOR.light;
  return {
    MuiCssBaseline: {
      styleOverrides: {
        // Doubled pseudo-class raises specificity to (0,2,0) so the ring beats
        // MUI component classes that reset outline to 0, e.g. MuiTableRow-root
        // on the keyboard-focusable driver rows.
        ':focus-visible:focus-visible': {
          outline: `${FOCUS_OUTLINE_WIDTH}px solid ${ringColor}`,
          outlineOffset: `${FOCUS_OUTLINE_OFFSET}px`,
        },
      },
    },
  };
}

const baseThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...baseThemeOptions,
  components: {
    ...baseThemeOptions.components,
    ...focusVisibleOverrides('light'),
  },
  palette: {
    mode: 'light',
    primary: palette.primary,
    secondary: palette.secondary,
    success: palette.success,
    error: palette.error,
    warning: palette.warning,
    background: palette.background.light,
    text: palette.text.light,
  },
});

export const darkTheme = createTheme({
  ...baseThemeOptions,
  components: {
    ...baseThemeOptions.components,
    ...focusVisibleOverrides('dark'),
  },
  palette: {
    mode: 'dark',
    primary: palette.primary,
    secondary: palette.secondary,
    success: palette.success,
    error: palette.error,
    warning: palette.warning,
    background: palette.background.dark,
    text: palette.text.dark,
  },
});
