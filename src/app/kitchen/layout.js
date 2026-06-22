'use client';

import '../globals.css';
import { usePathname, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState } from 'react';

export default function KitchenLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Don't protect login page
  const isLoginPage = pathname === '/kitchen/login';

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch('/api/kitchen/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      const data = await response.json();
      if (data.success) {
        router.push('/kitchen/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error logging out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const content = (
    <>
      {!isLoginPage && (
        <nav className="fixed inset-x-0 top-0 bg-white/90 backdrop-blur-md border-b border-stone-200 z-50 h-14 md:h-16 flex items-center shadow-sm">
          <div className="w-full px-4 md:px-8 flex justify-between items-center min-w-0">
            {/* Brand Section */}
            <div className="flex items-center gap-2 md:gap-3 min-w-0 shrink-0">
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-[24px]">restaurant_menu</span>
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <h1 className="font-serif italic text-primary text-base md:text-lg font-medium truncate leading-none md:leading-tight mt-0.5 md:mt-0">
                  The Grove
                </h1>
                <p className="hidden md:block text-stone-500 font-label text-[10px] uppercase tracking-widest mt-1 truncate">
                  Kitchen Management
                </p>
              </div>
            </div>

            {/* Actions Section */}
            <div className="flex gap-2 md:gap-6 items-center shrink-0 ml-4">
              <a href="/kitchen/orders" title="Orders" className="flex items-center justify-center gap-2 w-11 h-11 md:w-auto md:h-auto rounded-full md:rounded-none hover:bg-stone-100 md:hover:bg-transparent font-label text-xs uppercase tracking-widest text-stone-700 hover:text-primary transition shrink-0">
                <span className="material-symbols-outlined text-[20px] md:text-[18px]">receipt_long</span>
                <span className="hidden md:inline">Orders</span>
              </a>
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                title="Sign Out"
                className="flex items-center justify-center gap-2 w-11 h-11 md:w-auto md:h-auto md:px-5 md:py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 transition font-label text-xs uppercase tracking-widest disabled:opacity-50 shrink-0"
              >
                <span className="material-symbols-outlined text-[20px] md:text-[18px] text-stone-600">logout</span>
                <span className="hidden md:inline">{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </nav>
      )}

      <main className={isLoginPage ? '' : 'pt-24 min-h-screen'} suppressHydrationWarning>
        <div className="flex justify-center" suppressHydrationWarning>
          {children}
        </div>
      </main>

      {!isLoginPage && (
        <footer className="bg-white border-t border-stone-200 py-6 px-8 text-center text-stone-500 font-label text-xs">
          <p>The Grove Kitchen Management System © 2024</p>
        </footer>
      )}
    </>
  );

  if (isLoginPage) {
    // Show login without protection
    return content;
  }

  // Protect other routes
  return <ProtectedRoute>{content}</ProtectedRoute>;
}
