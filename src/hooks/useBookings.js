import { useState, useEffect, useCallback } from 'react';

export function useBookings(page = 1, limit = 20, status = null) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  });

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (status) query.append('status', status);

      const response = await fetch(`/api/bookings?${query}`);
      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to fetch bookings');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, status]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, error, pagination, refetch: fetchBookings };
}

export function useBooking(id) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBooking = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bookings/${id}`);
      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
      } else {
        setError(data.error || 'Failed to fetch booking');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching booking:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const updateBooking = useCallback(
    async (updates) => {
      if (!id) return null;
      
      try {
        const response = await fetch(`/api/bookings/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        const data = await response.json();

        if (data.success) {
          setBooking(data.booking);
          return data.booking;
        } else {
          setError(data.error);
          return null;
        }
      } catch (err) {
        setError(err.message);
        console.error('Error updating booking:', err);
        return null;
      }
    },
    [id]
  );

  const deleteBooking = useCallback(async () => {
    if (!id) return false;
    
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setBooking(null);
        return true;
      } else {
        setError(data.error);
        return false;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error deleting booking:', err);
      return false;
    }
  }, [id]);

  return {
    booking,
    loading,
    error,
    updateBooking,
    deleteBooking,
    refetch: fetchBooking,
  };
}
