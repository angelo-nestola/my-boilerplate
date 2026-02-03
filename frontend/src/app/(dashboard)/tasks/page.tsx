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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { DashboardLayout } from '@/components/layout';
import { DataGridWrapper } from '@/components/ui';
import {
  useMyTasks,
  useTask,
  useDeleteTask,
  TaskListItem,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  TaskEditDialog,
  TaskStatus,
  TaskPriority,
  useTasks,
} from '@/features/tasks';

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

function getStatusColor(status: string): ChipColor {
  const option = TASK_STATUS_OPTIONS.find((o) => o.value === status);
  return (option?.color || 'default') as ChipColor;
}

function getPriorityColor(priority: string): ChipColor {
  const option = TASK_PRIORITY_OPTIONS.find((o) => o.value === priority);
  return (option?.color || 'default') as ChipColor;
}

function getStatusLabel(status: string): string {
  const option = TASK_STATUS_OPTIONS.find((o) => o.value === status);
  return option?.label || status;
}

function getPriorityLabel(priority: string): string {
  const option = TASK_PRIORITY_OPTIONS.find((o) => o.value === priority);
  return option?.label || priority;
}

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<'my' | 'all'>('my');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');

  const { data: myTasks = [], isLoading: myTasksLoading, refetch: refetchMyTasks } = useMyTasks();
  const { data: allTasks = [], isLoading: allTasksLoading, refetch: refetchAllTasks } = useTasks({
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });

  const tasks = viewMode === 'my' ? myTasks : allTasks;
  const isLoading = viewMode === 'my' ? myTasksLoading : allTasksLoading;
  const refetch = viewMode === 'my' ? refetchMyTasks : refetchAllTasks;

  const deleteMutation = useDeleteTask();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskListItem | null>(null);

  const { data: selectedTask } = useTask(selectedTaskId || '');

  const handleAdd = () => {
    setSelectedTaskId(null);
    setEditDialogOpen(true);
  };

  const handleEdit = (task: TaskListItem) => {
    setSelectedTaskId(task.id);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (task: TaskListItem) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      try {
        await deleteMutation.mutateAsync(taskToDelete.id);
        setDeleteDialogOpen(false);
        setTaskToDelete(null);
      } catch {
        // Error handled by mutation
      }
    }
  };

  const handleDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedTaskId(null);
  };

  const columns: GridColDef[] = [
    {
      field: 'taskKey',
      headerName: 'Key',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} size="small" variant="outlined" color="primary" />
      ),
    },
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 250,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={getStatusLabel(params.value)}
          size="small"
          color={getStatusColor(params.value)}
        />
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={getPriorityLabel(params.value)}
          size="small"
          color={getPriorityColor(params.value)}
          variant="outlined"
        />
      ),
    },
    {
      field: 'categoryName',
      headerName: 'Category',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'assigneeName',
      headerName: 'Assignee',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          {params.value || 'Unassigned'}
        </Typography>
      ),
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) return '-';
        const date = new Date(params.value);
        const isOverdue = date < new Date() && params.row.status !== 'Done' && params.row.status !== 'Closed';
        return (
          <Typography
            variant="body2"
            sx={{ color: isOverdue ? 'error.main' : 'text.secondary' }}
          >
            {date.toLocaleDateString()}
          </Typography>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams<TaskListItem>) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
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
    <DashboardLayout>
      <Box sx={{ pb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {viewMode === 'my' ? 'My Tasks' : 'All Tasks'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              sx={{ borderRadius: 2 }}
            >
              New Task
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>View</InputLabel>
              <Select
                value={viewMode}
                label="View"
                onChange={(e: SelectChangeEvent) => setViewMode(e.target.value as 'my' | 'all')}
              >
                <MenuItem value="my">My Tasks</MenuItem>
                <MenuItem value="all">All Tasks</MenuItem>
              </Select>
            </FormControl>
            {viewMode === 'all' && (
              <>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value as TaskStatus | '')}
                  >
                    <MenuItem value="">All</MenuItem>
                    {TASK_STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={priorityFilter}
                    label="Priority"
                    onChange={(e: SelectChangeEvent) => setPriorityFilter(e.target.value as TaskPriority | '')}
                  >
                    <MenuItem value="">All</MenuItem>
                    {TASK_PRIORITY_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
          </Box>
        </Box>

        <Box sx={{ height: 600 }}>
          <DataGridWrapper
            rows={tasks}
            columns={columns}
            loading={isLoading}
            searchPlaceholder="Search tasks..."
            onAdd={handleAdd}
            onRefresh={() => refetch()}
            addButtonLabel="New Task"
          />
        </Box>

        {/* Edit Dialog */}
        <TaskEditDialog
          open={editDialogOpen}
          onClose={handleDialogClose}
          task={selectedTask}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete task &quot;{taskToDelete?.taskKey}&quot;? This
              action cannot be undone.
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
    </DashboardLayout>
  );
}
