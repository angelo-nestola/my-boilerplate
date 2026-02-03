'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import BugReportIcon from '@mui/icons-material/BugReport';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import BuildIcon from '@mui/icons-material/Build';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import DescriptionIcon from '@mui/icons-material/Description';
import ScienceIcon from '@mui/icons-material/Science';
import EngineeringIcon from '@mui/icons-material/Engineering';
import { TreeGrid, TreeNode } from '@/components/ui/data-grid/TreeGrid';
import { useCategoriesTree, useDeleteCategory, Category } from '@/features/categories';
import { CategoryEditDialog } from '@/features/categories/CategoryEditDialog';

// Map icon names to actual icon components
const iconMap: Record<string, React.ReactNode> = {
  folder: <FolderIcon sx={{ fontSize: 20 }} />,
  bug_report: <BugReportIcon sx={{ fontSize: 20 }} />,
  new_releases: <NewReleasesIcon sx={{ fontSize: 20 }} />,
  build: <BuildIcon sx={{ fontSize: 20 }} />,
  lightbulb: <LightbulbIcon sx={{ fontSize: 20 }} />,
  description: <DescriptionIcon sx={{ fontSize: 20 }} />,
  science: <ScienceIcon sx={{ fontSize: 20 }} />,
  engineering: <EngineeringIcon sx={{ fontSize: 20 }} />,
};

interface CategoryTreeItem {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  sortOrder: number;
  parentId?: string | null;
  children: CategoryTreeItem[];
}

export default function CategoriesPage() {
  const { data: categories = [], isLoading, refetch } = useCategoriesTree();
  const deleteMutation = useDeleteCategory();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [parentIdForNew, setParentIdForNew] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<TreeNode | null>(null);

  // Transform categories to TreeNode format
  const treeData = useMemo(() => {
    const transformCategory = (cat: CategoryTreeItem): TreeNode => ({
      id: cat.id,
      name: cat.name,
      parentId: cat.parentId,
      icon: iconMap[cat.icon || 'folder'] || iconMap.folder,
      color: cat.color || '#1976d2',
      metadata: {
        description: cat.description,
        sortOrder: cat.sortOrder,
        icon: cat.icon,
      },
      children: cat.children?.map(transformCategory) || [],
    });

    return categories.map(transformCategory);
  }, [categories]);

  const handleAdd = () => {
    setSelectedCategory(null);
    setParentIdForNew(null);
    setEditDialogOpen(true);
  };

  const handleAddChild = (parentId: string | number) => {
    setSelectedCategory(null);
    setParentIdForNew(String(parentId));
    setEditDialogOpen(true);
  };

  const handleEdit = (node: TreeNode) => {
    // Reconstruct category from node
    const category: Category = {
      id: String(node.id),
      name: node.name,
      description: node.metadata?.description as string | undefined,
      color: node.color,
      icon: node.metadata?.icon as string | undefined,
      sortOrder: (node.metadata?.sortOrder as number) || 0,
      parentId: node.parentId ? String(node.parentId) : null,
      createdAt: '',
    };
    setSelectedCategory(category);
    setParentIdForNew(null);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (node: TreeNode) => {
    setCategoryToDelete(node);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      try {
        await deleteMutation.mutateAsync(String(categoryToDelete.id));
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
      } catch {
        // Error is handled by mutation
      }
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" color="text.primary" sx={{ fontWeight: 600, mb: 2 }}>
        Task Categories
      </Typography>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <TreeGrid
          title="Categories"
          data={treeData}
          loading={isLoading}
          searchPlaceholder="Search categories..."
          onAdd={handleAdd}
          onAddChild={handleAddChild}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onRefresh={() => refetch()}
          addButtonLabel="Add Category"
          showItemCount
        />
      </Box>

        {/* Edit Dialog */}
        <CategoryEditDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          category={selectedCategory}
          parentId={parentIdForNew}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete &quot;{categoryToDelete?.name}&quot;? This action
              cannot be undone.
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
    </Box>
  );
}
