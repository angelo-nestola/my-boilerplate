'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  Skeleton,
  Tooltip,
  Collapse,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { OrgUnitTreeNode, OrgUnitType } from './types';

const TYPE_COLORS: Record<OrgUnitType, 'primary' | 'secondary' | 'warning' | 'info'> = {
  Orbit: 'primary',
  CompetenceCenter: 'secondary',
  TechnicalHub: 'warning',
  StaffGroup: 'info',
};

const TYPE_LABELS: Record<OrgUnitType, string> = {
  Orbit: 'Orbit',
  CompetenceCenter: 'CC',
  TechnicalHub: 'Hub',
  StaffGroup: 'Staff',
};

interface OrgTreeRowProps {
  node: OrgUnitTreeNode;
  depth: number;
  defaultExpanded?: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
}

function OrgTreeRow({ node, depth, defaultExpanded = false, selectedId, onSelect }: OrgTreeRowProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.id;
  const toggle = useCallback(() => setExpanded((prev) => !prev), []);

  const tooltipContent = [node.name, node.domain].filter(Boolean).join(' — ');

  return (
    <>
      <Tooltip title={tooltipContent} placement="right" arrow>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            pl: depth * 3,
            py: 0.5,
            cursor: 'pointer',
            borderRadius: 1,
            bgcolor: isSelected ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: isSelected ? 'action.selected' : 'action.hover' },
          }}
          onClick={() => onSelect?.(node.id)}
        >
          {hasChildren ? (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                toggle();
              }}
              sx={{ p: 0.25 }}
            >
              {expanded ? (
                <ExpandMoreIcon sx={{ fontSize: 18 }} />
              ) : (
                <ChevronRightIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          ) : (
            <Box sx={{ width: 22 }} />
          )}

          <Chip
            label={TYPE_LABELS[node.type]}
            color={TYPE_COLORS[node.type]}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.7rem', minWidth: 44 }}
          />

          <Typography
            variant="body2"
            noWrap
            sx={{
              fontWeight: isSelected ? 700 : depth === 0 ? 600 : 400,
              fontSize: '0.85rem',
            }}
          >
            {node.code}{node.code !== node.name ? ` — ${node.name}` : ''}
          </Typography>

          {node.memberCount > 0 && (
            <Typography variant="caption" color="text.secondary">
              ({node.memberCount})
            </Typography>
          )}

          {hasChildren && !expanded && (
            <Typography variant="caption" color="text.disabled">
              +{node.children.length}
            </Typography>
          )}
        </Box>
      </Tooltip>

      {hasChildren && (
        <Collapse in={expanded}>
          {node.children.map((child) => (
            <OrgTreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </Collapse>
      )}
    </>
  );
}

interface OrgChartProps {
  data: OrgUnitTreeNode[];
  loading?: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export function OrgChart({ data, loading, selectedId, onSelect }: OrgChartProps) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, py: 2 }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" height={28} width={`${60 + i * 5}%`} />
        ))}
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
        No organization units found. Create your first unit to see the structure.
      </Typography>
    );
  }

  return (
    <Box sx={{ py: 1 }}>
      {data.map((root) => (
        <OrgTreeRow
          key={root.id}
          node={root}
          depth={0}
          defaultExpanded
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </Box>
  );
}
