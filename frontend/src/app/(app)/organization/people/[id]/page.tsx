'use client';

import { use, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import { usePerson, useOrgUnits, useRoles, useCreateAssignment, useDeleteAssignment } from '@/features/organization';
import { Can } from '@/components/auth/Can';
import { ROUTES } from '@/lib/constants';

export default function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: person, isLoading } = usePerson(id);
  const { data: orgUnits } = useOrgUnits();
  const { data: roles } = useRoles();
  const createAssignment = useCreateAssignment();
  const deleteAssignment = useDeleteAssignment();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split('T')[0]);

  const handleCreateAssignment = async () => {
    if (!selectedUnit || !selectedRole) return;
    try {
      await createAssignment.mutateAsync({
        personId: id,
        data: {
          personId: id,
          orgUnitId: selectedUnit,
          orgRoleId: selectedRole,
          validFrom: new Date(validFrom).toISOString(),
        },
      });
      setDialogOpen(false);
      setSelectedUnit('');
      setSelectedRole('');
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rounded" height={200} />
      </Box>
    );
  }

  if (!person) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Person not found</Typography>
        <Button onClick={() => router.push(ROUTES.ORGANIZATION_PEOPLE)} sx={{ mt: 2 }}>
          Back to People
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => router.push(ROUTES.ORGANIZATION_PEOPLE)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              {person.firstName} {person.lastName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip label={person.status} color={person.status === 'Active' ? 'success' : 'default'} variant="outlined" />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {person.email}
            </Typography>
            {person.notes && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                {person.notes}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Assignments ({person.assignments?.length ?? 0})
              </Typography>
              <Can capability="PERSON_MANAGE">
                <Button size="small" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
                  Assign
                </Button>
              </Can>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {person.assignments && person.assignments.length > 0 ? (
              <List disablePadding>
                {person.assignments.map((assignment) => (
                  <ListItem
                    key={assignment.id}
                    divider
                    secondaryAction={
                      <Can capability="PERSON_MANAGE">
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => deleteAssignment.mutate({ personId: id, id: assignment.id })}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Can>
                    }
                  >
                    <ListItemText
                      primary={assignment.orgUnitName}
                      slotProps={{ secondary: { component: 'div' } }}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                          <Chip label={assignment.roleName} size="small" variant="outlined" />
                          <Typography variant="caption" color="text.secondary">
                            from {new Date(assignment.validFrom).toLocaleDateString()}
                            {assignment.validTo && ` to ${new Date(assignment.validTo).toLocaleDateString()}`}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No assignments yet
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign to Organization Unit</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <FormControl fullWidth>
            <InputLabel>Organization Unit</InputLabel>
            <Select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} label="Organization Unit">
              {orgUnits?.map((unit) => (
                <MenuItem key={unit.id} value={unit.id}>
                  {unit.name} ({unit.type})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} label="Role">
              {roles?.map((role) => (
                <MenuItem key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Valid From"
            type="date"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateAssignment}
            disabled={!selectedUnit || !selectedRole || createAssignment.isPending}
          >
            {createAssignment.isPending ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
