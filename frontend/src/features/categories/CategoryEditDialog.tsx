'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from './types';
import { useCreateCategory, useUpdateCategory, useCategories } from './hooks';

// Common icon options for categories
const ICON_OPTIONS = [
  { value: 'folder', label: 'Folder' },
  { value: 'bug_report', label: 'Bug' },
  { value: 'new_releases', label: 'Feature' },
  { value: 'build', label: 'Task' },
  { value: 'lightbulb', label: 'Idea' },
  { value: 'description', label: 'Documentation' },
  { value: 'science', label: 'Research' },
  { value: 'engineering', label: 'Engineering' },
];

// Common color options
const COLOR_OPTIONS = [
  { value: '#1976d2', label: 'Blue' },
  { value: '#2e7d32', label: 'Green' },
  { value: '#ed6c02', label: 'Orange' },
  { value: '#d32f2f', label: 'Red' },
  { value: '#9c27b0', label: 'Purple' },
  { value: '#0288d1', label: 'Cyan' },
  { value: '#616161', label: 'Gray' },
];

interface CategoryEditDialogProps {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
  parentId?: string | null;
}

export function CategoryEditDialog({
  open,
  onClose,
  category,
  parentId: initialParentId,
}: CategoryEditDialogProps) {
  const isEdit = !!category;
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const { data: categories = [] } = useCategories();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#1976d2',
    icon: 'folder',
    sortOrder: 0,
    parentId: '' as string | null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color || '#1976d2',
        icon: category.icon || 'folder',
        sortOrder: category.sortOrder,
        parentId: category.parentId || null,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#1976d2',
        icon: 'folder',
        sortOrder: 0,
        parentId: initialParentId || null,
      });
    }
    setError(null);
  }, [category, initialParentId, open]);

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

    try {
      if (isEdit) {
        const data: UpdateCategoryRequest = {
          name: formData.name,
          description: formData.description || undefined,
          color: formData.color || undefined,
          icon: formData.icon || undefined,
          sortOrder: formData.sortOrder,
          parentId: formData.parentId || null,
        };
        await updateMutation.mutateAsync({ id: category!.id, data });
      } else {
        const data: CreateCategoryRequest = {
          name: formData.name,
          description: formData.description || undefined,
          color: formData.color || undefined,
          icon: formData.icon || undefined,
          sortOrder: formData.sortOrder,
          parentId: formData.parentId || null,
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

  // Filter out current category and its descendants from parent options
  const availableParents = categories.filter((c) => {
    if (!isEdit) return true;
    if (c.id === category?.id) return false;
    // Simple check - in a real app you'd check all descendants
    return true;
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Category' : 'Create Category'}</DialogTitle>
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
            label="Description"
            value={formData.description}
            onChange={handleChange('description')}
            fullWidth
            multiline
            rows={2}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Color</InputLabel>
              <Select
                value={formData.color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, color: e.target.value as string }))
                }
                label="Color"
              >
                {COLOR_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: option.value,
                        }}
                      />
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Icon</InputLabel>
              <Select
                value={formData.icon}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, icon: e.target.value as string }))
                }
                label="Icon"
              >
                {ICON_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Sort Order"
              type="number"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))
              }
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Parent Category</InputLabel>
              <Select
                value={formData.parentId || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    parentId: e.target.value || null,
                  }))
                }
                label="Parent Category"
              >
                <MenuItem value="">
                  <em>None (Root)</em>
                </MenuItem>
                {availableParents.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
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
