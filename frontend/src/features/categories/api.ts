import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/lib/constants';
import { Category, CategoryTree, CreateCategoryRequest, UpdateCategoryRequest } from './types';

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.LIST);
    return response.data;
  },

  getTree: async (): Promise<CategoryTree[]> => {
    const response = await apiClient.get<CategoryTree[]>(API_ENDPOINTS.CATEGORIES.TREE);
    return response.data;
  },

  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<Category>(
      API_ENDPOINTS.CATEGORIES.DETAIL.replace(':id', id)
    );
    return response.data;
  },

  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post<Category>(API_ENDPOINTS.CATEGORIES.LIST, data);
    return response.data;
  },

  update: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await apiClient.put<Category>(
      API_ENDPOINTS.CATEGORIES.DETAIL.replace(':id', id),
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CATEGORIES.DETAIL.replace(':id', id));
  },
};
