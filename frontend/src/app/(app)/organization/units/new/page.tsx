'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Paper,
  Grid,
  Alert,
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import HubIcon from '@mui/icons-material/Hub';
import GroupsIcon from '@mui/icons-material/Groups';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { useCreateOrgUnit } from '@/features/organization';
import { ROUTES } from '@/lib/constants';
import type { OrgUnitType } from '@/features/organization';

export default function NewOrgUnitPage() {
  const router = useRouter();
  const createMutation = useCreateOrgUnit();
  const [name, setName] = useState('');
  const [type, setType] = useState<OrgUnitType>('Orbit');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      await createMutation.mutateAsync({ name: name.trim(), type, description: description || undefined, domain: domain || undefined });
      router.push(ROUTES.ORGANIZATION_UNITS);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mb: 2 }}>
        Back
      </Button>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        New Organization Unit
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Type</Typography>
              <ToggleButtonGroup
                value={type}
                exclusive
                onChange={(_, v) => v && setType(v)}
                fullWidth
              >
                <ToggleButton value="Orbit"><PublicIcon sx={{ mr: 1 }} /> Orbit</ToggleButton>
                <ToggleButton value="CompetenceCenter"><HubIcon sx={{ mr: 1 }} /> CC</ToggleButton>
                <ToggleButton value="StaffGroup"><GroupsIcon sx={{ mr: 1 }} /> Staff</ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
            </Grid>

            {(type === 'Orbit' || type === 'CompetenceCenter') && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label={type === 'Orbit' ? 'Market Area' : 'Tech Domain'}
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  fullWidth
                />
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={3} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Unit'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
