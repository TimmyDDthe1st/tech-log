'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Paper,
  ThemeProvider,
  CssBaseline,
} from '@mui/material';
import { Flight } from '../../types/flight';
import { lightTheme, darkTheme } from '../theme';
import { useFlights } from '../hooks/useFlights';
import { useTheme } from '../hooks/useTheme';
import { FlightDataGrid } from '../components/FlightDataGrid';
import { FlightForm } from '../components/FlightForm';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { PageHeader } from '../components/PageHeader';

interface FlightFormData {
  flights: {
    date: string;
    pilotName: string;
    startTime: number;
    endTime: number;
    comments: string;
  }[];
  // For edit mode
  date?: string;
  pilotName?: string;
  startTime?: number;
  endTime?: number;
  comments?: string;
}

export default function Home() {
  const { 
    flights, 
    loading, 
    error, 
    setError,
    createFlights, 
    updateFlight, 
    deleteFlight, 
    bulkDeleteFlights,
    getMonthlyTotal 
  } = useFlights();
  
  const { isDarkMode, mounted, toggleTheme } = useTheme();

  // UI state
  const [selectedFlights, setSelectedFlights] = useState<(string | number)[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [flightToDelete, setFlightToDelete] = useState<Flight | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [flightToEdit, setFlightToEdit] = useState<Flight | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [initialStartTime, setInitialStartTime] = useState(0);

  // Event handlers
  const handleDeleteClick = (flight: Flight) => {
    setFlightToDelete(flight);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!flightToDelete) return;
    
    setDeleting(true);
    try {
      await deleteFlight(flightToDelete.id);
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
    // Find the flight with the highest end time to use as start time
    let startTime = 0;
    if (flights.length > 0) {
      const flightWithHighestEndTime = flights.reduce((highest, current) => {
        const currentEndTime = Number(current.endTime) || 0;
        const highestEndTime = Number(highest.endTime) || 0;
        return currentEndTime > highestEndTime ? current : highest;
      });
      startTime = Number(flightWithHighestEndTime.endTime) || 0;
    }

    setInitialStartTime(startTime);
    setCreateDialogOpen(true);
  };

  const handleCreateSubmit = async (data: FlightFormData) => {
    setCreating(true);
    try {
      await createFlights(data.flights);
      setCreateDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create flights');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateCancel = () => {
    setCreateDialogOpen(false);
  };

  const handleEditClick = (flight: Flight) => {
    setFlightToEdit(flight);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: FlightFormData) => {
    if (!flightToEdit) return;
    
    setEditing(true);
    try {
      const payload = {
        id: flightToEdit.id,
        date: data.date!,
        pilotName: data.pilotName!,
        startTime: data.startTime!,
        endTime: data.endTime!,
        comments: data.comments!,
      };
      
      await updateFlight(payload);
      setEditDialogOpen(false);
      setFlightToEdit(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update flight');
    } finally {
      setEditing(false);
    }
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setFlightToEdit(null);
  };

  const handleBulkDelete = async () => {
    if (selectedFlights.length === 0) return;
    
    setBulkDeleting(true);
    try {
      await bulkDeleteFlights(selectedFlights);
      setSelectedFlights([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete flights');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSelectionChange = (newSelection: any) => {
    if (newSelection.type === 'exclude') {
      // When type is 'exclude', we have all rows selected except those in the ids Set
      const allFlightIds = flights.map(flight => flight.id);
      const excludedIds = Array.from(newSelection.ids) as (string | number)[];
      const selectedIds = allFlightIds.filter(id => !excludedIds.includes(id));
      setSelectedFlights(selectedIds);
    } else {
      // When type is 'include' or if it's just an array, use the ids directly
      const selectedIds = Array.from(newSelection.ids || newSelection) as (string | number)[];
      setSelectedFlights(selectedIds);
    }
  };

  // Use light theme as fallback during SSR to prevent hydration mismatch
  const currentTheme = (!mounted ? lightTheme : (isDarkMode ? darkTheme : lightTheme));

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
      <Box sx={{ width: '100%', height: '100vh', p: 3, display: 'flex', flexDirection: 'column' }}>
        <PageHeader
          monthlyTotal={getMonthlyTotal()}
          selectedFlightsCount={selectedFlights.length}
          isDarkMode={isDarkMode}
          loading={loading}
          bulkDeleting={bulkDeleting}
          onToggleTheme={toggleTheme}
          onCreateFlight={handleCreateClick}
          onBulkDelete={handleBulkDelete}
        />
        
        <Paper elevation={3} sx={{ mt: 3, flexGrow: 1, display: 'flex' }}>
          <FlightDataGrid
            flights={flights}
            loading={loading}
            selectedFlights={selectedFlights}
            onSelectionChange={handleSelectionChange}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </Paper>

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          flight={flightToDelete}
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />

        <FlightForm
          open={createDialogOpen}
          mode="create"
          flights={flights}
          initialStartTime={initialStartTime}
          onClose={handleCreateCancel}
          onSubmit={handleCreateSubmit}
          loading={creating}
        />

        <FlightForm
          open={editDialogOpen}
          mode="edit"
          flightToEdit={flightToEdit}
          flights={flights}
          onClose={handleEditCancel}
          onSubmit={handleEditSubmit}
          loading={editing}
        />
      </Box>
    </ThemeProvider>
  );
}