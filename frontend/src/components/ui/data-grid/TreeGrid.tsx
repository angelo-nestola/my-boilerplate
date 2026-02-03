'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  alpha,
  Chip,
  SxProps,
  Theme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderIcon from '@mui/icons-material/Folder';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export interface TreeNode {
  id: string | number;
  name: string;
  parentId?: string | number | null;
  children?: TreeNode[];
  metadata?: Record<string, unknown>;
  icon?: React.ReactNode;
  color?: string;
}

interface TreeGridProps {
  title?: string;
  data: TreeNode[];
  loading?: boolean;
  searchPlaceholder?: string;
  onAdd?: () => void;
  onAddChild?: (parentId: string | number) => void;
  onEdit?: (node: TreeNode) => void;
  onDelete?: (node: TreeNode) => void;
  onRefresh?: () => void;
  onSelect?: (node: TreeNode) => void;
  selectedId?: string | number | null;
  addButtonLabel?: string;
  showItemCount?: boolean;
  sx?: SxProps<Theme>;
}

interface TreeItemProps {
  node: TreeNode;
  level: number;
  expandedIds: Set<string | number>;
  toggleExpand: (id: string | number) => void;
  onAddChild?: (parentId: string | number) => void;
  onEdit?: (node: TreeNode) => void;
  onDelete?: (node: TreeNode) => void;
  onSelect?: (node: TreeNode) => void;
  selectedId?: string | number | null;
  showItemCount?: boolean;
  searchValue: string;
}

