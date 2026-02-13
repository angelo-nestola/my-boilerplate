'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orgApi } from './api';
import { useToast } from '@/components/ui';
import type {
  CreateOrgUnit,
  UpdateOrgUnit,
  CreatePerson,
  UpdatePerson,
  CreateOrgAssignment,
  UpdateOrgAssignment,
  OrgUnitType,
} from './types';

function getErrorMessage(error: unknown): string {
  const err = error as { response?: { data?: { errors?: string[] } }; message?: string };
  return err.response?.data?.errors?.[0] || err.message || 'An error occurred';
}

export const orgKeys = {
  all: ['organization'] as const,
  units: () => [...orgKeys.all, 'units'] as const,
  unitList: (search?: string, type?: OrgUnitType) => [...orgKeys.units(), { search, type }] as const,
  unitDetail: (id: string) => [...orgKeys.units(), id] as const,
  unitMembers: (id: string) => [...orgKeys.units(), id, 'members'] as const,
  persons: () => [...orgKeys.all, 'persons'] as const,
  personList: (search?: string, isActive?: boolean) => [...orgKeys.persons(), { search, isActive }] as const,
  personDetail: (id: string) => [...orgKeys.persons(), id] as const,
  roles: () => [...orgKeys.all, 'roles'] as const,
  capabilities: () => [...orgKeys.all, 'capabilities'] as const,
  unitTree: () => [...orgKeys.units(), 'tree'] as const,
  dashboard: () => [...orgKeys.all, 'dashboard'] as const,
  sanityCheck: () => [...orgKeys.all, 'sanity-check'] as const,
};

// OrgUnit hooks
export function useOrgUnits(search?: string, type?: OrgUnitType) {
  return useQuery({
    queryKey: orgKeys.unitList(search, type),
    queryFn: () => orgApi.getOrgUnits(search, type),
  });
}

export function useOrgUnitTree() {
  return useQuery({
    queryKey: orgKeys.unitTree(),
    queryFn: () => orgApi.getOrgUnitTree(),
  });
}

export function useOrgUnit(id: string) {
  return useQuery({
    queryKey: orgKeys.unitDetail(id),
    queryFn: () => orgApi.getOrgUnit(id),
    enabled: !!id,
  });
}

export function useOrgUnitMembers(id: string) {
  return useQuery({
    queryKey: orgKeys.unitMembers(id),
    queryFn: () => orgApi.getOrgUnitMembers(id),
    enabled: !!id,
  });
}

export function useCreateOrgUnit() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: CreateOrgUnit) => orgApi.createOrgUnit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.units() });
      showSuccess('Organization unit created');
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
}

export function useUpdateOrgUnit() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrgUnit }) => orgApi.updateOrgUnit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.units() });
      showSuccess('Organization unit updated');
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
}

export function useDeleteOrgUnit() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (id: string) => orgApi.deleteOrgUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.units() });
      showSuccess('Organization unit deleted');
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
}

// Person hooks
export function usePersons(search?: string, isActive?: boolean) {
  return useQuery({
    queryKey: orgKeys.personList(search, isActive),
    queryFn: () => orgApi.getPersons(search, isActive),
  });
}

export function usePerson(id: string) {
  return useQuery({
    queryKey: orgKeys.personDetail(id),
    queryFn: () => orgApi.getPerson(id),
    enabled: !!id,
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: CreatePerson) => orgApi.createPerson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.persons() });
      showSuccess('Person created');
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePerson }) => orgApi.updatePerson(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.persons() });
      showSuccess('Person updated');
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (id: string) => orgApi.deletePerson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.persons() });
      showSuccess('Person deleted');
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
}

// Assignment hooks
export function useCreateAssignment() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ personId, data }: { personId: string; data: CreateOrgAssignment }) =>
      orgApi.createAssignment(personId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.all });
      showSuccess('Assignment created');
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ personId, id }: { personId: string; id: string }) =>
      orgApi.deleteAssignment(personId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.all });
      showSuccess('Assignment removed');
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
}

// Roles & Capabilities hooks
export function useRoles() {
  return useQuery({
    queryKey: orgKeys.roles(),
    queryFn: orgApi.getRoles,
  });
}

export function useCapabilities() {
  return useQuery({
    queryKey: orgKeys.capabilities(),
    queryFn: orgApi.getCapabilities,
  });
}

export function useUpdateRoleCapabilities() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ roleId, capabilityIds }: { roleId: string; capabilityIds: string[] }) =>
      orgApi.updateRoleCapabilities(roleId, capabilityIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.roles() });
      showSuccess('Capabilities updated');
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
}

// Dashboard hooks
export function useOrgDashboard() {
  return useQuery({
    queryKey: orgKeys.dashboard(),
    queryFn: orgApi.getDashboard,
  });
}

export function useSanityCheck() {
  return useQuery({
    queryKey: orgKeys.sanityCheck(),
    queryFn: orgApi.getSanityCheck,
  });
}
