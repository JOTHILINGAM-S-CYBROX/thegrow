"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const StatusPillContext = createContext({
  showPill: () => {},
});

export const useStatusPill = () => useContext(StatusPillContext);

export function StatusPillProvider({ children }) {
  const [pill, setPill] = useState(null);

  const showPill = useCallback((message, type = 'success') => {
    const id = Date.now();
    setPill({ id, message, type });

    setTimeout(() => {
      setPill((current) => (current?.id === id ? null : current));
    }, 2000);
  }, []);

  return (
    <StatusPillContext.Provider value={{ showPill }}>
      {children}
      {pill && <StatusPill message={pill.message} type={pill.type} />}
    </StatusPillContext.Provider>
  );
}

function StatusPill({ message, type }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const getStyle = () => {
    switch (type) {
      case 'error':
        return 'bg-red-800 text-white';
      case 'info':
        return 'bg-blue-800 text-white';
      case 'success':
      default:
        return 'bg-emerald-800 text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      case 'success':
      default:
        return 'check_circle';
    }
  };

  return (
    <div className="fixed z-[9999] bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:-translate-x-0 md:right-6 md:bottom-6 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none">
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border border-white/10 backdrop-blur-md ${getStyle()}`}>
        <span className="material-symbols-outlined text-[18px] shrink-0 opacity-90">{getIcon()}</span>
        <span className="text-[13px] font-semibold tracking-wide whitespace-nowrap">{message}</span>
      </div>
    </div>
  );
}
