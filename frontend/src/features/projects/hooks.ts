import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from './api';
import {
  CreateProjectRequest,
  UpdateProjectRequest,
  AddProjectMemberRequest,
  UpdateProjectMemberRequest,
} from './types';
import { useToast } from '@/components/ui';

const QUERY_KEY = 'projects';
const MEMBERS_QUERY_KEY = 'project-members';

function getErrorMessage(error: unknown): string {
  const err = error as { response?: { data?: { error?: string } }; message?: string };
  return err.response?.data?.error || err.message || 'An error occurred';
}

export function useProjects(search?: string, isActive?: boolean) {
  return useQuery({
    queryKey: [QUERY_KEY, { search, isActive }],
    queryFn: () => projectsApi.getAll(search, isActive),
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => projectsApi.getById(id!),
    enabled: !!id,
  });
}

export function useProjectByCode(code: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, 'code', code],
    queryFn: () => projectsApi.getByCode(code!),
    enabled: !!code,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectsApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      showSuccess(`Project "${data.name}" created successfully`);
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) =>
      projectsApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
      showSuccess(`Project "${data.name}" updated successfully`);
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      showSuccess('Project deleted successfully');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

// Members hooks
export function useProjectMembers(projectId: string | undefined) {
  return useQuery({
    queryKey: [MEMBERS_QUERY_KEY, projectId],
    queryFn: () => projectsApi.getMembers(projectId!),
    enabled: !!projectId,
  });
}

export function useAddProjectMember() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: AddProjectMemberRequest }) =>
      projectsApi.addMember(projectId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [MEMBERS_QUERY_KEY, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      showSuccess(`Member added successfully`);
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

export function useUpdateProjectMember() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({
      projectId,
      memberId,
      data,
    }: {
      projectId: string;
      memberId: string;
      data: UpdateProjectMemberRequest;
    }) => projectsApi.updateMember(projectId, memberId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [MEMBERS_QUERY_KEY, variables.projectId] });
      showSuccess('Member role updated');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ projectId, memberId }: { projectId: string; memberId: string }) =>
      projectsApi.removeMember(projectId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [MEMBERS_QUERY_KEY, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      showSuccess('Member removed from project');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
}
