export type TaskStatus = 'Backlog' | 'Todo' | 'InProgress' | 'Review' | 'Done' | 'Closed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Task {
  id: string;
  projectId: string;
  projectName?: string | null;
  projectCode?: string | null;
  taskNumber: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  categoryId?: string | null;
  categoryName?: string | null;
  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeEmail?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  dueDate?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  taskKey: string;
}

export interface TaskListItem {
  id: string;
  projectId: string;
  projectCode?: string | null;
  taskNumber: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  categoryName?: string | null;
  assigneeName?: string | null;
  dueDate?: string | null;
  taskKey: string;
}

export interface CreateTaskRequest {
  projectId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryId?: string;
  assigneeId?: string;
  estimatedHours?: number;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryId?: string;
  assigneeId?: string;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
}

export interface TaskFilter {
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}

export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'Backlog', label: 'Backlog', color: 'default' },
  { value: 'Todo', label: 'To Do', color: 'info' },
  { value: 'InProgress', label: 'In Progress', color: 'warning' },
  { value: 'Review', label: 'Review', color: 'secondary' },
  { value: 'Done', label: 'Done', color: 'success' },
  { value: 'Closed', label: 'Closed', color: 'error' },
];

export const TASK_PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'Low', label: 'Low', color: 'default' },
  { value: 'Medium', label: 'Medium', color: 'info' },
  { value: 'High', label: 'High', color: 'warning' },
  { value: 'Urgent', label: 'Urgent', color: 'error' },
];
