'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Paper,
  ThemeProvider,
  CssBaseline,
  CircularProgress,
} from '@mui/material';
import { Flight } from '../../types/flight';
import { lightTheme, darkTheme } from '../theme';
import { useFlights } from '../hooks/useFlights';
import { useTheme } from '../hooks/useTheme';
import { useAircraft } from '../hooks/useAircraft';
import { FlightDataGrid } from '../components/FlightDataGrid';
import { FlightForm } from '../components/FlightForm';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { PageHeader } from '../components/PageHeader';
import { AircraftWizard } from '../components/AircraftWizard';
import { EditAircraftDialog } from '../components/EditAircraftDialog';
import { UserManagement } from '../components/UserManagement';

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
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const { 
    flights, 
    loading, 
    error, 
    setError,
    createFlights, 
    updateFlight, 
    deleteFlight, 
    bulkDeleteFlights,
    getMonthlyTotal,
    getTotalHoursWithBase,
    getLastFlightEndTime
  } = useFlights();
  
  const { isDarkMode, mounted, toggleTheme } = useTheme();
  
  const { 
    aircraft,
    baseHours, 
    registration,
    loading: aircraftLoading, 
    isSetupComplete,
    createOrUpdateAircraft,
    updateAircraft
  } = useAircraft();
  

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
  const [editAircraftOpen, setEditAircraftOpen] = useState(false);
  const [userManagementOpen, setUserManagementOpen] = useState(false);

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
    // Get the last flight end time, using base hours as fallback
    const lastEndTime = getLastFlightEndTime(baseHours);
    const startTime = lastEndTime > 0 ? lastEndTime : baseHours;

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

  const handleAircraftSetup = async (registration: string, baseHours: number) => {
    try {
      await createOrUpdateAircraft(registration, baseHours);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create aircraft');
    }
  };

  const handleEditAircraft = () => {
    setEditAircraftOpen(true);
  };

  const handleEditAircraftClose = () => {
    setEditAircraftOpen(false);
  };

  const handleEditAircraftSave = async (newRegistration: string, newBaseHours: number) => {
    try {
      if (aircraft) {
        await updateAircraft(aircraft.id, newRegistration, newBaseHours);
      }
    } catch (err) {
      throw err; // Let the dialog handle the error display
    }
  };

  const handleOpenUserManagement = () => {
    setUserManagementOpen(true);
  };

  const handleCloseUserManagement = () => {
    setUserManagementOpen(false);
  };


  // Use light theme as fallback during SSR to prevent hydration mismatch
  const currentTheme = (!mounted ? lightTheme : (isDarkMode ? darkTheme : lightTheme));

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <Box sx={{ 
          width: '100%', 
          height: '100vh', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <CircularProgress size={60} />
        </Box>
      </ThemeProvider>
    );
  }

  // Redirect to signin happens in useEffect above
  if (!session) {
    return null;
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

  // Show aircraft wizard if setup is not complete
  if (!loading && !aircraftLoading && !isSetupComplete) {
    return (
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <AircraftWizard onComplete={handleAircraftSetup} />
      </ThemeProvider>
    );
  }


  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box sx={{ width: '100%', height: '100vh', p: 3, display: 'flex', flexDirection: 'column' }}>
        <PageHeader
          monthlyTotal={getMonthlyTotal()}
          totalHours={getTotalHoursWithBase(baseHours)}
          aircraftRegistration={registration}
          selectedFlightsCount={selectedFlights.length}
          isDarkMode={isDarkMode}
          loading={loading}
          bulkDeleting={bulkDeleting}
          onToggleTheme={toggleTheme}
          onCreateFlight={handleCreateClick}
          onBulkDelete={handleBulkDelete}
          onEditAircraft={handleEditAircraft}
          onOpenUserManagement={handleOpenUserManagement}
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

        <EditAircraftDialog
          open={editAircraftOpen}
          aircraft={aircraft}
          onClose={handleEditAircraftClose}
          onSave={handleEditAircraftSave}
          loading={aircraftLoading}
        />

        {/* User Management Modal */}
        {userManagementOpen && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'background.paper',
              zIndex: 1300,
              p: 3,
            }}
          >
            <UserManagement onClose={handleCloseUserManagement} />
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}