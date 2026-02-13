'use client';

import { Grid, Card, CardContent, Typography, Box, Skeleton, Alert, AlertTitle, Button } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import HubIcon from '@mui/icons-material/Hub';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { useOrgDashboard } from '@/features/organization';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

function StatCard({
  title,
  value,
  icon,
  color,
  loading,
  onClick,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            }
          : undefined,
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${color}15`,
              color: color,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          {loading ? (
            <Skeleton variant="text" width={60} height={40} />
          ) : (
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          )}
        </Box>
        <Typography color="text.secondary" variant="body2">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: dashboard, isLoading } = useOrgDashboard();

  const failedChecks = dashboard?.sanityChecks.filter((c) => !c.passed) ?? [];

  return (
    <Box>
      <Typography variant="h5" color="text.primary" sx={{ fontWeight: 600, mb: 3 }}>
        Dashboard
      </Typography>

      {failedChecks.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Organization Setup Required</AlertTitle>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {failedChecks.map((check) => (
              <li key={check.code}>{check.description}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: true }}>
          <StatCard
            title="Orbits"
            value={dashboard?.orbitCount ?? 0}
            icon={<PublicIcon />}
            color="#1976d2"
            loading={isLoading}
            onClick={() => router.push(ROUTES.ORGANIZATION_UNITS)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: true }}>
          <StatCard
            title="Competence Centers"
            value={dashboard?.ccCount ?? 0}
            icon={<HubIcon />}
            color="#9c27b0"
            loading={isLoading}
            onClick={() => router.push(ROUTES.ORGANIZATION_UNITS)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: true }}>
          <StatCard
            title="Technical Hub"
            value={dashboard?.techHubCount ?? 0}
            icon={<AccountTreeIcon />}
            color="#ed6c02"
            loading={isLoading}
            onClick={() => router.push(ROUTES.ORGANIZATION_UNITS)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: true }}>
          <StatCard
            title="Staff Groups"
            value={dashboard?.staffGroupCount ?? 0}
            icon={<GroupsIcon />}
            color="#0288d1"
            loading={isLoading}
            onClick={() => router.push(ROUTES.ORGANIZATION_UNITS)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: true }}>
          <StatCard
            title="Active People"
            value={dashboard?.activePersonCount ?? 0}
            icon={<PeopleIcon />}
            color="#2e7d32"
            loading={isLoading}
            onClick={() => router.push(ROUTES.ORGANIZATION_PEOPLE)}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={() => router.push(ROUTES.ORGANIZATION)}>
          Organization Overview
        </Button>
        <Button variant="outlined" onClick={() => router.push(ROUTES.ORGANIZATION_ROLES)}>
          Roles & Permissions
        </Button>
      </Box>
    </Box>
  );
}
