'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Skeleton,
  useMediaQuery,
  useTheme,
  Fab,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import { GridColDef } from '@mui/x-data-grid';
import { DataGridWrapper } from '@/components/ui/data-grid/DataGridWrapper';
import { usePersons } from '@/features/organization';
import { Can } from '@/components/auth/Can';
import { ROUTES } from '@/lib/constants';

const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Name',
    flex: 1,
    minWidth: 200,
    valueGetter: (_, row) => `${row.firstName} ${row.lastName}`,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'primary.main' }}>
          {params.row.firstName?.[0]}{params.row.lastName?.[0]}
        </Avatar>
        {params.value}
      </Box>
    ),
  },
  { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
  {
    field: 'status',
    headerName: 'Status',
    width: 100,
    renderCell: (params) => (
      <Chip label={params.value} color={params.value === 'Active' ? 'success' : 'default'} size="small" variant="outlined" />
    ),
  },
  { field: 'assignmentCount', headerName: 'Assignments', width: 120, type: 'number' },
];

export default function PeoplePage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const isActive = statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined;
  const { data: persons, isLoading } = usePersons(search || undefined, isActive);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>People</Typography>
        {!isMobile && (
          <Can capability="PERSON_MANAGE">
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push(`${ROUTES.ORGANIZATION_PEOPLE}/new`)}>
              New Person
            </Button>
          </Can>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search people..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth={isMobile}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
          }}
          sx={{ minWidth: isMobile ? undefined : 300 }}
        />
        <ToggleButtonGroup value={statusFilter} exclusive onChange={(_, v) => v && setStatusFilter(v)} size="small">
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="active">Active</ToggleButton>
          <ToggleButton value="inactive">Inactive</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={72} />)}
        </Box>
      ) : isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {persons?.map((person) => (
            <Card key={person.id}>
              <CardActionArea onClick={() => router.push(`${ROUTES.ORGANIZATION_PEOPLE}/${person.id}`)}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {person.firstName[0]}{person.lastName[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {person.firstName} {person.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {person.email}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: person.status === 'Active' ? 'success.main' : 'grey.400' }} />
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
          {persons?.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary">No people found</Typography>
              <Can capability="PERSON_MANAGE">
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => router.push(`${ROUTES.ORGANIZATION_PEOPLE}/new`)}>
                  Add First Person
                </Button>
              </Can>
            </Box>
          )}
        </Box>
      ) : (
        <DataGridWrapper
          rows={persons ?? []}
          columns={columns}
          loading={isLoading}
          onAdd={() => router.push(`${ROUTES.ORGANIZATION_PEOPLE}/new`)}
          addButtonLabel="New Person"
        />
      )}

      {isMobile && (
        <Can capability="PERSON_MANAGE">
          <Fab color="primary" sx={{ position: 'fixed', bottom: 16, right: 16 }} onClick={() => router.push(`${ROUTES.ORGANIZATION_PEOPLE}/new`)}>
            <AddIcon />
          </Fab>
        </Can>
      )}
    </Box>
  );
}
