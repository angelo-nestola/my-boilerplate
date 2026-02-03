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
  FormControlLabel,
  Switch,
  Box,
  Alert,
  CircularProgress,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
} from '@mui/material';
import { User, CreateUserRequest, UpdateUserRequest } from './types';
import { useCreateUser, useUpdateUser, useRoles } from './hooks';

interface UserEditDialogProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
}

export function UserEditDialog({ open, onClose, user }: UserEditDialogProps) {
  const isEdit = !!user;
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    isActive: true,
    roles: [] as string[],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        isActive: user.isActive,
        roles: user.roles || [],
      });
    } else {
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        isActive: true,
        roles: [],
      });
    }
    setError(null);
  }, [user, open]);

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleRolesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      roles: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleSubmit = async () => {
    setError(null);

    try {
      if (isEdit) {
        const data: UpdateUserRequest = {
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          phoneNumber: formData.phoneNumber || undefined,
          isActive: formData.isActive,
          roles: formData.roles,
        };
        await updateMutation.mutateAsync({ id: user!.id, data });
      } else {
        if (!formData.email || !formData.password) {
          setError('Email and password are required');
          return;
        }
        const data: CreateUserRequest = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          phoneNumber: formData.phoneNumber || undefined,
          roles: formData.roles,
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
      <DialogTitle>{isEdit ? 'Edit User' : 'Create User'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            disabled={isEdit}
            required={!isEdit}
            fullWidth
          />

          {!isEdit && (
            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              required
              fullWidth
            />
          )}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="First Name"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              fullWidth
            />
          </Box>

          <TextField
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange('phoneNumber')}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Roles</InputLabel>
            <Select
              multiple
              value={formData.roles}
              onChange={handleRolesChange}
              input={<OutlinedInput label="Roles" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              disabled={rolesLoading}
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
