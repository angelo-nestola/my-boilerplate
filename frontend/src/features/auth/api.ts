import apiClient from '@/lib/axios';
import { API_ENDPOINTS, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/constants';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  User,
} from './types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
    return response.data;
  },

  refresh: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      data
    );
    localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<{
      userId: string;
      email: string;
      personId?: string;
      capabilities: string[];
    }>(API_ENDPOINTS.AUTH.ME);
    return {
      id: response.data.userId,
      email: response.data.email,
      emailConfirmed: true,
      createdAt: new Date().toISOString(),
      personId: response.data.personId,
      capabilities: response.data.capabilities ?? [],
    };
  },

  hasStoredTokens: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },
};
