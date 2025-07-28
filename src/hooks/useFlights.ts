'use client';

import { useState, useEffect } from 'react';
import { Flight } from '../../types/flight';
import { sumHoursMinutes } from '../utils/timeUtils';

export const useFlights = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchFlights();
  }, []);

  const createFlights = async (flightData: any[]) => {
    try {
      const createdFlights = [];
      
      // Use the first flight's date, pilot name, and comments for all flights
      const sharedData = flightData[0];
      
      // Create each flight sequentially
      for (const flight of flightData) {
        const payload = {
          date: new Date(sharedData.date).toISOString().slice(0, 19).replace('T', ' '),
          pilotName: sharedData.pilotName,
          startTime: Number(flight.startTime),
          endTime: Number(flight.endTime),
          comments: sharedData.comments,
        };
        
        const response = await fetch('/api/flights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errorMessage = 'Failed to create flight';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (jsonError) {
            errorMessage = `Server error (status: ${response.status})`;
          }
          throw new Error(errorMessage);
        }

        const newFlight = await response.json();
        createdFlights.push(newFlight);
      }
      
      // Add all created flights to the state and sort by date ASC
      const updatedFlights = [...createdFlights, ...flights].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setFlights(updatedFlights);
      
      return createdFlights;
    } catch (err) {
      throw err;
    }
  };

  const updateFlight = async (flightData: any) => {
    try {
      const payload = {
        id: flightData.id,
        date: new Date(flightData.date).toISOString().slice(0, 19).replace('T', ' '),
        pilotName: flightData.pilotName,
        startTime: Number(flightData.startTime),
        endTime: Number(flightData.endTime),
        comments: flightData.comments,
      };
      
      const response = await fetch('/api/flights', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update flight';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // If JSON parsing fails, we can't read the response again
          errorMessage = `Server error (status: ${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const updatedFlight = await response.json();
      
      // Update the flight in the local state
      setFlights(flights.map(f => f.id === updatedFlight.id ? updatedFlight : f));
      
      return updatedFlight;
    } catch (err) {
      throw err;
    }
  };

  const deleteFlight = async (flightId: number) => {
    try {
      const response = await fetch(`/api/flights?id=${flightId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete flight');
      }
      
      // Remove the flight from the local state
      setFlights(flights.filter(f => f.id !== flightId));
    } catch (err) {
      throw err;
    }
  };

  const bulkDeleteFlights = async (flightIds: (string | number)[]) => {
    try {
      // Delete all selected flights
      await Promise.all(
        flightIds.map(id => 
          fetch(`/api/flights?id=${id}`, { method: 'DELETE' })
        )
      );
      
      // Remove deleted flights from state
      setFlights(flights.filter(f => !flightIds.includes(f.id)));
    } catch (err) {
      throw err;
    }
  };

  const getMonthlyTotal = (): number => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyFlightTimes = flights
      .filter(flight => {
        const flightDate = new Date(flight.date);
        return flightDate.getMonth() === currentMonth && flightDate.getFullYear() === currentYear;
      })
      .map(flight => Number(flight.totalTime) || 0);
    
    return sumHoursMinutes(monthlyFlightTimes);
  };

  return {
    flights,
    loading,
    error,
    setError,
    createFlights,
    updateFlight,
    deleteFlight,
    bulkDeleteFlights,
    getMonthlyTotal,
  };
};