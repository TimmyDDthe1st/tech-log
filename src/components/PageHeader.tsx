'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  monthlyTotal: number;
  totalHours?: number;
  aircraftRegistration?: string;
  selectedFlightsCount: number;
  isDarkMode: boolean;
  loading: boolean;
  bulkDeleting: boolean;
  onToggleTheme: () => void;
  onCreateFlight: () => void;
  onBulkDelete: () => void;
  onEditAircraft?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  monthlyTotal,
  totalHours,
  aircraftRegistration,
  selectedFlightsCount,
  isDarkMode,
  loading,
  bulkDeleting,
  onToggleTheme,
  onCreateFlight,
  onBulkDelete,
  onEditAircraft,
}) => {
  const router = useRouter();
  
  return (
    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
      <Box>
        <Typography variant="h4" component="h1">
          Pilot Flight Tracker {aircraftRegistration && `- ${aircraftRegistration}`}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Typography variant="h6" color="text.secondary">
            This months usage: {monthlyTotal.toFixed(2)} hours
          </Typography>
          {totalHours !== undefined && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Total aircraft hours: {totalHours.toFixed(2)}
            </Typography>
          )}
        </Box>
        <Box sx={{ height: '56px', mt: 2, display: 'flex', alignItems: 'flex-start' }}>
          {selectedFlightsCount > 0 && (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={onBulkDelete}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? 'Deleting...' : `Delete ${selectedFlightsCount} Flight${selectedFlightsCount > 1 ? 's' : ''}`}
            </Button>
          )}
        </Box>
      </Box>
      <Box display="flex" gap={2} alignItems="center">
        <IconButton onClick={onToggleTheme} color="inherit">
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        {onEditAircraft && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={onEditAircraft}
            disabled={loading}
          >
            Edit Aircraft
          </Button>
        )}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateFlight}
          disabled={loading}
        >
          Add New Flight
        </Button>
      </Box>
    </Box>
  );
};