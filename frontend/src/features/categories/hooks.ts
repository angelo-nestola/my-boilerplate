import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from './api';
import { CreateCategoryRequest, UpdateCategoryRequest } from './types';
import { useToast } from '@/components/ui';

const QUERY_KEY = 'categories';

function getErrorMessage(error: unknown): string {
  const err = error as { response?: { data?: { error?: string } }; message?: string };
  return err.response?.data?.error || err.message || 'An error occurred';
}

export function useCategories() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: categoriesApi.getAll,
  });
}

export function useCategoriesTree() {
  return useQuery({
    queryKey: [QUERY_KEY, 'tree'],
    queryFn: categoriesApi.getTree,
  });
}

export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => categoriesApi.getById(id!),
    enabled: !!id,
    retry: false, // Don't retry if category doesn't exist
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoriesApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      showSuccess(`Category "${data.name}" created successfully`);
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      categoriesApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      showSuccess(`Category "${data.name}" updated successfully`);
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      showSuccess('Category deleted successfully');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}
