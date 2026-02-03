'use client';

import { Box, Card, CardContent, Typography, alpha, SxProps, Theme } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  sx?: SxProps<Theme>;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  sx,
}: StatCardProps) {
  const isPositiveTrend = trend && trend.value >= 0;

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        ...sx,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: trend ? 1 : 0,
              }}
            >
              {value}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {isPositiveTrend ? (
                  <TrendingUpIcon
                    sx={{
                      fontSize: 16,
                      color: 'success.main',
                    }}
                  />
                ) : (
                  <TrendingDownIcon
                    sx={{
                      fontSize: 16,
                      color: 'error.main',
                    }}
                  />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: isPositiveTrend ? 'success.main' : 'error.main',
                    fontWeight: 600,
                  }}
                >
                  {isPositiveTrend ? '+' : ''}
                  {trend.value}%
                </Typography>
                {trend.label && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {trend.label}
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {icon && (
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette[color].main, 0.12),
                color: `${color}.main`,
                '& svg': {
                  fontSize: 28,
                },
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
