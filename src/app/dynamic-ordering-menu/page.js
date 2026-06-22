
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
  const { items, loading } = useMenu(page, 100);
  const { addToCart } = useCart();
  const [showAddedMessage, setShowAddedMessage] = useState(null);

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

  const handleAddToCart = (item) => {
    addToCart(item);
    setShowAddedMessage(item._id);
    setTimeout(() => setShowAddedMessage(null), 2000);
  };

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      


<main className="pt-32 pb-40">

<header className="px-4 md:px-8 max-w-screen-2xl mx-auto mb-16 text-center">
<div className="inline-flex items-center space-x-2 mb-4 bg-tertiary-container/10 px-4 py-1.5 rounded-full">
<span className={`  text-sm text-on-tertiary-container  material-symbols-outlined ${styles.materialSymbolsOutlined}`}>shopping_bag</span>
<span className="text-on-tertiary-container font-label uppercase tracking-[0.2em] text-[10px] font-bold">Parcel &amp; Pickup Only</span>
</div>
<h1 className="text-[clamp(2.5rem,8vw,5rem)] font-serif italic text-primary leading-tight mb-6">Interactive Menu</h1>
<p className="w-full md:max-w-2xl mx-auto text-on-surface-variant font-body leading-relaxed">Artisanally crafted flavors, packaged with care for your collection. Experience the forest's bounty wherever you are.</p>
</header>

<section className="sticky top-[88px] z-40 bg-surface/90 backdrop-blur-md py-4 border-y border-outline-variant/15 mb-16">
<div className="w-full md:max-w-4xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
<div className="flex items-center space-x-8 overflow-x-auto no-scrollbar w-full md:w-auto">
<button className="whitespace-nowrap font-serif italic text-xl text-primary border-b-2 border-primary pb-1">Signature Dishes</button>
<button className="whitespace-nowrap font-serif italic text-xl text-on-surface-variant hover:text-primary transition-colors">Continental</button>
<button className="whitespace-nowrap font-serif italic text-xl text-on-surface-variant hover:text-primary transition-colors">Asian</button>
<button className="whitespace-nowrap font-serif italic text-xl text-on-surface-variant hover:text-primary transition-colors">Indian</button>
</div>
<div className="flex items-center space-x-4">
<button className="flex items-center space-x-2 px-4 py-2 bg-surface-container-low rounded-full text-sm font-label text-on-surface hover:bg-surface-container-high transition-colors">
<span className={`  text-sm  material-symbols-outlined ${styles.materialSymbolsOutlined}`}>filter_list</span>
<span>Filters</span>
</button>
<div className="h-4 w-[1px] bg-outline-variant/30"></div>
<label className="flex items-center space-x-2 cursor-pointer">
<div className="w-3 h-3 rounded-full border border-emerald-600 bg-emerald-100 flex items-center justify-center">
<div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
</div>
<span className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Veg Only</span>
</label>
</div>
</div>
</section>

<section className="px-4 md:px-8 max-w-screen-2xl mx-auto mb-24">
<div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
<div>
<h2 className="text-3xl font-serif text-primary italic mb-2">Menu Items</h2>
<p className="text-on-surface-variant font-label text-sm uppercase tracking-widest">Our curated selection • Parcel Only</p>
</div>
</div>

{loading ? (
  <div className="text-center py-12 text-stone-500">Loading menu items...</div>
) : items.length > 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
    {items.map((item) => (
      <div key={item._id} className="flex flex-col group">
        <div className="aspect-[4/5] overflow-hidden rounded-lg mb-6 relative shadow-sm group-hover:shadow-xl transition-all duration-500">
          {item.imageUrl && (
            <img alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={item.imageUrl}/>
          )}
          {/* Tags */}
          <div className="absolute top-3 right-3 flex gap-2">
            {item.isVeg ? (
              <div className="inline-flex items-center justify-center w-6 h-6 rounded border border-green-600 bg-green-50 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-green-600"></span>
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-6 h-6 rounded border border-red-600 bg-red-50 shadow-sm">
                <span className="w-1.5 h-3 border-r-2 border-b-2 border-red-600 rotate-45"></span>
              </div>
            )}
            {item.isSpicy && (
              <span className="text-lg">🌶️</span>
            )}
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 to-transparent">
            <button
              onClick={() => handleAddToCart(item)}
              className="w-full bg-white text-primary py-3 rounded-full font-label text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-tertiary-fixed transition-colors"
            >
              {showAddedMessage === item._id ? '✓ Added to Cart' : 'Add to Cart'}
            </button>
          </div>
        </div>
        <div className="flex justify-between items-baseline mb-3 px-1">
          <h3 className="text-xl font-serif italic text-primary">{item.name}</h3>
          <span className="text-sm font-label font-semibold text-tertiary">₹{item.price}</span>
        </div>
        <p className="text-sm font-body text-on-surface-variant leading-relaxed px-1">{item.description}</p>
      </div>
    ))}
  </div>
) : (
  <div className="text-center py-12 text-stone-500">No menu items available</div>
)}
</section>

<CartDrawer />

<footer className="w-full bg-emerald-950 dark:bg-stone-950">
<div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-12 py-20 max-w-screen-2xl mx-auto">
<div className="md:col-span-2">
<span className="text-xl font-serif text-stone-50 mb-4 block">The Grove</span>
<p className="text-stone-400 font-body mb-8 max-w-sm">A sanctuary for fine dining and takeaway perfection. Our 'Parcel Only' service ensures restaurant quality in the comfort of your home.</p>
<Link href="/reservations" className="bg-tertiary-fixed text-on-tertiary px-8 py-3 rounded-full font-label text-sm uppercase tracking-widest hover:opacity-90 transition-opacity">
                Book a Table
            </Link>
</div>
<div>
<span className="font-sans text-sm tracking-widest uppercase text-stone-100 mb-6 block">Explore</span>
<nav className="flex flex-col space-y-4">
<Link className="text-stone-400 hover:text-stone-200 font-label text-sm uppercase tracking-widest transition-colors hover:underline" href="#">Pickup Policy</Link>
<Link className="text-stone-400 hover:text-stone-200 font-label text-sm uppercase tracking-widest transition-colors hover:underline" href="#">Address</Link>
<Link className="text-stone-400 hover:text-stone-200 font-label text-sm uppercase tracking-widest transition-colors hover:underline" href="#">Socials</Link>
</nav>
</div>
<div>
<span className="font-sans text-sm tracking-widest uppercase text-stone-100 mb-6 block">Legal</span>
<p className="text-stone-400 font-body text-sm leading-relaxed mb-4">Tiruppur District,<br/>Tamil Nadu, India</p>
<div className="text-stone-500 font-body text-xs mt-12">© 2024 The Grove, Tiruppur. All rights reserved.</div>
</div>
</div>
</footer>
</main>
    </div>
  );
}
