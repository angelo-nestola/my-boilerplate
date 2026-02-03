import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import TaskIcon from '@mui/icons-material/Task';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import PaletteIcon from '@mui/icons-material/Palette';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import TuneIcon from '@mui/icons-material/Tune';
import { type ReactElement } from 'react';

export interface MenuItem {
  id: string;
  label: string;
  icon: ReactElement;
  path?: string;
  children?: MenuItem[];
}

export const menuConfig: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: <FolderIcon />,
    path: '/projects',
  },
  {
    id: 'tasks',
    label: 'My Tasks',
    icon: <TaskIcon />,
    path: '/tasks',
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: <AdminPanelSettingsIcon />,
    children: [
      {
        id: 'users',
        label: 'Team Members',
        icon: <PeopleIcon />,
        path: '/admin/users',
      },
      {
        id: 'categories',
        label: 'Task Categories',
        icon: <CategoryIcon />,
        path: '/admin/categories',
      },
    ],
  },
  {
    id: 'design-system',
    label: 'Design System',
    icon: <PaletteIcon />,
    path: '/design-system',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    children: [
      {
        id: 'profile',
        label: 'Profile',
        icon: <PersonIcon />,
        path: '/profile',
      },
      {
        id: 'preferences',
        label: 'Preferences',
        icon: <TuneIcon />,
        path: '/settings/preferences',
      },
    ],
  },
];
