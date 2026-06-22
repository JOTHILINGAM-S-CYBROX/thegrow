'use client';

import { useOrders } from '@/hooks/useOrders';
import { useState } from 'react';

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('Pending');
  const { orders, loading, error, pagination, refetch } = useOrders(page, 20, status);

  const handleStatusFilter = (newStatus) => {
    setStatus(newStatus);
    setPage(1);
  };

  const updateStatus = async (orderId, currentStatus) => {
    console.log('🔵 updateStatus called with orderId:', orderId, 'type:', typeof orderId);
    
    let newStatus;
    if (currentStatus === 'Pending') newStatus = 'Preparing';
    else if (currentStatus === 'Preparing') newStatus = 'Ready';
    else if (currentStatus === 'Ready') newStatus = 'Completed';
    else return;

    try {
      const url = `/api/orders/${orderId}`;
      console.log('🔵 Fetching URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        // Auto-advance to next status tab to show the updated order
        setStatus(newStatus);
        setPage(1);
        alert(`✅ Order status updated to: ${newStatus}`);
        // Refresh orders (will fetch with new status filter)
        setTimeout(() => refetch(), 200);
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ Error updating order: ${error.message}`);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        alert('Order deleted successfully');
        refetch();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error deleting order: ${error.message}`);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  return (
    <div className="p-12 relative z-10 w-full max-w-6xl">
      <header className="mb-12 flex justify-between items-end border-b border-stone-200 pb-8">
        <div>
          <h1 className="text-5xl font-serif text-primary italic leading-tight">Incoming Orders</h1>
          <p className="text-stone-500 font-label tracking-widest text-xs uppercase mt-3">Live Order Tracking System</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={refetch}
            className="flex items-center gap-2 bg-stone-200 hover:bg-stone-300 transition-colors px-6 py-3 rounded-full font-label text-xs font-bold uppercase tracking-widest text-stone-700"
          >
            <span className="material-symbols-outlined text-sm">refresh</span> Refresh
          </button>
        </div>
      </header>

      {/* Status Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => handleStatusFilter(st)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              status === st
                ? 'bg-primary text-white'
                : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-rose-100 border border-rose-400 text-rose-700 px-6 py-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-stone-500">Loading orders...</div>
        </div>
      )}

      {/* Orders Grid */}
      {!loading && (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 flex items-center justify-between hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start gap-8">
                <div className="w-16 h-16 rounded-xl bg-surface-container-low flex items-center justify-center text-primary border border-stone-100 shrink-0">
                  <span className="material-symbols-outlined text-3xl">local_mall</span>
                </div>
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-headline text-2xl text-stone-800">{order.orderNumber}</span>
                    <span
                      className={`text-[10px] font-label font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border
                      ${order.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                      ${order.status === 'Preparing' ? 'bg-sky-50 text-sky-700 border-sky-200' : ''}
                      ${order.status === 'Ready' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                      ${order.status === 'Completed' ? 'bg-gray-50 text-gray-700 border-gray-200' : ''}
                      ${order.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' : ''}
                    `}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-stone-500 font-body text-sm mb-3">
                    {order.items && order.items.length > 0
                      ? order.items.map(item => `${item.quantity}x ${item.itemName || item.name}`).join(', ')
                      : 'No items'}
                  </p>
                  <p className="text-stone-400 font-label text-xs uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">schedule</span>
                    {formatTime(order.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-6 text-right ml-4 shrink-0">
                <div className="text-2xl font-serif italic text-emerald-800">₹{order.totalPrice || order.totalAmount}</div>
                {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                  <button
                    onClick={() => updateStatus(order._id, order.status)}
                    className={`px-8 py-3 rounded-full font-label text-xs font-bold uppercase tracking-widest transition-colors shadow-sm active:scale-95
                      ${order.status === 'Pending' ? 'bg-primary text-on-primary hover:bg-emerald-800' : ''}
                      ${order.status === 'Preparing' ? 'bg-sky-600 text-white hover:bg-sky-700' : ''}
                      ${order.status === 'Ready' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''}
                    `}
                  >
                    {order.status === 'Pending' && 'Accept & Prepare'}
                    {order.status === 'Preparing' && 'Mark as Ready'}
                    {order.status === 'Ready' && 'Complete Order'}
                  </button>
                )}
                {(order.status === 'Completed' || order.status === 'Cancelled') && (
                  <button
                    onClick={() => handleDeleteOrder(order._id)}
                    className="px-8 py-3 rounded-full font-label text-xs font-bold uppercase tracking-widest transition-colors shadow-sm bg-rose-100 text-rose-700 hover:bg-rose-200"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-24 text-stone-400 bg-white/50 border border-dashed border-stone-300 rounded-3xl">
              <span className="material-symbols-outlined text-5xl mb-4 block">receipt_long</span>
              <p className="font-headline text-xl">No orders found</p>
              <p className="font-label text-xs uppercase tracking-widest mt-2">
                {status === 'Pending' ? 'Waiting for incoming requests...' : 'No orders with this status'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                p === page
                  ? 'bg-primary text-white'
                  : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
