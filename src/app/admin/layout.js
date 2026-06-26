"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't show layout on login page
  const isLoginPage = pathname === '/admin/login';

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: 'dashboard' },
    { name: 'Orders', path: '/admin/orders', icon: 'receipt_long' },
    { name: 'Venue Bookings', path: '/admin/venue-bookings', icon: 'event' },
    { name: 'Menu Management', path: '/admin/menu', icon: 'restaurant_menu' },
    { name: 'Memberships', path: '/admin/memberships', icon: 'card_membership' },
    { name: 'Settings', path: '/admin/settings', icon: 'settings' },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        console.log('✅ Logged out successfully');
        router.push('/admin/login');
      } else {
        alert('Logout failed. Please try again.');
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error during logout');
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {isLoginPage ? (
        // Show login page without admin layout
        children
      ) : (
        <AdminProtectedRoute>
          <div className="flex flex-col md:flex-row h-[100dvh] bg-stone-100 font-body text-stone-800 overflow-hidden w-full max-w-[100vw]">
            
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between bg-emerald-950 text-white p-4 z-30 shadow-md shrink-0">
              <Link href="/admin" className="text-xl font-serif italic font-medium">
                The Grove <span className="text-[10px] font-sans tracking-widest uppercase text-emerald-300 ml-1">Admin</span>
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 -mr-2 text-white hover:bg-emerald-900 rounded-lg transition-colors"
                aria-label="Toggle navigation menu"
              >
                <span className="material-symbols-outlined text-2xl">
                  {isMobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
              <div 
                className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-emerald-950 text-stone-100 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="p-8 pb-12 border-b border-white/10 hidden md:block">
                <Link href="/admin" className="text-2xl font-serif italic text-white hover:opacity-80 transition-opacity">
                  The Grove <span className="text-xs font-sans tracking-widest uppercase block mt-1 text-emerald-300">Admin</span>
                </Link>
              </div>
              
              <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
                {adminLinks.map((link) => {
                  const isActive = pathname === link.path;
                  return (
                    <Link 
                      key={link.path} 
                      href={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                        isActive ? 'bg-emerald-900/50 text-emerald-100 shadow-inner' : 'hover:bg-emerald-900/30 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span className="material-symbols-outlined">{link.icon}</span>
                      <span className="font-label text-sm uppercase tracking-widest font-medium">{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
              
              <div className="p-8 border-t border-white/10 shrink-0">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 text-stone-200 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed py-2"
                >
                  <span className="material-symbols-outlined">logout</span>
                  <span className="font-label text-xs uppercase tracking-widest font-medium">
                    {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                  </span>
                </button>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-stone-50/50 relative flex flex-col w-full">
              {/* Subtle background decoration */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mt-24 -mr-24 pointer-events-none"></div>
              {children}
            </main>
          </div>
        </AdminProtectedRoute>
      )}
    </>
  );
}
