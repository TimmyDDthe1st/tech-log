'use client';

import React from 'react';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Box, Typography, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Flight } from '../../types/flight';

interface FlightDataGridProps {
  flights: Flight[];
  loading: boolean;
  selectedFlights: (string | number)[];
  onSelectionChange: (selection: any) => void;
  onEdit: (flight: Flight) => void;
  onDelete: (flight: Flight) => void;
}

export const FlightDataGrid: React.FC<FlightDataGridProps> = ({
  flights,
  loading,
  selectedFlights,
  onSelectionChange,
  onEdit,
  onDelete,
}) => {
  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: 'Date',
      type: 'dateTime',
      width: 150,
      valueFormatter: (value) => {
        return new Date(value).toLocaleDateString();
      },
    },
    {
      field: 'pilotName',
      headerName: 'Pilot Name',
      width: 150,
    },
    {
      field: 'startTime',
      headerName: 'Start Time',
      type: 'number',
      width: 120,
    },
    {
      field: 'endTime',
      headerName: 'End Time',
      type: 'number',
      width: 120,
    },
    {
      field: 'totalTime',
      headerName: 'Total Time',
      type: 'number',
      width: 120,
    },
    {
      field: 'comments',
      headerName: 'Comments',
      width: 300,
      flex: 1,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ row }) => {
        return [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            onClick={() => onEdit(row)}
            color="primary"
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => onDelete(row)}
          />,
        ];
      },
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DataGrid
      rows={flights}
      columns={columns}
      initialState={{
        pagination: {
          paginationModel: { page: 0, pageSize: 10 },
        },
        sorting: {
          sortModel: [{ field: 'date', sort: 'asc' }],
        },
      }}
      pageSizeOptions={[5, 10, 25]}
      checkboxSelection
      disableRowSelectionOnClick
      onRowSelectionModelChange={onSelectionChange}
      slots={{
        noRowsOverlay: () => (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            textAlign: 'center',
            p: 2
          }}>
            <Typography variant="body1" color="text.secondary">
              There are no flights logged yet, hit Add New Flight to get started...
            </Typography>
          </Box>
        ),
      }}
      sx={{
        border: 0,
        width: '100%',
        '& .MuiDataGrid-cell:hover': {
          color: 'primary.main',
        },
      }}
    />
  );
};