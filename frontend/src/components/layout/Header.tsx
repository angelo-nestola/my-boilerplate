'use client';

import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useState } from 'react';
import { useAuth, useLogout } from '@/features/auth';
import { useSidebar } from './SidebarContext';
import { useThemeMode } from '@/theme';

export function Header() {
  const muiTheme = useTheme();
  const { user } = useAuth();
  const logout = useLogout();
  const { sidebarWidth, toggleMobile } = useSidebar();
  const { mode, toggleTheme, isDark } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const userInitials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.email?.[0].toUpperCase() || 'U';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${sidebarWidth}px)` },
        ml: { md: `${sidebarWidth}px` },
        transition: muiTheme.transitions.create(['width', 'margin'], {
          easing: muiTheme.transitions.easing.sharp,
          duration: muiTheme.transitions.duration.enteringScreen,
        }),
        backdropFilter: 'blur(8px)',
        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        {/* Mobile menu button */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={toggleMobile}
          sx={{
            mr: 2,
            display: { md: 'none' },
            color: 'text.primary',
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Page title - can be dynamic */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          Dashboard
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Toggle */}
          <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main',
                },
              }}
            >
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {/* User email (hidden on small screens) */}
          <Typography
            variant="body2"
            sx={{
              display: { xs: 'none', sm: 'block' },
              color: 'text.secondary',
            }}
          >
            {user?.email}
          </Typography>

          {/* User avatar */}
          <IconButton onClick={handleMenuOpen}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              {userInitials}
            </Avatar>
          </IconButton>
        </Box>

        {/* User menu dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 180,
            },
          }}
        >
          <MenuItem
            onClick={handleMenuClose}
            component="a"
            href="/profile"
          >
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
