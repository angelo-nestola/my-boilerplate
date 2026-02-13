import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/lib/constants';
import type {
  OrgUnitList,
  OrgUnit,
  OrgUnitTreeNode,
  CreateOrgUnit,
  UpdateOrgUnit,
  PersonList,
  PersonDetail,
  Person,
  CreatePerson,
  UpdatePerson,
  OrgAssignment,
  CreateOrgAssignment,
  UpdateOrgAssignment,
  OrgRole,
  Capability,
  OrgDashboard,
  SanityCheck,
  OrgUnitType,
} from './types';

export const orgApi = {
  // OrgUnits
  getOrgUnits: async (search?: string, type?: OrgUnitType): Promise<OrgUnitList[]> => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (type) params.set('type', type);
    const response = await apiClient.get<OrgUnitList[]>(`${API_ENDPOINTS.ORG_UNITS.LIST}?${params}`);
    return response.data;
  },

  getOrgUnit: async (id: string): Promise<OrgUnit> => {
    const response = await apiClient.get<OrgUnit>(API_ENDPOINTS.ORG_UNITS.DETAIL(id));
    return response.data;
  },

  getOrgUnitMembers: async (id: string): Promise<OrgAssignment[]> => {
    const response = await apiClient.get<OrgAssignment[]>(API_ENDPOINTS.ORG_UNITS.MEMBERS(id));
    return response.data;
  },

  createOrgUnit: async (data: CreateOrgUnit): Promise<OrgUnit> => {
    const response = await apiClient.post<OrgUnit>(API_ENDPOINTS.ORG_UNITS.LIST, data);
    return response.data;
  },

  updateOrgUnit: async (id: string, data: UpdateOrgUnit): Promise<OrgUnit> => {
    const response = await apiClient.put<OrgUnit>(API_ENDPOINTS.ORG_UNITS.DETAIL(id), data);
    return response.data;
  },

  deleteOrgUnit: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.ORG_UNITS.DETAIL(id));
  },

  getOrgUnitTree: async (): Promise<OrgUnitTreeNode[]> => {
    const response = await apiClient.get<OrgUnitTreeNode[]>(API_ENDPOINTS.ORG_UNITS.TREE);
    return response.data;
  },

  // Persons
  getPersons: async (search?: string, isActive?: boolean): Promise<PersonList[]> => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (isActive !== undefined) params.set('isActive', String(isActive));
    const response = await apiClient.get<PersonList[]>(`${API_ENDPOINTS.PERSONS.LIST}?${params}`);
    return response.data;
  },

  getPerson: async (id: string): Promise<PersonDetail> => {
    const response = await apiClient.get<PersonDetail>(API_ENDPOINTS.PERSONS.DETAIL(id));
    return response.data;
  },

  createPerson: async (data: CreatePerson): Promise<Person> => {
    const response = await apiClient.post<Person>(API_ENDPOINTS.PERSONS.LIST, data);
    return response.data;
  },

  updatePerson: async (id: string, data: UpdatePerson): Promise<Person> => {
    const response = await apiClient.put<Person>(API_ENDPOINTS.PERSONS.DETAIL(id), data);
    return response.data;
  },

  deletePerson: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.PERSONS.DETAIL(id));
  },

  // Assignments
  getPersonAssignments: async (personId: string): Promise<OrgAssignment[]> => {
    const response = await apiClient.get<OrgAssignment[]>(API_ENDPOINTS.PERSONS.ASSIGNMENTS(personId));
    return response.data;
  },

  createAssignment: async (personId: string, data: CreateOrgAssignment): Promise<OrgAssignment> => {
    const response = await apiClient.post<OrgAssignment>(API_ENDPOINTS.PERSONS.ASSIGNMENTS(personId), data);
    return response.data;
  },

  updateAssignment: async (personId: string, id: string, data: UpdateOrgAssignment): Promise<OrgAssignment> => {
    const response = await apiClient.put<OrgAssignment>(API_ENDPOINTS.PERSONS.ASSIGNMENT_DETAIL(personId, id), data);
    return response.data;
  },

  deleteAssignment: async (personId: string, id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.PERSONS.ASSIGNMENT_DETAIL(personId, id));
  },

  // Roles & Capabilities
  getRoles: async (): Promise<OrgRole[]> => {
    const response = await apiClient.get<OrgRole[]>(API_ENDPOINTS.ORG_ROLES.LIST);
    return response.data;
  },

  getCapabilities: async (): Promise<Capability[]> => {
    const response = await apiClient.get<Capability[]>(API_ENDPOINTS.ORG_ROLES.CAPABILITIES);
    return response.data;
  },

  updateRoleCapabilities: async (roleId: string, capabilityIds: string[]): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.ORG_ROLES.UPDATE_CAPABILITIES(roleId), { capabilityIds });
  },

  // Dashboard
  getDashboard: async (): Promise<OrgDashboard> => {
    const response = await apiClient.get<OrgDashboard>(API_ENDPOINTS.ORGANIZATION.DASHBOARD);
    return response.data;
  },

  getSanityCheck: async (): Promise<SanityCheck[]> => {
    const response = await apiClient.get<SanityCheck[]>(API_ENDPOINTS.ORGANIZATION.SANITY_CHECK);
    return response.data;
  },
};
