'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Card,
  CardContent,
  CardActionArea,
  Skeleton,
  useMediaQuery,
  useTheme,
  Fab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import { GridColDef } from '@mui/x-data-grid';
import { DataGridWrapper } from '@/components/ui/data-grid/DataGridWrapper';
import { useOrgUnits } from '@/features/organization';
import { Can } from '@/components/auth/Can';
import { ROUTES } from '@/lib/constants';
import type { OrgUnitType, OrgUnitList } from '@/features/organization';

const typeColors: Record<OrgUnitType, 'primary' | 'secondary' | 'info'> = {
  Orbit: 'primary',
  CompetenceCenter: 'secondary',
  StaffGroup: 'info',
};

const typeLabels: Record<OrgUnitType, string> = {
  Orbit: 'Orbit',
  CompetenceCenter: 'CC',
  StaffGroup: 'Staff',
};

const tabs: { label: string; value: OrgUnitType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Orbit', value: 'Orbit' },
  { label: 'CC', value: 'CompetenceCenter' },
  { label: 'Staff', value: 'StaffGroup' },
];

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1, minWidth: 200 },
  {
    field: 'type',
    headerName: 'Type',
    width: 120,
    renderCell: (params) => (
      <Chip label={typeLabels[params.value as OrgUnitType]} color={typeColors[params.value as OrgUnitType]} size="small" />
    ),
  },
  { field: 'domain', headerName: 'Domain', flex: 1, minWidth: 150 },
  { field: 'memberCount', headerName: 'Members', width: 100, type: 'number' },
  {
    field: 'status',
    headerName: 'Status',
    width: 100,
    renderCell: (params) => (
      <Chip label={params.value} color={params.value === 'Active' ? 'success' : 'default'} size="small" variant="outlined" />
    ),
  },
];

export default function OrgUnitsPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [search, setSearch] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const selectedType = tabs[tabValue].value === 'all' ? undefined : (tabs[tabValue].value as OrgUnitType);
  const { data: units, isLoading } = useOrgUnits(search || undefined, selectedType);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Organization Units
        </Typography>
        {!isMobile && (
          <Can capability="ORGUNIT_MANAGE">
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push(`${ROUTES.ORGANIZATION_UNITS}/new`)}>
              New Unit
            </Button>
          </Can>
        )}
      </Box>

      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
        {tabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} />
        ))}
      </Tabs>

      <TextField
        size="small"
        placeholder="Search units..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth={isMobile}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2, minWidth: isMobile ? undefined : 300 }}
      />

      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={80} />
          ))}
        </Box>
      ) : isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {units?.map((unit: OrgUnitList) => (
            <Card key={unit.id}>
              <CardActionArea onClick={() => router.push(`${ROUTES.ORGANIZATION_UNITS}/${unit.id}`)}>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {unit.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Chip label={typeLabels[unit.type]} color={typeColors[unit.type]} size="small" />
                      {unit.domain && (
                        <Typography variant="body2" color="text.secondary">
                          {unit.domain}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Chip label={`${unit.memberCount} members`} size="small" variant="outlined" />
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
          {units?.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary">No units found</Typography>
              <Can capability="ORGUNIT_MANAGE">
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => router.push(`${ROUTES.ORGANIZATION_UNITS}/new`)}>
                  Create First Unit
                </Button>
              </Can>
            </Box>
          )}
        </Box>
      ) : (
        <DataGridWrapper
          rows={units ?? []}
          columns={columns}
          loading={isLoading}
          onAdd={() => router.push(`${ROUTES.ORGANIZATION_UNITS}/new`)}
          addButtonLabel="New Unit"
        />
      )}

      {isMobile && (
        <Can capability="ORGUNIT_MANAGE">
          <Fab color="primary" sx={{ position: 'fixed', bottom: 16, right: 16 }} onClick={() => router.push(`${ROUTES.ORGANIZATION_UNITS}/new`)}>
            <AddIcon />
          </Fab>
        </Can>
      )}
    </Box>
  );
}
