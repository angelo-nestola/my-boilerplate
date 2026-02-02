'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from './api';
import { ROUTES } from '@/lib/constants';
import type { AuthContextType, LoginRequest, RegisterRequest, User } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Mark as mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication on mount
  useEffect(() => {
    if (!mounted) return;

    const checkAuth = async () => {
      if (authApi.hasStoredTokens()) {
        try {
          const profile = await authApi.getProfile();
          setUser(profile);
        } catch {
          // Token invalid or expired, clear it
          authApi.logout();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [mounted]);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      await authApi.login(credentials);
      const profile = await authApi.getProfile();
      setUser(profile);
      router.push(ROUTES.DASHBOARD);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      await authApi.register(data);
      const profile = await authApi.getProfile();
      setUser(profile);
      router.push(ROUTES.DASHBOARD);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    router.push(ROUTES.LOGIN);
  }, [router]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
