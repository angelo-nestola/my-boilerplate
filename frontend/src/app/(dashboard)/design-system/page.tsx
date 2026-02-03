'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  Paper,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FolderIcon from '@mui/icons-material/Folder';
import BugReportIcon from '@mui/icons-material/BugReport';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import BuildIcon from '@mui/icons-material/Build';
import SettingsIcon from '@mui/icons-material/Settings';
import { GridColDef } from '@mui/x-data-grid';
import {
  StatCard,
  InfoCard,
  ActionCard,
  DataGridWrapper,
  TreeGrid,
  TreeNode,
} from '@/components/ui';
import { palette } from '@/theme/palette';

// Sample data for DataGrid demo
const sampleRows = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Developer', status: 'Active' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Viewer', status: 'Inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Developer', status: 'Active' },
  { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', role: 'Admin', status: 'Active' },
];

const sampleColumns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
  { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
  { field: 'role', headerName: 'Role', width: 120 },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params) => (
      <Chip
        label={params.value}
        size="small"
        color={params.value === 'Active' ? 'success' : 'default'}
      />
    ),
  },
];

// Sample tree data for TreeGrid demo
const sampleTreeData: TreeNode[] = [
  {
    id: '1',
    name: 'Bug',
    icon: <BugReportIcon />,
    color: '#e53935',
    children: [
      { id: '1-1', name: 'Critical', parentId: '1' },
      { id: '1-2', name: 'Major', parentId: '1' },
      { id: '1-3', name: 'Minor', parentId: '1' },
    ],
  },
  {
    id: '2',
    name: 'Feature',
    icon: <NewReleasesIcon />,
    color: '#43a047',
    children: [
      { id: '2-1', name: 'Enhancement', parentId: '2' },
      { id: '2-2', name: 'New Feature', parentId: '2' },
    ],
  },
  {
    id: '3',
    name: 'Task',
    icon: <BuildIcon />,
    color: '#1e88e5',
    children: [
      { id: '3-1', name: 'Development', parentId: '3' },
      { id: '3-2', name: 'Documentation', parentId: '3' },
      { id: '3-3', name: 'Testing', parentId: '3' },
    ],
  },
];

