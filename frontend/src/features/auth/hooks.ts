'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from './api';
import { useAuthContext } from './context';
import type { LoginRequest, RegisterRequest, User } from './types';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

/**
 * Hook for accessing auth state and actions
 * Facade pattern: provides a simple interface to the auth feature
 */
export function useAuth() {
  return useAuthContext();
}

/**
 * Hook for fetching user profile with React Query
 * Use this when you need caching/refetching behavior
 */
export function useUser() {
  const { isAuthenticated } = useAuthContext();

  return useQuery<User>({
    queryKey: authKeys.profile(),
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const { login } = useAuthContext();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onSuccess: () => {
      // Invalidate user queries after login
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

/**
 * Hook for register mutation
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const { register } = useAuthContext();

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

/**
 * Hook for logout
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const { logout } = useAuthContext();

  return () => {
    logout();
    // Clear all cached data on logout
    queryClient.clear();
  };
}
