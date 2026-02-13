'use client';

import { Box, Typography, Chip, Button, Skeleton, Divider } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { useRouter } from 'next/navigation';
import { useOrgUnit, useOrgUnitMembers } from './hooks';
import type { OrgAssignment, OrgUnitType } from './types';

const TYPE_COLORS: Record<OrgUnitType, 'primary' | 'secondary' | 'warning' | 'info'> = {
  Orbit: 'primary',
  CompetenceCenter: 'secondary',
  TechnicalHub: 'warning',
  StaffGroup: 'info',
};

const columns: GridColDef<OrgAssignment>[] = [
  {
    field: 'personName',
    headerName: 'Name',
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'roleName',
    headerName: 'Role',
    flex: 1,
    minWidth: 120,
  },
  {
    field: 'validFrom',
    headerName: 'From',
    width: 110,
    valueFormatter: (value: string) => new Date(value).toLocaleDateString(),
  },
  {
    field: 'validTo',
    headerName: 'To',
    width: 110,
    valueFormatter: (value: string | undefined) =>
      value ? new Date(value).toLocaleDateString() : '—',
  },
];

interface OrgUnitDetailProps {
  unitId: string | null;
}

export function OrgUnitDetail({ unitId }: OrgUnitDetailProps) {
  const router = useRouter();
  const { data: unit, isLoading: unitLoading } = useOrgUnit(unitId ?? '');
  const { data: members, isLoading: membersLoading } = useOrgUnitMembers(unitId ?? '');

  if (!unitId) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 8 }}>
        <AccountTreeIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography color="text.secondary">
          Select a unit from the tree to see its details
        </Typography>
      </Box>
    );
  }

  if (unitLoading) {
    return (
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton variant="rounded" height={32} width="60%" />
        <Skeleton variant="rounded" height={20} width="40%" />
        <Skeleton variant="rounded" height={200} />
      </Box>
    );
  }

  if (!unit) {
    return (
      <Typography color="text.secondary" sx={{ p: 2 }}>
        Unit not found
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {unit.name}
          </Typography>
          <Button
            size="small"
            endIcon={<OpenInNewIcon />}
            onClick={() => router.push(`/organization/units/${unit.id}`)}
          >
            Full Detail
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Chip
            label={unit.type}
            color={TYPE_COLORS[unit.type as OrgUnitType] ?? 'default'}
            size="small"
          />
          <Chip
            label={unit.status}
            color={unit.status === 'Active' ? 'success' : 'default'}
            size="small"
            variant="outlined"
          />
        </Box>

        {unit.domain && (
          <Typography variant="body2" color="text.secondary">
            {unit.domain}
          </Typography>
        )}
        {unit.parentName && (
          <Typography variant="caption" color="text.secondary">
            Parent: {unit.parentName}
          </Typography>
        )}
      </Box>

      <Divider />

      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Members ({members?.length ?? 0})
        </Typography>
      </Box>

      <Box sx={{ flex: 1, px: 2, pb: 2, minHeight: 200 }}>
        <DataGrid
          rows={members ?? []}
          columns={columns}
          loading={membersLoading}
          density="compact"
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'action.hover' },
          }}
        />
      </Box>
    </Box>
  );
}
