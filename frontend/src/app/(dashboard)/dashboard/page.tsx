'use client';

import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import ArticleIcon from '@mui/icons-material/Article';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Placeholder stats data
const stats = [
  { title: 'Total Users', value: '1,234', icon: <PeopleIcon />, color: '#1976d2' },
  { title: 'Documents', value: '567', icon: <ArticleIcon />, color: '#2e7d32' },
  { title: 'Growth', value: '+12.5%', icon: <TrendingUpIcon />, color: '#ed6c02' },
  { title: 'Avg. Time', value: '3.5h', icon: <AccessTimeIcon />, color: '#9c27b0' },
];

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.title}>
            <Card>
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
                      bgcolor: `${stat.color}15`,
                      color: stat.color,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" component="div">
                    {stat.value}
                  </Typography>
                </Box>
                <Typography color="text.secondary" variant="body2">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Welcome to CleanApi Dashboard
          </Typography>
          <Typography color="text.secondary">
            This is a placeholder dashboard page. The backend API is connected and ready to use.
            You can extend this page with real data from your API endpoints.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
