'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import type { ThemeMode } from './palette';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme-mode';

interface ThemeModeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
}

export function ThemeModeProvider({
  children,
  defaultMode = 'light',
}: ThemeModeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (stored && (stored === 'light' || stored === 'dark')) {
        setModeState(stored);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  // Persist to localStorage when mode changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
      } catch {
        // localStorage not available
      }
    }
  }, [mode, mounted]);

  const toggleTheme = useCallback(() => {
    setModeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      toggleTheme,
      setMode,
      isDark: mode === 'dark',
    }),
    [mode, toggleTheme, setMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
}
