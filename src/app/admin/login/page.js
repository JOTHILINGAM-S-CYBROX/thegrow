'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to admin dashboard
        router.push('/admin');
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white" suppressHydrationWarning>
      
      {/* Left Side - Brand & Image */}
      <div className="hidden lg:flex flex-1 relative bg-stone-950 overflow-hidden">
        {/* Background Image */}
        <img 
          src="/kitchen-bg.png" 
          alt="Admin Portal Background" 
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-50"
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-stone-950/80 via-transparent to-transparent" />
        
        {/* Branding Content */}
        <div className="relative z-20 flex flex-col justify-end p-16 xl:p-24 h-full text-white w-full">
          <div className="mb-6">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
            </div>
          </div>
          <h1 className="text-5xl xl:text-6xl font-serif italic mb-4 tracking-tight">The Grove</h1>
          <p className="text-stone-300 text-lg xl:text-xl font-light max-w-lg leading-relaxed">
            Centralized admin portal for holistic restaurant management, configuration, and insights.
          </p>
          
          <div className="mt-16 flex items-center gap-6 text-sm font-medium text-stone-400">
            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">verified_user</span> Master Control</span>
            <span className="w-1 h-1 rounded-full bg-stone-600" />
            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">shield</span> Enhanced Security</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Panel */}
      <div className="w-full lg:w-[480px] xl:w-[560px] flex items-center justify-center px-6 sm:px-12 md:px-20 lg:px-16 xl:px-24 bg-white relative shrink-0 min-h-[100dvh] lg:min-h-screen" suppressHydrationWarning>
        
        {/* Single Vertically Centered Content Block */}
        <div className="w-full max-w-[400px] py-6 sm:py-8 lg:py-12 flex flex-col justify-center">
          
          {/* Mobile/Tablet Branding (Hidden on desktop) */}
          <div className="lg:hidden mb-6 sm:mb-8 text-center flex flex-col items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-stone-50 rounded-xl flex items-center justify-center mb-3 sm:mb-5 border border-stone-100">
              <span className="material-symbols-outlined text-stone-800 text-xl sm:text-2xl">admin_panel_settings</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif italic text-stone-900 mb-1 sm:mb-2">The Grove</h1>
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
              Admin Portal
            </p>
          </div>

          {/* Form Header */}
          <div className="mb-6 lg:mb-10 text-center lg:text-left">
            <h2 className="text-2xl lg:text-3xl font-semibold text-stone-900 mb-1.5 lg:mb-3 tracking-tight">Welcome back</h2>
            <p className="text-xs lg:text-sm text-stone-500 font-body leading-relaxed">Please enter your admin password to access the control panel.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <div>
              <label className="block text-[10px] lg:text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-2 text-center lg:text-left">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                autoFocus
                className="h-[48px] lg:h-[56px] w-full px-4 lg:px-5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all text-sm lg:text-base shadow-sm text-center lg:text-left"
              />
            </div>

            {error && (
              <div className="p-3 lg:p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs lg:text-sm font-medium flex items-center justify-center lg:justify-start gap-2 lg:gap-3">
                <span className="material-symbols-outlined text-[18px] lg:text-[20px]">error</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-[48px] lg:h-[56px] w-full bg-stone-900 hover:bg-stone-800 active:bg-black text-white rounded-xl font-medium text-[14px] lg:text-[15px] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center mt-1 lg:mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-[18px] lg:text-[20px]">progress_activity</span>
                  Verifying Credentials...
                </span>
              ) : (
                'Login to Admin Panel'
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 lg:mt-8">
            <div className="rounded-2xl bg-stone-50 p-4 lg:p-5 border border-stone-100 flex items-start gap-3 lg:gap-4">
              <span className="material-symbols-outlined text-stone-400 text-[20px] lg:text-[24px]">shield_lock</span>
              <div>
                <p className="text-xs lg:text-sm font-semibold text-stone-800 mb-0.5 lg:mb-1">High Security Area</p>
                <p className="text-[10px] lg:text-xs text-stone-500 leading-relaxed">
                  This portal contains sensitive configurations. All administrative sessions are logged and monitored.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
