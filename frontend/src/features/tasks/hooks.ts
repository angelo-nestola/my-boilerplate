'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from './api';
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilter,
  TaskStatus,
} from './types';
import { useToast } from '@/components/ui';

function getErrorMessage(error: unknown): string {
  const err = error as { response?: { data?: { error?: string } }; message?: string };
  return err.response?.data?.error || err.message || 'An error occurred';
}

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filter?: TaskFilter) => [...taskKeys.lists(), filter] as const,
  myTasks: () => [...taskKeys.all, 'my'] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

export function useTasks(filter?: TaskFilter) {
  return useQuery({
    queryKey: taskKeys.list(filter),
    queryFn: () => tasksApi.getAll(filter),
  });
}

export function useMyTasks() {
  return useQuery({
    queryKey: taskKeys.myTasks(),
    queryFn: tasksApi.getMyTasks,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => tasksApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => tasksApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.myTasks() });
      showSuccess(`Task "${data.title}" created successfully`);
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) =>
      tasksApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.myTasks() });
      queryClient.setQueryData(taskKeys.detail(data.id), data);
      showSuccess(`Task "${data.title}" updated successfully`);
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksApi.updateStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.myTasks() });
      queryClient.setQueryData(taskKeys.detail(data.id), data);
      showSuccess(`Task status updated to "${data.status}"`);
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.myTasks() });
      showSuccess('Task deleted successfully');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}
