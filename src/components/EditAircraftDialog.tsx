'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
} from '@mui/material';
import { validateTimeFormat } from '../utils/timeUtils';
import { Aircraft } from '../../types/aircraft';

interface EditAircraftDialogProps {
  open: boolean;
  aircraft: Aircraft | null;
  onClose: () => void;
  onSave: (registration: string, baseHours: number) => Promise<void>;
  loading?: boolean;
}

export const EditAircraftDialog: React.FC<EditAircraftDialogProps> = ({
  open,
  aircraft,
  onClose,
  onSave,
  loading = false,
}) => {
  const [registration, setRegistration] = useState<string>('');
  const [baseHours, setBaseHours] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Update form when dialog opens or aircraft changes
  useEffect(() => {
    if (open && aircraft) {
      setRegistration(aircraft.registration);
      setBaseHours(aircraft.baseHours.toString());
      setError(null);
    }
  }, [open, aircraft]);

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

    setSaving(true);
    try {
      await onSave(registration.trim().toUpperCase(), hours);
      setError(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update aircraft');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="edit-aircraft-dialog-title"
    >
      <DialogTitle id="edit-aircraft-dialog-title">
        Edit Aircraft
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Aircraft Registration"
              value={registration}
              onChange={(e) => setRegistration(e.target.value.toUpperCase())}
              placeholder="N123AB"
              helperText="Enter your aircraft's registration number"
              autoFocus
              disabled={saving || loading}
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
              disabled={saving || loading}
            />

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <Alert severity="info">
              <strong>Note:</strong> Use hours.minutes format where minutes cannot exceed 59. 
              For example: 200.30 = 200 hours 30 minutes. Changing these values will affect total aircraft hours calculations.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving || loading}>
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="contained"
            disabled={!registration.trim() || !baseHours.trim() || saving || loading}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};