'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Box,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
  ThemeProvider,
  CssBaseline,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useForm, Controller } from 'react-hook-form';
import { Flight } from '../../types/flight';
import { lightTheme, darkTheme } from '../theme';

interface FlightFormData {
  date: string;
  pilotName: string;
  startTime: number;
  endTime: number;
  comments: string;
}

export default function Home() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [flightToDelete, setFlightToDelete] = useState<Flight | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [flightToEdit, setFlightToEdit] = useState<Flight | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<FlightFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      pilotName: '',
      startTime: 0,
      endTime: 0,
      comments: '',
    }
  });

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const response = await fetch('/api/flights');
        if (!response.ok) {
          throw new Error('Failed to fetch flights');
        }
        const data = await response.json();
        setFlights(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, []);

  const handleDeleteClick = (flight: Flight) => {
    setFlightToDelete(flight);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!flightToDelete) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/flights?id=${flightToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete flight');
      }
      
      // Remove the flight from the local state
      setFlights(flights.filter(f => f.id !== flightToDelete.id));
      setDeleteDialogOpen(false);
      setFlightToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete flight');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setFlightToDelete(null);
  };

  const handleCreateClick = () => {
    // Find the most recent endTime to use as startTime
    if (flights.length > 0) {
      const mostRecentFlight = flights.reduce((latest, current) => {
        return new Date(current.date) > new Date(latest.date) ? current : latest;
      });

      setValue('startTime', mostRecentFlight.endTime);
    } else {
      // If no flights exist, start with 0
      setValue('startTime', 0);
    }

    setCreateDialogOpen(true);
  };

  const handleCreateSubmit = async (data: FlightFormData) => {
    setCreating(true);
    try {
      const payload = {
        date: new Date(data.date).toISOString().slice(0, 19).replace('T', ' '),
        pilotName: data.pilotName,
        startTime: Number(data.startTime),
        endTime: Number(data.endTime),
        comments: data.comments,
      };
      
      console.log('Sending payload:', payload);
      
      const response = await fetch('/api/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create flight');
      }

      const newFlight = await response.json();
      setFlights([newFlight, ...flights]);
      setCreateDialogOpen(false);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create flight');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateCancel = () => {
    setCreateDialogOpen(false);
    reset();
  };

  const handleEditClick = (flight: Flight) => {
    setFlightToEdit(flight);
    // Pre-populate the form with existing flight data
    setValue('date', new Date(flight.date).toISOString().split('T')[0]);
    setValue('pilotName', flight.pilotName);
    setValue('startTime', flight.startTime);
    setValue('endTime', flight.endTime);
    setValue('comments', flight.comments);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: FlightFormData) => {
    if (!flightToEdit) return;
    
    setEditing(true);
    try {
      const payload = {
        id: flightToEdit.id,
        date: new Date(data.date).toISOString().slice(0, 19).replace('T', ' '),
        pilotName: data.pilotName,
        startTime: Number(data.startTime),
        endTime: Number(data.endTime),
        comments: data.comments,
      };
      
      console.log('Sending edit payload:', payload);
      
      const response = await fetch('/api/flights', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update flight');
      }

      const updatedFlight = await response.json();
      // Update the flight in the local state
      setFlights(flights.map(f => f.id === updatedFlight.id ? updatedFlight : f));
      setEditDialogOpen(false);
      setFlightToEdit(null);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update flight');
    } finally {
      setEditing(false);
    }
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setFlightToEdit(null);
    reset();
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 90,
    },
    {
      field: 'date',
      headerName: 'Date',
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
            onClick={() => handleEditClick(row)}
            color="primary"
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDeleteClick(row)}
            color="error"
          />,
        ];
      },
    },
  ];

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  if (loading) {
    return (
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <Box sx={{ width: '100%', p: 3, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <Box sx={{ width: '100%', p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box sx={{ width: '100%', p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Pilot Flight Tracker
        </Typography>
        <Box display="flex" gap={2}>
          <IconButton onClick={toggleTheme} color="inherit">
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
            disabled={loading}
          >
            Add New Flight
          </Button>
        </Box>
      </Box>
      
      <Paper elevation={3} sx={{ mt: 3, height: 600 }}>
        <DataGrid
          rows={flights}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            border: 0,
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main',
            },
          }}
        />
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the flight record for {flightToDelete?.pilotName} on{' '}
            {flightToDelete && new Date(flightToDelete.date).toLocaleDateString()}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleting}
            autoFocus
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={createDialogOpen}
        onClose={handleCreateCancel}
        maxWidth="sm"
        fullWidth
        aria-labelledby="create-dialog-title"
      >
        <DialogTitle id="create-dialog-title">
          Add New Flight
        </DialogTitle>
        <form onSubmit={handleSubmit(handleCreateSubmit)}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Controller
                name="date"
                control={control}
                rules={{ required: 'Date is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Date"
                    type="date"
                    fullWidth
                    disabled
                    error={!!errors.date}
                    helperText={errors.date?.message || 'Automatically set to today\'s date'}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
              
              <Controller
                name="pilotName"
                control={control}
                rules={{ required: 'Pilot name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Pilot Name"
                    fullWidth
                    error={!!errors.pilotName}
                    helperText={errors.pilotName?.message}
                  />
                )}
              />
              
              <Controller
                name="startTime"
                control={control}
                rules={{ 
                  required: 'Start time is required',
                  min: { value: 0, message: 'Start time must be positive' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Start Time"
                    type="number"
                    fullWidth
                    disabled
                    error={!!errors.startTime}
                    helperText={errors.startTime?.message || 'Auto-filled from most recent flight end time'}
                    inputProps={{ step: 0.01 }}
                  />
                )}
              />
              
              <Controller
                name="endTime"
                control={control}
                rules={{ 
                  required: 'End time is required',
                  min: { value: 0, message: 'End time must be positive' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="End Time"
                    type="number"
                    fullWidth
                    error={!!errors.endTime}
                    helperText={errors.endTime?.message}
                    inputProps={{ step: 0.01 }}
                  />
                )}
              />
              
              <Controller
                name="comments"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Comments"
                    multiline
                    rows={3}
                    fullWidth
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreateCancel} disabled={creating}>
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="contained"
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create Flight'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onClose={handleEditCancel}
        maxWidth="sm"
        fullWidth
        aria-labelledby="edit-dialog-title"
      >
        <DialogTitle id="edit-dialog-title">
          Edit Flight
        </DialogTitle>
        <form onSubmit={handleSubmit(handleEditSubmit)}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Controller
                name="date"
                control={control}
                rules={{ required: 'Date is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Date"
                    type="date"
                    fullWidth
                    error={!!errors.date}
                    helperText={errors.date?.message}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
              
              <Controller
                name="pilotName"
                control={control}
                rules={{ required: 'Pilot name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Pilot Name"
                    fullWidth
                    error={!!errors.pilotName}
                    helperText={errors.pilotName?.message}
                  />
                )}
              />
              
              <Controller
                name="startTime"
                control={control}
                rules={{ 
                  required: 'Start time is required',
                  min: { value: 0, message: 'Start time must be positive' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Start Time"
                    type="number"
                    fullWidth
                    error={!!errors.startTime}
                    helperText={errors.startTime?.message}
                    inputProps={{ step: 0.01 }}
                  />
                )}
              />
              
              <Controller
                name="endTime"
                control={control}
                rules={{ 
                  required: 'End time is required',
                  min: { value: 0, message: 'End time must be positive' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="End Time"
                    type="number"
                    fullWidth
                    error={!!errors.endTime}
                    helperText={errors.endTime?.message}
                    inputProps={{ step: 0.01 }}
                  />
                )}
              />
              
              <Controller
                name="comments"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Comments"
                    multiline
                    rows={3}
                    fullWidth
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditCancel} disabled={editing}>
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="contained"
              disabled={editing}
            >
              {editing ? 'Updating...' : 'Update Flight'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      </Box>
    </ThemeProvider>
  );
}
