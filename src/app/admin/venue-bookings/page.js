'use client';

import { useBookings } from '@/hooks/useBookings';
import { useBookingStats } from '@/hooks/useBookingStats';
import { useState } from 'react';
import { useStatusPill } from '@/contexts/StatusPillContext';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function AdminVenueBookings() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(null);
  const { bookings, loading, error, pagination, refetch } = useBookings(page, 20, status);
  const { stats, refetch: refetchStats } = useBookingStats();
  const { showPill } = useStatusPill();
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const handleStatusFilter = (newStatus) => {
    setStatus(newStatus === 'all' ? null : newStatus);
    setPage(1);
  };

  const executeDeleteBooking = async () => {
    if (!bookingToDelete) return;
    const id = bookingToDelete;
    setBookingToDelete(null);

    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        showPill('Booking deleted successfully', 'success');
        refetch();
        refetchStats();
      } else {
        showPill(`Failed to delete: ${data.error}`, 'error');
      }
    } catch (error) {
      showPill('Failed to delete booking', 'error');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-amber-50 text-amber-700 border-amber-200',
      Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
      'Advance Paid': 'bg-purple-50 text-purple-700 border-purple-200',
      'Fully Paid': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Completed: 'bg-stone-50 text-stone-700 border-stone-200',
      Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return colors[status] || 'bg-stone-50 text-stone-700 border-stone-200';
  };

  const updateBooking = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        showPill(`Booking moved to ${newStatus}`, 'success');
        refetch();
        refetchStats();
      } else {
        showPill(`Failed to update: ${data.error}`, 'error');
      }
    } catch (error) {
      showPill('Failed to update booking', 'error');
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 relative z-10 w-full max-w-7xl mx-auto">
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:justify-between md:items-end border-b border-stone-200 pb-6 md:pb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-primary italic leading-tight break-words">Venue Bookings</h1>
          <p className="text-stone-500 font-label tracking-widest text-xs uppercase mt-2 md:mt-3">Event Space Management Portal</p>
        </div>
        <button 
          onClick={() => { refetch(); refetchStats(); }}
          className="flex items-center justify-center gap-2 bg-white border border-stone-200 shadow-sm hover:bg-stone-50 transition-colors px-6 py-2.5 rounded-lg font-label text-xs font-bold uppercase tracking-widest text-stone-700"
        >
          <span className="material-symbols-outlined text-sm">refresh</span> Refresh
        </button>
      </header>

      {/* KPI Summary Section */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 mb-6 shrink-0">
        {[
          { label: 'Pending', count: stats?.Pending || 0, icon: 'hourglass_empty', iconColor: 'text-amber-500/40' },
          { label: 'Confirmed', count: stats?.Confirmed || 0, icon: 'check_circle', iconColor: 'text-blue-500/40' },
          { label: 'Advance Paid', count: stats?.['Advance Paid'] || 0, icon: 'payments', iconColor: 'text-purple-500/40' },
          { label: 'Fully Paid', count: stats?.['Fully Paid'] || 0, icon: 'task_alt', iconColor: 'text-emerald-500/40' },
          { label: 'Completed', count: stats?.Completed || 0, icon: 'event_available', iconColor: 'text-stone-400' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 md:p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2 md:mb-4">
              <span className={`material-symbols-outlined text-2xl md:text-3xl ${kpi.iconColor}`}>{kpi.icon}</span>
            </div>
            <div>
              <p className="text-stone-500 font-label text-[9px] md:text-xs uppercase tracking-widest mb-1 whitespace-nowrap">{kpi.label}</p>
              <p className="text-2xl md:text-3xl font-headline text-stone-800">{kpi.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status Filter */}
      <div className="mb-6 shrink-0 w-full overflow-x-auto pb-2 lg:pb-0">
        <div className="inline-flex bg-stone-100 rounded-xl p-1 shadow-inner border border-stone-200">
          {['all', 'Pending', 'Confirmed', 'Advance Paid', 'Fully Paid', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusFilter(st)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center text-center whitespace-nowrap ${
                (status === st || (status === null && st === 'all'))
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/50'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
              }`}
            >
              {st === 'all' ? 'All Bookings' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-rose-100 border border-rose-400 text-rose-700 px-6 py-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-stone-500 font-label tracking-widest uppercase text-xs animate-pulse">Loading bookings...</div>
        </div>
      )}

      {/* Bookings Data Display */}
      {!loading && bookings.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          
          {/* Mobile Card Layout (Hidden on Desktop) */}
          <div className="md:hidden flex flex-col divide-y divide-stone-100">
            {bookings.map((booking) => (
              <div key={booking._id} className="p-4 space-y-3 cursor-pointer hover:bg-stone-50 transition-colors" onClick={() => setSelectedBookingId(booking._id)}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-stone-400 font-headline text-xs mb-1 block">ID: {booking.bookingNumber}</span>
                    <p className="font-serif italic text-lg text-primary leading-tight">{booking.customerInfo?.name || booking.customerName || 'Unknown Customer'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[9px] font-label font-bold uppercase tracking-widest border whitespace-nowrap ${getStatusColor(booking.paymentStatus)}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 bg-stone-50 rounded-lg p-3 border border-stone-100">
                  <div>
                    <p className="text-[10px] text-stone-500 uppercase tracking-widest font-label mb-0.5">Event</p>
                    <p className="text-xs font-semibold text-stone-700 truncate">{booking.eventType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-500 uppercase tracking-widest font-label mb-0.5">Date</p>
                    <p className="text-xs font-medium text-stone-700">
                      {new Date(booking.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedBookingId(booking._id); }}
                    className="w-full py-2 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900 rounded-lg transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[14px]">tune</span> Manage
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout (Hidden on Mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-100">
                  <th className="font-label text-[10px] uppercase tracking-widest text-stone-500 py-4 px-6 font-semibold">ID</th>
                  <th className="font-label text-[10px] uppercase tracking-widest text-stone-500 py-4 px-6 font-semibold">Client</th>
                  <th className="font-label text-[10px] uppercase tracking-widest text-stone-500 py-4 px-6 font-semibold">Event Details</th>
                  <th className="font-label text-[10px] uppercase tracking-widest text-stone-500 py-4 px-6 font-semibold">Date & Space</th>
                  <th className="font-label text-[10px] uppercase tracking-widest text-stone-500 py-4 px-6 font-semibold">Status</th>
                  <th className="font-label text-[10px] uppercase tracking-widest text-stone-500 py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-stone-50/80 transition-colors group cursor-pointer" onClick={() => setSelectedBookingId(booking._id)}>
                    <td className="py-4 px-6 text-stone-400 font-headline text-sm">{booking.bookingNumber}</td>
                    <td className="py-4 px-6">
                      <p className="font-serif italic text-lg text-primary">{booking.customerInfo?.name || booking.customerName || 'Unknown Customer'}</p>
                      <p className="text-[11px] font-label text-stone-400 mt-0.5">{booking.customerInfo?.email || booking.customerEmail || 'No Email'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-xs font-semibold text-stone-700">{booking.eventType}</p>
                      <p className="text-[10px] font-label uppercase tracking-widest text-stone-400 flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[12px]">groups</span> {booking.numberOfGuests} Guests
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-xs text-stone-700 font-medium">
                        {new Date(booking.eventDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-[10px] font-label uppercase tracking-widest text-stone-400 mt-0.5">
                        {booking.venue || booking.selectedSpace || 'TBD'}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-label font-bold uppercase tracking-widest border whitespace-nowrap inline-block ${getStatusColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedBookingId(booking._id); }}
                        className="px-4 py-1.5 bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 hover:border-stone-300 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5 shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        <span className="material-symbols-outlined text-[14px]">tune</span> Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-stone-50/50 rounded-2xl border border-stone-100 mx-4 my-6">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-stone-200 shadow-sm mb-4">
            <span className="material-symbols-outlined text-stone-400 text-3xl">event_busy</span>
          </div>
          <h3 className="text-lg font-serif italic text-stone-800 mb-1.5">No Venue Bookings Found</h3>
          <p className="text-sm text-stone-500 max-w-sm mb-6 leading-relaxed">There are currently no bookings matching this status. Try selecting a different filter.</p>
          <button 
            onClick={() => { refetch(); refetchStats(); }}
            className="px-5 py-2.5 bg-white border border-stone-200 text-stone-700 text-sm font-semibold rounded-xl hover:bg-stone-50 hover:text-stone-900 transition-colors shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span> Refresh List
          </button>
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                p === page
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Booking Details Drawer */}
      {selectedBookingId && (() => {
        const selectedBooking = bookings.find(b => b._id === selectedBookingId);
        if (!selectedBooking) return null;
        
        return (
          <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/30 backdrop-blur-sm transition-opacity">
            <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between p-6 md:p-8 border-b border-stone-100 bg-stone-50/50">
                <div>
                  <h2 className="text-2xl font-serif italic text-stone-900">Booking Management</h2>
                  <p className="text-[10px] font-label uppercase tracking-widest text-stone-500 mt-1.5">ID: {selectedBooking.bookingNumber}</p>
                </div>
                <button onClick={() => setSelectedBookingId(null)} className="p-2 text-stone-400 hover:text-stone-700 bg-white hover:bg-stone-100 rounded-full transition-colors border border-stone-200 shadow-sm flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg block">close</span>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                {/* Status */}
                <div>
                  <h3 className="text-[10px] font-label uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">flag</span> Current Status</h3>
                  <span className={`px-4 py-2 rounded-lg text-xs font-label font-bold uppercase tracking-widest border inline-block whitespace-nowrap ${getStatusColor(selectedBooking.paymentStatus)}`}>
                    {selectedBooking.paymentStatus}
                  </span>
                </div>

                {/* Client Info */}
                <div>
                  <h3 className="text-[10px] font-label uppercase tracking-widest text-stone-400 mb-3 border-b border-stone-100 pb-2 flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">person</span> Client Information</h3>
                  <div className="bg-stone-50/80 rounded-2xl p-5 border border-stone-100 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-serif italic text-xl">
                        {(selectedBooking.customerInfo?.name || selectedBooking.customerName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-serif italic text-lg text-stone-800">{selectedBooking.customerInfo?.name || selectedBooking.customerName || 'Unknown Customer'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Email</span>
                        <span className="text-stone-600 text-sm font-medium">{selectedBooking.customerInfo?.email || selectedBooking.customerEmail || 'Not Provided'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Phone</span>
                        <span className="text-stone-600 text-sm font-medium">{selectedBooking.customerInfo?.phone || selectedBooking.customerPhone || 'Not Provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div>
                  <h3 className="text-[10px] font-label uppercase tracking-widest text-stone-400 mb-3 border-b border-stone-100 pb-2 flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">event</span> Event Details</h3>
                  <div className="grid grid-cols-2 gap-4 bg-white border border-stone-100 p-5 rounded-2xl shadow-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">Event Type</p>
                      <p className="text-sm font-medium text-stone-800">{selectedBooking.eventType}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">Guest Count</p>
                      <p className="text-sm font-medium text-stone-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-stone-400">groups</span> {selectedBooking.numberOfGuests}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">Scheduled Date</p>
                      <p className="text-sm font-medium text-stone-800">
                        {new Date(selectedBooking.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">Reserved Space</p>
                      <p className="text-sm font-medium text-stone-800">{selectedBooking.venue || selectedBooking.selectedSpace || 'TBD'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Administrative Controls */}
              <div className="p-6 md:p-8 border-t border-stone-100 bg-stone-50 shrink-0">
                 <h3 className="text-[10px] font-label uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">admin_panel_settings</span> Management Actions</h3>
                 <div className="space-y-3">
                  {selectedBooking.paymentStatus === 'Pending' && (
                    <>
                      <button
                        onClick={() => { updateBooking(selectedBooking._id, 'Advance Paid'); setSelectedBookingId(null); }}
                        className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors text-xs font-bold uppercase tracking-widest shadow-sm flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">payments</span> Log Advance Payment
                      </button>
                      <button
                        onClick={() => { updateBooking(selectedBooking._id, 'Confirmed'); setSelectedBookingId(null); }}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-xs font-bold uppercase tracking-widest shadow-sm flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">verified</span> Mark Confirmed
                      </button>
                      <button
                        onClick={() => { setBookingToDelete(selectedBooking._id); setSelectedBookingId(null); }}
                        className="w-full py-3.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest shadow-sm flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span> Delete Booking
                      </button>
                    </>
                  )}
                  {selectedBooking.paymentStatus === 'Confirmed' && (
                    <button
                      onClick={() => { updateBooking(selectedBooking._id, 'Advance Paid'); setSelectedBookingId(null); }}
                      className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors text-xs font-bold uppercase tracking-widest shadow-sm flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">payments</span> Log Advance Payment
                    </button>
                  )}
                  {selectedBooking.paymentStatus === 'Advance Paid' && (
                    <button
                      onClick={() => { updateBooking(selectedBooking._id, 'Fully Paid'); setSelectedBookingId(null); }}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors text-xs font-bold uppercase tracking-widest shadow-sm flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">task_alt</span> Log Full Payment
                    </button>
                  )}
                  {selectedBooking.paymentStatus === 'Fully Paid' && (
                    <button
                      onClick={() => { updateBooking(selectedBooking._id, 'Completed'); setSelectedBookingId(null); }}
                      className="w-full py-3.5 bg-stone-900 hover:bg-black text-white rounded-xl transition-colors text-xs font-bold uppercase tracking-widest shadow-sm flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">event_available</span> Mark Event Completed
                    </button>
                  )}
                  {(selectedBooking.paymentStatus === 'Completed' || selectedBooking.paymentStatus === 'Cancelled') && (
                    <button
                      onClick={() => { setBookingToDelete(selectedBooking._id); setSelectedBookingId(null); }}
                      className="w-full py-3.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest shadow-sm flex items-center justify-center gap-2 mt-4"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span> Delete Record
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <ConfirmationModal
        isOpen={!!bookingToDelete}
        title="Delete Booking"
        message="Are you sure you want to delete this booking? It will be removed permanently from the system."
        onConfirm={executeDeleteBooking}
        onCancel={() => setBookingToDelete(null)}
      />
    </div>
  );
}
