import { useState, useEffect, useCallback } from 'react';

export function useOrders(page = 1, limit = 20, status = null) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (status && status !== 'All') query.append('status', status);

      const response = await fetch(`/api/orders?${query}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, status]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, pagination, refetch: fetchOrders };
}

export function useOrder(id) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${id}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.error || 'Failed to fetch order');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateOrder = useCallback(
    async (updates) => {
      if (!id) return null;
      
      try {
        const response = await fetch(`/api/orders/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        const data = await response.json();

        if (data.success) {
          setOrder(data.order);
          return data.order;
        } else {
          setError(data.error);
          return null;
        }
      } catch (err) {
        setError(err.message);
        console.error('Error updating order:', err);
        return null;
      }
    },
    [id]
  );

  const deleteOrder = useCallback(async () => {
    if (!id) return false;
    
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setOrder(null);
        return true;
      } else {
        setError(data.error);
        return false;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error deleting order:', err);
      return false;
    }
  }, [id]);

  return {
    order,
    loading,
    error,
    updateOrder,
    deleteOrder,
    refetch: fetchOrder,
  };
}
