'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useForm, Controller, useWatch, useFieldArray } from 'react-hook-form';
import { Flight } from '../../types/flight';
import { validateTimeFormat, formatDateForInput } from '../utils/timeUtils';

interface FlightFormData {
  flights: {
    date: string;
    pilotName: string;
    startTime: number;
    endTime: number;
    comments: string;
  }[];
  date?: string;
  pilotName?: string;
  startTime?: number;
  endTime?: number;
  comments?: string;
}

interface FlightFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  flightToEdit?: Flight | null;
  flights: Flight[];
  initialStartTime?: number;
  onClose: () => void;
  onSubmit: (data: FlightFormData) => void;
  loading: boolean;
}

export const FlightForm: React.FC<FlightFormProps> = ({
  open,
  mode,
  flightToEdit,
  flights,
  initialStartTime = 0,
  onClose,
  onSubmit,
  loading,
}) => {
  const isEditMode = mode === 'edit';

  const { control, handleSubmit, reset, setValue, getValues, formState: { errors } } = useForm<FlightFormData>({
    defaultValues: isEditMode ? {
      date: flightToEdit ? formatDateForInput(flightToEdit.date) : '',
      pilotName: flightToEdit?.pilotName || '',
      startTime: flightToEdit?.startTime || 0,
      endTime: flightToEdit?.endTime || 0,
      comments: flightToEdit?.comments || '',
    } : {
      flights: [{
        date: new Date().toISOString().split('T')[0],
        pilotName: '',
        startTime: initialStartTime,
        endTime: 0,
        comments: '',
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'flights'
  });

  // Watch all flight end times to update subsequent start times (create mode only)
  const watchedFlights = useWatch({
    control,
    name: 'flights'
  });

  // Update start times when end times change (create mode only)
  React.useEffect(() => {
    if (!isEditMode && watchedFlights && Array.isArray(watchedFlights)) {
      for (let i = 0; i < watchedFlights.length - 1; i++) {
        const currentFlight = watchedFlights[i];
        const nextFlight = watchedFlights[i + 1];
        
        if (currentFlight?.endTime !== undefined && 
            nextFlight?.startTime !== currentFlight.endTime) {
          setValue(`flights.${i + 1}.startTime`, currentFlight.endTime);
        }
      }
    }
  }, [watchedFlights, setValue, isEditMode]);

  // Update initial start time when dialog opens (create mode only)
  React.useEffect(() => {
    if (!isEditMode && open && initialStartTime !== undefined) {
      setValue('flights.0.startTime', initialStartTime);
    }
  }, [isEditMode, open, initialStartTime, setValue]);

  // Update form values when flightToEdit changes (edit mode only)
  React.useEffect(() => {
    if (isEditMode && flightToEdit && open) {
      setValue('date', formatDateForInput(flightToEdit.date));
      setValue('pilotName', flightToEdit.pilotName);
      setValue('startTime', flightToEdit.startTime);
      setValue('endTime', flightToEdit.endTime);
      setValue('comments', flightToEdit.comments || '');
    }
  }, [isEditMode, flightToEdit, open, setValue]);


  const addFlightRow = () => {
    const currentFields = getValues().flights || [];
    const lastRow = currentFields[currentFields.length - 1];
    const startTime = lastRow?.endTime || 0;

    append({
      date: new Date().toISOString().split('T')[0],
      pilotName: '',
      startTime: startTime,
      endTime: 0,
      comments: '',
    });
  };

  const removeFlightRow = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      
      // Update start times for all flights after removal
      setTimeout(() => {
        const currentFormValues = getValues();
        if (currentFormValues.flights && Array.isArray(currentFormValues.flights)) {
          // Recalculate start times for all flights starting from the first affected flight
          const startIndex = Math.max(0, index - 1);
          
          for (let i = startIndex; i < currentFormValues.flights.length; i++) {
            if (i === 0) {
              // First flight keeps its current start time or uses initialStartTime
              const currentStartTime = currentFormValues.flights[i]?.startTime;
              if (currentStartTime === undefined || currentStartTime === 0) {
                setValue(`flights.${i}.startTime`, initialStartTime);
              }
            } else {
              // Subsequent flights start where the previous flight ended
              const previousFlight = currentFormValues.flights[i - 1];
              if (previousFlight?.endTime !== undefined) {
                setValue(`flights.${i}.startTime`, previousFlight.endTime);
              }
            }
          }
        }
      }, 0);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby={`${mode}-dialog-title`}
    >
      <DialogTitle id={`${mode}-dialog-title`}>
        {isEditMode ? 'Edit Flight' : 'Add New Flight'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {isEditMode ? (
              // Edit mode - single flight
              <>
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
                    min: { value: 0, message: 'Start time must be positive' },
                    validate: validateTimeFormat
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
                    min: { value: 0, message: 'End time must be positive' },
                    validate: {
                      timeFormat: validateTimeFormat,
                      greaterThanStart: (value) => {
                        if (value === undefined) return true;
                        const startTime = getValues().startTime;
                        if (startTime === undefined) return true;
                        if (value <= startTime) {
                          return 'End time must be greater than start time';
                        }
                        return true;
                      }
                    }
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
              </>
            ) : (
              // Create mode - multiple flights
              <>
                <Controller
                  name="flights.0.date"
                  control={control}
                  rules={{ required: 'Date is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Date"
                      type="date"
                      fullWidth
                      disabled
                      error={!!errors.flights?.[0]?.date}
                      helperText={errors.flights?.[0]?.date?.message || 'Automatically set to today\'s date'}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
                
                <Controller
                  name="flights.0.pilotName"
                  control={control}
                  rules={{ required: 'Pilot name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Pilot Name"
                      fullWidth
                      error={!!errors.flights?.[0]?.pilotName}
                      helperText={errors.flights?.[0]?.pilotName?.message}
                    />
                  )}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 1 }}>
                  <span>Flight Times</span>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addFlightRow}
                    size="small"
                  >
                    Add Flight
                  </Button>
                </Box>
                
                {fields.map((field, index) => (
                  <Box key={field.id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Controller
                      name={`flights.${index}.startTime`}
                      control={control}
                      rules={{ 
                        required: 'Start time is required',
                        min: { value: 0, message: 'Start time must be positive' },
                        validate: validateTimeFormat
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={`Start Time ${index + 1}`}
                          type="number"
                          disabled={index === 0}
                          error={!!errors.flights?.[index]?.startTime}
                          helperText={errors.flights?.[index]?.startTime?.message}
                          inputProps={{ step: 0.01 }}
                          sx={{ minWidth: 140 }}
                        />
                      )}
                    />
                    
                    <Controller
                      name={`flights.${index}.endTime`}
                      control={control}
                      rules={{ 
                        required: 'End time is required',
                        min: { value: 0, message: 'End time must be positive' },
                        validate: {
                          timeFormat: validateTimeFormat,
                          greaterThanStart: (value) => {
                            if (value === undefined) return true;
                            const currentFormValues = getValues();
                            const startTime = currentFormValues.flights?.[index]?.startTime;
                            if (startTime === undefined) return true;
                            if (Number(value) <= Number(startTime)) {
                              return 'End time must be greater than start time';
                            }
                            return true;
                          }
                        }
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={`End Time ${index + 1}`}
                          type="number"
                          error={!!errors.flights?.[index]?.endTime}
                          helperText={errors.flights?.[index]?.endTime?.message}
                          inputProps={{ step: 0.01 }}
                          sx={{ minWidth: 140 }}
                        />
                      )}
                    />
                    
                    {fields.length > 1 && index > 0 && (
                      <IconButton
                        onClick={() => removeFlightRow(index)}
                        color="error"
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                
                <Controller
                  name="flights.0.comments"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Comments"
                      multiline
                      rows={3}
                      fullWidth
                      sx={{ mt: 2 }}
                    />
                  )}
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Flight' : `Create ${fields?.length || 1} Flight${(fields?.length || 1) > 1 ? 's' : ''}`)}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};