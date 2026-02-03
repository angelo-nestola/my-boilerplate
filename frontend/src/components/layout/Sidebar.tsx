'use client';

import {
  Drawer,
  List,
  Box,
  Typography,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useSidebar, SIDEBAR_WIDTH_EXPANDED, SIDEBAR_WIDTH_COLLAPSED } from './SidebarContext';
import { SidebarMenuItem } from './sidebar/SidebarMenuItem';
import { SidebarMenuGroup } from './sidebar/SidebarMenuGroup';
import { menuConfig } from '@/config/menuConfig';

export function Sidebar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile, sidebarWidth } = useSidebar();

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header / Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          p: 2,
          minHeight: 64,
        }}
      >
        {!isCollapsed && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              letterSpacing: '-0.5px',
            }}
          >
            CleanApi
          </Typography>
        )}
        {isCollapsed && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            CA
          </Typography>
        )}
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Menu Items */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          py: 2,
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 3,
            bgcolor: (theme) => alpha(theme.palette.text.primary, 0.1),
          },
        }}
      >
        <List component="nav" disablePadding>
          {menuConfig.map((item) =>
            item.children ? (
              <SidebarMenuGroup
                key={item.id}
                item={item}
                onItemClick={isMobile ? closeMobile : undefined}
              />
            ) : (
              <SidebarMenuItem
                key={item.id}
                item={item}
                onItemClick={isMobile ? closeMobile : undefined}
              />
            )
          )}
        </List>
      </Box>

      {/* Collapse Toggle (Desktop only) */}
      {!isMobile && (
        <>
          <Divider sx={{ mx: 2 }} />
          <Box
            sx={{
              display: 'flex',
              justifyContent: isCollapsed ? 'center' : 'flex-end',
              p: 1,
            }}
          >
            <IconButton
              onClick={toggleCollapse}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main',
                },
              }}
            >
              {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Box>
        </>
      )}
    </Box>
  );

  // Mobile drawer (temporary)
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={isMobileOpen}
        onClose={closeMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: SIDEBAR_WIDTH_EXPANDED,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // Desktop drawer (permanent)
  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: sidebarWidth,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
      open
    >
      {drawerContent}
    </Drawer>
  );
}

// Export for backwards compatibility and DashboardLayout
export { SIDEBAR_WIDTH_EXPANDED, SIDEBAR_WIDTH_COLLAPSED };
