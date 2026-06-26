import { useState, useEffect, useCallback } from 'react';

export function useOrderStats() {
  const [stats, setStats] = useState({
    Pending: 0,
    Preparing: 0,
    Ready: 0,
    Completed: 0,
    Cancelled: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders/stats', {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to fetch order stats');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching order stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetchStats: fetchStats };
}
