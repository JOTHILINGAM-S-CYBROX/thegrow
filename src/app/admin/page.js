'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalBookings: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        // You can add actual API calls here
        setStats({
          totalOrders: 0,
          totalBookings: 0,
          totalCustomers: 0,
          totalRevenue: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-12 relative z-10 w-full max-w-7xl">
      <header className="mb-12 flex justify-between items-end border-b border-stone-200 pb-8">
        <div>
          <h1 className="text-[clamp(2.5rem,8vw,4rem)] font-serif text-primary italic leading-tight">Dashboard</h1>
          <p className="text-stone-500 font-label tracking-widest text-xs uppercase mt-3">Admin Control Center</p>
        </div>
      </header>

      {/* Stats Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-serif italic text-primary mb-6">Statistics</h2>
        {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-3xl text-primary/40">receipt_long</span>
              </div>
              <div>
                <p className="text-stone-500 font-label text-xs uppercase tracking-widest mb-1">Total Orders</p>
                <p className="text-3xl font-headline text-stone-800">{stats.totalOrders}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-3xl text-emerald-500/40">event</span>
              </div>
              <div>
                <p className="text-stone-500 font-label text-xs uppercase tracking-widest mb-1">Total Bookings</p>
                <p className="text-3xl font-headline text-stone-800">{stats.totalBookings}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-3xl text-amber-500/40">group</span>
              </div>
              <div>
                <p className="text-stone-500 font-label text-xs uppercase tracking-widest mb-1">Total Customers</p>
                <p className="text-3xl font-headline text-stone-800">{stats.totalCustomers}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-3xl text-sky-500/40">trending_up</span>
              </div>
              <div>
                <p className="text-stone-500 font-label text-xs uppercase tracking-widest mb-1">Total Revenue</p>
                <p className="text-3xl font-headline text-stone-800">₹{stats.totalRevenue}</p>
              </div>
            </div>
          </div>
      </div>

      {/* Management Modules */}
      <div>
        <h2 className="text-2xl font-serif italic text-primary mb-6">Management Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Orders Management */}
          <Link href="/admin/orders" className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 hover:shadow-md transition-shadow cursor-pointer group flex flex-col justify-between">
            <div className="flex items-start justify-between mb-6">
              <span className="material-symbols-outlined text-4xl text-primary group-hover:scale-110 transition-transform">receipt_long</span>
              <span className="material-symbols-outlined text-stone-300 group-hover:text-primary transition-colors">arrow_outward</span>
            </div>
            <div>
              <h3 className="text-xl font-serif italic text-stone-800 mb-2">Orders Management</h3>
              <p className="text-sm text-stone-500">View, track, and manage all customer orders</p>
            </div>
          </Link>

          {/* Menu Management */}
          <Link href="/admin/menu" className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 hover:shadow-md transition-shadow cursor-pointer group flex flex-col justify-between">
            <div className="flex items-start justify-between mb-6">
              <span className="material-symbols-outlined text-4xl text-emerald-700 group-hover:scale-110 transition-transform">restaurant_menu</span>
              <span className="material-symbols-outlined text-stone-300 group-hover:text-emerald-700 transition-colors">arrow_outward</span>
            </div>
            <div>
              <h3 className="text-xl font-serif italic text-stone-800 mb-2">Menu Management</h3>
              <p className="text-sm text-stone-500">Add, edit, and manage menu items and pricing</p>
            </div>
          </Link>

          {/* Venue Bookings */}
          <Link href="/admin/venue-bookings" className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 hover:shadow-md transition-shadow cursor-pointer group flex flex-col justify-between">
            <div className="flex items-start justify-between mb-6">
              <span className="material-symbols-outlined text-4xl text-amber-700 group-hover:scale-110 transition-transform">event</span>
              <span className="material-symbols-outlined text-stone-300 group-hover:text-amber-700 transition-colors">arrow_outward</span>
            </div>
            <div>
              <h3 className="text-xl font-serif italic text-stone-800 mb-2">Venue Bookings</h3>
              <p className="text-sm text-stone-500">Manage event bookings and reservations</p>
            </div>
          </Link>

          {/* Kitchen Dashboard */}
          <Link href="/kitchen/orders" className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 hover:shadow-md transition-shadow cursor-pointer group flex flex-col justify-between">
            <div className="flex items-start justify-between mb-6">
              <span className="material-symbols-outlined text-4xl text-orange-700 group-hover:scale-110 transition-transform">restaurant_menu</span>
              <span className="material-symbols-outlined text-stone-300 group-hover:text-orange-700 transition-colors">arrow_outward</span>
            </div>
            <div>
              <h3 className="text-xl font-serif italic text-stone-800 mb-2">Kitchen Dashboard</h3>
              <p className="text-sm text-stone-500">Monitor live kitchen orders and status</p>
            </div>
          </Link>

          {/* Memberships Management */}
          <Link href="/admin/memberships" className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 hover:shadow-md transition-shadow cursor-pointer group flex flex-col justify-between">
            <div className="flex items-start justify-between mb-6">
              <span className="material-symbols-outlined text-4xl text-rose-700 group-hover:scale-110 transition-transform">card_membership</span>
              <span className="material-symbols-outlined text-stone-300 group-hover:text-rose-700 transition-colors">arrow_outward</span>
            </div>
            <div>
              <h3 className="text-xl font-serif italic text-stone-800 mb-2">Memberships Management</h3>
              <p className="text-sm text-stone-500">View and verify customer memberships and uploaded documents</p>
            </div>
          </Link>

          {/* Analytics */}
          <Link href="#" className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 hover:shadow-md transition-shadow cursor-pointer group flex flex-col justify-between">
            <div className="flex items-start justify-between mb-6">
              <span className="material-symbols-outlined text-4xl text-sky-700 group-hover:scale-110 transition-transform">analytics</span>
              <span className="material-symbols-outlined text-stone-300 group-hover:text-sky-700 transition-colors">arrow_outward</span>
            </div>
            <div>
              <h3 className="text-xl font-serif italic text-stone-800 mb-2">Analytics</h3>
              <p className="text-sm text-stone-500">View insights and performance metrics</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
