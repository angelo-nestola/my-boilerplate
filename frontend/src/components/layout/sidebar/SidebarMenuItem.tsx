'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  alpha,
} from '@mui/material';
import { useSidebar } from '../SidebarContext';
import type { MenuItem } from '@/config/menuConfig';

interface SidebarMenuItemProps {
  item: MenuItem;
  depth?: number;
  onItemClick?: () => void;
}

export function SidebarMenuItem({ item, depth = 0, onItemClick }: SidebarMenuItemProps) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();

  if (!item.path) return null;

  const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
  const paddingLeft = isCollapsed ? 2 : 2 + depth * 2;

  const buttonContent = (
    <ListItemButton
      component={Link}
      href={item.path}
      onClick={onItemClick}
      sx={{
        minHeight: 48,
        px: paddingLeft,
        borderRadius: 2,
        mx: 1,
        mb: 0.5,
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        '&.Mui-selected': {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
          color: 'primary.main',
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.25),
          },
          '& .MuiListItemIcon-root': {
            color: 'primary.main',
          },
        },
        '&:hover': {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
        },
      }}
      selected={isActive}
    >
      <ListItemIcon
        sx={{
          minWidth: isCollapsed ? 0 : 40,
          justifyContent: 'center',
          color: isActive ? 'primary.main' : 'text.secondary',
        }}
      >
        {item.icon}
      </ListItemIcon>
      {!isCollapsed && (
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{
            fontSize: depth > 0 ? '0.875rem' : '0.9375rem',
            fontWeight: isActive ? 600 : 400,
          }}
        />
      )}
    </ListItemButton>
  );

  return (
    <ListItem disablePadding sx={{ display: 'block' }}>
      {isCollapsed ? (
        <Tooltip title={item.label} placement="right" arrow>
          {buttonContent}
        </Tooltip>
      ) : (
        buttonContent
      )}
    </ListItem>
  );
}
