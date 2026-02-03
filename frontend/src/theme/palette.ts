/**
 * Custom Color Palette for CleanApi Dashboard
 * Based on provided design samples
 */

export const palette = {
  // Light mode colors
  palladian: '#EEE9DF',      // Light cream - light mode background
  oatmeal: '#C9C1B1',        // Beige/tan - light mode secondary surfaces

  // Dark mode colors
  blueFantastic: '#2C3B4D',  // Dark blue - dark mode surfaces/cards
  abyssalBlue: '#1B2632',    // Very dark blue - dark mode background

  // Accent colors (both modes)
  burningFlame: '#FFB162',   // Orange - PRIMARY accent
  truffleTrouble: '#A35139', // Brownish red - secondary accent/error
} as const;

// Primary color variations
export const primary = {
  main: palette.burningFlame,
  light: '#FFCF99',
  dark: '#E09840',
  contrastText: '#1B2632',
};

// Secondary color variations
export const secondary = {
  main: palette.truffleTrouble,
  light: '#C06B50',
  dark: '#7A3D2B',
  contrastText: '#FFFFFF',
};

// Light theme specific
export const lightPalette = {
  background: {
    default: palette.palladian,
    paper: '#FFFFFF',
  },
  text: {
    primary: '#1B2632',
    secondary: '#4A5568',
    disabled: '#A0AEC0',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
};

// Dark theme specific
export const darkPalette = {
  background: {
    default: palette.abyssalBlue,
    paper: palette.blueFantastic,
  },
  text: {
    primary: '#F7FAFC',
    secondary: '#A0AEC0',
    disabled: '#4A5568',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
};

export type ThemeMode = 'light' | 'dark';
