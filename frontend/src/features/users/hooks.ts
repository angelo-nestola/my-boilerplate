import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from './api';
import { CreateUserRequest, UpdateUserRequest, ChangePasswordRequest } from './types';
import { useToast } from '@/components/ui';

function getErrorMessage(error: unknown): string {
  const err = error as { response?: { data?: { error?: string } }; message?: string };
  return err.response?.data?.error || err.message || 'An error occurred';
}

export const userKeys = {
  all: ['users'] as const,
  list: (search?: string) => [...userKeys.all, 'list', search] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
  roles: () => [...userKeys.all, 'roles'] as const,
};

export function useUsers(search?: string) {
  return useQuery({
    queryKey: userKeys.list(search),
    queryFn: () => usersApi.getAll(search),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: userKeys.roles(),
    queryFn: () => usersApi.getRoles(),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => usersApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      showSuccess(`User "${data.email}" created successfully`);
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      usersApi.update(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      showSuccess(`User updated successfully`);
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

export function useChangePassword() {
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangePasswordRequest }) =>
      usersApi.changePassword(id, data),
    onSuccess: () => {
      showSuccess('Password changed successfully');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      showSuccess('User deleted successfully');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}
