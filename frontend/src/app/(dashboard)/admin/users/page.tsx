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
} from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import { DataGridWrapper } from '@/components/ui';
import { useUsers, useDeleteUser, useChangePassword, User } from '@/features/users';
import { UserEditDialog } from '@/features/users/UserEditDialog';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const { data: users = [], isLoading, refetch } = useUsers(search);
  const deleteMutation = useDeleteUser();
  const changePasswordMutation = useChangePassword();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [userForPassword, setUserForPassword] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const handleAdd = () => {
    setSelectedUser(null);
    setEditDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      await deleteMutation.mutateAsync(userToDelete.id);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handlePasswordClick = (user: User) => {
    setUserForPassword(user);
    setNewPassword('');
    setPasswordDialogOpen(true);
  };

  const handlePasswordConfirm = async () => {
    if (userForPassword && newPassword) {
      await changePasswordMutation.mutateAsync({
        id: userForPassword.id,
        data: { newPassword },
      });
      setPasswordDialogOpen(false);
      setUserForPassword(null);
      setNewPassword('');
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'fullName',
      headerName: 'Name',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'roles',
      headerName: 'Roles',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {(params.value as string[] || []).map((role: string) => (
            <Chip key={role} label={role} size="small" color="primary" variant="outlined" />
          ))}
        </Box>
      ),
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
      renderCell: (params: GridRenderCellParams<User>) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEdit(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset Password">
            <IconButton size="small" onClick={() => handlePasswordClick(params.row)}>
              <LockResetIcon fontSize="small" />
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
      <Typography variant="h5" color="text.primary" sx={{ fontWeight: 600, mb: 2 }}>
        Team Members
      </Typography>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGridWrapper
          rows={users}
          columns={columns}
          loading={isLoading}
          searchPlaceholder="Search users..."
          onAdd={handleAdd}
          onRefresh={() => refetch()}
          addButtonLabel="Add User"
        />
      </Box>

        {/* Edit Dialog */}
        <UserEditDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          user={selectedUser}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete User</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete {userToDelete?.fullName || userToDelete?.email}?
              This action cannot be undone.
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

        {/* Change Password Dialog */}
        <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Enter a new password for {userForPassword?.fullName || userForPassword?.email}.
            </DialogContentText>
            <Box
              component="input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              sx={{
                width: '100%',
                p: 1.5,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                fontSize: '1rem',
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handlePasswordConfirm}
              disabled={!newPassword || changePasswordMutation.isPending}
            >
              Reset Password
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
}
