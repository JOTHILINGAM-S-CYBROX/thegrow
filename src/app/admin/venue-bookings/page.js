'use client';

import { useBookings } from '@/hooks/useBookings';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminVenueBookings() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(null);
  const { bookings, loading, error, pagination, refetch } = useBookings(page, 20, status);

  const handleStatusFilter = (newStatus) => {
    setStatus(newStatus === 'all' ? null : newStatus);
    setPage(1);
  };

  const handleDeleteBooking = async (id) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        alert('Booking deleted successfully');
        refetch();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error deleting booking: ${error.message}`);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-amber-50 text-amber-700 border-amber-200',
      Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
      'Advance Paid': 'bg-purple-50 text-purple-700 border-purple-200',
      'Fully Paid': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Completed: 'bg-gray-50 text-gray-700 border-gray-200',
      Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
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
        alert('Booking updated successfully');
        refetch();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error updating booking: ${error.message}`);
    }
  };

  return (
    <div className="p-12 relative z-10 w-full max-w-7xl">
      <header className="mb-12 flex justify-between items-end border-b border-stone-200 pb-8">
        <div>
          <h1 className="text-[clamp(2.5rem,8vw,4rem)] font-serif text-primary italic leading-tight">Venue Bookings</h1>
          <p className="text-stone-500 font-label tracking-widest text-xs uppercase mt-3">Event Space Management Portal</p>
        </div>
      </header>

      {/* Status Filter */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-stone-100 p-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              status === null
                ? 'bg-primary text-white'
                : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
            }`}
          >
            All
          </button>
          {['Pending', 'Confirmed', 'Advance Paid', 'Fully Paid', 'Completed', 'Cancelled'].map(
            (st) => (
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
            )
          )}
        </div>
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
          <div className="text-stone-500">Loading bookings...</div>
        </div>
      )}

      {/* Bookings Table */}
      {!loading && bookings.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="font-label text-xs uppercase tracking-widest text-stone-500 py-6 px-8 font-semibold">ID</th>
                  <th className="font-label text-xs uppercase tracking-widest text-stone-500 py-6 px-8 font-semibold">Client</th>
                  <th className="font-label text-xs uppercase tracking-widest text-stone-500 py-6 px-8 font-semibold">Event Details</th>
                  <th className="font-label text-xs uppercase tracking-widest text-stone-500 py-6 px-8 font-semibold">Date & Space</th>
                  <th className="font-label text-xs uppercase tracking-widest text-stone-500 py-6 px-8 font-semibold">Status</th>
                  <th className="font-label text-xs uppercase tracking-widest text-stone-500 py-6 px-8 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                    <td className="py-6 px-8 text-stone-400 font-headline text-lg">{booking.bookingNumber}</td>
                    <td className="py-6 px-8">
                      <p className="font-serif italic text-xl text-primary">{booking.customerName}</p>
                      <p className="text-xs font-label text-stone-400 mt-1">{booking.customerEmail}</p>
                    </td>
                    <td className="py-6 px-8">
                      <p className="text-sm font-semibold text-stone-700">{booking.eventType}</p>
                      <p className="text-xs font-label uppercase tracking-widest text-stone-400 flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[10px]">groups</span> {booking.numberOfGuests} Guests
                      </p>
                    </td>
                    <td className="py-6 px-8">
                      <p className="text-sm text-stone-700 font-medium">
                        {new Date(booking.eventDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-xs font-label uppercase tracking-widest text-stone-400 mt-1">
                        {booking.selectedSpace || 'TBD'}
                      </p>
                    </td>
                    <td className="py-6 px-8">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-[0.2em] border ${getStatusColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="py-6 px-8 text-right space-x-2">
                      {booking.paymentStatus === 'Pending' && (
                        <>
                          <button
                            onClick={() => updateBooking(booking._id, 'Advance Paid')}
                            className="p-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-full transition-colors"
                            title="Mark Advance Paid"
                          >
                            <span className="material-symbols-outlined text-sm block">check_circle</span>
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(booking._id)}
                            className="p-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-full transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-sm block">delete</span>
                          </button>
                        </>
                      )}
                      {booking.paymentStatus === 'Advance Paid' && (
                        <>
                          <button
                            onClick={() => updateBooking(booking._id, 'Fully Paid')}
                            className="p-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-full transition-colors"
                            title="Mark Fully Paid"
                          >
                            <span className="material-symbols-outlined text-sm block">check_circle</span>
                          </button>
                        </>
                      )}
                      {booking.paymentStatus === 'Fully Paid' && (
                        <>
                          <button
                            onClick={() => updateBooking(booking._id, 'Completed')}
                            className="p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                            title="Mark Completed"
                          >
                            <span className="material-symbols-outlined text-sm block">done_all</span>
                          </button>
                        </>
                      )}
                      {(booking.paymentStatus === 'Completed' || booking.paymentStatus === 'Cancelled') && (
                        <span className="text-stone-300 italic font-body text-sm">Resolved</span>
                      )}
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
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 text-center">
          <p className="text-stone-500">No bookings found</p>
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
