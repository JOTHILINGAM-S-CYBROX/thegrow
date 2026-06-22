'use client';

import { useState, useEffect } from 'react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    foodOrderingEnabled: true,
    membershipEnabled: true,
    tableBookingEnabled: true,
    eventBookingEnabled: true,
  });
  const [initialSettings, setInitialSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch settings
  const fetchSettings = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
          setInitialSettings(data.settings);
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to retrieve current settings.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error fetching settings.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle Toggle
  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Save Settings
  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
        setInitialSettings(settings); // Sync diagnostics after save
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error saving settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-8 min-h-screen">
      
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-serif italic text-stone-800 mb-2 font-bold text-[#064e3b]">System Configuration</h2>
        <p className="text-stone-500 font-body text-sm">
          Toggle restaurant systems and features on/off instantly. Changes will reflect globally for all users.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-16 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-emerald-800 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-stone-500 text-sm font-label">Retrieving system settings...</p>
        </div>
      ) : (
        <div className="max-w-3xl space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-stone-200/60 overflow-hidden divide-y divide-stone-100">
            
            {/* Toggle Item 1: Food Ordering */}
            <div className="p-8 flex items-center justify-between gap-6 hover:bg-stone-50/40 transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-800">restaurant_menu</span>
                  <h3 className="font-serif italic font-bold text-lg text-stone-850">Food Ordering System</h3>
                </div>
                <p className="text-xs text-stone-500 max-w-lg font-body leading-relaxed">
                  Controls the visibility of the "Menu" page in the navigation bars and blocks ordering access. When disabled, customers will see a neat "Temporarily Offline" message.
                </p>
              </div>
              <div>
                <button
                  onClick={() => handleToggle('foodOrderingEnabled')}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                    settings.foodOrderingEnabled ? 'bg-emerald-800' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      settings.foodOrderingEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Toggle Item 2: Membership System */}
            <div className="p-8 flex items-center justify-between gap-6 hover:bg-stone-50/40 transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-800">card_membership</span>
                  <h3 className="font-serif italic font-bold text-lg text-stone-850">Membership System</h3>
                </div>
                <p className="text-xs text-stone-500 max-w-lg font-body leading-relaxed">
                  Enables or disables new customer registrations for memberships. Disabling this hides the "Memberships" tab and blocks checkout features for memberships.
                </p>
              </div>
              <div>
                <button
                  onClick={() => handleToggle('membershipEnabled')}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                    settings.membershipEnabled ? 'bg-emerald-800' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      settings.membershipEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Toggle Item 3: Table Booking */}
            <div className="p-8 flex items-center justify-between gap-6 hover:bg-stone-50/40 transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-800">table_restaurant</span>
                  <h3 className="font-serif italic font-bold text-lg text-stone-850">Table Booking System</h3>
                </div>
                <p className="text-xs text-stone-500 max-w-lg font-body leading-relaxed">
                  Controls the ability for customers to reserve tables for dine-in. Disabling this hides the table reservation flow.
                </p>
              </div>
              <div>
                <button
                  onClick={() => handleToggle('tableBookingEnabled')}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                    settings.tableBookingEnabled ? 'bg-emerald-800' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      settings.tableBookingEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Toggle Item 4: Events Booking */}
            <div className="p-8 flex items-center justify-between gap-6 hover:bg-stone-50/40 transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-800">celebration</span>
                  <h3 className="font-serif italic font-bold text-lg text-stone-850">Events Booking System</h3>
                </div>
                <p className="text-xs text-stone-500 max-w-lg font-body leading-relaxed">
                  Controls the ability for customers to book venues for private events. Disabling this hides the venue booking options.
                </p>
              </div>
              <div>
                <button
                  onClick={() => handleToggle('eventBookingEnabled')}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                    settings.eventBookingEnabled ? 'bg-emerald-800' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      settings.eventBookingEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

          </div>

          {/* Alert Messages */}
          {message.text && (
            <div className={`p-4 rounded-lg text-sm flex gap-3 items-center border ${
              message.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-850' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <span className="material-symbols-outlined text-lg">
                {message.type === 'success' ? 'check_circle' : 'warning'}
              </span>
              <span className="font-body">{message.text}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={fetchSettings}
              disabled={saving}
              className="px-8 py-4 border border-outline text-on-surface-variant hover:bg-surface-variant rounded-full text-xs font-label uppercase tracking-[0.2em] transition-colors font-semibold shadow-sm"
            >
              Reset Changes
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-10 py-4 bg-primary hover:bg-emerald-900 text-on-primary rounded-full text-xs font-label uppercase tracking-[0.2em] font-bold transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-3"
            >
              <span className={`material-symbols-outlined text-lg ${saving ? 'animate-spin' : ''}`}>{saving ? 'sync' : 'save'}</span>
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>

          {/* Diagnostics Section */}
          {initialSettings && (
            <div className="mt-12 bg-stone-50 border border-stone-200 rounded-xl p-8">
              <h3 className="font-serif italic text-xl text-stone-800 mb-6 font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-stone-400">memory</span>
                Architecture Diagnostics
              </h3>
              <p className="text-xs text-stone-500 mb-6 font-body">Real-time status of the feature toggle pipeline.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'foodOrderingEnabled', label: 'Food Ordering System' },
                  { key: 'membershipEnabled', label: 'Membership System' },
                  { key: 'tableBookingEnabled', label: 'Table Booking System' },
                  { key: 'eventBookingEnabled', label: 'Events Booking System' }
                ].map(sys => (
                  <div key={sys.key} className="bg-white p-4 rounded-lg border border-stone-100 shadow-sm text-sm">
                    <div className="font-bold text-stone-700 mb-4">{sys.label}</div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">database</span>
                          Database Persistence
                        </span>
                        <span className={initialSettings[sys.key] ? 'text-emerald-600 font-bold' : 'text-stone-400'}>
                          {initialSettings[sys.key] ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs border-t border-stone-50 pt-2">
                        <span className="text-stone-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">api</span>
                          API Response
                        </span>
                        <span className={initialSettings[sys.key] ? 'text-emerald-600 font-bold' : 'text-stone-400'}>
                          {initialSettings[sys.key] ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs border-t border-stone-50 pt-2">
                        <span className="text-stone-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">web</span>
                          Frontend UI State
                        </span>
                        <span className={settings[sys.key] ? 'text-emerald-600 font-bold' : 'text-stone-400'}>
                          {settings[sys.key] ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
