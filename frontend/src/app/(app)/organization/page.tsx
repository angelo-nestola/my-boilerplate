'use client';

import { Box, Grid, Alert, AlertTitle, Button, Skeleton, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import PublicIcon from '@mui/icons-material/Public';
import HubIcon from '@mui/icons-material/Hub';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { StatCard } from '@/components/ui/cards/StatCard';
import { useOrgDashboard } from '@/features/organization';
import { ROUTES } from '@/lib/constants';

export default function OrganizationDashboardPage() {
  const router = useRouter();
  const { data: dashboard, isLoading } = useOrgDashboard();

  const failedChecks = dashboard?.sanityChecks.filter((c) => !c.passed) ?? [];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Organization Overview
      </Typography>

      {failedChecks.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Sanity Check Issues</AlertTitle>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {failedChecks.map((check) => (
              <li key={check.code}>{check.description}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: true }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={140} />
          ) : (
            <StatCard
              title="Orbits"
              value={dashboard?.orbitCount ?? 0}
              icon={<PublicIcon />}
              color="primary"
              sx={{ cursor: 'pointer' }}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: true }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={140} />
          ) : (
            <StatCard
              title="Competence Centers"
              value={dashboard?.ccCount ?? 0}
              icon={<HubIcon />}
              color="secondary"
              sx={{ cursor: 'pointer' }}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: true }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={140} />
          ) : (
            <StatCard
              title="Technical Hub"
              value={dashboard?.techHubCount ?? 0}
              icon={<AccountTreeIcon />}
              color="warning"
              sx={{ cursor: 'pointer' }}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: true }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={140} />
          ) : (
            <StatCard
              title="Staff Groups"
              value={dashboard?.staffGroupCount ?? 0}
              icon={<GroupsIcon />}
              color="info"
              sx={{ cursor: 'pointer' }}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: true }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={140} />
          ) : (
            <StatCard
              title="Active People"
              value={dashboard?.activePersonCount ?? 0}
              icon={<PeopleIcon />}
              color="success"
              sx={{ cursor: 'pointer' }}
            />
          )}
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="outlined" startIcon={<AccountTreeIcon />} onClick={() => router.push(ROUTES.ORGANIZATION_CHART)}>
          Org Chart
        </Button>
        <Button variant="outlined" onClick={() => router.push(ROUTES.ORGANIZATION_UNITS)}>
          Manage Units
        </Button>
        <Button variant="outlined" onClick={() => router.push(ROUTES.ORGANIZATION_PEOPLE)}>
          Manage People
        </Button>
        <Button variant="outlined" onClick={() => router.push(ROUTES.ORGANIZATION_ROLES)}>
          Roles & Permissions
        </Button>
      </Box>
    </Box>
  );
}
