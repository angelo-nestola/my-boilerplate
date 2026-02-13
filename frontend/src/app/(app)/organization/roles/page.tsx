'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  Skeleton,
  Tabs,
  Tab,
} from '@mui/material';
import { useRoles, useCapabilities, useUpdateRoleCapabilities } from '@/features/organization';
import type { Capability, OrgRole } from '@/features/organization';
import { useCapability } from '@/hooks/useCapability';

export default function RolesPage() {
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: capabilities, isLoading: capsLoading } = useCapabilities();
  const updateMutation = useUpdateRoleCapabilities();
  const canManage = useCapability('ROLE_MANAGE');
  const [groupFilter, setGroupFilter] = useState('all');

  const isLoading = rolesLoading || capsLoading;

  const groups = Array.from(new Set(capabilities?.map((c) => c.group) ?? [])).sort();
  const filteredCapabilities = groupFilter === 'all'
    ? capabilities
    : capabilities?.filter((c) => c.group === groupFilter);

  const handleToggle = async (role: OrgRole, capability: Capability) => {
    if (!canManage) return;

    const currentCodes = role.capabilityCodes ?? [];
    const hasCapability = currentCodes.includes(capability.code);

    // We need capability IDs, but we only have codes in the matrix
    // Build the new set of capability IDs from the full capabilities list
    const allCaps = capabilities ?? [];
    const currentCapIds = allCaps
      .filter((c) => currentCodes.includes(c.code))
      .map((c) => c.id);

    let newCapIds: string[];
    if (hasCapability) {
      newCapIds = currentCapIds.filter((id) => id !== capability.id);
    } else {
      newCapIds = [...currentCapIds, capability.id];
    }

    await updateMutation.mutateAsync({ roleId: role.roleId, capabilityIds: newCapIds });
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rounded" height={400} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Roles & Capabilities
      </Typography>

      <Tabs
        value={groupFilter}
        onChange={(_, v) => setGroupFilter(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        <Tab label="All" value="all" />
        {groups.map((group) => (
          <Tab key={group} label={group} value={group} />
        ))}
      </Tabs>

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, minWidth: 180, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                Role
              </TableCell>
              {filteredCapabilities?.map((cap) => (
                <TableCell key={cap.id} align="center" sx={{ minWidth: 100 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <Chip label={cap.group} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 11 }}>
                      {cap.code}
                    </Typography>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {roles?.map((role) => (
              <TableRow key={role.roleId} hover>
                <TableCell sx={{ fontWeight: 600, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                  {role.roleName}
                </TableCell>
                {filteredCapabilities?.map((cap) => {
                  const hasCap = role.capabilityCodes?.includes(cap.code) ?? false;
                  return (
                    <TableCell key={cap.id} align="center">
                      <Checkbox
                        checked={hasCap}
                        disabled={!canManage || updateMutation.isPending}
                        onChange={() => handleToggle(role, cap)}
                        size="small"
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
