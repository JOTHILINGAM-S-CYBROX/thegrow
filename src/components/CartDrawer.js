"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, removeFromCart, updateQuantity, getTotal, getItemCount, clearCart } = useCart();

  const itemCount = getItemCount();
  const total = getTotal();

  if (itemCount === 0) {
    return (
      <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[95%] max-w-lg">
        <div className="bg-primary shadow-2xl rounded-3xl px-4 py-3 sm:px-6 sm:py-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-on-primary opacity-50 cursor-not-allowed">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <span className={`text-xl sm:text-2xl material-symbols-outlined ${styles.materialSymbolsOutlined}`}>
                shopping_cart
              </span>
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold opacity-70">Order Summary</p>
              <p className="font-serif italic text-base sm:text-lg leading-none">₹0.00</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold opacity-70">Add Items</p>
              <p className="text-[10px] sm:text-xs">to Checkout</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating Cart Button */}
      <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[95%] max-w-lg">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-primary shadow-2xl rounded-3xl px-4 py-3 sm:px-6 sm:py-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-on-primary hover:shadow-3xl transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <span className={`text-xl sm:text-2xl material-symbols-outlined ${styles.materialSymbolsOutlined}`}>
                shopping_cart
              </span>
              <span className="absolute -top-2 -right-2 bg-tertiary-fixed text-on-tertiary text-[9px] sm:text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            </div>
            <div className="text-left">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold opacity-70">Order Summary</p>
              <p className="font-serif italic text-base sm:text-lg leading-none">₹{total.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="text-right">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold opacity-70">Items Ready</p>
              <p className="text-[10px] sm:text-xs">Est. 25-30 mins</p>
            </div>
            <span className="text-lg sm:text-xl material-symbols-outlined shrink-0">chevron_right</span>
          </div>
        </button>
      </div>

      {/* Cart Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[70] transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Cart Drawer */}
      <div
        className={`fixed right-0 top-0 h-[100dvh] w-full max-w-lg bg-surface z-[70] transition-transform duration-300 transform ${
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

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="flex gap-4 pb-4 border-b border-outline-variant/10"
            >
              {/* Item Image */}
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}

              {/* Item Details */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-serif italic text-primary">{item.name}</h3>
                    <p className="text-sm text-on-surface-variant">₹{item.price}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-1 hover:bg-error/10 rounded transition-colors"
                  >
                    <span className="text-lg material-symbols-outlined text-error">delete</span>
                  </button>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 bg-surface-container rounded-full w-fit px-2 py-1">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="p-1 hover:bg-surface-container-high rounded transition-colors"
                    disabled={item.quantity <= 1}
                  >
                    <span className="text-lg material-symbols-outlined">remove</span>
                  </button>
                  <span className="w-6 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="p-1 hover:bg-surface-container-high rounded transition-colors"
                  >
                    <span className="text-lg material-symbols-outlined">add</span>
                  </button>
                </div>

                {/* Item Total */}
                <p className="text-sm font-semibold text-primary mt-2">
                  Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer with Total & Checkout */}
        <div className="sticky bottom-0 bg-surface border-t border-outline-variant/20 p-6 space-y-4">
          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-outline-variant/20" />
          </div>

          {/* Total */}
          <div className="flex justify-between items-baseline">
            <p className="text-on-surface-variant font-label text-sm uppercase tracking-widest">
              Total Items
            </p>
            <p className="text-2xl font-serif italic text-primary">{itemCount}</p>
          </div>

          <div className="flex justify-between items-baseline">
            <p className="text-on-surface-variant font-label text-sm uppercase tracking-widest">
              Total Price
            </p>
            <p className="text-2xl font-serif italic text-primary">₹{total.toFixed(2)}</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                clearCart();
                setIsOpen(false);
              }}
              className="flex-1 px-4 py-3 bg-surface-container rounded-full font-label text-sm uppercase tracking-widest hover:bg-surface-container-high transition-colors"
            >
              Clear Cart
            </button>
            <Link
              href="/sms-auth-checkout"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-3 bg-primary text-on-primary rounded-full font-label text-sm uppercase tracking-widest font-bold hover:opacity-90 transition-opacity text-center"
            >
              Proceed to Checkout →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
