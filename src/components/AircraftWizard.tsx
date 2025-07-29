'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { validateTimeFormat } from '../utils/timeUtils';

interface AircraftWizardProps {
  onComplete: (registration: string, baseHours: number) => void;
}

export const AircraftWizard: React.FC<AircraftWizardProps> = ({ onComplete }) => {
  const [registration, setRegistration] = useState<string>('');
  const [baseHours, setBaseHours] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registration.trim()) {
      setError('Please enter aircraft registration');
      return;
    }
    
    const hours = Number(baseHours);
    if (isNaN(hours) || hours < 0) {
      setError('Please enter a valid number of hours');
      return;
    }

    const validationResult = validateTimeFormat(hours);
    if (validationResult !== true) {
      setError(validationResult);
      return;
    }

    setLoading(true);
    try {
      setError(null);
      onComplete(registration.trim().toUpperCase(), hours);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create aircraft');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        p: 3,
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <FlightTakeoffIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome to Flight Tracker
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Let's get started by setting up your aircraft registration and current total hours
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Aircraft Registration"
              value={registration}
              onChange={(e) => setRegistration(e.target.value.toUpperCase())}
              placeholder="N123AB"
              helperText="Enter your aircraft's registration number"
              sx={{ mb: 2 }}
              autoFocus
            />
            
            <TextField
              fullWidth
              label="Aircraft Base Hours"
              type="number"
              value={baseHours}
              onChange={(e) => setBaseHours(e.target.value)}
              placeholder="200.30"
              helperText="Enter your aircraft's current total hours (e.g., 200.30 for 200 hours 30 minutes)"
              inputProps={{ step: 0.01, min: 0 }}
              sx={{ mb: 2 }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Note:</strong> Use hours.minutes format where minutes cannot exceed 59. 
                For example: 200.30 = 200 hours 30 minutes.
              </Typography>
            </Alert>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={!registration.trim() || !baseHours.trim() || loading}
            >
              {loading ? 'Creating Aircraft...' : 'Create Aircraft & Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};