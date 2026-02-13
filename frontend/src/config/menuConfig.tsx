import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PaletteIcon from '@mui/icons-material/Palette';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
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
    id: 'organization',
    label: 'Organization',
    icon: <BusinessIcon />,
    children: [
      {
        id: 'org-dashboard',
        label: 'Overview',
        icon: <DashboardIcon />,
        path: '/organization',
      },
      {
        id: 'org-chart',
        label: 'Org Chart',
        icon: <AccountTreeIcon />,
        path: '/organization/chart',
      },
      {
        id: 'org-units',
        label: 'Units',
        icon: <CorporateFareIcon />,
        path: '/organization/units',
      },
      {
        id: 'org-people',
        label: 'People',
        icon: <PeopleIcon />,
        path: '/organization/people',
      },
      {
        id: 'org-roles',
        label: 'Roles & Permissions',
        icon: <SecurityIcon />,
        path: '/organization/roles',
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
    ],
  },
];
