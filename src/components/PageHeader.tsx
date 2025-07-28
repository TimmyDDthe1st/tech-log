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
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

interface PageHeaderProps {
  monthlyTotal: number;
  selectedFlightsCount: number;
  isDarkMode: boolean;
  loading: boolean;
  bulkDeleting: boolean;
  onToggleTheme: () => void;
  onCreateFlight: () => void;
  onBulkDelete: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  monthlyTotal,
  selectedFlightsCount,
  isDarkMode,
  loading,
  bulkDeleting,
  onToggleTheme,
  onCreateFlight,
  onBulkDelete,
}) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
      <Box>
        <Typography variant="h4" component="h1">
          Pilot Flight Tracker
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
          This months useage: {monthlyTotal.toFixed(2)} hours
        </Typography>
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