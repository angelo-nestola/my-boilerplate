'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Project, CreateProjectRequest, UpdateProjectRequest } from './types';
import { useCreateProject, useUpdateProject } from './hooks';

interface ProjectEditDialogProps {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
}

export function ProjectEditDialog({ open, onClose, project }: ProjectEditDialogProps) {
  const isEdit = !!project;
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        code: project.code,
        description: project.description || '',
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
        isActive: project.isActive,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        startDate: '',
        endDate: '',
        isActive: true,
      });
    }
    setError(null);
  }, [project, open]);

  const handleChange =
    (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSubmit = async () => {
    setError(null);

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (!isEdit && !formData.code.trim()) {
      setError('Code is required');
      return;
    }

    try {
      if (isEdit) {
        const data: UpdateProjectRequest = {
          name: formData.name,
          description: formData.description || undefined,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          isActive: formData.isActive,
        };
        await updateMutation.mutateAsync({ id: project!.id, data });
      } else {
        const data: CreateProjectRequest = {
          name: formData.name,
          code: formData.code.toUpperCase(),
          description: formData.description || undefined,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Project' : 'Create Project'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Name"
            value={formData.name}
            onChange={handleChange('name')}
            required
            fullWidth
            autoFocus
          />

          <TextField
            label="Code"
            value={formData.code}
            onChange={handleChange('code')}
            required={!isEdit}
            disabled={isEdit}
            fullWidth
            helperText={isEdit ? 'Code cannot be changed' : 'Unique project code (e.g., PROJ-1)'}
            inputProps={{ style: { textTransform: 'uppercase' } }}
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
            <TextField
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={handleChange('startDate')}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={handleChange('endDate')}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {isEdit && (
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                />
              }
              label="Active"
            />
          )}
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
