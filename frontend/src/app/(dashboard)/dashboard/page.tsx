'use client';

import { Grid, Card, CardContent, Typography, Box, Skeleton, Chip, LinearProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import FolderIcon from '@mui/icons-material/Folder';
import TaskIcon from '@mui/icons-material/Task';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useUsers } from '@/features/users';
import { useProjects, ProjectListItem } from '@/features/projects';
import { useMyTasks, TASK_STATUS_OPTIONS } from '@/features/tasks';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

function StatCard({
  title,
  value,
  icon,
  color,
  loading,
  onClick,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            }
          : undefined,
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${color}15`,
              color: color,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          {loading ? (
            <Skeleton variant="text" width={60} height={40} />
          ) : (
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          )}
        </Box>
        <Typography color="text.secondary" variant="body2">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
}

function getStatusLabel(status: string): string {
  const option = TASK_STATUS_OPTIONS.find((o) => o.value === status);
  return option?.label || status;
}

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

function getStatusColor(status: string): ChipColor {
  const option = TASK_STATUS_OPTIONS.find((o) => o.value === status);
  return (option?.color || 'default') as ChipColor;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: myTasks = [], isLoading: myTasksLoading } = useMyTasks();

  const inProgressTasks = myTasks.filter((t) => t.status === 'InProgress');
  const activeProjects = projects.filter((p: ProjectListItem) => p.isActive);

  return (
    <Box>
      <Typography variant="h5" color="text.primary" sx={{ fontWeight: 600, mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Users"
            value={users.length}
            icon={<PeopleIcon />}
            color="#1976d2"
            loading={usersLoading}
            onClick={() => router.push(ROUTES.ADMIN_USERS)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Projects"
            value={activeProjects.length}
            icon={<FolderIcon />}
            color="#2e7d32"
            loading={projectsLoading}
            onClick={() => router.push(ROUTES.PROJECTS)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="My Tasks"
            value={myTasks.length}
            icon={<TaskIcon />}
            color="#ed6c02"
            loading={myTasksLoading}
            onClick={() => router.push(ROUTES.TASKS)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="In Progress"
            value={inProgressTasks.length}
            icon={<PlayArrowIcon />}
            color="#9c27b0"
            loading={myTasksLoading}
            onClick={() => router.push(ROUTES.TASKS)}
          />
        </Grid>
      </Grid>

      {/* Recent Projects */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Recent Projects
          </Typography>
          {projectsLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" height={60} />
              ))}
            </Box>
          ) : activeProjects.length === 0 ? (
            <Typography color="text.secondary">No active projects yet.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {activeProjects.slice(0, 5).map((project: ProjectListItem) => {
                const progress =
                  project.taskCount > 0
                    ? Math.round((project.completedTaskCount / project.taskCount) * 100)
                    : 0;
                return (
                  <Box
                    key={project.id}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.selected' },
                    }}
                    onClick={() => router.push(`${ROUTES.PROJECTS}/${project.id}`)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={project.code} size="small" variant="outlined" color="primary" />
                        <Typography variant="subtitle1">{project.name}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {project.taskCount} tasks
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ flex: 1, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption" sx={{ minWidth: 35 }}>
                        {progress}%
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* My Recent Tasks */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            My Recent Tasks
          </Typography>
          {myTasksLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" height={40} />
              ))}
            </Box>
          ) : myTasks.length === 0 ? (
            <Typography color="text.secondary">No tasks assigned to you yet.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {myTasks.slice(0, 5).map((task) => (
                <Box
                  key={task.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.selected' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onClick={() => router.push(ROUTES.TASKS)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label={task.taskKey} size="small" variant="outlined" />
                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                      {task.title}
                    </Typography>
                  </Box>
                  <Chip label={getStatusLabel(task.status)} size="small" color={getStatusColor(task.status)} />
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
