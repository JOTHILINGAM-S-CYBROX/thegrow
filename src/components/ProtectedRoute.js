'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * ProtectedRoute component that redirects unauthenticated users to kitchen login
 * Checks authentication status via /api/kitchen/check-auth endpoint (server-side cookie check)
 */
export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check kitchen authentication via API endpoint
    const checkKitchenAuth = async () => {
      try {
        const response = await fetch('/api/kitchen/check-auth', {
          method: 'GET',
          credentials: 'include',
        });
        
        const data = await response.json();
        
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          router.push('/kitchen/login');
        }
      } catch (error) {
        console.error('Error checking kitchen auth:', error);
        router.push('/kitchen/login');
      } finally {
        setLoading(false);
      }
    };

    checkKitchenAuth();
  }, [router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <span className="material-symbols-outlined text-5xl text-primary">restaurant_menu</span>
          </div>
          <p className="text-on-surface-variant font-body">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Only render if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return children;
}
