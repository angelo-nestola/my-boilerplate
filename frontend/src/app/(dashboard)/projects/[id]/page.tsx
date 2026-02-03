'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import { DashboardLayout } from '@/components/layout';
import {
  useProject,
  useProjectMembers,
  useAddProjectMember,
  useUpdateProjectMember,
  useRemoveProjectMember,
  ProjectMember,
  ProjectRole,
} from '@/features/projects';
import { ProjectEditDialog } from '@/features/projects/ProjectEditDialog';
import { useUsers } from '@/features/users';

const ROLE_OPTIONS: ProjectRole[] = ['Viewer', 'Developer', 'Admin', 'Owner'];

const roleColors: Record<ProjectRole, 'default' | 'info' | 'warning' | 'error'> = {
  Viewer: 'default',
  Developer: 'info',
  Admin: 'warning',
  Owner: 'error',
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: members = [], isLoading: membersLoading } = useProjectMembers(projectId);
  const { data: users = [] } = useUsers();
  const addMemberMutation = useAddProjectMember();
  const updateMemberMutation = useUpdateProjectMember();
  const removeMemberMutation = useRemoveProjectMember();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<ProjectRole>('Developer');
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter out users who are already members
  const memberUserIds = members.map((m) => m.userId);
  const availableUsers = users.filter((u) => !memberUserIds.includes(u.id));

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    setError(null);

    try {
      await addMemberMutation.mutateAsync({
        projectId,
        data: { userId: selectedUserId, role: selectedRole },
      });
      setAddMemberDialogOpen(false);
      setSelectedUserId('');
      setSelectedRole('Developer');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      setError(error.response?.data?.error || error.message || 'An error occurred');
    }
  };

  const handleRoleChange = async (member: ProjectMember, newRole: ProjectRole) => {
    try {
      await updateMemberMutation.mutateAsync({
        projectId,
        memberId: member.id,
        data: { role: newRole },
      });
    } catch {
      // Error handled by mutation
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await removeMemberMutation.mutateAsync({
        projectId,
        memberId: memberToRemove.id,
      });
      setMemberToRemove(null);
    } catch {
      // Error handled by mutation
    }
  };

  if (projectLoading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 3 }} />
        </Box>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">Project not found</Alert>
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/projects')} sx={{ mt: 2 }}>
            Back to Projects
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ pb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => router.push('/projects')}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {project.name}
              </Typography>
              <Chip label={project.code} color="primary" variant="outlined" />
              <Chip
                label={project.isActive ? 'Active' : 'Inactive'}
                color={project.isActive ? 'success' : 'default'}
                size="small"
              />
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setEditDialogOpen(true)}
          >
            Edit
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Project Info */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Details
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography>{project.description || 'No description'}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography>
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : 'Not set'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    End Date
                  </Typography>
                  <Typography>
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString()
                      : 'Not set'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Members
                  </Typography>
                  <Typography>{project.memberCount}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tasks
                  </Typography>
                  <Typography>{project.taskCount}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Members */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Team Members</Typography>
                <Button
                  size="small"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setAddMemberDialogOpen(true)}
                >
                  Add
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {membersLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : members.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No team members yet
                </Typography>
              ) : (
                <List dense>
                  {members.map((member) => (
                    <ListItem
                      key={member.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          size="small"
                          color="error"
                          onClick={() => setMemberToRemove(member)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {(member.userFullName || member.userEmail)[0].toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={member.userFullName || member.userEmail}
                      />
                      <Select
                        size="small"
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member, e.target.value as ProjectRole)
                        }
                        variant="standard"
                        sx={{ fontSize: '0.75rem', mr: 2 }}
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <MenuItem key={role} value={role}>
                            <Chip
                              label={role}
                              size="small"
                              color={roleColors[role]}
                              sx={{ height: 20 }}
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Edit Project Dialog */}
        <ProjectEditDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          project={project}
        />

        {/* Add Member Dialog */}
        <Dialog open={addMemberDialogOpen} onClose={() => setAddMemberDialogOpen(false)}>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>User</InputLabel>
              <Select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                label="User"
              >
                {availableUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.fullName || user.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as ProjectRole)}
                label="Role"
              >
                {ROLE_OPTIONS.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddMemberDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleAddMember}
              disabled={!selectedUserId || addMemberMutation.isPending}
            >
              Add Member
            </Button>
          </DialogActions>
        </Dialog>

        {/* Remove Member Confirmation */}
        <Dialog open={!!memberToRemove} onClose={() => setMemberToRemove(null)}>
          <DialogTitle>Remove Member</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to remove{' '}
              {memberToRemove?.userFullName || memberToRemove?.userEmail} from this project?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMemberToRemove(null)}>Cancel</Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleRemoveMember}
              disabled={removeMemberMutation.isPending}
            >
              Remove
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
