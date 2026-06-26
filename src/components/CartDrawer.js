"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import styles from './CartDrawer.module.css';

export default function CartDrawer({ mode = 'mobile' }) {
  const [isOpen, setIsOpen] = useState(false);
  const { items, removeFromCart, updateQuantity, getTotal, getItemCount, clearCart } = useCart();

  const itemCount = getItemCount();
  const total = getTotal();

  const isDesktop = mode === 'desktop';

  if (itemCount === 0) {
    if (isDesktop) {
      return (
        <div className="w-full flex items-center justify-between px-2 py-1 opacity-80 select-none">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <span className="text-xl material-symbols-outlined opacity-60">shopping_bag</span>
            <p className="text-sm font-medium tracking-wide">
              Cart (0) <span className="opacity-30 mx-2">|</span> <span className="font-serif italic text-on-surface-variant">Add dishes to begin your order</span>
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-fit">
        <div className="bg-surface border border-outline-variant/30 shadow-lg rounded-full px-5 py-3 sm:px-6 sm:py-3.5 flex items-center gap-3 text-on-surface opacity-90 select-none backdrop-blur-md bg-opacity-95">
          <span className="text-lg sm:text-xl material-symbols-outlined opacity-60">
            shopping_bag
          </span>
          <p className="text-xs sm:text-sm font-medium tracking-wide">
            Cart (0) <span className="opacity-30 mx-2">|</span> <span className="font-serif italic text-on-surface-variant">Add dishes to begin your order</span>
          </p>
        </div>
      </div>
    );
  }

  const DesktopCartButton = () => (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-primary shadow-sm rounded-full px-5 py-3 flex flex-row items-center justify-between text-on-primary hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 group border border-primary-container/20"
      >
        <div className="flex items-center gap-4">
          <div className="bg-on-primary/10 w-12 h-12 rounded-full flex flex-col items-center justify-center font-semibold text-sm border border-on-primary/10 tracking-wide leading-tight">
            <span className="text-xs opacity-80">{itemCount}</span>
            <span className="text-[9px] uppercase opacity-60">{itemCount === 1 ? 'Item' : 'Items'}</span>
          </div>
          <div className="text-left flex flex-col justify-center">
            <span className="font-serif italic text-xl font-medium leading-none mb-1">₹{total.toFixed(2)}</span>
            <span className="text-[10px] uppercase tracking-widest opacity-60">Plus Taxes</span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-on-primary text-primary px-5 py-2.5 rounded-full font-label text-sm uppercase tracking-wider font-bold group-hover:opacity-90 transition-opacity">
          Review Order
          <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">east</span>
        </div>
      </button>
    </div>
  );

  const MobileCartButton = () => (
    <div className="fixed bottom-0 left-0 w-full z-[60] px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
      <button
        onClick={() => setIsOpen(true)}
        className="w-full max-w-lg mx-auto bg-primary shadow-sm rounded-[16px] flex items-center justify-between text-on-primary transition-all duration-300 border border-primary-container/10"
        style={{ padding: '10px 16px', gap: '12px', minHeight: '56px', maxHeight: '64px' }}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="bg-on-primary/10 w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[14px] font-bold border border-on-primary/10">
            {itemCount}
          </div>
          <div className="text-left flex flex-col justify-center">
            <span className="text-[11px] sm:text-[12px] leading-tight opacity-90 font-medium mb-[3px]">
              {itemCount === 1 ? '1 Item' : `${itemCount} Items`}
            </span>
            <span className="text-[16px] sm:text-[18px] font-bold leading-none tracking-tight">
              ₹{total.toFixed(2)}
            </span>
          </div>
        </div>
        <div 
          className="flex items-center justify-center gap-1.5 bg-on-primary text-primary h-[44px] px-4 rounded-[12px] font-bold text-[14px] sm:text-[15px] whitespace-nowrap shrink-0 overflow-hidden"
          style={{ maxWidth: '50%' }}
        >
          <span className="truncate">Review Order</span>
          <span className="material-symbols-outlined text-[16px] shrink-0">east</span>
        </div>
      </button>
    </div>
  );

  return (
    <>
      {/* Floating Cart Button */}
      {isDesktop ? <DesktopCartButton /> : <MobileCartButton />}

      {/* Cart Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[1000] transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Cart Drawer */}
      <div
        className={`fixed right-0 top-0 h-[100dvh] w-full max-w-lg bg-surface z-[1010] transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-outline-variant/20 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-serif italic text-primary">Your Cart</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-surface-container rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Cart Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 flex flex-col">
          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex gap-3 sm:gap-4 pb-4 border-b border-outline-variant/10"
              >
                {/* Item Image */}
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg shrink-0"
                  />
                )}

                {/* Item Details */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="mb-3">
                    <h3 className="font-serif italic text-primary text-base sm:text-lg leading-tight truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm font-medium text-on-surface mt-0.5">₹{item.price}</p>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    {/* Quantity Controls */}
                    <div className="flex items-center bg-surface-container rounded-[10px] border border-outline-variant/20 overflow-hidden h-[44px]">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-[40px] sm:w-[44px] h-full hover:bg-surface-container-high transition-colors flex items-center justify-center text-primary"
                        disabled={item.quantity <= 1}
                      >
                        <span className="text-[20px] material-symbols-outlined">remove</span>
                      </button>
                      <span className="w-8 text-center font-bold text-[14px] sm:text-[15px] bg-surface h-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-[40px] sm:w-[44px] h-full hover:bg-surface-container-high transition-colors flex items-center justify-center text-primary"
                      >
                        <span className="text-[20px] material-symbols-outlined">add</span>
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-[11px] sm:text-xs font-semibold text-error/80 hover:text-error uppercase tracking-wider px-2 py-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Section directly after items */}
          <div className="mt-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-4 space-y-3 mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant uppercase tracking-wider font-semibold text-[11px]">Total Items</span>
              <span className="font-bold">{itemCount}</span>
            </div>
            <div className="h-px bg-outline-variant/10 w-full" />
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant uppercase tracking-wider font-semibold text-[11px]">Total Price</span>
              <span className="text-lg font-serif italic text-primary font-bold">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Sticky Footer Action Area */}
        <div className="sticky bottom-0 bg-surface border-t border-outline-variant/10 px-4 pt-3 pb-6 sm:px-6 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-10">
          <div className="grid gap-3 grid-cols-[80px_1fr] sm:grid-cols-[1fr_2fr]">
            <button
              onClick={() => {
                clearCart();
                setIsOpen(false);
              }}
              className="flex items-center justify-center w-full h-[52px] border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container hover:text-error hover:border-error/30 rounded-[12px] text-[12px] sm:text-[13px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap px-1 sm:px-2"
            >
              <span className="sm:hidden">Clear</span>
              <span className="hidden sm:inline">Clear Cart</span>
            </button>
            <Link
              href="/sms-auth-checkout"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center w-full h-[52px] bg-emerald-800 text-white rounded-[12px] font-bold text-[14px] sm:text-[15px] tracking-wide hover:bg-emerald-900 transition-colors whitespace-nowrap shadow-sm px-2 sm:px-3"
            >
              <span>Proceed to Checkout</span>
              <span className="material-symbols-outlined ml-1.5 shrink-0 text-[18px]">east</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
