// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7268';

// Auth
export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  // Organization
  ORGANIZATION: '/organization',
  ORGANIZATION_CHART: '/organization/chart',
  ORGANIZATION_UNITS: '/organization/units',
  ORGANIZATION_PEOPLE: '/organization/people',
  ORGANIZATION_ROLES: '/organization/roles',
  // Design System
  DESIGN_SYSTEM: '/design-system',
  // Settings
  SETTINGS_PREFERENCES: '/settings/preferences',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  ORG_UNITS: {
    LIST: '/api/org-units',
    TREE: '/api/org-units/tree',
    DETAIL: (id: string) => `/api/org-units/${id}`,
    MEMBERS: (id: string) => `/api/org-units/${id}/members`,
  },
  PERSONS: {
    LIST: '/api/persons',
    DETAIL: (id: string) => `/api/persons/${id}`,
    ASSIGNMENTS: (id: string) => `/api/persons/${id}/assignments`,
    ASSIGNMENT_DETAIL: (personId: string, id: string) => `/api/persons/${personId}/assignments/${id}`,
  },
  ORG_ROLES: {
    LIST: '/api/org-roles',
    CAPABILITIES: '/api/capabilities',
    UPDATE_CAPABILITIES: (roleId: string) => `/api/org-roles/${roleId}/capabilities`,
  },
  ORGANIZATION: {
    DASHBOARD: '/api/organization/dashboard',
    SANITY_CHECK: '/api/organization/sanity-check',
  },
} as const;
