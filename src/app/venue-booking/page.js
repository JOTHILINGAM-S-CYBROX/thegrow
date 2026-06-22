'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function Page() {
  const [eventType, setEventType] = useState('Private Dinner');
  const [isEventTypeOpen, setIsEventTypeOpen] = useState(false);
  
  const [preferredSpace, setPreferredSpace] = useState('The Lawn');
  const [isPreferredSpaceOpen, setIsPreferredSpaceOpen] = useState(false);

  const [settings, setSettings] = useState({ eventBookingEnabled: true, loading: false });

  const [selectedDate, setSelectedDate] = useState(6);
  const [selectedTime, setSelectedTime] = useState('06:00 PM');
  const [customTime, setCustomTime] = useState('');
  const [name, setName] = useState('');

  // Dynamically populated from the DB
  const [fullyBookedDates, setFullyBookedDates] = useState([]);
  const [partiallyBookedDates, setPartiallyBookedDates] = useState({});

  const allTimeSlots = ['11:00 AM', '02:30 PM', '06:00 PM', '08:00 PM', 'Full Day', 'Custom Timing'];

  const getAvailableTimes = (day) => {
    const bookedForDay = partiallyBookedDates[day] || [];
    return allTimeSlots.map(time => {
      let isBooked = bookedForDay.includes(time);
      if (bookedForDay.includes('Full Day') && time !== 'Custom Timing') {
        isBooked = true; // if full day is booked, other specific slots are unavailable
      }
      return { time, isBooked };
    });
  };
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [guestCount, setGuestCount] = useState('20');
  const [specialReqs, setSpecialReqs] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, bookingsRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/bookings')
        ]);
        
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (data.success && data.settings) {
            setSettings({
              eventBookingEnabled: data.settings.eventBookingEnabled,
              loading: false
            });
          } else {
            setSettings(prev => ({ ...prev, loading: false }));
          }
        }

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          if (bookingsData.success && bookingsData.bookings) {
            const partial = {};
            const full = [];
            
            bookingsData.bookings.forEach(booking => {
              if (booking.status === 'Cancelled' || booking.status === 'Rejected') return;
              if (!booking.eventDate) return;
              
              const dateObj = new Date(booking.eventDate);
              const day = dateObj.getDate();
              
              if (!partial[day]) partial[day] = [];
              if (booking.timeSlot) {
                 partial[day].push(booking.timeSlot);
              }
            });
            
            Object.keys(partial).forEach(day => {
               const slots = partial[day];
               if (slots.includes('Full Day') || (slots.includes('11:00 AM') && slots.includes('02:30 PM') && slots.includes('06:00 PM') && slots.includes('08:00 PM'))) {
                   full.push(parseInt(day));
               }
            });
            
            setPartiallyBookedDates(partial);
            setFullyBookedDates(full);
          }
        }
      } catch (e) {
        console.error(e);
        setSettings(prev => ({ ...prev, loading: false }));
      }
    };
    fetchData();
  }, []);

  if (settings.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!settings.eventBookingEnabled) {
    return (
      <div className="bg-surface text-on-surface antialiased min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-lg">
          <span className="material-symbols-outlined text-6xl text-primary mb-6">event_busy</span>
          <h1 className="text-4xl font-serif mb-4 text-stone-800 italic">Temporarily Offline</h1>
          <p className="text-stone-500 font-body mb-8 leading-relaxed">
            Our venue booking system is currently undergoing maintenance. Please check back later or contact us directly for event inquiries.
          </p>
          <Link href="/" className="px-8 py-3 bg-primary text-on-primary rounded-full font-label uppercase tracking-widest text-xs hover:opacity-90 transition-opacity inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body antialiased">



      <main className="pt-32">

        <section className="py-20 md:py-28 lg:py-32 mb-24 max-w-screen-2xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32">
          <div className="flex flex-col md:flex-row gap-16 lg:gap-24 items-center md:items-end">
            <div className="md:w-1/2 w-full flex flex-col justify-center">
              <span className="label-md uppercase tracking-[0.2em] text-on-surface-variant text-xs mb-6 md:mb-8 block">The Spaces</span>
              <h1 className="font-headline text-[clamp(2.5rem,5vw,5rem)] italic leading-tight mb-8 md:mb-12 max-w-[12ch] md:max-w-[15ch] lg:max-w-none text-primary">Curating Nature's Finest Canvas.</h1>
              <p className="body-md text-[clamp(1rem,1.5vw,1.125rem)] text-on-surface-variant leading-relaxed max-w-[32ch] md:max-w-[40ch] lg:max-w-[55ch]">From sun-drenched lawns to intimate grove enclaves, The Verdant Gallery offers three distinct stages for your most memorable gatherings.</p>
            </div>
            <div className="md:w-1/2 w-full h-[300px] md:h-[500px] relative overflow-hidden rounded-lg">
              <img className="w-full h-full object-cover" data-alt="Lush garden venue with hanging lights" src="/assets/food/1L1A8974.webp" />
              <div className="absolute bottom-6 left-6 bg-surface-container-low/90 backdrop-blur px-6 py-4 rounded shadow-lg max-w-xs">
                <p className="font-headline text-lg italic">The Grove Ambience</p>
                <p className="text-xs font-label uppercase tracking-widest mt-1">Golden Hour Experience</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low py-32 px-12">
          <div className="w-full md:max-w-screen-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">

              <div className="group">
                <div className="aspect-[4/5] overflow-hidden rounded mb-6 relative">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" data-alt="Wide open green lawn for outdoor events" src="/assets/food/1L1A9129.webp" />
                  <div className="absolute top-4 right-4 bg-primary px-3 py-1">
                    <span className="text-[10px] text-on-primary font-label tracking-[0.2em] uppercase">Capacity 200</span>
                  </div>
                </div>
                <h3 className="font-headline text-2xl mb-2">The Lawn</h3>
                <p className="text-on-surface-variant body-md mb-6 leading-relaxed">Our expansive open-air green, perfect for grand weddings and corporate gala events under the stars.</p>
                <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-4 transition-all">
                  <span className="text-xs uppercase tracking-widest">Select this space</span>
                  <span className={`  text-sm  material-symbols-outlined ${styles.materialSymbolsOutlined}`}>arrow_forward</span>
                </div>
              </div>

              <div className="group mt-12 md:mt-24">
                <div className="aspect-[4/5] overflow-hidden rounded mb-6 relative">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" data-alt="Elegant wooden deck with dining tables" src="/assets/food/1L1A9209.webp" />
                  <div className="absolute top-4 right-4 bg-primary px-3 py-1">
                    <span className="text-[10px] text-on-primary font-label tracking-[0.2em] uppercase">Capacity 80</span>
                  </div>
                </div>
                <h3 className="font-headline text-2xl mb-2">Al Fresco Deck</h3>
                <p className="text-on-surface-variant body-md mb-6 leading-relaxed">A contemporary timber deck nestled between age-old oaks, ideal for cocktail receptions and brunch.</p>
                <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-4 transition-all">
                  <span className="text-xs uppercase tracking-widest">Select this space</span>
                  <span className={`  text-sm  material-symbols-outlined ${styles.materialSymbolsOutlined}`}>arrow_forward</span>
                </div>
              </div>

              <div className="group">
                <div className="aspect-[4/5] overflow-hidden rounded mb-6 relative">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" data-alt="Intimate wooded clearing for private dining" src="/assets/food/1L1A9180.webp" />
                  <div className="absolute top-4 right-4 bg-primary px-3 py-1">
                    <span className="text-[10px] text-on-primary font-label tracking-[0.2em] uppercase">Capacity 20</span>
                  </div>
                </div>
                <h3 className="font-headline text-2xl mb-2">Private Grove</h3>
                <p className="text-on-surface-variant body-md mb-6 leading-relaxed">An intimate enclave surrounded by lush tropical ferns. Designed for exclusive chef's table experiences.</p>
                <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-4 transition-all">
                  <span className="text-xs uppercase tracking-widest">Select this space</span>
                  <span className={`  text-sm  material-symbols-outlined ${styles.materialSymbolsOutlined}`}>arrow_forward</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 px-12 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-20">

            <div className="lg:w-1/2">
              <h2 className="font-headline text-[clamp(2rem,4vw,4rem)] mb-6">Select a Date</h2>
              <div className="bg-surface-container p-8 rounded shadow-sm border border-outline-variant/10">
                <div className="flex justify-between items-center mb-8">
                  <span className="font-label font-semibold text-lg">November 2024</span>
                  <div className="flex gap-4">
                    <button className="p-2 hover:bg-surface-variant rounded-full"><span className={`   material-symbols-outlined ${styles.materialSymbolsOutlined}`}>chevron_left</span></button>
                    <button className="p-2 hover:bg-surface-variant rounded-full"><span className={`   material-symbols-outlined ${styles.materialSymbolsOutlined}`}>chevron_right</span></button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-label uppercase tracking-widest text-on-surface-variant mb-4">
                  <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center font-medium">
                  {[27, 28, 29, 30, 31].map(day => (
                    <span key={`prev-${day}`} className="p-3 text-outline/30">{day}</span>
                  ))}
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                    const isFullyBooked = fullyBookedDates.includes(day);
                    return (
                      <span 
                        key={day} 
                        onClick={() => !isFullyBooked && setSelectedDate(day)}
                        className={`p-3 rounded transition-colors relative
                          ${isFullyBooked ? 'text-outline/40 cursor-not-allowed bg-surface-container-lowest line-through' : 
                            selectedDate === day ? 'bg-secondary text-on-secondary cursor-pointer' : 
                            'hover:bg-primary hover:text-on-primary cursor-pointer'
                          }
                        `}
                      >
                        {day}
                      </span>
                    )
                  })}
                </div>
                <div className="mt-8 pt-8 border-t border-outline-variant/20">
                  <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-4">Available Times</p>
                  <div className="flex flex-wrap gap-3">
                    {getAvailableTimes(selectedDate).map(({time, isBooked}) => (
                      <button 
                        key={time}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setSelectedTime(time)}
                        className={`px-4 py-2 rounded text-sm transition-all 
                          ${isBooked ? 'border border-outline/20 text-outline/40 cursor-not-allowed bg-surface-container-lowest line-through' :
                            selectedTime === time ? 'bg-primary-container text-on-primary-container font-medium' : 
                            'border border-outline hover:bg-primary hover:text-on-primary'
                          }
                        `}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                  {selectedTime === 'Custom Timing' && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Specify Custom Time</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 04:00 PM to 09:00 PM" 
                        className="w-full bg-transparent border-0 border-b border-outline focus:ring-0 focus:border-primary py-3 px-0 text-sm"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:w-1/2">
              <h2 className="font-headline text-[clamp(2rem,4vw,4rem)] mb-6">Booking Details</h2>
              {isSuccess ? (
                <div className="bg-emerald-50 text-emerald-800 p-8 rounded-lg shadow-sm text-center">
                  <span className="material-symbols-outlined text-5xl mb-4">check_circle</span>
                  <h3 className="text-2xl font-headline mb-2">Inquiry Submitted</h3>
                  <p className="text-emerald-700">Thank you, {name}. Your booking inquiry for {eventType} on November {selectedDate} at {selectedTime === 'Custom Timing' ? customTime : selectedTime} has been received. Our concierge will contact you shortly.</p>
                  <button onClick={() => setIsSuccess(false)} className="mt-6 text-sm font-label uppercase tracking-widest underline">Submit another inquiry</button>
                </div>
              ) : (
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Full Name</label>
                    <input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-transparent border-0 border-b border-outline focus:ring-0 focus:border-primary py-3 px-0" placeholder="Jane Doe" type="text" />
                  </div>
                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Email Address</label>
                    <input required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent border-0 border-b border-outline focus:ring-0 focus:border-primary py-3 px-0" placeholder="jane@example.com" type="email" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Phone Number</label>
                  <input required value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-transparent border-0 border-b border-outline focus:ring-0 focus:border-primary py-3 px-0" placeholder="+1 234 567 8900" type="tel" />
                </div>
                <div className="relative">
                  <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Event Type</label>
                  <button
                    type="button"
                    onClick={() => setIsEventTypeOpen(true)}
                    className="w-full bg-transparent border-0 border-b border-outline focus:ring-0 focus:border-primary py-3 px-0 text-left flex justify-between items-center transition-colors hover:border-primary"
                  >
                    <span className="text-stone-850 text-lg">{eventType}</span>
                    <span className="material-symbols-outlined text-stone-400">expand_more</span>
                  </button>

                  {/* Tablet/Desktop Floating Dropdown */}
                  {isEventTypeOpen && (
                    <>
                      <div className="hidden md:block fixed inset-0 z-40" onClick={() => setIsEventTypeOpen(false)}></div>
                      <div className="hidden md:flex absolute top-full left-0 mt-3 z-50 bg-surface md:w-[360px] lg:w-[400px] rounded-xl shadow-2xl border border-outline-variant/20 animate-in fade-in zoom-in-95 origin-top-left flex-col max-h-[320px] overflow-y-auto p-2">
                        {[
                          'Private Dinner',
                          'Wedding Ceremony',
                          'Corporate Retreat',
                          'Brand Launch'
                        ].map(opt => (
                          <button
                            key={opt}
                            onClick={() => { setEventType(opt); setIsEventTypeOpen(false); }}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg min-h-[48px] transition-all text-left ${eventType === opt ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-surface-container border border-transparent'}`}
                          >
                            <span className={`text-base ${eventType === opt ? 'text-emerald-800 font-medium' : 'text-stone-700'}`}>{opt}</span>
                            {eventType === opt && (
                              <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Guest Count</label>
                    <input value={guestCount} onChange={e => setGuestCount(e.target.value)} className="w-full bg-transparent border-0 border-b border-outline focus:ring-0 focus:border-primary py-3 px-0" placeholder="20" type="number" min="1" required />
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Preferred Space</label>
                    <button
                      type="button"
                      onClick={() => setIsPreferredSpaceOpen(true)}
                      className="w-full bg-transparent border-0 border-b border-outline focus:ring-0 focus:border-primary py-3 px-0 text-left flex justify-between items-center transition-colors hover:border-primary"
                    >
                      <span className="text-stone-850 text-lg">{preferredSpace}</span>
                      <span className="material-symbols-outlined text-stone-400">expand_more</span>
                    </button>

                    {/* Tablet/Desktop Floating Dropdown */}
                    {isPreferredSpaceOpen && (
                      <>
                        <div className="hidden md:block fixed inset-0 z-40" onClick={() => setIsPreferredSpaceOpen(false)}></div>
                        <div className="hidden md:flex absolute top-full left-0 mt-3 z-50 bg-surface md:w-[320px] lg:w-[380px] rounded-xl shadow-2xl border border-outline-variant/20 animate-in fade-in zoom-in-95 origin-top-left flex-col max-h-[320px] overflow-y-auto p-2">
                          {[
                            'The Lawn',
                            'Al Fresco Deck',
                            'Private Grove'
                          ].map(opt => (
                            <button
                              key={opt}
                              onClick={() => { setPreferredSpace(opt); setIsPreferredSpaceOpen(false); }}
                              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg min-h-[48px] transition-all text-left ${preferredSpace === opt ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-surface-container border border-transparent'}`}
                            >
                              <span className={`text-base ${preferredSpace === opt ? 'text-emerald-800 font-medium' : 'text-stone-700'}`}>{opt}</span>
                              {preferredSpace === opt && (
                                <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Special Requirements</label>
                  <textarea value={specialReqs} onChange={e => setSpecialReqs(e.target.value)} className="w-full bg-transparent border-0 border-b border-outline focus:ring-0 focus:border-primary py-3 px-0" placeholder="Dietary notes, decor preferences..." rows="3"></textarea>
                </div>
                <div className="bg-surface-container-high/50 p-6 rounded flex items-start gap-4">
                  <span className={`  text-tertiary  material-symbols-outlined ${styles.materialSymbolsOutlined}`}>info</span>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    <strong>All bookings are pending admin approval</strong> to prevent double bookings. Our concierge will contact you within 24 hours to confirm your reservation.
                  </p>
                </div>
                <button disabled={isSubmitting} className="w-full bg-primary text-on-primary py-5 rounded-lg shadow-xl hover:bg-primary-container disabled:opacity-50 transition-colors font-label tracking-[0.2em] uppercase text-sm" type="submit">
                  {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </form>
              )}
            </div>
          </div>
        </section>

        <section className="mb-32">
          <div className="relative min-h-[400px] md:min-h-[600px] w-full">
            <img className="w-full h-full object-cover" data-alt="People laughing at a dinner party in a forest" src="/assets/food/1L1A9205-Edit.webp" />
            <div className="absolute inset-0 bg-primary/20 backdrop-brightness-75"></div>
            <div className="absolute inset-0 flex items-center justify-center text-center p-12">
              <div className="w-full md:max-w-2xl text-on-primary">
                <span className={`  text-6xl mb-8  material-symbols-outlined ${styles.materialSymbolsOutlined}`}>format_quote</span>
                <h2 className="font-headline text-[clamp(2rem,4vw,4rem)] italic leading-tight mb-8">"An ethereal experience. The light filtering through the canopy made our evening feel like a forgotten dream."</h2>
                <p className="font-label uppercase tracking-widest text-xs">- Eleanor Vance, Vogue Living</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-20 px-12 bg-stone-100 dark:bg-stone-950">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 items-start max-w-screen-2xl mx-auto">
          <div className="col-span-1 md:col-span-1">
            <div className="font-serif text-lg text-emerald-950 dark:text-emerald-50 mb-6">The Verdant Gallery</div>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8">Nurturing elegance through nature's inherent beauty. A sanctuary for the senses in the heart of the grove.</p>
          </div>
          <div>
            <h4 className="font-label text-xs tracking-widest uppercase text-emerald-900 dark:text-emerald-500 mb-6 font-bold">Navigation</h4>
            <ul className="space-y-4">
              <li><Link className="font-sans text-xs tracking-widest uppercase text-stone-500 dark:text-stone-500 hover:text-emerald-900 dark:hover:text-emerald-400 transition-all hover:translate-x-1 duration-200 block" href="/">Home</Link></li>
              <li><Link className="font-sans text-xs tracking-widest uppercase text-stone-500 dark:text-stone-500 hover:text-emerald-900 dark:hover:text-emerald-400 transition-all hover:translate-x-1 duration-200 block" href="/interactive-menu">Menu</Link></li>
              <li><Link className="font-sans text-xs tracking-widest uppercase text-stone-500 dark:text-stone-500 hover:text-emerald-900 dark:hover:text-emerald-400 transition-all hover:translate-x-1 duration-200 block underline decoration-emerald-900 dark:decoration-emerald-400" href="/venue-booking">Venue</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-label text-xs tracking-widest uppercase text-emerald-900 dark:text-emerald-500 mb-6 font-bold">Policy</h4>
            <ul className="space-y-4">
              <li><Link className="font-sans text-xs tracking-widest uppercase text-stone-500 dark:text-stone-500 hover:text-emerald-900 dark:hover:text-emerald-400 transition-all hover:translate-x-1 duration-200 block" href="#">Privacy Policy</Link></li>
              <li><Link className="font-sans text-xs tracking-widest uppercase text-stone-500 dark:text-stone-500 hover:text-emerald-900 dark:hover:text-emerald-400 transition-all hover:translate-x-1 duration-200 block" href="#">Terms of Service</Link></li>
              <li><Link className="font-sans text-xs tracking-widest uppercase text-stone-500 dark:text-stone-500 hover:text-emerald-900 dark:hover:text-emerald-400 transition-all hover:translate-x-1 duration-200 block" href="#">Sustainability</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-label text-xs tracking-widest uppercase text-emerald-900 dark:text-emerald-500 mb-6 font-bold">Connect</h4>
            <p className="text-xs font-sans tracking-widest text-stone-500 mb-4 uppercase">Join the curation</p>
            <div className="flex gap-4">
              <Link className="w-10 h-10 border border-outline-variant flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all" href="#">
                <span className={`  text-lg  material-symbols-outlined ${styles.materialSymbolsOutlined}`}>public</span>
              </Link>
              <Link className="w-10 h-10 border border-outline-variant flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all" href="#">
                <span className={`  text-lg  material-symbols-outlined ${styles.materialSymbolsOutlined}`}>mail</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-outline-variant/10 text-center">
          <p className="font-sans text-[10px] tracking-widest uppercase text-stone-500 dark:text-stone-500">© 2024 The Verdant Gallery. All rights reserved.</p>
        </div>
      </footer>

      {/* Event Type Bottom Sheet (Mobile Only) */}
      {isEventTypeOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm animate-in fade-in" 
            onClick={() => setIsEventTypeOpen(false)}
          ></div>
          
          <div className="relative bg-surface w-full rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom pb-safe flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-outline/10 flex justify-between items-center">
              <h3 className="font-headline text-xl text-stone-800">Select Event Type</h3>
              <button onClick={() => setIsEventTypeOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined text-stone-500 text-sm">close</span>
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2">
              {[
                'Private Dinner',
                'Wedding Ceremony',
                'Corporate Retreat',
                'Brand Launch'
              ].map(opt => (
                <button
                  key={opt}
                  onClick={() => { setEventType(opt); setIsEventTypeOpen(false); }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl min-h-[56px] transition-all text-left ${eventType === opt ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-surface-container border border-transparent'}`}
                >
                  <span className={`text-lg ${eventType === opt ? 'text-emerald-800 font-medium' : 'text-stone-700'}`}>{opt}</span>
                  {eventType === opt && (
                    <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preferred Space Bottom Sheet (Mobile Only) */}
      {isPreferredSpaceOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm animate-in fade-in" 
            onClick={() => setIsPreferredSpaceOpen(false)}
          ></div>
          
          <div className="relative bg-surface w-full rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom pb-safe flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-outline/10 flex justify-between items-center">
              <h3 className="font-headline text-xl text-stone-800">Select Preferred Space</h3>
              <button onClick={() => setIsPreferredSpaceOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined text-stone-500 text-sm">close</span>
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2">
              {[
                'The Lawn',
                'Al Fresco Deck',
                'Private Grove'
              ].map(opt => (
                <button
                  key={opt}
                  onClick={() => { setPreferredSpace(opt); setIsPreferredSpaceOpen(false); }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl min-h-[56px] transition-all text-left ${preferredSpace === opt ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-surface-container border border-transparent'}`}
                >
                  <span className={`text-lg ${preferredSpace === opt ? 'text-emerald-800 font-medium' : 'text-stone-700'}`}>{opt}</span>
                  {preferredSpace === opt && (
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
