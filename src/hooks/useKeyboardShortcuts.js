'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook to handle global keyboard shortcuts
 * Ctrl+Shift+A = Admin login
 * Ctrl+Shift+K = Kitchen login
 */
export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Shift+A for admin login
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        router.push('/admin/login');
      }

      // Ctrl+Shift+K for kitchen login
      if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        router.push('/kitchen/login');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);
}
