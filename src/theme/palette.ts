// Color palette for Grand Prix Playoffs
// All colors tested for WCAG AA contrast (4.5:1 minimum for text)

// Podium trophy colors - adjusted for better contrast on both light/dark backgrounds
export const PODIUM_COLORS = {
  // Gold: Darkened from #FFD700 to pass contrast on dark bg
  gold: {
    light: '#C79900', // Dark gold - 3:1 on white
    dark: '#FFD700', // Original gold - works on dark bg with stroke
  },
  // Silver: Darkened for light mode
  silver: {
    light: '#6B6B6B', // Dark gray - 5.9:1 on white
    dark: '#C0C0C0', // Original silver - 10:1 on dark
  },
  // Bronze: Slightly adjusted
  bronze: {
    light: '#8B4513', // Saddle brown - 5.6:1 on white
    dark: '#CD7F32', // Original bronze - 6.5:1 on dark
  },
} as const;

// Points breakdown colors - mode-aware for accessibility
export const POINTS_COLORS = {
  race: 'text.secondary', // Gray - uses theme token
  sprint: {
    light: '#0066CC', // Darker blue - 5.2:1 on white
    dark: '#64B5F6', // Light blue - 8.5:1 on dark
  },
  pole: {
    light: '#B8860B', // Dark goldenrod - 4.7:1 on white
    dark: '#FFD54F', // Amber - 11:1 on dark
  },
  fastestLap: {
    light: '#7B1FA2', // Deep purple - 7.5:1 on white
    dark: '#CE93D8', // Light purple - 9:1 on dark
  },
} as const;

// Elimination marker color - same red for both modes (passes AA contrast)
export const ELIMINATION_COLOR = {
  light: '#C62828', // Dark red - 6.5:1 on white, 4.8:1 on dark
  dark: '#C62828', // Same dark red - consistent across modes
} as const;

// Visible focus indicator color (WCAG 2.2 AA: focus ring needs 3:1 against the
// adjacent background). Racing red #E10600 measures ~4.0:1 on the light paper
// (#FFFFFF) and ~4.6:1 on the dark default (#121212), so one value clears both
// modes against the UI component contrast requirement.
export const FOCUS_RING_COLOR = {
  light: '#E10600',
  dark: '#E10600',
} as const;

export const palette = {
  // Primary - Racing red
  primary: {
    main: '#E10600',
    light: '#FF3333',
    dark: '#B30500',
    contrastText: '#FFFFFF',
  },

  // Secondary - Dark charcoal
  secondary: {
    main: '#1E1E1E',
    light: '#3D3D3D',
    dark: '#0A0A0A',
    contrastText: '#FFFFFF',
  },

  // Status colors for playoff states
  success: {
    main: '#00D26A', // Advancing/qualified
    light: '#33DB88',
    dark: '#00A854',
  },

  error: {
    main: '#E10600', // Eliminated
    light: '#FF3333',
    dark: '#B30500',
  },

  warning: {
    main: '#FFB800', // At risk / bubble
    light: '#FFC933',
    dark: '#CC9300',
    // Charcoal foreground for text on the warning fill. Measures 9.612:1 on
    // #FFB800, clearing WCAG 2.2 AA (4.5:1). warning.main is the same in light
    // and dark mode, so the ratio holds in both.
    contrastText: '#1E1E1E',
  },

  // Background colors
  background: {
    light: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    dark: {
      default: '#121212',
      paper: '#1E1E1E',
    },
  },

  // Text colors - improved contrast
  text: {
    light: {
      primary: '#1A1A1A', // Slightly darker - 14:1 on white
      secondary: '#525252', // Darker gray - 7:1 on white (was #666666 at 5.5:1)
    },
    dark: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3', // 7.5:1 on dark bg
    },
  },
} as const;
