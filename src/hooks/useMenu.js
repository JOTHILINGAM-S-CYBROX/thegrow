import { useState, useEffect, useCallback } from 'react';

export function useMenu(page = 1, limit = 20, subCategory = null, menuType = null) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (subCategory) query.append('subCategory', subCategory);
      if (menuType) query.append('menuType', menuType);

      const response = await fetch(`/api/menu?${query}`);
      const data = await response.json();

      if (data.success) {
        setItems(data.menus);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to fetch menu items');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching menu:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, subCategory, menuType]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, pagination, refetch: fetchItems };
}

export function useMenuItem(id) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItem = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/menu/${id}`);
      const data = await response.json();

      if (data.success) {
        setItem(data.menu);
      } else {
        setError(data.error || 'Failed to fetch menu item');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching menu item:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const updateItem = useCallback(
    async (updates) => {
      if (!id) return null;

      try {
        const response = await fetch(`/api/menu/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        const data = await response.json();

        if (data.success) {
          setItem(data.menu);
          return data.menu;
        } else {
          setError(data.error);
          return null;
        }
      } catch (err) {
        setError(err.message);
        console.error('Error updating menu item:', err);
        return null;
      }
    },
    [id]
  );

  const deleteItem = useCallback(async () => {
    if (!id) return false;

    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setItem(null);
        return true;
      } else {
        setError(data.error);
        return false;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error deleting menu item:', err);
      return false;
    }
  }, [id]);

  return {
    item,
    loading,
    error,
    updateItem,
    deleteItem,
    refetch: fetchItem,
  };
}
