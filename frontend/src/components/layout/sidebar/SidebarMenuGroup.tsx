'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  List,
  Tooltip,
  alpha,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useSidebar } from '../SidebarContext';
import { SidebarMenuItem } from './SidebarMenuItem';
import type { MenuItem } from '@/config/menuConfig';

interface SidebarMenuGroupProps {
  item: MenuItem;
  onItemClick?: () => void;
}

export function SidebarMenuGroup({ item, onItemClick }: SidebarMenuGroupProps) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();

  // Check if any child is active
  const hasActiveChild = item.children?.some(
    (child) => child.path && (pathname === child.path || pathname.startsWith(`${child.path}/`))
  );

  const [isExpanded, setIsExpanded] = useState(hasActiveChild || false);

  const handleToggle = () => {
    if (!isCollapsed) {
      setIsExpanded((prev) => !prev);
    }
  };

  const buttonContent = (
    <ListItemButton
      onClick={handleToggle}
      sx={{
        minHeight: 48,
        px: 2,
        borderRadius: 2,
        mx: 1,
        mb: 0.5,
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        bgcolor: hasActiveChild
          ? (theme) => alpha(theme.palette.primary.main, 0.08)
          : 'transparent',
        '&:hover': {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: isCollapsed ? 0 : 40,
          justifyContent: 'center',
          color: hasActiveChild ? 'primary.main' : 'text.secondary',
        }}
      >
        {item.icon}
      </ListItemIcon>
      {!isCollapsed && (
        <>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: '0.9375rem',
              fontWeight: hasActiveChild ? 600 : 400,
              color: hasActiveChild ? 'primary.main' : 'text.primary',
            }}
          />
          {isExpanded ? (
            <ExpandMoreIcon
              sx={{ color: 'text.secondary', fontSize: 20, transition: 'transform 0.2s' }}
            />
          ) : (
            <ChevronRightIcon
              sx={{ color: 'text.secondary', fontSize: 20, transition: 'transform 0.2s' }}
            />
          )}
        </>
      )}
    </ListItemButton>
  );

  return (
    <>
      <ListItem disablePadding sx={{ display: 'block' }}>
        {isCollapsed ? (
          <Tooltip title={item.label} placement="right" arrow>
            {buttonContent}
          </Tooltip>
        ) : (
          buttonContent
        )}
      </ListItem>

      {!isCollapsed && item.children && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children.map((child) => (
              <SidebarMenuItem
                key={child.id}
                item={child}
                depth={1}
                onItemClick={onItemClick}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}
