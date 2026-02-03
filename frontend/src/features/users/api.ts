import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/lib/constants';
import { User, CreateUserRequest, UpdateUserRequest, ChangePasswordRequest } from './types';

export const usersApi = {
  getAll: async (search?: string): Promise<User[]> => {
    const params = search ? { search } : {};
    const response = await apiClient.get<User[]>(API_ENDPOINTS.USERS.LIST, { params });
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(API_ENDPOINTS.USERS.DETAIL.replace(':id', id));
    return response.data;
  },

  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<User>(API_ENDPOINTS.USERS.LIST, data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<User>(API_ENDPOINTS.USERS.DETAIL.replace(':id', id), data);
    return response.data;
  },

  changePassword: async (id: string, data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post(`${API_ENDPOINTS.USERS.DETAIL.replace(':id', id)}/change-password`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.USERS.DETAIL.replace(':id', id));
  },

  getRoles: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>(`${API_ENDPOINTS.USERS.LIST}/roles`);
    return response.data;
  },
};
