'use client';

import { useState, useEffect } from 'react';
import { Aircraft } from '../../types/aircraft';

export const useAircraft = () => {
  const [aircraft, setAircraft] = useState<Aircraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const fetchAircraft = async () => {
    try {
      const response = await fetch('/api/aircraft');
      if (!response.ok) {
        throw new Error('Failed to fetch aircraft');
      }
      const data: Aircraft = await response.json();
      setAircraft(data);
      setIsSetupComplete(data.registration !== '' && data.baseHours >= 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAircraft();
  }, []);

  const createOrUpdateAircraft = async (registration: string, baseHours: number) => {
    try {
      const response = await fetch('/api/aircraft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registration, baseHours }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save aircraft');
      }

      const data: Aircraft = await response.json();
      setAircraft(data);
      setIsSetupComplete(data.registration !== '' && data.baseHours >= 0);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save aircraft');
      throw err;
    }
  };

  const updateAircraft = async (id: number, registration: string, baseHours: number) => {
    try {
      const response = await fetch('/api/aircraft', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, registration, baseHours }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update aircraft');
      }

      const data: Aircraft = await response.json();
      setAircraft(data);
      setIsSetupComplete(data.registration !== '' && data.baseHours >= 0);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update aircraft');
      throw err;
    }
  };

  return {
    aircraft,
    baseHours: aircraft?.baseHours || 0,
    registration: aircraft?.registration || '',
    loading,
    error,
    isSetupComplete,
    createOrUpdateAircraft,
    updateAircraft,
    refetch: fetchAircraft,
  };
};