export type ProjectRole = 'Viewer' | 'Developer' | 'Admin' | 'Owner';

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
  memberCount: number;
  taskCount: number;
}

export interface ProjectListItem {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
}

export interface CreateProjectRequest {
  name: string;
  code: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface ProjectMember {
  id: string;
  userId: string;
  userEmail: string;
  userFullName?: string | null;
  role: ProjectRole;
  joinedAt: string;
}

export interface AddProjectMemberRequest {
  userId: string;
  role?: ProjectRole;
}

export interface UpdateProjectMemberRequest {
  role: ProjectRole;
}
