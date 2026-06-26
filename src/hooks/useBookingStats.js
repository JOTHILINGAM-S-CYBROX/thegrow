import { useState, useEffect, useCallback } from 'react';

export function useBookingStats() {
  const [stats, setStats] = useState({
    Pending: 0,
    Confirmed: 0,
    'Advance Paid': 0,
    'Fully Paid': 0,
    Completed: 0,
    Cancelled: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/bookings/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to fetch booking stats');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching booking stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
