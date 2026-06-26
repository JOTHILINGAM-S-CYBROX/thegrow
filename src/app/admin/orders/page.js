'use client';

import { useOrders } from '@/hooks/useOrders';
import { useOrderStats } from '@/hooks/useOrderStats';
import { useState } from 'react';
import { useStatusPill } from '@/contexts/StatusPillContext';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('Pending');
  const { orders, loading, error, pagination, refetch } = useOrders(page, 20, status);
  const { stats, refetchStats } = useOrderStats();
  const { showPill } = useStatusPill();
  const [orderToDelete, setOrderToDelete] = useState(null);
  
  // NEW: State for selected order (details panel)
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const selectedOrder = orders.find(o => o._id === selectedOrderId) || null;

  const handleStatusFilter = (newStatus) => {
    setStatus(newStatus);
    setPage(1);
    setSelectedOrderId(null);
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
        setSelectedOrderId(null);
        showPill(`Order moved to ${newStatus}`, 'success');
        setTimeout(() => { refetch(); refetchStats(); }, 200);
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
        if (selectedOrderId === orderId) setSelectedOrderId(null);
        refetch();
        refetchStats();
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
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  // Status badge colors map
  const getStatusClasses = (statusStr) => {
    switch (statusStr) {
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Action button rendering
  const getActionButton = (order) => {
    if (order.status === 'Pending') {
      return (
        <button onClick={(e) => { e.stopPropagation(); updateStatus(order._id, order.status); }} className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-bold shadow hover:bg-emerald-800 uppercase tracking-wider transition">
          Accept
        </button>
      );
    }
    if (order.status === 'Preparing') {
      return (
        <button onClick={(e) => { e.stopPropagation(); updateStatus(order._id, order.status); }} className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold shadow hover:bg-blue-700 uppercase tracking-wider transition">
          Mark Ready
        </button>
      );
    }
    if (order.status === 'Ready') {
      return (
        <button onClick={(e) => { e.stopPropagation(); updateStatus(order._id, order.status); }} className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold shadow hover:bg-green-700 uppercase tracking-wider transition">
          Complete
        </button>
      );
    }
    if (order.status === 'Completed' || order.status === 'Cancelled') {
      return (
        <button onClick={(e) => { e.stopPropagation(); setSelectedOrderId(order._id); }} className="px-4 py-1.5 rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300 text-xs font-bold shadow uppercase tracking-wider transition">
          View
        </button>
      );
    }
    return null;
  };

  return (
    <div className="p-4 lg:p-8 relative z-10 w-full max-w-[1600px] mx-auto min-h-screen lg:h-[calc(100vh-theme(spacing.16))] flex flex-col">
      {/* 1. Page Header */}
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 w-full border-b lg:border-none border-stone-200 pb-4 lg:pb-0">
        <div>
          <h1 className="text-3xl lg:text-4xl font-serif text-primary italic leading-tight">Incoming Orders</h1>
          <p className="text-stone-500 font-label tracking-widest text-[10px] lg:text-xs uppercase mt-1">Live Order Tracking System</p>
        </div>
        <button
          onClick={() => { refetch(); refetchStats(); }}
          className="flex items-center justify-center gap-2 bg-white border border-stone-200 shadow-sm hover:bg-stone-50 transition-colors px-6 py-2.5 rounded-lg font-label text-xs font-bold uppercase tracking-widest text-stone-700"
        >
          <span className="material-symbols-outlined text-sm">refresh</span> Refresh
        </button>
      </header>

      {/* 2. Order Statistics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 shrink-0">
        {[
          { label: 'Pending', count: stats.Pending, icon: 'pending_actions', iconColor: 'text-amber-500/40' },
          { label: 'Preparing', count: stats.Preparing, icon: 'skillet', iconColor: 'text-blue-500/40' },
          { label: 'Ready', count: stats.Ready, icon: 'room_service', iconColor: 'text-emerald-500/40' },
          { label: 'Completed', count: stats.Completed, icon: 'check_circle', iconColor: 'text-stone-400' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 md:p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2 md:mb-4">
              <span className={`material-symbols-outlined text-2xl md:text-3xl ${kpi.iconColor}`}>{kpi.icon}</span>
            </div>
            <div>
              <p className="text-stone-500 font-label text-[9px] md:text-xs uppercase tracking-widest mb-1">{kpi.label}</p>
              <p className="text-2xl md:text-3xl font-headline text-stone-800">{kpi.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Filters (Segmented Controls) */}
      <div className="mb-6 shrink-0 w-full overflow-x-auto pb-2 lg:pb-0">
        <div className="inline-flex bg-stone-100 rounded-xl p-1 shadow-inner border border-stone-200">
          {['All', 'Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusFilter(st)}
              className={`px-5 lg:px-8 py-2.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap ${
                status === st
                  ? 'bg-white text-primary shadow-sm border border-stone-200/50'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Orders List/Table */}
        <div className="flex-1 min-h-0 flex flex-col bg-transparent lg:bg-white lg:border lg:border-stone-200 rounded-xl lg:shadow-sm overflow-hidden">
          {error && (
             <div className="bg-rose-100 border border-rose-400 text-rose-700 px-6 py-4 m-4 rounded-lg shrink-0">
               {error}
             </div>
          )}
          
          {loading && (
             <div className="flex justify-center items-center h-64">
               <div className="text-stone-500">Loading orders...</div>
             </div>
          )}

          {/* Mobile Grid (< 1024px) */}
          {!loading && (
            <div className="block lg:hidden flex-1 overflow-y-auto pb-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 flex flex-row items-center justify-between gap-3 w-full"
                  >
                    <div className="flex flex-col min-w-0 flex-1 justify-center gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-headline text-base sm:text-lg text-stone-800 truncate leading-none">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`text-[9px] font-label font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border whitespace-nowrap ${getStatusClasses(order.status)}`}
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
                        <div className="text-emerald-800 font-bold text-[11px] sm:text-xs">
                          ₹{order.totalPrice || order.totalAmount}
                        </div>
                      </div>
                    </div>

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
                          {order.status === 'Pending' && 'Accept →'}
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
                  <div className="col-span-full flex flex-col items-center justify-center py-12 px-6 text-center bg-stone-50/50 rounded-2xl border border-stone-100 mt-2 mb-8">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border border-stone-200 shadow-sm mb-4">
                      <span className="material-symbols-outlined text-stone-400 text-2xl">inbox</span>
                    </div>
                    <h3 className="text-base font-serif italic text-stone-800 mb-1">No Orders Found</h3>
                    <p className="text-xs text-stone-500 max-w-[240px] mb-5 leading-relaxed">No orders match the current filter. Try selecting a different status.</p>
                    <button 
                      onClick={() => { refetch(); refetchStats(); }}
                      className="px-4 py-2 bg-white border border-stone-200 text-stone-700 text-xs font-semibold rounded-lg hover:bg-stone-50 transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">refresh</span> Refresh List
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Desktop Table (>= 1024px) */}
          {!loading && (
            <div className="hidden lg:block flex-1 overflow-y-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="sticky top-0 bg-stone-50 shadow-sm border-b border-stone-200 z-10 text-stone-500 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                    {orders.map(order => (
                      <tr 
                          key={order._id}
                          onClick={() => setSelectedOrderId(order._id)} 
                          className={`hover:bg-stone-50 cursor-pointer transition-colors ${selectedOrderId === order._id ? 'bg-primary/5 shadow-inner relative' : ''}`}
                      >
                        {/* Active Selection Indicator */}
                        {selectedOrderId === order._id && (
                           <td className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></td>
                        )}
                        <td className="px-6 py-4 font-bold text-stone-900 whitespace-nowrap text-[15px]">{order.orderNumber}</td>
                        <td className="px-6 py-4 text-stone-600 max-w-xs truncate">
                          {order.items && order.items.length > 0 ? order.items.map(item => `${item.quantity}x ${item.itemName || item.name}`).join(', ') : 'No items'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${getStatusClasses(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-stone-900 font-bold whitespace-nowrap">₹{order.totalPrice || order.totalAmount}</td>
                        <td className="px-6 py-4 text-stone-500 whitespace-nowrap">{formatTime(order.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {getActionButton(order)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-stone-50/50 rounded-2xl border border-stone-100 mx-4 my-6">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-stone-200 shadow-sm mb-4">
                    <span className="material-symbols-outlined text-stone-400 text-3xl">inbox</span>
                  </div>
                  <h3 className="text-lg font-serif italic text-stone-800 mb-1.5">No Orders Found</h3>
                  <p className="text-sm text-stone-500 max-w-sm mb-6 leading-relaxed">There are currently no orders in this view. Try changing the filter or refreshing the list.</p>
                  <button 
                    onClick={() => { refetch(); refetchStats(); }}
                    className="px-5 py-2.5 bg-white border border-stone-200 text-stone-700 text-sm font-semibold rounded-xl hover:bg-stone-50 hover:text-stone-900 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">refresh</span> Refresh Orders
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Order Details Panel (>= 1280px) */}
        {!loading && selectedOrder && (
          <div className="hidden xl:flex flex-col w-[400px] shrink-0 bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden h-full">
            <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex justify-between items-center shrink-0">
              <h2 className="font-bold text-lg text-stone-800">Order Details</h2>
              <button onClick={() => setSelectedOrderId(null)} className="text-stone-400 hover:text-stone-600 bg-white rounded-full p-1 border border-stone-200 shadow-sm">
                <span className="material-symbols-outlined text-sm block">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6 flex justify-between items-start">
                 <div>
                   <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1">Order Number</p>
                   <p className="text-3xl font-bold text-stone-900 font-headline">{selectedOrder.orderNumber}</p>
                 </div>
                 <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md border ${getStatusClasses(selectedOrder.status)}`}>
                    {selectedOrder.status}
                 </span>
              </div>

              <div className="mb-8">
                 <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-3 border-b border-stone-100 pb-2">Items</p>
                 <ul className="space-y-4">
                   {selectedOrder.items?.map((item, i) => (
                      <li key={i} className="flex justify-between items-start text-sm">
                         <div className="flex gap-3">
                            <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{item.quantity}x</span>
                            <span className="text-stone-800 font-medium">{item.itemName || item.name}</span>
                         </div>
                         <span className="text-stone-600 font-semibold whitespace-nowrap ml-4">₹{item.price * item.quantity}</span>
                      </li>
                   ))}
                 </ul>
                 <div className="border-t border-stone-200 mt-6 pt-4 flex justify-between items-center font-bold text-xl">
                    <span className="text-stone-800">Total</span>
                    <span className="text-emerald-700">₹{selectedOrder.totalPrice || selectedOrder.totalAmount}</span>
                 </div>
              </div>

              {selectedOrder.customerInfo && Object.keys(selectedOrder.customerInfo).length > 0 && (
                <div className="mb-8">
                   <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-3 border-b border-stone-100 pb-2">Customer Info</p>
                   <div className="bg-stone-50 p-4 rounded-xl text-sm space-y-3 text-stone-700 border border-stone-200 shadow-inner">
                      <div className="flex items-center gap-3">
                         <span className="material-symbols-outlined text-stone-400 text-lg">person</span>
                         <span className="font-medium">{selectedOrder.customerInfo.name || 'Guest'}</span>
                      </div>
                      {selectedOrder.customerInfo.phone && (
                         <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-stone-400 text-lg">phone</span>
                            <span className="font-medium">{selectedOrder.customerInfo.phone}</span>
                         </div>
                      )}
                   </div>
                </div>
              )}
              
              <div className="mt-auto pt-6 border-t border-stone-100 flex gap-3">
                 {selectedOrder.status !== 'Completed' && selectedOrder.status !== 'Cancelled' && (
                    <button 
                       onClick={() => updateStatus(selectedOrder._id, selectedOrder.status)}
                       className="flex-1 bg-primary text-white py-3 rounded-lg font-bold shadow hover:bg-emerald-800 transition flex justify-center items-center gap-2 uppercase tracking-wider text-xs"
                    >
                       Advance Status <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                 )}
                 <button 
                    onClick={() => setOrderToDelete(selectedOrder._id)}
                    className="flex-none bg-white border border-rose-200 text-rose-600 px-4 py-3 rounded-lg font-bold hover:bg-rose-50 transition flex justify-center items-center"
                    title="Delete Order"
                 >
                    <span className="material-symbols-outlined text-lg">delete</span>
                 </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="mt-6 flex justify-center gap-2 shrink-0 lg:pb-0 pb-4">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition ${
                p === page
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {p}
            </button>
          ))}
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
