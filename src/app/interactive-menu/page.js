"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useMenu } from '@/hooks/useMenu';
import { useCart } from '@/hooks/useCart';
import CartDrawer from '@/components/CartDrawer';
import styles from './page.module.css';

export default function Page() {
  const [settings, setSettings] = useState({ foodOrderingEnabled: true, loading: true });
  const [headerHeight, setHeaderHeight] = useState(88); // Default fallback
  const [tabsHeight, setTabsHeight] = useState(60); // Default fallback

  useEffect(() => {
    const updateHeights = () => {
      const nav = document.querySelector('nav');
      if (nav) {
        setHeaderHeight(nav.offsetHeight);
      }
      const tabs = document.getElementById('category-tabs');
      if (tabs) {
        setTabsHeight(tabs.offsetHeight);
      }
    };
    
    updateHeights();
    window.addEventListener('resize', updateHeights);
    return () => window.removeEventListener('resize', updateHeights);
  }, []);

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
  const [menuType, setMenuType] = useState('FOOD');
  const { items, loading, pagination } = useMenu(page, 100, subCategory, menuType);
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

  const handleMenuTypeChange = (type) => {
    setMenuType(type);
    setSubCategory(null);
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

        <section 
          id="category-tabs"
          className="sticky z-[950] bg-surface/95 backdrop-blur-md py-4 border-y border-outline-variant/15 shadow-sm"
          style={{ top: `${headerHeight}px` }}
        >
          <div className="w-full max-w-screen-xl mx-auto px-4 md:px-8">
            
            {/* Top Level Menu Toggle */}
            <div className="flex justify-center mb-6">
              <div className="bg-surface-container-low p-1 rounded-full inline-flex shadow-inner border border-outline-variant/20">
                <button
                  onClick={() => handleMenuTypeChange('FOOD')}
                  className={`px-8 py-3 rounded-full font-label text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 ${
                    menuType === 'FOOD' 
                      ? 'bg-primary text-on-primary shadow-md font-bold' 
                      : 'text-on-surface-variant hover:text-primary font-semibold'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">restaurant</span>
                  Restaurant Menu
                </button>
                <button
                  onClick={() => handleMenuTypeChange('BAR')}
                  className={`px-8 py-3 rounded-full font-label text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 ${
                    menuType === 'BAR' 
                      ? 'bg-primary text-on-primary shadow-md font-bold' 
                      : 'text-on-surface-variant hover:text-primary font-semibold'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">local_bar</span>
                  Bar Menu
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar w-full">
              <button 
                onClick={() => handleSubCategoryChange(null)}
                className={`whitespace-nowrap font-serif italic text-xl pb-1 border-b-2 transition-colors ${
                  subCategory === null
                    ? 'text-primary border-primary'
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                {menuType === 'FOOD' ? 'All Dishes' : 'All Drinks'}
              </button>

              {menuType === 'FOOD' && (
                <>
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
                </>
              )}

              {menuType === 'BAR' && (
                <>
                  <button 
                    onClick={() => handleSubCategoryChange('Beer')}
                    className={`whitespace-nowrap font-serif italic text-xl pb-1 border-b-2 transition-colors ${
                      subCategory === 'Beer'
                        ? 'text-primary border-primary'
                        : 'text-on-surface-variant border-transparent hover:text-primary'
                    }`}
                  >
                    Beer
                  </button>
                  <button 
                    onClick={() => handleSubCategoryChange('Wine')}
                    className={`whitespace-nowrap font-serif italic text-xl pb-1 border-b-2 transition-colors ${
                      subCategory === 'Wine'
                        ? 'text-primary border-primary'
                        : 'text-on-surface-variant border-transparent hover:text-primary'
                    }`}
                  >
                    Wine
                  </button>
                  <button 
                    onClick={() => handleSubCategoryChange('Cocktails')}
                    className={`whitespace-nowrap font-serif italic text-xl pb-1 border-b-2 transition-colors ${
                      subCategory === 'Cocktails'
                        ? 'text-primary border-primary'
                        : 'text-on-surface-variant border-transparent hover:text-primary'
                    }`}
                  >
                    Cocktails
                  </button>
                  <button 
                    onClick={() => handleSubCategoryChange('Spirits')}
                    className={`whitespace-nowrap font-serif italic text-xl pb-1 border-b-2 transition-colors ${
                      subCategory === 'Spirits'
                        ? 'text-primary border-primary'
                        : 'text-on-surface-variant border-transparent hover:text-primary'
                    }`}
                  >
                    Spirits
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Desktop Sticky Cart */}
        <section 
          className="hidden md:block sticky z-[900] bg-surface/90 backdrop-blur-md py-3 shadow-[0_10px_20px_rgba(0,0,0,0.03)] border-b border-outline-variant/10 mb-8 transition-all"
          style={{ top: `${headerHeight + tabsHeight}px` }}
        >
          <div className="w-full max-w-screen-xl mx-auto px-4 md:px-8">
            <CartDrawer mode="desktop" />
          </div>
        </section>

        {/* Mobile Sticky Cart */}
        <div className="md:hidden">
          <CartDrawer mode="mobile" />
        </div>

        <section className="px-4 md:px-8 max-w-4xl mx-auto mt-8 md:mt-12">
          {loading && <div className="text-center py-12 text-stone-500">Loading menu items...</div>}
          <div className="flex flex-col gap-6 w-full">
            {items.map((item) => (
              <div key={item._id} className="flex flex-col items-stretch gap-3 bg-surface-container-low p-4 md:p-6 rounded-2xl hover:bg-surface-container transition-all duration-300 group shadow-sm hover:shadow-md border border-outline-variant/15 w-full max-w-full box-border relative overflow-hidden">
                
                {/* Decorative Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>

                {/* Content */}
                <div className="flex-grow flex flex-col justify-between w-full z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl md:text-2xl font-serif italic text-primary leading-tight tracking-wide">{item.name}</h3>
                      <div className="flex gap-2 items-center shrink-0">
                        {item.isVeg ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-green-600 bg-green-50 shrink-0" title="Vegetarian">
                            <span className="w-2 h-2 rounded-full bg-green-600"></span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-red-600 bg-red-50 shrink-0" title="Non-Vegetarian">
                            <span className="w-1.5 h-3 border-r-2 border-b-2 border-red-600 rotate-45"></span>
                          </span>
                        )}
                        {item.isSpicy && (
                          <span className="text-sm" title="Spicy">🌶️</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-body text-on-surface-variant leading-relaxed mb-3 max-w-2xl">{item.description}</p>
                    <span className="block text-lg font-label font-bold text-tertiary mb-4">₹{item.price}</span>
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
