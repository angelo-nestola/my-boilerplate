'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import { Task, CreateTaskRequest, UpdateTaskRequest, TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS, TaskStatus, TaskPriority } from './types';
import { useCreateTask, useUpdateTask } from './hooks';
import { useProjects, useProjectMembers, ProjectMember } from '@/features/projects';
import { useCategories } from '@/features/categories';

interface TaskEditDialogProps {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultProjectId?: string;
}

export function TaskEditDialog({ open, onClose, task, defaultProjectId }: TaskEditDialogProps) {
  const isEdit = !!task;
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();

  const { data: projects = [] } = useProjects();
  const { data: categories = [] } = useCategories();

  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    description: '',
    status: 'Backlog' as TaskStatus,
    priority: 'Medium' as TaskPriority,
    categoryId: '',
    assigneeId: '',
    estimatedHours: '',
    actualHours: '',
    dueDate: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch members for the selected project
  const { data: projectMembers = [] } = useProjectMembers(formData.projectId || undefined);

  useEffect(() => {
    if (task) {
      setFormData({
        projectId: task.projectId,
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        categoryId: task.categoryId || '',
        assigneeId: task.assigneeId || '',
        estimatedHours: task.estimatedHours?.toString() || '',
        actualHours: task.actualHours?.toString() || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    } else {
      setFormData({
        projectId: defaultProjectId || '',
        title: '',
        description: '',
        status: 'Backlog',
        priority: 'Medium',
        categoryId: '',
        assigneeId: '',
        estimatedHours: '',
        actualHours: '',
        dueDate: '',
      });
    }
    setError(null);
  }, [task, defaultProjectId, open]);

  const handleChange =
    (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSubmit = async () => {
    setError(null);

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!isEdit && !formData.projectId) {
      setError('Project is required');
      return;
    }

    try {
      if (isEdit) {
        const data: UpdateTaskRequest = {
          title: formData.title,
          description: formData.description || undefined,
          status: formData.status,
          priority: formData.priority,
          categoryId: formData.categoryId || undefined,
          assigneeId: formData.assigneeId || undefined,
          estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
          actualHours: formData.actualHours ? parseFloat(formData.actualHours) : undefined,
          dueDate: formData.dueDate || undefined,
        };
        await updateMutation.mutateAsync({ id: task!.id, data });
      } else {
        const data: CreateTaskRequest = {
          projectId: formData.projectId,
          title: formData.title,
          description: formData.description || undefined,
          status: formData.status,
          priority: formData.priority,
          categoryId: formData.categoryId || undefined,
          assigneeId: formData.assigneeId || undefined,
          estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
          dueDate: formData.dueDate || undefined,
        };
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      setError(error.response?.data?.error || error.message || 'An error occurred');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const selectedProject = projects.find((p) => p.id === formData.projectId);
  const selectedMember = projectMembers.find((m) => m.userId === formData.assigneeId);
  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Task' : 'Create Task'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Autocomplete
            options={projects}
            getOptionLabel={(option) => `${option.code} - ${option.name}`}
            value={selectedProject || null}
            onChange={(_, newValue) => {
              // Reset assignee when project changes since members are different
              setFormData((prev) => ({ ...prev, projectId: newValue?.id || '', assigneeId: '' }));
            }}
            disabled={isEdit}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Project"
                required={!isEdit}
                helperText={isEdit ? 'Project cannot be changed' : undefined}
              />
            )}
          />

          <TextField
            label="Title"
            value={formData.title}
            onChange={handleChange('title')}
            required
            fullWidth
            autoFocus={!isEdit}
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={handleChange('description')}
            fullWidth
            multiline
            rows={3}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value as TaskStatus }))
                }
              >
                {TASK_STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))
                }
              >
                {TASK_PRIORITY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Autocomplete
            options={categories}
            getOptionLabel={(option) => option.name}
            value={selectedCategory || null}
            onChange={(_, newValue) => {
              setFormData((prev) => ({ ...prev, categoryId: newValue?.id || '' }));
            }}
            renderInput={(params) => <TextField {...params} label="Category" />}
          />

          <Autocomplete
            options={projectMembers}
            getOptionLabel={(option: ProjectMember) => option.userFullName || option.userEmail}
            value={selectedMember || null}
            onChange={(_, newValue) => {
              setFormData((prev) => ({ ...prev, assigneeId: newValue?.userId || '' }));
            }}
            disabled={!formData.projectId}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Assignee"
                helperText={!formData.projectId ? 'Select a project first' : undefined}
              />
            )}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Estimated Hours"
              type="number"
              value={formData.estimatedHours}
              onChange={handleChange('estimatedHours')}
              fullWidth
              inputProps={{ min: 0, step: 0.5 }}
            />
            {isEdit && (
              <TextField
                label="Actual Hours"
                type="number"
                value={formData.actualHours}
                onChange={handleChange('actualHours')}
                fullWidth
                inputProps={{ min: 0, step: 0.5 }}
              />
            )}
          </Box>

          <TextField
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={handleChange('dueDate')}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
        >
          {isEdit ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
