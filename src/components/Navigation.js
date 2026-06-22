"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [settings, setSettings] = useState({ 
    foodOrderingEnabled: true, 
    membershipEnabled: true,
    tableBookingEnabled: true,
    eventBookingEnabled: true
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen]);

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.settings) {
            setSettings(data.settings);
          }
        }
      } catch (err) {
        console.error('Error fetching settings for navigation:', err);
      }
    };
    fetchSettings();
  }, []);

  const isInternalPage = pathname && (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/kitchen') ||
    pathname.startsWith('/staff')
  );

  if (isInternalPage) {
    return null;
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    ...(settings.foodOrderingEnabled ? [{ name: 'Menu', path: '/interactive-menu' }] : []),
    { name: 'Experience', path: '/experience-gallery' },
    ...(settings.eventBookingEnabled ? [{ name: 'Events', path: '/venue-booking' }] : []),
    ...(settings.membershipEnabled ? [{ name: 'Memberships', path: '/memberships' }] : []),
  ];

  const bottomLinks = [
    { name: 'Home', path: '/', icon: 'home' },
    ...(settings.foodOrderingEnabled ? [{ name: 'Menu', path: '/interactive-menu', icon: 'restaurant_menu' }] : []),
    ...(settings.eventBookingEnabled ? [{ name: 'Events', path: '/venue-booking', icon: 'event' }] : []),
    ...(settings.tableBookingEnabled ? [{ name: 'Reserve', path: '/reservations', icon: 'event_seat' }] : []),
  ];

  return (
    <>
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 shadow-sm bg-[#fdf9ee]/80 backdrop-blur-[20px]" suppressHydrationWarning>
        <div className="flex justify-between items-center px-4 md:px-8 py-4 md:py-6 max-w-screen-2xl mx-auto" suppressHydrationWarning>
          <Link href="/" className="flex items-center justify-center relative z-[60] shrink-0">
            <img src="/assets/logo/g-logo.webp" alt="The Grove Logo" className="h-8 min-[740px]:h-9 lg:h-10 w-auto object-contain transition-all" />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden min-[740px]:flex items-center gap-[clamp(12px,2vw,48px)]">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`${isActive ? 'text-primary border-b border-primary pb-1 font-headline italic' : 'text-stone-600 hover:text-primary transition-colors font-headline italic'} text-[clamp(14px,1.5vw,18px)] tracking-tight whitespace-nowrap`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
          
          {/* Desktop CTA */}
          {settings.tableBookingEnabled && (
            <div className="hidden min-[740px]:block shrink-0">
              <Link href="/reservations" className="bg-primary text-on-primary px-[clamp(12px,2vw,24px)] py-2 rounded-full font-label text-[clamp(10px,1.2vw,14px)] tracking-wider xl:tracking-widest uppercase hover:opacity-80 transition-opacity active:scale-95 flex items-center justify-center min-h-[44px] whitespace-nowrap w-max">
                Book a Table
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Menu */}
          <button 
            className="min-[740px]:hidden flex items-center justify-center w-[44px] h-[44px] text-stone-800 relative z-[60] hover:bg-stone-100 rounded-full transition-colors shrink-0"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            aria-label="Toggle Navigation"
            aria-expanded={isDrawerOpen}
          >
            <span className="material-symbols-outlined text-3xl">
              {isDrawerOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div 
        className={`fixed inset-0 z-[65] min-[740px]:hidden transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div 
          className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
          onClick={() => setIsDrawerOpen(false)}
        />
        <div 
          className={`absolute top-0 right-0 h-[100dvh] w-[85vw] max-w-[340px] bg-surface shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-primary/10">
            <img src="/assets/logo/g-logo.webp" alt="The Grove Logo" className="h-8 w-auto object-contain" />
            <button 
              onClick={() => setIsDrawerOpen(false)}
              className="flex items-center justify-center w-[44px] h-[44px] text-stone-500 hover:text-stone-800 transition-colors"
              aria-label="Close Navigation"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-8 py-10">
            <nav className="flex flex-col space-y-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`block text-2xl font-headline tracking-wide transition-colors duration-300 ${
                      isActive ? 'text-primary italic' : 'text-stone-500 hover:text-primary'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Bottom CTA Section */}
          <div className="mt-auto px-8 py-10 bg-surface-container-lowest border-t border-primary/5">
            <span className="font-label text-primary/60 text-[10px] tracking-[0.2em] uppercase mb-4 block">The Grove Experience</span>
            <p className="text-on-surface-variant text-sm mb-6 italic leading-relaxed">Cultivating culinary memories in the heart of Tiruppur's finest coconut groves.</p>
            {settings.tableBookingEnabled && (
              <Link
                href="/reservations"
                onClick={() => setIsDrawerOpen(false)}
                className="bg-primary text-on-primary w-full py-4 rounded-full font-label text-sm tracking-widest uppercase hover:opacity-90 transition-opacity active:scale-95 flex items-center justify-center"
              >
                Book a Table
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Mobile) */}
      {pathname !== '/sms-auth-checkout' && (
        <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-20 px-4 pb-safe bg-stone-50/90 backdrop-blur-xl xl:hidden z-50 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]" suppressHydrationWarning>
          {bottomLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link key={link.path} href={link.path} className={`flex flex-col items-center justify-center ${isActive ? 'text-emerald-900 scale-110' : 'text-stone-400'}`}>
                <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {link.icon}
                </span>
                <span className="font-label text-[10px] font-medium tracking-tighter uppercase mt-1">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
