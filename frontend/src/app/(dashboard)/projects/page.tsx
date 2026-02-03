'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useRouter } from 'next/navigation';
import { DataGridWrapper } from '@/components/ui';
import { useProjects, useDeleteProject, useProject, ProjectListItem } from '@/features/projects';
import { ProjectEditDialog } from '@/features/projects/ProjectEditDialog';

export default function ProjectsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: projects = [], isLoading, refetch } = useProjects(search);
  const deleteMutation = useDeleteProject();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectListItem | null>(null);

  // Fetch full project data when editing
  const { data: selectedProject } = useProject(selectedProjectId || '');

  const handleAdd = () => {
    setSelectedProjectId(null);
    setEditDialogOpen(true);
  };

  const handleView = (project: ProjectListItem) => {
    router.push(`/projects/${project.id}`);
  };

  const handleEdit = (project: ProjectListItem) => {
    setSelectedProjectId(project.id);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (project: ProjectListItem) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (projectToDelete) {
      try {
        await deleteMutation.mutateAsync(projectToDelete.id);
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
      } catch {
        // Error is handled by mutation
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'code',
      headerName: 'Code',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} size="small" variant="outlined" color="primary" />
      ),
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 150,
      renderCell: (params: GridRenderCellParams<ProjectListItem>) => {
        const row = params.row;
        const progress =
          row.taskCount > 0 ? Math.round((row.completedTaskCount / row.taskCount) * 100) : 0;
        return (
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ flex: 1, height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" sx={{ minWidth: 35 }}>
              {progress}%
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'memberCount',
      headerName: 'Members',
      width: 100,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'taskCount',
      headerName: 'Tasks',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          color={params.value ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams<ProjectListItem>) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => handleView(params.row)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEdit(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" color="text.primary" sx={{ fontWeight: 600 }}>
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          New Project
        </Button>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGridWrapper
          rows={projects}
          columns={columns}
          loading={isLoading}
          searchPlaceholder="Search projects..."
          onAdd={handleAdd}
          onRefresh={() => refetch()}
          addButtonLabel="New Project"
        />
      </Box>

        {/* Edit Dialog */}
        <ProjectEditDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedProjectId(null);
          }}
          project={selectedProject}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete project &quot;{projectToDelete?.name}&quot; (
              {projectToDelete?.code})? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
}
