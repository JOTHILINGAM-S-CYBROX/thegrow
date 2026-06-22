"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './useAuth';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  /**
   * Generate user-specific localStorage key
   * If not authenticated, use a temporary session key
   */
  const getCartKey = () => {
    if (isAuthenticated && user?.phone) {
      return `grove_cart_${user.phone}`;
    }
    return 'grove_cart_guest_session';
  };

  // Load cart from localStorage on mount and when user changes
  useEffect(() => {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
        setItems([]);
      }
    }
    setLoading(false);
  }, [isAuthenticated, user?.phone]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      const cartKey = getCartKey();
      localStorage.setItem(cartKey, JSON.stringify(items));
    }
  }, [items, loading, isAuthenticated, user?.phone]);

  // Add item to cart or increase quantity
  const addToCart = (item) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i._id === item._id);
      
      if (existingItem) {
        // Item already in cart, increase quantity
        return prevItems.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        // New item, add to cart
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setItems((prevItems) => prevItems.filter((i) => i._id !== itemId));
  };

  // Update quantity of item
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setItems((prevItems) =>
        prevItems.map((i) =>
          i._id === itemId ? { ...i, quantity } : i
        )
      );
    }
  };

  // Clear entire cart
  const clearCart = () => {
    setItems([]);
  };

  // Get total price
  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Get item count
  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
    loading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
