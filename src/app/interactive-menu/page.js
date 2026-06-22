"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useMenu } from '@/hooks/useMenu';
import { useCart } from '@/hooks/useCart';
import CartDrawer from '@/components/CartDrawer';
import styles from './page.module.css';

export default function Page() {
  const [settings, setSettings] = useState({ foodOrderingEnabled: true, loading: true });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.settings) {
            setSettings({
              foodOrderingEnabled: data.settings.foodOrderingEnabled,
              loading: false
            });
            return;
          }
        }
      } catch (e) {
        console.error(e);
      }
      setSettings(prev => ({ ...prev, loading: false }));
    };
    fetchSettings();
  }, []);

  const [page, setPage] = useState(1);
  const [quantities, setQuantities] = useState({});
  const [showAddedMessage, setShowAddedMessage] = useState(null);
  const [subCategory, setSubCategory] = useState(null);
  const { items, loading, pagination } = useMenu(page, 100, subCategory);
  const { addToCart } = useCart();

  if (!settings.loading && !settings.foodOrderingEnabled) {
    return (
      <div className="min-h-screen bg-[#fdf9ee] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-full md:max-w-md bg-stone-50/90 backdrop-blur-xl p-12 rounded-3xl border border-stone-200 shadow-xl space-y-6">
          <span className="material-symbols-outlined text-emerald-800 text-6xl">restaurant_menu</span>
          <h2 className="text-3xl font-serif italic text-emerald-900">Menu Temporarily Offline</h2>
          <p className="text-stone-600 font-body text-sm leading-relaxed">
            Our kitchen ordering system is currently offline for maintenance or private events. Please visit us again later or check with staff.
          </p>
          <a href="/" className="inline-block bg-emerald-800 text-white px-8 py-3 rounded-full font-label text-xs uppercase tracking-widest hover:bg-emerald-900 transition-colors">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  const handleSubCategoryChange = (newSubCategory) => {
    setSubCategory(newSubCategory === subCategory ? null : newSubCategory);
    setPage(1);
  };

  const updateQuantity = (id, change) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      const next = current + change;
      if (next < 1) return prev;
      return { ...prev, [id]: next };
    });
  };

  const getQuantity = (id) => quantities[id] || 1;

  const handleAddToCart = (item) => {
    addToCart(item);
    setShowAddedMessage(item._id);
    setTimeout(() => setShowAddedMessage(null), 2000);
  };

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      <main className="pt-32 pb-24">
        <header className="px-4 md:px-8 max-w-screen-2xl mx-auto mb-16 md:mb-20 text-center">
          <span className="text-on-tertiary-container font-label uppercase tracking-[0.2em] text-xs font-semibold mb-4 block">A Culinary Journey</span>
          <h1 className="text-[clamp(2rem,7vw,5rem)] font-serif italic text-primary leading-tight mb-4 md:mb-6">Interactive Menu</h1>
          <p className="w-full md:max-w-2xl mx-auto text-on-surface-variant font-body leading-relaxed text-[clamp(1rem,2vw,1.25rem)]">From the heart of the coconut grove, we bring you flavors that dance between the shadows of the forest and the warmth of the coastal sun.</p>
        </header>

        <section className="sticky top-[88px] z-40 bg-surface/90 backdrop-blur-md py-4 border-y border-outline-variant/15 mb-16 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="w-full md:max-w-4xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar w-full">
              <button 
                onClick={() => handleSubCategoryChange(null)}
                className={`whitespace-nowrap font-serif italic text-xl pb-1 border-b-2 transition-colors ${
                  subCategory === null
                    ? 'text-primary border-primary'
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                All Dishes
              </button>
              <button 
                onClick={() => handleSubCategoryChange('Signature')}
                className={`whitespace-nowrap font-serif italic text-xl pb-1 border-b-2 transition-colors ${
                  subCategory === 'Signature'
                    ? 'text-primary border-primary'
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                Signature
              </button>
              <button 
                onClick={() => handleSubCategoryChange('Continental')}
                className={`whitespace-nowrap font-serif italic text-xl pb-1 border-b-2 transition-colors ${
                  subCategory === 'Continental'
                    ? 'text-primary border-primary'
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                Continental
              </button>
              <button 
                onClick={() => handleSubCategoryChange('Asian')}
                className={`whitespace-nowrap font-serif italic text-xl pb-1 border-b-2 transition-colors ${
                  subCategory === 'Asian'
                    ? 'text-primary border-primary'
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                Asian
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <CartDrawer />
            </div>
          </div>
        </section>

        <section className="px-4 md:px-8 max-w-4xl mx-auto">
          {loading && <div className="text-center py-12 text-stone-500">Loading menu items...</div>}
          <div className="flex flex-col gap-6 w-full">
            {items.map((item) => (
              <div key={item._id} className="flex flex-col md:flex-row items-stretch gap-4 md:gap-6 bg-surface-container-low p-4 md:p-5 rounded-2xl hover:bg-surface-container transition-all group shadow-sm border border-outline-variant/10 w-full max-w-full box-border">
                
                {/* Image */}
                {item.imageUrl && (
                  <div className="w-full md:w-48 aspect-[4/3] md:aspect-auto md:h-auto flex-shrink-0 overflow-hidden rounded-xl relative">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-grow flex flex-col justify-between w-full py-1">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl md:text-2xl font-serif italic text-primary leading-tight">{item.name}</h3>
                      <div className="flex gap-1 items-center shrink-0">
                        {item.isVeg ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-green-600 bg-green-50 shrink-0">
                            <span className="w-2 h-2 rounded-full bg-green-600"></span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-red-600 bg-red-50 shrink-0">
                            <span className="w-1.5 h-3 border-r-2 border-b-2 border-red-600 rotate-45"></span>
                          </span>
                        )}
                        {item.isSpicy && (
                          <span className="text-sm">🌶️</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-body text-on-surface-variant leading-relaxed mb-3">{item.description}</p>
                    <span className="block text-lg font-label font-semibold text-tertiary mb-4">₹{item.price}</span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-auto border-t border-outline-variant/20 pt-4 gap-4 w-full">
                    <div className="flex items-center justify-between w-full sm:w-auto bg-surface rounded-full px-4 sm:px-2 py-2 sm:py-1 shadow-sm border border-outline-variant/30 min-h-[48px]">
                      <button onClick={() => updateQuantity(item._id, -1)} className="w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors material-symbols-outlined text-sm">remove</button>
                      <span className="font-label text-base sm:text-sm w-8 sm:w-4 text-center">{getQuantity(item._id)}</span>
                      <button onClick={() => updateQuantity(item._id, 1)} className="w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors material-symbols-outlined text-sm">add</button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                      {showAddedMessage === item._id && (
                        <span className="text-green-600 font-label text-sm flex items-center gap-1 w-full justify-center sm:w-auto">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Added to Cart
                        </span>
                      )}
                      <button onClick={() => handleAddToCart(item)} className="w-full sm:w-auto bg-primary text-on-primary px-6 py-3 rounded-full font-label text-sm uppercase tracking-widest hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 min-h-[52px]">
                         <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                         Add to Cart
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="w-full mt-24 bg-emerald-950 dark:bg-stone-950">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-12 py-20 max-w-screen-2xl mx-auto">
          <div className="md:col-span-2">
            <span className="text-xl font-serif text-stone-50 mb-4 block">The Grove</span>
            <p className="text-stone-400 font-body mb-8 max-w-sm">Dine amidst nature, where every meal is a celebration of the senses. Join us under the canopy of Tiruppur's finest coconut grove.</p>
            <Link href="/reservations" className="bg-tertiary-fixed text-on-tertiary px-8 py-3 rounded-full font-label text-sm uppercase tracking-widest hover:opacity-90 transition-opacity">
              Book a Table
            </Link>
          </div>
          <div>
            <span className="font-sans text-sm tracking-widest uppercase text-stone-100 mb-6 block">Explore</span>
            <nav className="flex flex-col space-y-4">
              <Link className="text-stone-400 hover:text-stone-200 font-label text-sm uppercase tracking-widest transition-colors hover:underline decoration-stone-500 underline-offset-4" href="#">Contact</Link>
              <Link className="text-stone-400 hover:text-stone-200 font-label text-sm uppercase tracking-widest transition-colors hover:underline decoration-stone-500 underline-offset-4" href="#">Address</Link>
              <Link className="text-stone-400 hover:text-stone-200 font-label text-sm uppercase tracking-widest transition-colors hover:underline decoration-stone-500 underline-offset-4" href="#">Socials</Link>
              <Link className="text-stone-400 hover:text-stone-200 font-label text-sm uppercase tracking-widest transition-colors hover:underline decoration-stone-500 underline-offset-4" href="#">Opening Hours</Link>
            </nav>
          </div>
          <div>
            <span className="font-sans text-sm tracking-widest uppercase text-stone-100 mb-6 block">Legal</span>
            <p className="text-stone-400 font-body text-sm leading-relaxed mb-4">Tiruppur District,<br />Tamil Nadu, India</p>
            <div className="text-stone-500 font-body text-xs mt-12">© 2024 The Grove, Tiruppur. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
