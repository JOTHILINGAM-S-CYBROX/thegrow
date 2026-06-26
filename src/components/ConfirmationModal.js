"use client";

import React, { useEffect } from 'react';

export default function ConfirmationModal({ 
  isOpen, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed? This action cannot be undone.", 
  confirmText = "Delete", 
  cancelText = "Cancel", 
  onConfirm, 
  onCancel,
  isDestructive = true
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
            <span className="material-symbols-outlined text-[24px]">
              {isDestructive ? 'warning' : 'help'}
            </span>
          </div>
          
          <h3 className="text-xl font-serif italic text-on-surface mb-2">
            {title}
          </h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {message}
          </p>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-surface-container-lowest border-t border-outline-variant/10">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl font-label text-sm uppercase tracking-widest text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl font-label text-sm uppercase tracking-widest font-bold transition-colors shadow-sm ${
              isDestructive 
                ? 'bg-error text-white hover:bg-error/90 shadow-error/20' 
                : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
