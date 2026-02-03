'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  alpha,
  SxProps,
  Theme,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowModesModel,
  GridRowId,
  GridEventListener,
  GridRowEditStopReasons,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridValidRowModel,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import RefreshIcon from '@mui/icons-material/Refresh';

export type DataGridRow = GridValidRowModel & { id: string | number };

interface DataGridWrapperProps {
  title?: string;
  rows: DataGridRow[];
  columns: GridColDef[];
  loading?: boolean;
  searchPlaceholder?: string;
  onAdd?: () => void;
  onEdit?: (row: DataGridRow) => void;
  onDelete?: (id: GridRowId) => void;
  onRefresh?: () => void;
  onRowUpdate?: (newRow: DataGridRow, oldRow: DataGridRow) => Promise<DataGridRow>;
  editable?: boolean;
  addButtonLabel?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  sx?: SxProps<Theme>;
}

interface CustomToolbarProps {
  title?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  onAdd?: () => void;
  onRefresh?: () => void;
  addButtonLabel?: string;
}

function CustomToolbar({
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  onAdd,
  onRefresh,
  addButtonLabel = 'Add',
}: CustomToolbarProps) {
  return (
    <GridToolbarContainer
      sx={{
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {title && (
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        )}

        {onAdd && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            sx={{ borderRadius: 2 }}
          >
            {addButtonLabel}
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: searchValue && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => onSearchChange('')}>
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

        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />

        {onRefresh && (
          <IconButton onClick={onRefresh} size="small" color="primary">
            <RefreshIcon />
          </IconButton>
        )}
      </Box>
    </GridToolbarContainer>
  );
}

export function DataGridWrapper({
  title,
  rows,
  columns,
  loading = false,
  searchPlaceholder,
  onAdd,
  onEdit,
  onDelete,
  onRefresh,
  onRowUpdate,
  editable = false,
  addButtonLabel,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  sx,
}: DataGridWrapperProps) {
  const [searchValue, setSearchValue] = useState('');
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [paginationModel, setPaginationModel] = useState({
    pageSize,
    page: 0,
  });

  // Filter rows based on search
  const filteredRows = rows.filter((row) => {
    if (!searchValue) return true;
    const searchLower = searchValue.toLowerCase();
    return Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchLower)
    );
  });

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const processRowUpdate = useCallback(
    async (newRow: DataGridRow, oldRow: DataGridRow) => {
      if (onRowUpdate) {
        return await onRowUpdate(newRow, oldRow);
      }
      return newRow;
    },
    [onRowUpdate]
  );

  const handleProcessRowUpdateError = useCallback((error: Error) => {
    console.error('Error updating row:', error);
  }, []);

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
      <DataGrid
        rows={filteredRows}
        columns={columns}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={pageSizeOptions}
        editMode={editable ? 'row' : undefined}
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={handleProcessRowUpdateError}
        disableRowSelectionOnClick
        slots={{
          toolbar: () => (
            <CustomToolbar
              title={title}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              searchPlaceholder={searchPlaceholder}
              onAdd={onAdd}
              onRefresh={onRefresh}
              addButtonLabel={addButtonLabel}
            />
          ),
        }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
            borderBottom: '2px solid',
            borderColor: 'divider',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
          },
          '& .MuiDataGrid-row:hover': {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid',
            borderColor: 'divider',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid',
            borderColor: 'divider',
          },
        }}
      />
    </Paper>
  );
}
