import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/lib/constants';
import {
  Project,
  ProjectListItem,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectMember,
  AddProjectMemberRequest,
  UpdateProjectMemberRequest,
} from './types';

export const projectsApi = {
  getAll: async (search?: string, isActive?: boolean): Promise<ProjectListItem[]> => {
    const params: Record<string, string | boolean> = {};
    if (search) params.search = search;
    if (isActive !== undefined) params.isActive = isActive;
    const response = await apiClient.get<ProjectListItem[]>(API_ENDPOINTS.PROJECTS.LIST, {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await apiClient.get<Project>(
      API_ENDPOINTS.PROJECTS.DETAIL.replace(':id', id)
    );
    return response.data;
  },

  getByCode: async (code: string): Promise<Project> => {
    const response = await apiClient.get<Project>(`${API_ENDPOINTS.PROJECTS.LIST}/code/${code}`);
    return response.data;
  },

  create: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await apiClient.post<Project>(API_ENDPOINTS.PROJECTS.LIST, data);
    return response.data;
  },

  update: async (id: string, data: UpdateProjectRequest): Promise<Project> => {
    const response = await apiClient.put<Project>(
      API_ENDPOINTS.PROJECTS.DETAIL.replace(':id', id),
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.PROJECTS.DETAIL.replace(':id', id));
  },

  // Members
  getMembers: async (projectId: string): Promise<ProjectMember[]> => {
    const response = await apiClient.get<ProjectMember[]>(
      API_ENDPOINTS.PROJECTS.MEMBERS.replace(':id', projectId)
    );
    return response.data;
  },

  addMember: async (projectId: string, data: AddProjectMemberRequest): Promise<ProjectMember> => {
    const response = await apiClient.post<ProjectMember>(
      API_ENDPOINTS.PROJECTS.MEMBERS.replace(':id', projectId),
      data
    );
    return response.data;
  },

  updateMember: async (
    projectId: string,
    memberId: string,
    data: UpdateProjectMemberRequest
  ): Promise<ProjectMember> => {
    const response = await apiClient.put<ProjectMember>(
      `${API_ENDPOINTS.PROJECTS.MEMBERS.replace(':id', projectId)}/${memberId}`,
      data
    );
    return response.data;
  },

  removeMember: async (projectId: string, memberId: string): Promise<void> => {
    await apiClient.delete(
      `${API_ENDPOINTS.PROJECTS.MEMBERS.replace(':id', projectId)}/${memberId}`
    );
  },
};
