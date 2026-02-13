'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { useOrgUnitTree } from '@/features/organization';
import { OrgChart } from '@/features/organization/OrgChart';
import { OrgUnitDetail } from '@/features/organization/OrgUnitDetail';

export default function OrgChartPage() {
  const { data: tree, isLoading } = useOrgUnitTree();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId && tree && tree.length > 0) {
      setSelectedId(tree[0].id);
    }
  }, [tree, selectedId]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, height: 'calc(100vh - 64px)' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Org Chart
      </Typography>

      <Grid container spacing={2} sx={{ height: 'calc(100% - 48px)' }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ height: '100%', overflow: 'auto', p: 1 }}>
            <OrgChart
              data={tree ?? []}
              loading={isLoading}
              selectedId={selectedId ?? undefined}
              onSelect={setSelectedId}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ height: '100%', overflow: 'auto' }}>
            <OrgUnitDetail unitId={selectedId} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
