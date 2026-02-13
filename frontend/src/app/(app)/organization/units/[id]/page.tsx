'use client';

import { use } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Skeleton,
  Grid,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { useOrgUnit, useOrgUnitMembers } from '@/features/organization';
import { ROUTES } from '@/lib/constants';

const typeLabels: Record<string, string> = {
  Orbit: 'Orbit',
  CompetenceCenter: 'Competence Center',
  StaffGroup: 'Staff Group',
};

export default function OrgUnitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: unit, isLoading } = useOrgUnit(id);
  const { data: members, isLoading: membersLoading } = useOrgUnitMembers(id);

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rounded" height={200} />
      </Box>
    );
  }

  if (!unit) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Unit not found</Typography>
        <Button onClick={() => router.push(ROUTES.ORGANIZATION_UNITS)} sx={{ mt: 2 }}>
          Back to Units
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => router.push(ROUTES.ORGANIZATION_UNITS)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              {unit.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip label={typeLabels[unit.type] ?? unit.type} color="primary" />
              <Chip label={unit.status} color={unit.status === 'Active' ? 'success' : 'default'} variant="outlined" />
            </Box>
            {unit.domain && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Domain: {unit.domain}
              </Typography>
            )}
            {unit.description && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                {unit.description}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Members ({members?.length ?? 0})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {membersLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[1, 2, 3].map((i) => <Skeleton key={i} height={60} />)}
              </Box>
            ) : members && members.length > 0 ? (
              <List disablePadding>
                {members.map((member) => (
                  <ListItem key={member.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {member.personName.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.personName}
                      slotProps={{ secondary: { component: 'div' } }}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                          <Chip label={member.roleName} size="small" variant="outlined" />
                          <Typography variant="caption" color="text.secondary">
                            from {new Date(member.validFrom).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No members assigned yet
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
