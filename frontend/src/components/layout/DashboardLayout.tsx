'use client';

import { Box, Toolbar, useTheme } from '@mui/material';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SidebarProvider, useSidebar } from './SidebarContext';
import { AuthGuard } from '@/components/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Inner layout component that uses sidebar context
 */
function DashboardLayoutInner({ children }: DashboardLayoutProps) {
  const theme = useTheme();
  const { sidebarWidth } = useSidebar();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header />
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          width: { md: `calc(100% - ${sidebarWidth}px)` },
          ml: { md: `${sidebarWidth}px` },
          minHeight: '100vh',
          bgcolor: 'background.default',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 56 } }} /> {/* Spacer for fixed AppBar */}
        {children}
      </Box>
    </Box>
  );
}

/**
 * Main DashboardLayout that wraps everything with providers
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <DashboardLayoutInner>{children}</DashboardLayoutInner>
      </SidebarProvider>
    </AuthGuard>
  );
}
