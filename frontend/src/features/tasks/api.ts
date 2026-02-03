import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/lib/constants';
import type {
  Task,
  TaskListItem,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilter,
  TaskStatus,
} from './types';

export const tasksApi = {
  getAll: async (filter?: TaskFilter): Promise<TaskListItem[]> => {
    const params = new URLSearchParams();
    if (filter?.projectId) params.append('projectId', filter.projectId);
    if (filter?.assigneeId) params.append('assigneeId', filter.assigneeId);
    if (filter?.status) params.append('status', filter.status);
    if (filter?.priority) params.append('priority', filter.priority);
    if (filter?.search) params.append('search', filter.search);

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.TASKS.LIST}?${queryString}`
      : API_ENDPOINTS.TASKS.LIST;

    const response = await apiClient.get<TaskListItem[]>(url);
    return response.data;
  },

  getMyTasks: async (): Promise<TaskListItem[]> => {
    const response = await apiClient.get<TaskListItem[]>(API_ENDPOINTS.TASKS.MY_TASKS);
    return response.data;
  },

  getById: async (id: string): Promise<Task> => {
    const response = await apiClient.get<Task>(
      API_ENDPOINTS.TASKS.DETAIL.replace(':id', id)
    );
    return response.data;
  },

  create: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await apiClient.post<Task>(API_ENDPOINTS.TASKS.LIST, data);
    return response.data;
  },

  update: async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    const response = await apiClient.put<Task>(
      API_ENDPOINTS.TASKS.DETAIL.replace(':id', id),
      data
    );
    return response.data;
  },

  updateStatus: async (id: string, status: TaskStatus): Promise<Task> => {
    const response = await apiClient.patch<Task>(
      `${API_ENDPOINTS.TASKS.DETAIL.replace(':id', id)}/status`,
      status
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.TASKS.DETAIL.replace(':id', id));
  },
};
