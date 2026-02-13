export type OrgUnitType = 'CompetenceCenter' | 'Orbit' | 'StaffGroup' | 'TechnicalHub';
export type PersonStatus = 'Active' | 'Inactive';
export type OrgUnitStatus = 'Active' | 'Inactive';

export interface OrgUnit {
  id: string;
  code: string;
  name: string;
  type: OrgUnitType;
  description?: string;
  domain?: string;
  status: OrgUnitStatus;
  parentId?: string;
  parentName?: string;
  createdAt: string;
  updatedAt?: string;
  memberCount: number;
  childCount: number;
}

export interface OrgUnitList {
  id: string;
  code: string;
  name: string;
  type: OrgUnitType;
  domain?: string;
  status: OrgUnitStatus;
  parentId?: string;
  parentName?: string;
  memberCount: number;
}

export interface CreateOrgUnit {
  code: string;
  name: string;
  type: OrgUnitType;
  description?: string;
  domain?: string;
  parentId?: string;
}

export interface UpdateOrgUnit {
  name?: string;
  description?: string;
  domain?: string;
  status?: OrgUnitStatus;
  parentId?: string;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: PersonStatus;
  notes?: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
  assignmentCount: number;
}

export interface PersonList {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: PersonStatus;
  assignmentCount: number;
}

export interface PersonDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: PersonStatus;
  notes?: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
  assignments: OrgAssignment[];
}

export interface CreatePerson {
  firstName: string;
  lastName: string;
  email: string;
  notes?: string;
  userId?: string;
}

export interface UpdatePerson {
  firstName?: string;
  lastName?: string;
  email?: string;
  notes?: string;
  status?: PersonStatus;
  userId?: string;
}

export interface OrgAssignment {
  id: string;
  personId: string;
  orgUnitId: string;
  orgRoleId: string;
  validFrom: string;
  validTo?: string;
  personName: string;
  orgUnitName: string;
  roleName: string;
}

export interface CreateOrgAssignment {
  personId: string;
  orgUnitId: string;
  orgRoleId: string;
  validFrom: string;
  validTo?: string;
}

export interface UpdateOrgAssignment {
  orgRoleId?: string;
  validFrom?: string;
  validTo?: string;
}

export interface OrgRole {
  roleId: string;
  roleCode: string;
  roleName: string;
  capabilityCodes: string[];
}

export interface Capability {
  id: string;
  code: string;
  name: string;
  description?: string;
  group: string;
}

export interface OrgUnitTreeNode {
  id: string;
  code: string;
  name: string;
  type: OrgUnitType;
  status: OrgUnitStatus;
  domain?: string;
  memberCount: number;
  children: OrgUnitTreeNode[];
}

export interface OrgDashboard {
  orbitCount: number;
  ccCount: number;
  staffGroupCount: number;
  techHubCount: number;
  activePersonCount: number;
  sanityChecks: SanityCheck[];
}

export interface SanityCheck {
  code: string;
  description: string;
  passed: boolean;
}
