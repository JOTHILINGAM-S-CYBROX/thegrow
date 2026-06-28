'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { useStatusPill } from '@/contexts/StatusPillContext';

export default function Page() {
  const { showPill } = useStatusPill();
  const [settings, setSettings] = useState({ tableBookingEnabled: true, loading: false });
  const [step, setStep] = useState(1);
  
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => {
    if (currentYear === today.getFullYear() && currentMonth <= today.getMonth()) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const isPastDate = (day) => {
    if (currentYear < today.getFullYear()) return true;
    if (currentYear === today.getFullYear() && currentMonth < today.getMonth()) return true;
    if (currentYear === today.getFullYear() && currentMonth === today.getMonth() && day < today.getDate()) return true;
    return false;
  };

  const isToday = (day) => {
    return currentYear === today.getFullYear() && currentMonth === today.getMonth() && day === today.getDate();
  };
  
  const isSelected = (day) => {
    return selectedYear === currentYear && selectedMonth === currentMonth && selectedDate === day;
  };
  
  const handleSelectDate = (day) => {
    setSelectedDate(day);
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
  };

  const allTimeSlots = ['18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

  const parseTimeStr = (timeStr) => {
    const [h, m] = timeStr.split(':');
    return parseInt(h) * 60 + parseInt(m);
  };

  const getAvailableTimes = (day) => {
    const isTodaySelected = selectedYear === today.getFullYear() && selectedMonth === today.getMonth() && day === today.getDate();
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    return allTimeSlots.map(time => {
      let isPast = false;
      if (isTodaySelected) {
        const timeMins = parseTimeStr(time);
        if ((currentMins + 30) > timeMins) {
          isPast = true;
        }
      }
      return { time, isDisabled: isPast, isPast };
    });
  };

  useEffect(() => {
    const available = getAvailableTimes(selectedDate);
    const currentSlot = available.find(s => s.time === selectedTime);
    if (!currentSlot || currentSlot.isDisabled) {
      const firstValid = available.find(s => !s.isDisabled);
      if (firstValid) {
        setSelectedTime(firstValid.time);
      }
    }
  }, [selectedDate, selectedMonth, selectedYear]);

  const [selectedTime, setSelectedTime] = useState('19:30');
  
  const [partySize, setPartySize] = useState(2);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.settings) {
            setSettings({
              tableBookingEnabled: data.settings.tableBookingEnabled,
              loading: false
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedDateObj = new Date(selectedYear, selectedMonth, selectedDate);
    const todayObj = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (selectedDateObj < todayObj) {
      showPill("Cannot book a past date. Please select a valid date.", 'error');
      return;
    }

    const available = getAvailableTimes(selectedDate);
    const currentSlot = available.find(s => s.time === selectedTime);
    if (!currentSlot || currentSlot.isDisabled) {
      showPill("Selected time slot is no longer available.", 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(3);
    }, 1500);
  };

  if (settings.loading) return null;

  if (!settings.tableBookingEnabled) {
    return (
      <div className="bg-surface text-on-surface antialiased min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-lg">
          <span className="material-symbols-outlined text-6xl text-primary mb-6">event_busy</span>
          <h1 className="text-4xl font-serif mb-4 text-stone-800 italic">Temporarily Offline</h1>
          <p className="text-stone-500 font-body mb-8 leading-relaxed">
            Our table reservation system is currently undergoing maintenance. Please check back later or contact us directly to make a reservation.
          </p>
          <Link href="/" className="px-8 py-3 bg-primary text-on-primary rounded-full font-label uppercase tracking-widest text-xs hover:opacity-90 transition-opacity">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface antialiased">



      <main className="pt-16 md:pt-24 min-h-screen">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-0">

          <aside className="w-full lg:w-1/3 h-64 md:h-96 lg:h-[calc(100vh-6rem)] lg:sticky top-24 overflow-hidden bg-surface-container-low p-0 lg:p-8 shrink-0 z-10">
            <div className="relative h-full w-full group overflow-hidden rounded-none lg:rounded-xl">
              <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" data-alt="Elegant dimly lit restaurant interior with emerald accents" src="/assets/ambience/07.jpg.webp" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 lg:from-primary/80 via-primary/40 lg:via-transparent to-transparent"></div>
              <div className="absolute bottom-6 md:bottom-10 lg:bottom-12 left-6 md:left-10 lg:left-12 right-6 md:right-12 text-on-primary">
                <span className="label-sm font-label uppercase tracking-widest text-primary-fixed-dim mb-2 lg:mb-4 block">The Setting</span>
                <h2 className="text-3xl md:text-5xl lg:text-4xl font-serif mb-2 lg:mb-4 italic">Dine amidst the swaying palms.</h2>
                <p className="hidden md:block text-sm md:text-base lg:text-sm font-body leading-relaxed opacity-90 max-w-2xl lg:max-w-none">Our space is designed to blend the boundaries between nature and fine dining, offering an escape into the lush Tiruppur landscape.</p>
              </div>
            </div>
          </aside>

          <section className="flex-1 p-4 md:p-12 lg:p-24 bg-surface w-full max-w-full">
            <div className="w-full lg:max-w-2xl mx-auto">

              <div className="flex items-center gap-2 sm:gap-4 mb-12 w-full overflow-hidden">
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 ${step >= 1 ? 'bg-primary text-on-primary border-none' : 'border border-outline-variant text-on-surface-variant'}`}>1</span>
                  <span className={`text-[10px] sm:text-xs font-label uppercase tracking-wider sm:tracking-widest ${step >= 1 ? 'text-on-surface' : 'text-on-surface-variant'}`}>Time</span>
                </div>
                <div className={`h-[1px] flex-1 min-w-[8px] transition-colors duration-500 ${step >= 2 ? 'bg-primary' : 'bg-outline-variant'}`}></div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 ${step >= 2 ? 'bg-primary text-on-primary border-none' : 'border border-outline-variant text-on-surface-variant'}`}>2</span>
                  <span className={`text-[10px] sm:text-xs font-label uppercase tracking-wider sm:tracking-widest ${step >= 2 ? 'text-on-surface' : 'text-on-surface-variant'}`}>Details</span>
                </div>
                <div className={`h-[1px] flex-1 min-w-[8px] transition-colors duration-500 ${step >= 3 ? 'bg-primary' : 'bg-outline-variant'}`}></div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 ${step >= 3 ? 'bg-primary text-on-primary border-none' : 'border border-outline-variant text-on-surface-variant'}`}>3</span>
                  <span className={`text-[10px] sm:text-xs font-label uppercase tracking-wider sm:tracking-widest ${step >= 3 ? 'text-on-surface' : 'text-on-surface-variant'}`}>Confirm</span>
                </div>
              </div>
              <header className="mb-16">
                <h1 className="text-[clamp(2rem,4vw,4rem)] font-serif text-primary mb-4 italic">Reserve Your Experience</h1>
                <p className="text-stone-500 font-body text-lg">
                  {step === 1 ? 'Select a date and time that suits your palate.' : step === 2 ? 'Please provide your reservation details.' : 'Your reservation has been confirmed.'}
                </p>
              </header>

              <form className="space-y-16" onSubmit={handleSubmit}>
                {step === 1 && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-serif">{monthNames[currentMonth]} {currentYear}</h3>
                    <div className="flex gap-4">
                      <button 
                        className={`p-2 transition-colors rounded-full ${currentYear === today.getFullYear() && currentMonth <= today.getMonth() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-container'}`} 
                        type="button"
                        onClick={handlePrevMonth}
                        disabled={currentYear === today.getFullYear() && currentMonth <= today.getMonth()}
                      >
                        <span className={`   material-symbols-outlined ${styles.materialSymbolsOutlined}`}>chevron_left</span>
                      </button>
                      <button className="p-2 hover:bg-surface-container transition-colors rounded-full" type="button" onClick={handleNextMonth}>
                        <span className={`   material-symbols-outlined ${styles.materialSymbolsOutlined}`}>chevron_right</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2 mb-12">
                    <div className="text-center text-[10px] font-label uppercase tracking-tighter text-outline pb-4">Sun</div>
                    <div className="text-center text-[10px] font-label uppercase tracking-tighter text-outline pb-4">Mon</div>
                    <div className="text-center text-[10px] font-label uppercase tracking-tighter text-outline pb-4">Tue</div>
                    <div className="text-center text-[10px] font-label uppercase tracking-tighter text-outline pb-4">Wed</div>
                    <div className="text-center text-[10px] font-label uppercase tracking-tighter text-outline pb-4">Thu</div>
                    <div className="text-center text-[10px] font-label uppercase tracking-tighter text-outline pb-4">Fri</div>
                    <div className="text-center text-[10px] font-label uppercase tracking-tighter text-outline pb-4">Sat</div>

                    {Array.from({ length: firstDayOfMonth }, (_, i) => (
                      <div key={`padding-${i}`} className="aspect-square"></div>
                    ))}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                      const pastDate = isPastDate(day);
                      const todayDate = isToday(day);
                      return (
                        <div 
                          key={day}
                          onClick={() => !pastDate && handleSelectDate(day)}
                          className={`aspect-square flex items-center justify-center text-sm font-medium rounded-lg transition-all 
                            ${pastDate ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                            ${isSelected(day) ? 'bg-primary text-on-primary shadow-lg scale-105' : (!pastDate ? 'hover:bg-surface-container' : '')}
                            ${todayDate && !isSelected(day) ? 'ring-2 ring-primary ring-inset' : ''}
                          `}
                        >
                          {day}
                        </div>
                      )
                    })}
                  </div>
                  {getAvailableTimes(selectedDate).every(slot => slot.isDisabled) ? (
                    <div className="p-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-center my-8">
                      <span className="material-symbols-outlined text-outline text-4xl mb-2">event_busy</span>
                      <p className="text-lg font-serif text-on-surface-variant">No booking times available for today.</p>
                      <p className="text-sm text-outline mt-2">Please choose another date.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {getAvailableTimes(selectedDate).map(({time, isDisabled, isPast}) => (
                          <button 
                            key={time}
                            disabled={isDisabled}
                            onClick={() => setSelectedTime(time)}
                            className={`py-4 border rounded transition-all text-sm font-medium relative overflow-hidden ${isDisabled ? 'border-outline-variant/20 text-outline/40 cursor-not-allowed bg-surface-container-lowest ' + (!isPast ? 'line-through' : '') : selectedTime === time ? 'border-2 border-primary bg-primary-container text-on-primary-container font-bold' : 'border-outline-variant hover:border-primary hover:bg-surface-container-lowest'}`} 
                            type="button"
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex justify-end pt-12">
                        <button onClick={() => setStep(2)} className="w-full md:w-auto bg-primary text-on-primary px-12 py-5 rounded-full font-label uppercase text-sm tracking-[0.2em] shadow-xl hover:opacity-90 active:scale-95 transition-all" type="button">Next: Party Size</button>
                      </div>
                    </>
                  )}
                </section>
                )}

                {step === 2 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-8">
                      <button onClick={() => setStep(1)} className="text-sm font-label uppercase tracking-widest text-primary flex items-center gap-2 hover:underline" type="button">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Date & Time
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Party Size</label>
                        <input value={partySize} onChange={e => setPartySize(e.target.value)} required min="1" max="20" className="w-full bg-transparent border-0 border-b border-outline focus:ring-0 focus:border-primary py-3 px-0 text-lg" type="number" />
                      </div>
                      <div>
                        <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Full Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} required className="w-full bg-transparent border-0 border-b border-outline focus:ring-0 focus:border-primary py-3 px-0 text-lg" placeholder="Jane Doe" type="text" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-8 mb-8">
                      <div>
                        <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Phone Number</label>
                        <input value={phone} onChange={e => setPhone(e.target.value)} required className="w-full bg-transparent border-0 border-b border-outline focus:ring-0 focus:border-primary py-3 px-0 text-lg" placeholder="+91 98765 43210" type="tel" />
                      </div>
                    </div>
                    <div className="mb-12">
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Special Requests (Optional)</label>
                      <textarea value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} className="w-full bg-transparent border-0 border-b border-outline focus:ring-0 focus:border-primary py-3 px-0 text-lg" placeholder="Allergies, anniversaries, preferred seating..." rows="2"></textarea>
                    </div>
                    
                    <div className="flex justify-end pt-8">
                      <button disabled={isSubmitting} className="w-full md:w-auto bg-primary text-on-primary px-12 py-5 rounded-full font-label uppercase text-sm tracking-[0.2em] shadow-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50" type="submit">
                        {isSubmitting ? 'Confirming...' : 'Confirm Reservation'}
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="animate-in fade-in zoom-in-95 duration-500 bg-emerald-50 border border-emerald-100 p-12 rounded-2xl text-center shadow-sm">
                    <span className="material-symbols-outlined text-6xl text-emerald-600 mb-6">check_circle</span>
                    <h2 className="text-3xl font-serif text-emerald-900 mb-4 italic">Reservation Confirmed</h2>
                    <p className="text-emerald-800 leading-relaxed mb-8 max-w-md mx-auto">
                      Thank you, {name}. Your table for {partySize} on {monthNames[selectedMonth]} {selectedDate}, {selectedYear} at {selectedTime} has been reserved. We look forward to hosting you!
                    </p>
                    <button onClick={() => { setStep(1); setName(''); setPhone(''); setSpecialRequests(''); setPartySize(2); }} className="text-sm font-label uppercase tracking-widest text-emerald-700 hover:text-emerald-900 underline underline-offset-4 transition-colors" type="button">
                      Make Another Reservation
                    </button>
                  </div>
                )}

              </form>
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full mt-24 bg-emerald-950 dark:bg-stone-950">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-4 md:px-12 py-16 md:py-20 max-w-screen-2xl mx-auto text-stone-100 dark:text-stone-300">
          <div>
            <span className="text-xl font-serif text-stone-50 mb-4 block">The Grove</span>
            <p className="text-stone-400 font-sans text-sm tracking-widest uppercase mb-4 leading-relaxed">Artisanal Dining <br />Tiruppur, India</p>
          </div>
          <div>
            <h4 className="font-sans text-sm tracking-widest uppercase mb-6 text-stone-50">Contact</h4>
            <p className="text-stone-400 hover:text-stone-200 transition-colors text-sm mb-2 cursor-pointer">hello@thegrove.com</p>
            <p className="text-stone-400 hover:text-stone-200 transition-colors text-sm cursor-pointer">+91 98765 43210</p>
          </div>
          <div>
            <h4 className="font-sans text-sm tracking-widest uppercase mb-6 text-stone-50">Opening Hours</h4>
            <p className="text-stone-400 text-sm">Open Daily 11 AM - 11 PM</p>
          </div>
          <div>
            <h4 className="font-sans text-sm tracking-widest uppercase mb-6 text-stone-50">Socials</h4>
            <div className="flex gap-4">
              <Link className="text-stone-400 hover:text-stone-200 underline decoration-stone-500 underline-offset-4" href="#">Instagram</Link>
              <Link className="text-stone-400 hover:text-stone-200 underline decoration-stone-500 underline-offset-4" href="#">Facebook</Link>
            </div>
          </div>
        </div>
        <div className="px-4 md:px-12 pb-12 text-center border-t border-stone-800 pt-8">
          <p className="text-stone-500 font-sans text-[10px] tracking-widest uppercase">© 2024 The Grove, Tiruppur. All rights reserved.</p>
        </div>
      </footer>



    </div>
  );
}
