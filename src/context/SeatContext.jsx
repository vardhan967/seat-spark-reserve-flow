
import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/axios';

const SeatContext = createContext();

export const useSeat = () => {
  const context = useContext(SeatContext);
  if (!context) {
    throw new Error('useSeat must be used within a SeatProvider');
  }
  return context;
};

export const SeatProvider = ({ children }) => {
  const [allSeats, setAllSeats] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLocations = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/api/locations/');
      setLocations(response.data);
    } catch (error) {
      setError('Failed to fetch locations');
      console.error('Error fetching locations:', error);
    }
  }, []);

  const fetchSeats = useCallback(async (locationId = null) => {
    try {
      setLoading(true);
      setError(null);
      const url = locationId ? `/api/seats/?location_id=${locationId}` : '/api/seats/';
      const response = await api.get(url);
      setAllSeats(response.data);
    } catch (error) {
      setError('Failed to fetch seats');
      console.error('Error fetching seats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const bookSeat = useCallback(async (seatId) => {
    try {
      setError(null);
      const response = await api.post(`/api/seats/${seatId}/book/`);
      // Update the seat in our state
      setAllSeats(prevSeats => 
        prevSeats.map(seat => 
          seat.id === seatId ? response.data : seat
        )
      );
      return { success: true, seat: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to book seat';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const releaseSeat = useCallback(async (seatId) => {
    try {
      setError(null);
      await api.post(`/api/seats/${seatId}/release/`);
      // Refresh seats after release
      await fetchSeats();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to release seat';
      setError(message);
      return { success: false, error: message };
    }
  }, [fetchSeats]);

  const fetchMyReservations = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/api/seats/my-reservations/');
      return response.data;
    } catch (error) {
      setError('Failed to fetch reservations');
      console.error('Error fetching reservations:', error);
      return [];
    }
  }, []);

  const fetchPendingSeats = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/api/seats/admin/pending/');
      return response.data;
    } catch (error) {
      setError('Failed to fetch pending seats');
      console.error('Error fetching pending seats:', error);
      return [];
    }
  }, []);

  const confirmSeat = useCallback(async (seatId) => {
    try {
      setError(null);
      await api.post(`/api/seats/admin/${seatId}/confirm/`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to confirm seat';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const value = {
    allSeats,
    locations,
    loading,
    error,
    fetchLocations,
    fetchSeats,
    bookSeat,
    releaseSeat,
    fetchMyReservations,
    fetchPendingSeats,
    confirmSeat,
  };

  return (
    <SeatContext.Provider value={value}>
      {children}
    </SeatContext.Provider>
  );
};