function ColorSwatch({ name, value, textColor }: { name: string; value: string; textColor?: string }) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: 2,
          bgcolor: value,
          mb: 1,
          boxShadow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" sx={{ color: textColor || '#fff', fontWeight: 600 }}>
          {value}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {name}
      </Typography>
    </Box>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" color="text.primary" sx={{ fontWeight: 700, mb: 3 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export default function DesignSystemPage() {
  const theme = useTheme();
  const [selectedTreeNode, setSelectedTreeNode] = useState<string | number | null>(null);

  return (
    <Box>
      <Typography variant="h5" color="text.primary" sx={{ fontWeight: 600, mb: 1 }}>
        Design System
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Component showcase and style guide for CleanApi
      </Typography>

        {/* Color Palette */}
        <Section title="Color Palette">
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Brand Colors
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
              <ColorSwatch name="Palladian" value={palette.palladian} textColor="#333" />
              <ColorSwatch name="Oatmeal" value={palette.oatmeal} textColor="#333" />
              <ColorSwatch name="Burning Flame" value={palette.burningFlame} textColor="#333" />
              <ColorSwatch name="Truffle" value={palette.truffleTrouble} />
              <ColorSwatch name="Blue Fantastic" value={palette.blueFantastic} />
              <ColorSwatch name="Abyssal Blue" value={palette.abyssalBlue} />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Theme Colors
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <ColorSwatch name="Primary" value={theme.palette.primary.main} />
              <ColorSwatch name="Secondary" value={theme.palette.secondary.main} />
              <ColorSwatch name="Success" value={theme.palette.success.main} />
              <ColorSwatch name="Warning" value={theme.palette.warning.main} />
              <ColorSwatch name="Error" value={theme.palette.error.main} />
              <ColorSwatch name="Info" value={theme.palette.info.main} />
            </Box>
          </Paper>
        </Section>

        {/* Stat Cards */}
        <Section title="Stat Cards">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Total Projects"
                value="24"
                icon={<FolderIcon />}
                trend={{ value: 12, label: 'vs last month' }}
                color="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Active Tasks"
                value="156"
                icon={<AssignmentIcon />}
                trend={{ value: -5, label: 'vs last week' }}
                color="warning"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Team Members"
                value="12"
                icon={<PeopleIcon />}
                color="success"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Completion Rate"
                value="87%"
                icon={<DashboardIcon />}
                trend={{ value: 3.2, label: 'improvement' }}
                color="info"
              />
            </Grid>
          </Grid>
        </Section>

        {/* Info Cards */}
        <Section title="Info Cards">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <InfoCard
                title="Project Alpha"
                description="A comprehensive project management system with task tracking, team collaboration, and reporting features."
                icon={<FolderIcon />}
                status={{ label: 'Active', color: 'success' }}
                metadata={[
                  { label: 'Tasks', value: 45 },
                  { label: 'Members', value: 8 },
                  { label: 'Due', value: 'Mar 15' },
                ]}
                accentColor="primary"
                onClick={() => alert('Card clicked!')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <InfoCard
                title="Sprint Planning"
                description="Review and plan upcoming sprint tasks with the development team."
                icon={<AssignmentIcon />}
                status={{ label: 'Pending', color: 'warning' }}
                metadata={[
                  { label: 'Stories', value: 12 },
                  { label: 'Points', value: 34 },
                ]}
                accentColor="warning"
              />
            </Grid>
          </Grid>
        </Section>

        {/* Action Cards */}
        <Section title="Action Cards">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <ActionCard
                title="Create New Project"
                subtitle="Start Fresh"
                description="Set up a new project with customizable settings, team members, and task categories."
                icon={<FolderIcon />}
                primaryAction={{
                  label: 'Create',
                  onClick: () => alert('Create clicked!'),
                }}
                secondaryAction={{
                  label: 'Learn More',
                  onClick: () => alert('Learn more clicked!'),
                }}
                accentColor="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <ActionCard
                title="Team Settings"
                subtitle="Administration"
                description="Manage team members, roles, and permissions for your organization."
                icon={<SettingsIcon />}
                menuActions={[
                  { label: 'Edit Settings', onClick: () => alert('Edit') },
                  { label: 'Export Data', onClick: () => alert('Export') },
                  { label: 'Delete Team', onClick: () => alert('Delete'), color: 'error' },
                ]}
                accentColor="secondary"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <ActionCard
                title="Quick Actions"
                description="Common tasks you can perform right now."
                primaryAction={{
                  label: 'Add Task',
                  onClick: () => alert('Add task!'),
                  color: 'success',
                }}
                accentColor="success"
              />
            </Grid>
          </Grid>
        </Section>

        {/* Alerts */}
        <Section title="Alerts">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="success">This is a success alert — check it out!</Alert>
            <Alert severity="info">This is an info alert — check it out!</Alert>
            <Alert severity="warning">This is a warning alert — check it out!</Alert>
            <Alert severity="error">This is an error alert — check it out!</Alert>
          </Box>
        </Section>

        {/* Buttons */}
        <Section title="Buttons">
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Variants
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
              <Button variant="contained">Contained</Button>
              <Button variant="outlined">Outlined</Button>
              <Button variant="text">Text</Button>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Colors
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
              <Button variant="contained" color="primary">Primary</Button>
              <Button variant="contained" color="secondary">Secondary</Button>
              <Button variant="contained" color="success">Success</Button>
              <Button variant="contained" color="warning">Warning</Button>
              <Button variant="contained" color="error">Error</Button>
              <Button variant="contained" color="info">Info</Button>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Sizes
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" size="small">Small</Button>
              <Button variant="contained" size="medium">Medium</Button>
              <Button variant="contained" size="large">Large</Button>
            </Box>
          </Paper>
        </Section>

        {/* Chips */}
        <Section title="Chips">
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip label="Default" />
              <Chip label="Primary" color="primary" />
              <Chip label="Secondary" color="secondary" />
              <Chip label="Success" color="success" />
              <Chip label="Warning" color="warning" />
              <Chip label="Error" color="error" />
              <Chip label="Info" color="info" />
              <Chip label="Outlined" variant="outlined" />
              <Chip label="Deletable" onDelete={() => {}} />
            </Box>
          </Paper>
        </Section>

        {/* DataGrid */}
        <Section title="DataGrid">
          <Box sx={{ height: 400 }}>
            <DataGridWrapper
              title="Team Members"
              rows={sampleRows}
              columns={sampleColumns}
              searchPlaceholder="Search members..."
              onAdd={() => alert('Add clicked!')}
              onRefresh={() => alert('Refresh clicked!')}
              addButtonLabel="Add Member"
            />
          </Box>
        </Section>

        {/* TreeGrid */}
        <Section title="TreeGrid (Hierarchical Data)">
          <Box sx={{ height: 400 }}>
            <TreeGrid
              title="Task Categories"
              data={sampleTreeData}
              searchPlaceholder="Search categories..."
              onAdd={() => alert('Add root category')}
              onAddChild={(parentId) => alert(`Add child to ${parentId}`)}
              onEdit={(node) => alert(`Edit ${node.name}`)}
              onDelete={(node) => alert(`Delete ${node.name}`)}
              onSelect={(node) => setSelectedTreeNode(node.id)}
              selectedId={selectedTreeNode}
              addButtonLabel="Add Category"
            />
          </Box>
        </Section>

        {/* Typography */}
        <Section title="Typography">
          <Paper sx={{ p: 3 }}>
            <Typography variant="h1" gutterBottom>h1. Heading</Typography>
            <Typography variant="h2" gutterBottom>h2. Heading</Typography>
            <Typography variant="h3" gutterBottom>h3. Heading</Typography>
            <Typography variant="h4" gutterBottom>h4. Heading</Typography>
            <Typography variant="h5" gutterBottom>h5. Heading</Typography>
            <Typography variant="h6" gutterBottom>h6. Heading</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>subtitle1. Lorem ipsum dolor sit amet</Typography>
            <Typography variant="subtitle2" gutterBottom>subtitle2. Lorem ipsum dolor sit amet</Typography>
            <Typography variant="body1" gutterBottom>body1. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Typography>
            <Typography variant="body2" gutterBottom>body2. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Typography>
            <Typography variant="button" display="block" gutterBottom>button text</Typography>
            <Typography variant="caption" display="block" gutterBottom>caption text</Typography>
            <Typography variant="overline" display="block">overline text</Typography>
          </Paper>
        </Section>
    </Box>
  );
}
