'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function KitchenLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Verify kitchen password
      const response = await fetch('/api/kitchen/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to kitchen orders dashboard
        router.push('/kitchen/orders');
      } else {
        setError(data.message || 'Invalid password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Kitchen login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-stone-100" suppressHydrationWarning>
      <div className="w-full max-w-md" suppressHydrationWarning>
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-stone-200 p-12" suppressHydrationWarning>
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <span className="material-symbols-outlined text-5xl text-emerald-600">restaurant_menu</span>
            </div>
            <h1 className="text-3xl font-serif italic text-emerald-700 mb-2">The Grove</h1>
            <p className="text-stone-500 font-label text-xs uppercase tracking-widest">
              Kitchen Staff Login
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Input */}
            <div>
              <label className="block font-label text-xs uppercase tracking-widest text-stone-700 mb-2">
                Kitchen Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                autoFocus
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-stone-100"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-body">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-label text-sm uppercase tracking-widest hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Access Kitchen'}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-8 pt-8 border-t border-stone-200 text-center text-xs text-stone-500 font-body">
            <p>Kitchen staff login only</p>
            <p className="mt-2">This area is restricted to authorized kitchen personnel</p>
            <p className="mt-4 text-[10px] text-stone-400">Shortcut: Ctrl+Shift+K</p>
          </div>
        </div>
      </div>
    </div>
  );
}
