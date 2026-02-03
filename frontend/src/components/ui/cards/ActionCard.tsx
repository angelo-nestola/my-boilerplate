'use client';

import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  alpha,
  SxProps,
  Theme,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';

interface ActionItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  disabled?: boolean;
}

interface ActionCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  primaryAction?: ActionItem;
  secondaryAction?: ActionItem;
  menuActions?: ActionItem[];
  accentColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  sx?: SxProps<Theme>;
}

export function ActionCard({
  title,
  subtitle,
  description,
  icon,
  primaryAction,
  secondaryAction,
  menuActions,
  accentColor = 'primary',
  sx,
}: ActionCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (action: ActionItem) => {
    handleMenuClose();
    action.onClick();
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      <CardContent sx={{ p: 3, flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
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
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 0.5,
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="body2"
                  sx={{
                    color: `${accentColor}.main`,
                    fontWeight: 500,
                    mb: 1,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
              {description && (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {description}
                </Typography>
              )}
            </Box>
          </Box>

          {menuActions && menuActions.length > 0 && (
            <>
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{
                  color: 'text.secondary',
                  ml: 1,
                }}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                {menuActions.map((action, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => handleMenuItemClick(action)}
                    disabled={action.disabled}
                    sx={{
                      color: action.color === 'error' ? 'error.main' : 'text.primary',
                    }}
                  >
                    {action.icon && (
                      <Box
                        component="span"
                        sx={{
                          mr: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          '& svg': { fontSize: 20 },
                        }}
                      >
                        {action.icon}
                      </Box>
                    )}
                    {action.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Box>
      </CardContent>

      {(primaryAction || secondaryAction) && (
        <CardActions sx={{ px: 3, pb: 2, pt: 0 }}>
          {secondaryAction && (
            <Button
              size="small"
              color={secondaryAction.color || 'inherit'}
              onClick={secondaryAction.onClick}
              disabled={secondaryAction.disabled}
              startIcon={secondaryAction.icon}
            >
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              size="small"
              variant="contained"
              color={primaryAction.color || 'primary'}
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
              startIcon={primaryAction.icon}
              sx={{ ml: 'auto' }}
            >
              {primaryAction.label}
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );
}
