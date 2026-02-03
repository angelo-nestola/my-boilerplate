'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  alpha,
  SxProps,
  Theme,
} from '@mui/material';

interface InfoCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  status?: {
    label: string;
    color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  };
  metadata?: Array<{
    label: string;
    value: string | number;
  }>;
  accentColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

export function InfoCard({
  title,
  description,
  icon,
  status,
  metadata,
  accentColor = 'primary',
  onClick,
  sx,
}: InfoCardProps) {
  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        borderLeft: 4,
        borderColor: `${accentColor}.main`,
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: (theme) => theme.shadows[4],
            }
          : {},
        ...sx,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {icon && (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette[accentColor].main, 0.12),
                color: `${accentColor}.main`,
                flexShrink: 0,
                '& svg': {
                  fontSize: 24,
                },
              }}
            >
              {icon}
            </Box>
          )}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {title}
              </Typography>
              {status && (
                <Chip
                  label={status.label}
                  color={status.color}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.675rem',
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>

            {description && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mb: metadata ? 1.5 : 0,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {description}
              </Typography>
            )}

            {metadata && metadata.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {metadata.map((item, index) => (
                  <Box key={index}>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.disabled', display: 'block' }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, color: 'text.primary' }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