function TreeItem({
  node,
  level,
  expandedIds,
  toggleExpand,
  onAddChild,
  onEdit,
  onDelete,
  onSelect,
  selectedId,
  showItemCount,
  searchValue,
}: TreeItemProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  // Highlight search matches
  const matchesSearch = searchValue
    ? node.name.toLowerCase().includes(searchValue.toLowerCase())
    : false;

  const childCount = useMemo(() => {
    const countChildren = (n: TreeNode): number => {
      if (!n.children) return 0;
      return n.children.length + n.children.reduce((sum, child) => sum + countChildren(child), 0);
    };
    return countChildren(node);
  }, [node]);

  return (
    <>
      <ListItem
        disablePadding
        sx={{
          display: 'block',
        }}
      >
        <ListItemButton
          onClick={() => {
            if (hasChildren) {
              toggleExpand(node.id);
            }
            onSelect?.(node);
          }}
          sx={{
            pl: 2 + level * 3,
            py: 1,
            bgcolor: isSelected
              ? (theme) => alpha(theme.palette.primary.main, 0.12)
              : matchesSearch
                ? (theme) => alpha(theme.palette.warning.main, 0.08)
                : 'transparent',
            borderLeft: isSelected ? 3 : 0,
            borderColor: 'primary.main',
            '&:hover': {
              bgcolor: (theme) =>
                isSelected
                  ? alpha(theme.palette.primary.main, 0.16)
                  : alpha(theme.palette.action.hover, 0.08),
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            {hasChildren ? (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node.id);
                }}
                sx={{ p: 0.5 }}
              >
                {isExpanded ? (
                  <ExpandMoreIcon sx={{ fontSize: 20 }} />
                ) : (
                  <ChevronRightIcon sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            ) : (
              <Box sx={{ width: 28 }} />
            )}
          </ListItemIcon>

          <ListItemIcon
            sx={{
              minWidth: 36,
              color: node.color || 'primary.main',
            }}
          >
            {node.icon || <FolderIcon sx={{ fontSize: 20 }} />}
          </ListItemIcon>

          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isSelected ? 600 : 400,
                    color: 'text.primary',
                  }}
                >
                  {node.name}
                </Typography>
                {showItemCount && childCount > 0 && (
                  <Chip
                    label={childCount}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      bgcolor: (theme) => alpha(theme.palette.text.secondary, 0.1),
                    }}
                  />
                )}
              </Box>
            }
          />

          <ListItemSecondaryAction>
            <Box
              sx={{
                display: 'flex',
                gap: 0.5,
                opacity: 0,
                transition: 'opacity 0.2s',
                '.MuiListItemButton-root:hover &': {
                  opacity: 1,
                },
              }}
            >
              {onAddChild && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild(node.id);
                  }}
                  sx={{ color: 'success.main' }}
                >
                  <AddCircleOutlineIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
              {onEdit && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(node);
                  }}
                  sx={{ color: 'primary.main' }}
                >
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
              {onDelete && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(node);
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
            </Box>
          </ListItemSecondaryAction>
        </ListItemButton>
      </ListItem>

      {hasChildren && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {node.children!.map((child) => (
              <TreeItem
                key={child.id}
                node={child}
                level={level + 1}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
                onAddChild={onAddChild}
                onEdit={onEdit}
                onDelete={onDelete}
                onSelect={onSelect}
                selectedId={selectedId}
                showItemCount={showItemCount}
                searchValue={searchValue}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

// Build tree structure from flat data
function buildTree(data: TreeNode[]): TreeNode[] {
  const map = new Map<string | number, TreeNode>();
  const roots: TreeNode[] = [];

  // First pass: create map
  data.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });

  // Second pass: build tree
  data.forEach((item) => {
    const node = map.get(item.id)!;
    if (item.parentId && map.has(item.parentId)) {
      const parent = map.get(item.parentId)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

// Filter tree to include only matching nodes and their ancestors
function filterTree(nodes: TreeNode[], searchValue: string): TreeNode[] {
  if (!searchValue) return nodes;

  const searchLower = searchValue.toLowerCase();

  const filterNode = (node: TreeNode): TreeNode | null => {
    const nameMatches = node.name.toLowerCase().includes(searchLower);
    const filteredChildren = node.children
      ? node.children.map(filterNode).filter((n): n is TreeNode => n !== null)
      : [];

    if (nameMatches || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children,
      };
    }

    return null;
  };

  return nodes.map(filterNode).filter((n): n is TreeNode => n !== null);
}

export function TreeGrid({
  title,
  data,
  loading = false,
  searchPlaceholder = 'Search...',
  onAdd,
  onAddChild,
  onEdit,
  onDelete,
  onRefresh,
  onSelect,
  selectedId,
  addButtonLabel = 'Add',
  showItemCount = true,
  sx,
}: TreeGridProps) {
  const [searchValue, setSearchValue] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set());

  // Build tree from flat data if needed
  const treeData = useMemo(() => {
    // Check if data is already in tree format
    const hasNesting = data.some((item) => item.children && item.children.length > 0);
    if (hasNesting) return data;

    // Build tree from flat data
    return buildTree(data);
  }, [data]);

  // Filter tree based on search
  const filteredTree = useMemo(
    () => filterTree(treeData, searchValue),
    [treeData, searchValue]
  );

  const toggleExpand = (id: string | number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string | number>();
    const collectIds = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          allIds.add(node.id);
          collectIds(node.children);
        }
      });
    };
    collectIds(treeData);
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        ...sx,
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
        }}
      >
        {title && (
          <Typography variant="h6" sx={{ fontWeight: 600, mr: 'auto' }}>
            {title}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: searchValue && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchValue('')}>
                    <ClearIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <Button size="small" onClick={expandAll} sx={{ minWidth: 0 }}>
            Expand All
          </Button>
          <Button size="small" onClick={collapseAll} sx={{ minWidth: 0 }}>
            Collapse
          </Button>

          {onRefresh && (
            <IconButton onClick={onRefresh} size="small" color="primary">
              <RefreshIcon />
            </IconButton>
          )}

          {onAdd && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAdd}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              {addButtonLabel}
            </Button>
          )}
        </Box>
      </Box>

      {/* Tree Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          bgcolor: 'background.paper',
        }}
      >
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Loading...</Typography>
          </Box>
        ) : filteredTree.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {searchValue ? 'No items found' : 'No data available'}
            </Typography>
          </Box>
        ) : (
          <List component="nav" disablePadding>
            {filteredTree.map((node) => (
              <TreeItem
                key={node.id}
                node={node}
                level={0}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
                onAddChild={onAddChild}
                onEdit={onEdit}
                onDelete={onDelete}
                onSelect={onSelect}
                selectedId={selectedId}
                showItemCount={showItemCount}
                searchValue={searchValue}
              />
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
}
