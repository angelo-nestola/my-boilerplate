'use client';

import { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Grid, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { useCreatePerson } from '@/features/organization';
import { ROUTES } from '@/lib/constants';

export default function NewPersonPage() {
  const router = useRouter();
  const createMutation = useCreatePerson();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('First name, last name and email are required');
      return;
    }

    try {
      await createMutation.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        notes: notes || undefined,
      });
      router.push(ROUTES.ORGANIZATION_PEOPLE);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mb: 2 }}>
        Back
      </Button>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>New Person</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth required />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth required />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth multiline rows={3} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Person'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
