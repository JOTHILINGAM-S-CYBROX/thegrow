'use client';

import { useOrders } from '@/hooks/useOrders';
import { useState } from 'react';
import { useStatusPill } from '@/contexts/StatusPillContext';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function KitchenOrders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('Pending');
  const { orders, loading, error, pagination, refetch } = useOrders(page, 20, status);
  const { showPill } = useStatusPill();
  const [orderToDelete, setOrderToDelete] = useState(null);

  const handleStatusFilter = (newStatus) => {
    setStatus(newStatus);
    setPage(1);
  };

  const updateStatus = async (orderId, currentStatus) => {
    let newStatus;
    if (currentStatus === 'Pending') newStatus = 'Preparing';
    else if (currentStatus === 'Preparing') newStatus = 'Ready';
    else if (currentStatus === 'Ready') newStatus = 'Completed';
    else return;

    try {
      const url = `/api/orders/${orderId}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        setStatus(newStatus);
        setPage(1);
        showPill(`Order moved to ${newStatus}`, 'success');
        setTimeout(() => refetch(), 200);
      } else {
        showPill(`Failed to update: ${data.error}`, 'error');
      }
    } catch (error) {
      showPill('Failed to update order', 'error');
    }
  };

  const executeDeleteOrder = async () => {
    if (!orderToDelete) return;
    const orderId = orderToDelete;
    setOrderToDelete(null);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        showPill('Order deleted successfully', 'success');
        refetch();
      } else {
        showPill(`Failed to delete: ${data.error}`, 'error');
      }
    } catch (error) {
      showPill('Failed to delete order', 'error');
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
    <div className="p-4 sm:p-6 md:p-8 lg:p-12 relative z-10 w-full max-w-6xl min-w-0">
      <header className="mb-6 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0 border-b border-stone-200 pb-4 md:pb-8">
        <div className="w-full md:w-auto min-w-0 break-words">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-primary italic leading-tight">Kitchen Orders</h1>
          <p className="text-stone-500 font-label tracking-widest text-[10px] sm:text-xs uppercase mt-2 md:mt-3">Live Order Management System</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto shrink-0">
          <button
            onClick={refetch}
            className="flex items-center justify-center gap-2 bg-stone-200 hover:bg-stone-300 transition-colors w-full md:w-auto px-4 py-2 sm:px-6 sm:py-3 rounded-full font-label text-[10px] sm:text-xs font-bold uppercase tracking-widest text-stone-700"
          >
            <span className="material-symbols-outlined text-sm">refresh</span> Refresh
          </button>
        </div>
      </header>

      {/* Status Filter */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2">
        {['All', 'Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => handleStatusFilter(st)}
            className={`w-full md:w-auto px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
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
              className="bg-white rounded-xl shadow-sm border border-stone-200 p-3 sm:p-4 flex flex-row items-center justify-between gap-3 w-full hover:shadow-md transition-shadow"
            >
              {/* Left Side: Info */}
              <div className="flex flex-col min-w-0 flex-1 justify-center gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-headline text-base sm:text-lg text-stone-800 truncate leading-none">
                    {order.orderNumber}
                  </span>
                  <span className="text-primary font-serif italic text-sm truncate leading-none">
                    {order.customerInfo?.name || 'Guest'}
                  </span>
                  <span
                    className={`text-[9px] font-label font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border whitespace-nowrap
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

                <p className="text-stone-500 font-body text-xs sm:text-sm truncate">
                  {order.items && order.items.length > 0
                    ? order.items.map(item => `${item.quantity}x ${item.itemName || item.name}`).join(', ')
                    : 'No items'}
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-stone-400 font-label text-[10px] uppercase tracking-widest mt-0.5">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[11px]">schedule</span>
                    {formatTime(order.createdAt)}
                  </div>
                  {order.scheduledTime && (
                    <div className="flex items-center gap-1 text-amber-600 font-semibold">
                      <span className="material-symbols-outlined text-[11px]">access_time</span>
                      {order.scheduledTime === 'now' ? 'ASAP' : order.scheduledTime === 'tomorrow' ? 'Tom 12:00' : order.scheduledTime}
                    </div>
                  )}
                  {order.customerInfo?.phone && (
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[11px]">phone</span>
                      {order.customerInfo.phone}
                    </div>
                  )}
                  <div className="text-emerald-800 font-bold text-[11px] sm:text-xs">
                    ₹{order.totalPrice || order.totalAmount}
                  </div>
                </div>
              </div>

              {/* Right Side: Action */}
              <div className="shrink-0 flex items-center">
                {order.status !== 'Completed' && order.status !== 'Cancelled' ? (
                  <button
                    onClick={() => updateStatus(order._id, order.status)}
                    className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-label text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors shadow-sm active:scale-95 text-center flex items-center justify-center gap-1 min-w-[80px]
                      ${order.status === 'Pending' ? 'bg-primary text-on-primary hover:bg-emerald-800' : ''}
                      ${order.status === 'Preparing' ? 'bg-sky-600 text-white hover:bg-sky-700' : ''}
                      ${order.status === 'Ready' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''}
                    `}
                  >
                    {order.status === 'Pending' && 'Cook →'}
                    {order.status === 'Preparing' && 'Ready →'}
                    {order.status === 'Ready' && 'Done →'}
                  </button>
                ) : (
                  <button
                    onClick={() => setOrderToDelete(order._id)}
                    className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-label text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors shadow-sm bg-rose-100 text-rose-700 hover:bg-rose-200 text-center min-w-[80px]"
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
                {status === 'Pending' ? 'Waiting for incoming orders...' : 'No orders with this status'}
              </p>
            </div>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={!!orderToDelete}
        title="Delete Order"
        message="Are you sure you want to delete this order? It will be removed permanently from the system."
        onConfirm={executeDeleteOrder}
        onCancel={() => setOrderToDelete(null)}
      />
    </div>
  );
}
