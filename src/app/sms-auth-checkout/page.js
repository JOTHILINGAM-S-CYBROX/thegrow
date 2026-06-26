'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

export default function SMSAuthCheckout() {
  const router = useRouter();
  const { items, getTotal, getItemCount, clearCart } = useCart();
  const auth = useAuth();

  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [pickupTime, setPickupTime] = useState('ASAP');
  const [isTimeSheetOpen, setIsTimeSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [orderPlacing, setOrderPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [headerHeight, setHeaderHeight] = useState(88); // Default fallback

  useEffect(() => {
    // Dynamically calculate header height to avoid collision
    const updateHeaderHeight = () => {
      const nav = document.querySelector('nav');
      if (nav) {
        setHeaderHeight(nav.offsetHeight);
      }
    };
    
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  useEffect(() => {
    if (items.length === 0 && !orderSuccess) {
      router.push('/interactive-menu');
    }
  }, [items, orderSuccess, router]);

  const handleSendOTP = async () => {
    setError('');
    setMessage('');
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-whatsapp-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage('Verification code sent securely to your WhatsApp!');
      } else {
        setError(data.message || 'Failed to send OTP code.');
      }
    } catch (err) {
      setError('Network error sending verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    if (otpCode.length !== 6) {
      setError('OTP must be exactly 6 digits.');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const res = await auth.login(cleanPhone, otpCode);

      if (res && res.success) {
        setMessage('Identity verified successfully!');
      } else {
        setError(res?.message || 'Invalid verification code.');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      setError('Please enter your name before placing the order.');
      return;
    }

    setOrderPlacing(true);
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          totalPrice: getTotal(),
          orderType: 'Takeaway',
          paymentStatus: 'Pending',
          paymentMethod: 'Cash',
          scheduledTime: pickupTime,
          customerInfo: {
            name: customerName.trim()
          }
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOrderData(data.order);
        setOrderSuccess(true);
        clearCart();
      } else {
        setError(data.error || 'Failed to finalize your order.');
      }
    } catch (err) {
      setError('Network error processing your request.');
    } finally {
      setOrderPlacing(false);
    }
  };

  if (items.length === 0 && !orderSuccess) {
    return null; // Will redirect via useEffect
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8 text-center pt-32">
        <div className="w-full md:max-w-md bg-surface-container-lowest backdrop-blur-xl p-12 rounded-3xl border border-outline/20 shadow-2xl space-y-6 transform transition-all hover:scale-105">
          <span className="material-symbols-outlined text-emerald-700 text-7xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <h2 className="text-4xl font-headline italic text-primary">Order Confirmed</h2>
          <p className="text-on-surface-variant font-body text-sm leading-relaxed">
            Your culinary journey begins. Order <span className="font-bold text-primary">#{orderData?.orderNumber}</span> has been dispatched to our kitchen.
          </p>
          <button onClick={() => router.push('/')} className="mt-8 inline-block bg-primary text-on-primary px-10 py-4 rounded-full font-label text-xs uppercase tracking-[0.2em] hover:bg-emerald-900 transition-colors shadow-md hover:shadow-xl font-bold w-full">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed pt-24 md:pt-32 pb-24">
      <div className="w-[95%] md:w-full md:max-w-screen-xl mx-auto px-2 sm:px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
        
        {/* Order Summary Section */}
        <div className="lg:col-span-5 order-1 lg:order-2 relative z-40">
          {/* Desktop & Tablet: Sticky Side Panel */}
          <div 
            className="hidden md:block bg-surface border border-outline-variant/20 rounded-2xl p-6 shadow-sm sticky transition-all"
            style={{ top: `${headerHeight + 24}px` }}
          >
            <h3 className="font-headline text-xl italic text-primary mb-4 border-b border-outline/10 pb-3">Order Summary</h3>
            <div className="space-y-3 md:space-y-6 max-h-[50vh] overflow-y-auto pr-2 no-scrollbar">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-3 md:gap-4 group">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} className="w-14 h-14 md:w-24 md:h-24 object-cover rounded-xl md:rounded-2xl shadow-sm shrink-0" />
                  )}
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="font-headline italic text-base md:text-[clamp(1.125rem,4vw,1.375rem)] text-stone-850 group-hover:text-primary transition-colors leading-tight mb-0.5">{item.name}</h4>
                    <div className="flex justify-between items-end">
                      <span className="text-[13px] md:text-[clamp(0.875rem,2vw,1rem)] text-on-surface-variant font-label uppercase tracking-widest">Qty: {item.quantity}</span>
                      <span className="font-serif italic font-bold text-xl md:text-[clamp(1.5rem,5vw,2rem)] text-stone-850 leading-none">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 md:mt-8 md:pt-6 border-t border-outline/20">
              <div className="flex justify-between items-end mb-1 md:mb-2">
                <span className="text-[13px] md:text-sm text-on-surface-variant font-label uppercase tracking-widest">Total Items</span>
                <span className="font-serif italic text-base md:text-lg text-stone-800">{getItemCount()}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[13px] md:text-sm text-on-surface-variant font-label uppercase tracking-widest">Grand Total</span>
                <span className="font-headline text-2xl md:text-3xl italic text-primary leading-none">₹{getTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Mobile: Bottom Sticky Checkout Bar (Order Summary) */}
          <div className="md:hidden fixed bottom-0 left-0 w-full bg-surface border-t border-outline-variant/20 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] z-[60] pb-safe px-4 py-3 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold opacity-80">{getItemCount()} Items</span>
              <span className="font-serif italic text-xl font-bold text-stone-850 leading-none">₹{getTotal().toFixed(2)}</span>
            </div>
            <button 
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label text-xs uppercase tracking-widest font-bold shadow-md"
            >
              Checkout <span className="material-symbols-outlined text-[14px] align-middle ml-1">arrow_downward</span>
            </button>
          </div>
        </div>

        {/* Authentication & Checkout Section */}
        <div className="lg:col-span-7 order-2 lg:order-1">
          <div className="space-y-6 md:space-y-8">
            <div>
              <span className="label-sm uppercase tracking-[0.2em] text-secondary font-semibold mb-2 md:mb-4 block">Secure Checkout</span>
              <h1 className="text-3xl md:text-[clamp(2.5rem,8vw,4rem)] font-headline italic tracking-tight leading-tight mb-2 md:mb-4 text-stone-850">
                Finalize Your <br />
                <span className="text-primary">Culinary Request</span>
              </h1>
              <p className="text-on-surface-variant max-w-md leading-relaxed text-[13px] md:text-sm">
                For security and seamless tracking, we verify your contact number before dispatching your order to the kitchen.
              </p>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 md:p-10 shadow-sm transition-all">
              {!auth.isAuthenticated ? (
                <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-800">
                      <span className="material-symbols-outlined text-lg md:text-2xl">security</span>
                    </div>
                    <div>
                      <h4 className="font-headline text-lg md:text-xl text-stone-850">Identity Verification</h4>
                      <p className="text-[11px] md:text-xs text-stone-500">We&apos;ll send a 6-digit OTP to your WhatsApp.</p>
                    </div>
                  </div>

                  <div className="space-y-5 md:space-y-6">
                    <div>
                      <label className="font-label text-xs tracking-[0.2em] uppercase text-stone-500 mb-3 block">WhatsApp Number</label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          disabled={loading || !!message}
                          className="flex-1 bg-surface border border-outline/30 rounded-xl px-6 py-4 text-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body placeholder:text-stone-300"
                        />
                        {!message && (
                          <div className="mt-6 md:mt-0 lg:static bottom-0 left-0 w-full lg:p-0 bg-surface/90 lg:bg-transparent lg:backdrop-blur-none border-outline/10 lg:border-none z-50">
                            <button
                              onClick={handleSendOTP}
                              disabled={loading || phone.length < 10}
                              className="w-full lg:w-auto bg-primary text-on-primary font-label text-xs tracking-widest uppercase px-8 py-4 rounded-xl hover:bg-emerald-900 transition-colors disabled:opacity-50 font-bold whitespace-nowrap shadow-sm hover:shadow-md min-h-[52px]"
                            >
                              {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {message && !error && !auth.isAuthenticated && (
                      <div className="animate-in fade-in duration-500">
                        <label className="font-label text-xs tracking-[0.2em] uppercase text-stone-500 mb-3 block">Verification Code</label>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <input
                            type="text"
                            maxLength="6"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            disabled={loading}
                            className="flex-1 bg-surface border border-outline/30 rounded-xl px-6 py-4 text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-headline font-bold text-stone-800"
                          />
                          <div className="mt-6 md:mt-0 lg:static bottom-0 left-0 w-full lg:p-0 bg-surface/90 lg:bg-transparent lg:backdrop-blur-none border-outline/10 lg:border-none z-50">
                            <button
                              onClick={handleVerifyOTP}
                              disabled={loading || otpCode.length !== 6}
                              className="w-full lg:w-auto bg-emerald-700 text-white font-label text-xs tracking-widest uppercase px-8 py-4 rounded-xl hover:bg-emerald-800 transition-colors disabled:opacity-50 font-bold whitespace-nowrap shadow-sm hover:shadow-md min-h-[52px]"
                            >
                              {loading ? 'Verifying...' : 'Verify Code'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 bg-error-container/50 border border-error/20 rounded-xl text-error text-sm flex gap-3 items-center mt-4">
                      <span className="material-symbols-outlined">error</span>
                      <span>{error}</span>
                    </div>
                  )}
                  {message && !error && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex gap-3 items-center mt-4">
                      <span className="material-symbols-outlined">check_circle</span>
                      <span>{message}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-4 pb-6 border-b border-outline/10">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 ring-4 ring-emerald-50">
                      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                    </div>
                    <div>
                      <span className="font-label text-[10px] tracking-widest uppercase text-emerald-700 font-bold block mb-1">Authenticated</span>
                      <h4 className="font-headline text-2xl text-stone-850">Welcome Back</h4>
                      <p className="text-sm text-stone-500">Connected as +91 {auth.user?.phone}</p>
                    </div>
                  </div>

                  <div className="pt-2 space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="font-label text-xs tracking-[0.2em] uppercase text-stone-500 mb-2 block">Your Name</label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full bg-surface border border-outline/30 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body"
                        />
                      </div>
                      <div className="relative">
                        <label className="font-label text-xs tracking-[0.2em] uppercase text-stone-500 mb-2 block">Preferred Pickup Time</label>
                        <button
                          type="button"
                          onClick={() => setIsTimeSheetOpen(true)}
                          className="w-full bg-surface border border-outline/30 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body flex justify-between items-center text-left"
                        >
                          <span className="text-stone-850 truncate pr-4">
                            {pickupTime === 'ASAP' ? 'ASAP (As soon as possible)' : pickupTime}
                          </span>
                          <span className="material-symbols-outlined text-stone-400">expand_more</span>
                        </button>
                      </div>
                    </div>
                    <div className="mt-8 mb-24 md:mb-0 lg:static bottom-0 left-0 w-full lg:p-0 bg-surface/90 lg:bg-transparent lg:backdrop-blur-none border-outline/10 lg:border-none z-50">
                      <button
                        onClick={handlePlaceOrder}
                        disabled={orderPlacing}
                        className="w-full bg-primary hover:bg-emerald-900 text-on-primary py-4 lg:py-5 rounded-xl font-label text-sm uppercase tracking-[0.2em] font-bold transition-all shadow-md hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-3 min-h-[52px]"
                      >
                        <span className={`material-symbols-outlined ${orderPlacing ? 'animate-spin' : ''}`}>
                          {orderPlacing ? 'sync' : 'restaurant'}
                        </span>
                        {orderPlacing ? 'Finalizing...' : 'Place Order'}
                      </button>
                    </div>
                    {error && (
                      <p className="text-error text-sm mt-4 text-center">{error}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pickup Time Bottom Sheet */}
      {isTimeSheetOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm animate-in fade-in" 
            onClick={() => setIsTimeSheetOpen(false)}
          ></div>
          
          <div className="relative bg-surface w-full md:w-[400px] md:mx-auto md:mb-auto md:mt-24 md:rounded-3xl rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom md:zoom-in-95 pb-safe flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-outline/10 flex justify-between items-center">
              <h3 className="font-headline text-xl text-stone-800">Select Pickup Time</h3>
              <button onClick={() => setIsTimeSheetOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined text-stone-500 text-sm">close</span>
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2">
              {[
                { value: 'ASAP', label: 'ASAP (As soon as possible)' },
                { value: 'Within 30 mins', label: 'Within 30 mins' },
                { value: 'Within 1 hour', label: 'Within 1 hour' },
                { value: 'Within 2 hours', label: 'Within 2 hours' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setPickupTime(opt.value); setIsTimeSheetOpen(false); }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl min-h-[56px] transition-all ${pickupTime === opt.value ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-surface-container border border-transparent'}`}
                >
                  <span className={`text-lg ${pickupTime === opt.value ? 'text-emerald-800 font-medium' : 'text-stone-700'}`}>{opt.label}</span>
                  {pickupTime === opt.value && (
                    <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
