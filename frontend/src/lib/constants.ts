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
  // Project Management
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/[id]',
  PROJECT_TASKS: '/projects/[id]/tasks',
  TASKS: '/tasks',
  // Administration
  ADMIN_USERS: '/admin/users',
  ADMIN_CATEGORIES: '/admin/categories',
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
  USERS: {
    LIST: '/api/users',
    DETAIL: '/api/users/:id',
  },
  PROJECTS: {
    LIST: '/api/projects',
    DETAIL: '/api/projects/:id',
    MEMBERS: '/api/projects/:id/members',
    TASKS: '/api/projects/:id/tasks',
  },
  TASKS: {
    LIST: '/api/tasks',
    DETAIL: '/api/tasks/:id',
    MY_TASKS: '/api/tasks/my',
  },
  CATEGORIES: {
    LIST: '/api/categories',
    TREE: '/api/categories/tree',
    DETAIL: '/api/categories/:id',
  },
} as const;
