'use client';

import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from '@/theme/theme';
import { ThemeModeProvider, useThemeMode } from '@/theme/ThemeContext';
import ThemeRegistry from './EmotionCacheProvider';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Inner component that applies the correct theme based on mode
 */
function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeMode();
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

/**
 * Main ThemeProvider that wraps the app with theme context and MUI theme
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ThemeRegistry>
      <ThemeModeProvider defaultMode="light">
        <ThemeWrapper>{children}</ThemeWrapper>
      </ThemeModeProvider>
    </ThemeRegistry>
  );
}
