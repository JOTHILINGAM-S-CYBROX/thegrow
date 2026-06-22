'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import styles from './page.module.css';

export default function Page() {
  const auth = useAuth();

  // Settings & Payment Flow states
  const [settings, setSettings] = useState({ membershipEnabled: true, loading: true });
  const [paymentFlow, setPaymentFlow] = useState('ONLINE'); // 'ONLINE' or 'IN_PERSON'
  const [lastPaymentStatus, setLastPaymentStatus] = useState('PAID'); // 'PAID', 'PENDING', 'FAILED'
  const [lastPaymentMethod, setLastPaymentMethod] = useState('ONLINE'); // 'ONLINE', 'IN_PERSON'

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.settings) {
            setSettings({
              membershipEnabled: data.settings.membershipEnabled,
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

  // Modal & Flow states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState('BASIC'); // 'BASIC' or 'PREMIUM'
  const [modalStep, setModalStep] = useState(1); // 1: Auth, 2: Aadhaar Upload, 3: Review & Verify, 4: Choose Payment, 5: Success

  // Authentication states
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  // File Upload & OCR states
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState('');
  const [ocrError, setOcrError] = useState('');

  // Form fields (extracted from Aadhaar)
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [aadhaarLastFour, setAadhaarLastFour] = useState('');
  const [calculatedAge, setCalculatedAge] = useState(0);
  const [isAgeValid, setIsAgeValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fileInputRef = useRef(null);

  // Sync auth state with step
  useEffect(() => {
    if (isModalOpen) {
      if (auth.isAuthenticated) {
        setModalStep(2); // Skip login if already authenticated
      } else {
        setModalStep(1);
      }
    }
  }, [auth.isAuthenticated, isModalOpen]);

  const openVerificationModal = (tier) => {
    setSelectedTier(tier);
    setIsModalOpen(true);
    setAuthError('');
    setAuthMessage('');
    setOcrError('');
    setSubmitError('');
    setSelectedFile(null);
    setFilePreview(null);
    if (auth.user?.name && !auth.user.name.startsWith('Customer ')) {
      setFullName(auth.user.name);
    } else {
      setFullName('');
    }
    setDob('');
    setAadhaarLastFour('');
    if (auth.isAuthenticated) {
      setModalStep(2);
    } else {
      setModalStep(1);
    }
  };

  const closeVerificationModal = () => {
    setIsModalOpen(false);
  };

  // Step 1: Send OTP via WhatsApp
  const handleSendOTP = async () => {
    setAuthError('');
    setAuthMessage('');
    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/send-whatsapp-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      const data = await res.json();

      if (data.success) {
        setAuthMessage('✅ Verification code sent to WhatsApp!');
        // Keep in login screen but show OTP input field
      } else {
        setAuthError(data.message || 'Failed to send OTP code.');
      }
    } catch (err) {
      setAuthError('Network error sending verification code.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Step 1: Verify OTP & Log In
  const handleVerifyOTP = async () => {
    setAuthError('');
    if (otpCode.length !== 6) {
      setAuthError('OTP must be exactly 6 digits.');
      return;
    }

    setAuthLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const res = await auth.login(cleanPhone, otpCode);

      if (res && res.success) {
        setAuthMessage('Logged in successfully!');
        setModalStep(2); // Advance to Aadhaar Upload step
      } else {
        setAuthError(res?.message || 'Invalid verification code.');
      }
    } catch (err) {
      setAuthError('Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Step 2: Handle File Drop / Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setOcrError('Only image files (JPEG, PNG) are allowed.');
      return;
    }
    setSelectedFile(file);
    setOcrError('');

    // File preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Step 2: Run OCR Analysis via backend
  const handleVerifyAadhaar = async (fileToUpload = selectedFile) => {
    if (!fileToUpload) {
      setOcrError('Please select or upload an image file first.');
      return;
    }

    setOcrLoading(true);
    setOcrError('');
    setOcrProgress('Uploading image...');

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      // Step simulator updates to make the UX feel premium and alive
      const progressSteps = [
        'Uploading document...',
        'Parsing layout structure...',
        'Running Tesseract.js OCR engine locally...',
        'Extracting identification text patterns...',
        'Calculating government compliance checks...'
      ];

      let stepIdx = 0;
      const progressInterval = setInterval(() => {
        if (stepIdx < progressSteps.length) {
          setOcrProgress(progressSteps[stepIdx]);
          stepIdx++;
        }
      }, 900);

      const res = await fetch('/api/memberships/verify-aadhaar', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      const data = await res.json();

      if (data.success) {
        if (data.details.name) {
          setFullName(data.details.name);
        }
        // Format DOB for HTML input tag (YYYY-MM-DD)
        let formattedDob = '';
        if (data.details.dob) {
          const parts = data.details.dob.split('/');
          if (parts.length === 3) {
            formattedDob = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          } else {
            formattedDob = data.details.dob;
          }
        }
        setDob(formattedDob);
        setAadhaarLastFour(data.details.aadhaarLastFour || '');
        setCalculatedAge(data.age);
        setIsAgeValid(data.isAdult);

        setModalStep(3); // Advance to form review
      } else {
        setOcrError(data.message || 'Failed to extract text from the Aadhaar card. Please upload a clearer image.');
      }
    } catch (err) {
      setOcrError('An error occurred during OCR verification. Please check your network connection.');
    } finally {
      setOcrLoading(false);
      setOcrProgress('');
    }
  };

  // Step 2: Directly trigger Mock Card simulation (WOW UX!)
  const handleSelectMock = async (type) => {
    setOcrLoading(true);
    setOcrError('');
    setOcrProgress('Loading mock test card...');
    try {
      const filename = type === 'adult' ? 'mock_adult.webp' : 'mock_minor.webp';
      const res = await fetch(`/images/${filename}`);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: 'image/png' });

      setSelectedFile(file);
      setFilePreview(`/images/${filename}`);

      // Pass file directly to verification
      await handleVerifyAadhaar(file);
    } catch (err) {
      setOcrError('Failed to load mock testing asset. Please try drag and drop.');
      setOcrLoading(false);
    }
  };

  // Dynamic Age calculation on form review step
  const handleDobChange = (e) => {
    const newDob = e.target.value;
    setDob(newDob);
    if (!newDob) return;

    const birthDate = new Date(newDob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    setCalculatedAge(age);
    setIsAgeValid(age >= 21);
  };

  // Submit membership registration with specific payment details
  const submitWithPayment = async (payStatus, payMethod) => {
    if (!isAgeValid) {
      setSubmitError('Verification Failed: Minors under 21 cannot register for memberships.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const formData = new FormData();
    formData.append('planType', selectedTier);
    formData.append('name', fullName);
    formData.append('dob', dob);
    formData.append('aadhaarLastFour', aadhaarLastFour);
    formData.append('file', selectedFile);
    formData.append('paymentStatus', payStatus);
    formData.append('paymentMethod', payMethod);

    try {
      const res = await fetch('/api/memberships/apply', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setLastPaymentStatus(payStatus);
        setLastPaymentMethod(payMethod);

        // Force refresh user context to reflect planType upgrade if paid immediately
        if (payStatus === 'PAID' && auth.logout) {
          await fetch('/api/auth/me');
        }
        setModalStep(5); // Advance to Success Screen
      } else {
        setSubmitError(data.message || 'Failed to complete membership enrollment.');
      }
    } catch (err) {
      setSubmitError('Network error finalizing application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!settings.loading && !settings.membershipEnabled) {
    return (
      <div className="min-h-screen bg-[#fdf9ee] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-full md:max-w-md bg-stone-50/90 backdrop-blur-xl p-12 rounded-3xl border border-stone-200 shadow-xl space-y-6">
          <span className="material-symbols-outlined text-emerald-800 text-6xl">card_membership</span>
          <h2 className="text-3xl font-serif italic text-emerald-900">Memberships Temporarily Offline</h2>
          <p className="text-stone-600 font-body text-sm leading-relaxed">
            Our membership registrations are currently offline for maintenance or event bookings. Please visit us again later or check with staff.
          </p>
          <a href="/" className="inline-block bg-emerald-800 text-white px-8 py-3 rounded-full font-label text-xs uppercase tracking-widest hover:bg-emerald-900 transition-colors">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      <main className="pt-20 md:pt-32">
        <section className="px-4 md:px-12 py-16 md:py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-screen-2xl mx-auto">
          <div className="lg:col-span-6">
            <span className="label-md uppercase tracking-[0.2em] text-on-tertiary-container font-semibold mb-6 block">The Curated Life</span>
            <h1 className="text-[clamp(2rem,4vw,4rem)] font-headline italic tracking-tight leading-tight mb-8">
              Cultivating <br />
              <span className="text-on-primary-fixed-variant">Lasting Connections</span>
            </h1>
            <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed mb-12">
              Join an exclusive community where nature meets fine dining. Our memberships are crafted for those who find solace in the grove and beauty in the bite.
            </p>
          </div>
          <div className="lg:col-span-6 relative">
            <div className="aspect-[4/5] bg-surface-container-low overflow-hidden rounded-lg">
              <img className="w-full h-full object-cover" alt="Lush green garden with sophisticated dining setup" src="/assets/ambience/08.jpg.webp" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-secondary-container/90 backdrop-blur-md p-8 max-w-xs shadow-xl rounded-sm">
              <p className="font-headline italic text-xl text-on-secondary-container mb-2">Member Highlight</p>
              <p className="text-sm text-on-secondary-fixed-variant leading-relaxed">"The Gallery is my second home. The quiet elegance of the members-only events is unmatched."</p>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low py-16 md:py-24 lg:py-32 px-4 md:px-12">
          <div className="max-w-screen-2xl mx-auto">
            <div className="mb-12 md:mb-20 text-center lg:text-left">
              <h2 className="text-[clamp(2rem,4vw,4rem)] md:text-[clamp(2rem,4vw,4rem)] font-headline mb-4">Membership Tiers</h2>
              <div className="h-1 w-24 bg-tertiary-fixed-dim"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

              {/* Saver Card */}
              <div className="bg-surface-container-lowest p-6 md:p-12 lg:p-16 w-full flex flex-col justify-between group hover:shadow-2xl transition-all duration-500 rounded-lg">
                <div>
                  <div className="flex justify-between items-start mb-8 md:mb-12">
                    <span className={`text-4xl text-on-primary-container material-symbols-outlined ${styles.materialSymbolsOutlined}`}>eco</span>
                    <span className="text-on-tertiary-fixed-variant font-label text-sm tracking-widest uppercase">The Essential</span>
                  </div>
                  <h3 className="text-[clamp(1.2rem,2vw,2rem)] font-headline mb-6 text-primary">The Grove Saver<br/>Membership</h3>
                  <ul className="space-y-3 md:space-y-6 mb-8 md:mb-12">
                    <li className="flex items-center gap-4 text-on-surface-variant">
                      <span className={`text-sm material-symbols-outlined ${styles.materialSymbolsOutlined}`}>check_circle</span>
                      <span>10% off dining Mon-Thu</span>
                    </li>
                    <li className="flex items-center gap-4 text-on-surface-variant">
                      <span className={`text-sm material-symbols-outlined ${styles.materialSymbolsOutlined}`}>check_circle</span>
                      <span>Seasonal Welcome Drink</span>
                    </li>
                    <li className="flex items-center gap-4 text-on-surface-variant">
                      <span className={`text-sm material-symbols-outlined ${styles.materialSymbolsOutlined}`}>check_circle</span>
                      <span>Birthday Dessert surprise</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-auto">
                  <div className="text-[clamp(1.2rem,2vw,2rem)] font-headline mb-6 md:mb-8">$149 <span className="text-[clamp(1rem,1.5vw,1.125rem)] font-sans font-light text-on-surface-variant italic">/ annually</span></div>
                  <button onClick={() => openVerificationModal('BASIC')} className="w-full bg-surface-variant border border-primary/10 text-primary py-4 md:py-5 px-8 font-medium hover:bg-primary hover:text-on-primary transition-all duration-300 uppercase tracking-widest text-xs min-h-[44px]">Join Now</button>
                </div>
              </div>

              {/* Elite Card */}
              <div className="bg-primary text-on-primary p-6 md:p-12 lg:p-16 w-full flex flex-col justify-between relative overflow-hidden rounded-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container rounded-full -mr-32 -mt-32 opacity-50"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8 md:mb-12">
                    <span className={`text-4xl text-tertiary-fixed material-symbols-outlined ${styles.materialSymbolsOutlined}`}>auto_awesome</span>
                    <span className="text-tertiary-fixed font-label text-sm tracking-widest uppercase">The Premium</span>
                  </div>
                  <h3 className="text-[clamp(1.2rem,2vw,2rem)] font-headline mb-6 text-on-primary">The Grove Elite<br/>Membership</h3>
                  <ul className="space-y-3 md:space-y-6 mb-8 md:mb-12">
                    <li className="flex items-center gap-4 text-on-primary-container">
                      <span className={`text-sm material-symbols-outlined ${styles.materialSymbolsOutlined}`} style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="text-on-primary">15% off dining Mon-Fri</span>
                    </li>
                    <li className="flex items-center gap-4 text-on-primary-container">
                      <span className={`text-sm material-symbols-outlined ${styles.materialSymbolsOutlined}`} style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="text-on-primary">Premium perk accessibility</span>
                    </li>
                    <li className="flex items-center gap-4 text-on-primary-container">
                      <span className={`text-sm material-symbols-outlined ${styles.materialSymbolsOutlined}`} style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="text-on-primary">Concierge dining &amp; Priority booking</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-auto relative z-10">
                  <div className="text-[clamp(1.2rem,2vw,2rem)] font-headline mb-6 md:mb-8 text-tertiary-fixed-dim">$495 <span className="text-[clamp(1rem,1.5vw,1.125rem)] font-sans font-light text-on-primary-container italic">/ annually</span></div>
                  <button onClick={() => openVerificationModal('PREMIUM')} className="w-full bg-tertiary-fixed text-on-tertiary-fixed py-4 md:py-5 px-8 font-medium hover:bg-white transition-all duration-300 uppercase tracking-widest text-xs min-h-[44px]">Join Now</button>
                </div>
              </div>

            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 lg:py-32 px-4 md:px-12 max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-rows-none md:grid-rows-2 gap-8 h-auto md:h-[600px]">
            <div className="md:col-span-2 md:row-span-2 bg-surface-container overflow-hidden rounded-lg group">
              <div className="h-full relative">
                <img className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Exclusive cocktail being prepared by a professional mixologist" src="/assets/ambience/09.jpg.webp" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex flex-col justify-end p-12">
                  <h4 className="text-white text-3xl font-headline italic mb-2">Member Events</h4>
                  <p className="text-on-primary-container text-sm">Monthly mixology and culinary workshops.</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 bg-surface-container-low p-12 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <span className={`text-5xl text-tertiary-container mb-6 material-symbols-outlined ${styles.materialSymbolsOutlined}`} style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                <h4 className="text-2xl font-headline mb-2">Digital Concierge</h4>
                <p className="text-on-surface-variant text-sm max-w-xs mx-auto">Instant table bookings through our member-only portal.</p>
              </div>
            </div>
            <div className="md:col-span-1 bg-surface-variant flex flex-col justify-center p-8 rounded-lg">
              <h4 className="text-4xl font-headline italic text-primary-container mb-2">15%</h4>
              <p className="text-xs uppercase tracking-widest font-medium">Off Events</p>
            </div>
            <div className="md:col-span-1 bg-secondary-container p-8 flex flex-col justify-center rounded-lg">
              <h4 className="text-xl font-headline text-on-secondary-container">The Cellar</h4>
              <p className="text-xs text-on-secondary-fixed-variant mt-2">Early access to rare vintages.</p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 lg:py-32 px-4 md:px-12 bg-stone-100 dark:bg-stone-900 text-center">
          <div className="w-full md:max-w-2xl mx-auto">
            <h2 className="text-[clamp(2rem,4vw,4rem)] md:text-[clamp(2rem,4vw,4rem)] font-headline mb-8 italic dark:text-stone-50">Ready to step into the gallery?</h2>
            <p className="text-[clamp(1rem,1.5vw,1.125rem)] text-on-surface-variant dark:text-stone-300 mb-6 md:mb-8 leading-relaxed">Our membership team is available to assist you in selecting the perfect tier for your lifestyle. Join today and start your journey.</p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center w-full max-w-sm sm:max-w-none mx-auto">
              <button onClick={() => openVerificationModal('BASIC')} className="w-full sm:w-auto bg-primary text-on-primary dark:bg-emerald-800 dark:text-white px-4 md:px-5 py-2.5 md:py-3 rounded-sm font-medium md:font-semibold tracking-[0.08em] uppercase text-[13px] md:text-[14px] min-h-[44px] md:min-h-[48px] lg:min-h-[52px] hover:opacity-90 transition-all flex items-center justify-center">Apply Now</button>
              <button className="w-full sm:w-auto border border-outline dark:border-stone-500 dark:text-stone-200 dark:hover:bg-stone-800 px-4 md:px-5 py-2.5 md:py-3 rounded-sm font-medium md:font-semibold tracking-[0.08em] uppercase text-[13px] md:text-[14px] min-h-[44px] md:min-h-[48px] lg:min-h-[52px] hover:bg-surface-variant transition-all flex items-center justify-center">Download Brochure</button>
            </div>
          </div>
        </section>
      </main>

      {/* VERIFICATION MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-xl bg-surface border border-outline-variant/30 text-on-surface shadow-2xl flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 border-b border-outline-variant/15 bg-surface-container-low">
              <div>
                <span className="label-sm uppercase tracking-widest text-secondary font-semibold">Verification Portal</span>
                <h3 className="font-headline text-2xl italic text-primary mt-1">
                  {selectedTier === 'BASIC' ? 'The Grove Saver Membership' : 'The Grove Elite Membership'}
                </h3>
              </div>
              <button
                onClick={closeVerificationModal}
                className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container transition rounded-full"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">

              {/* STEP 1: AUTHENTICATION */}
              {modalStep === 1 && (
                <div className="space-y-6">
                  <div className="bg-emerald-50 border border-emerald-200/50 rounded-lg p-6 flex gap-4 items-start">
                    <span className="material-symbols-outlined text-emerald-800 text-3xl">verified_user</span>
                    <div>
                      <h4 className="font-headline text-lg font-semibold text-emerald-950 mb-1">Verify Identity</h4>
                      <p className="text-sm text-emerald-800/95 leading-relaxed">
                        To sign up for a membership, we will verify your contact number. A 6-digit OTP will be dispatched via WhatsApp.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant mb-2 block">WhatsApp Phone Number</label>
                      <div className="flex gap-3">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          disabled={authLoading}
                          className="flex-1 bg-surface-container-lowest border border-outline/30 rounded-lg px-4 py-4 text-base focus:outline-none focus:border-primary transition-all font-body"
                        />
                        <button
                          onClick={handleSendOTP}
                          disabled={authLoading}
                          className="bg-primary text-on-primary font-label text-xs tracking-widest uppercase px-6 py-4 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                        >
                          {authLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                      </div>
                    </div>

                    {authMessage && (
                      <div>
                        <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant mb-2 block">Verification Code (6-digit)</label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            maxLength="6"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            disabled={authLoading}
                            className="flex-1 bg-surface-container-lowest border border-outline/30 rounded-lg px-4 py-4 text-center text-xl tracking-[0.5rem] focus:outline-none focus:border-primary transition-all font-headline font-bold"
                          />
                          <button
                            onClick={handleVerifyOTP}
                            disabled={authLoading || otpCode.length !== 6}
                            className="bg-emerald-600 text-white font-label text-xs tracking-widest uppercase px-6 py-4 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                          >
                            {authLoading ? 'Verifying...' : 'Verify & Next'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {authError && (
                    <div className="p-4 bg-error-container border border-error/20 rounded-lg text-on-error-container text-sm flex gap-2 items-center">
                      <span className="material-symbols-outlined text-lg">warning</span>
                      <span>{authError}</span>
                    </div>
                  )}

                  {authMessage && !authError && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex gap-2 items-center">
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      <span>{authMessage}</span>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: AADHAAR IMAGE UPLOAD */}
              {modalStep === 2 && (
                <div className="space-y-8">
                  <div className="text-center max-w-md mx-auto space-y-2">
                    <span className="material-symbols-outlined text-5xl text-primary-fixed-dim">id_card</span>
                    <h4 className="font-headline text-xl font-bold text-primary">Upload Aadhaar Card</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Goverment rules restrict membership and liquor service to minors. Upload your Aadhaar Card photo to verify your age (21+).
                    </p>
                  </div>

                  {/* Drag and drop zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-outline-variant/60 hover:border-primary hover:bg-surface-container-low transition-all duration-300 rounded-xl p-8 text-center cursor-pointer flex flex-col items-center justify-center gap-4 group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    {filePreview ? (
                      <div className="relative aspect-[3/2] w-48 overflow-hidden rounded border border-outline-variant bg-stone-100">
                        <img src={filePreview} alt="Aadhaar Preview" className="h-full w-full object-contain" />
                      </div>
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:scale-110 transition duration-300">cloud_upload</span>
                    )}

                    <div>
                      <p className="font-label text-sm font-semibold text-primary">
                        {selectedFile ? selectedFile.name : 'Click or Drag photo here'}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-1">Supports JPEG, PNG. Max 5MB.</p>
                    </div>
                  </div>

                  {/* Test Simulations Panel (Very clean!) */}
                  <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant/20 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-label text-xs tracking-widest uppercase text-secondary font-semibold">🧪 Developer Sandbox Testing</span>
                      <span className="bg-primary-fixed text-on-primary-fixed text-[10px] px-2 py-0.5 rounded font-label uppercase font-bold tracking-widest">Tesseract.js</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Select one of the simulated profiles to quickly verify the legal age workflow without requiring manual image uploads.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => handleSelectMock('adult')}
                        disabled={ocrLoading}
                        className="flex items-center gap-3 bg-surface-container-lowest border border-emerald-300 hover:bg-emerald-50 text-emerald-950 p-3 rounded-lg text-left transition text-xs font-semibold"
                      >
                        <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                        <div>
                          <div>Adult Profile (21+)</div>
                          <div className="text-[10px] text-emerald-800 font-normal">Name: Arjun Mehta (Age 30)</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleSelectMock('minor')}
                        disabled={ocrLoading}
                        className="flex items-center gap-3 bg-surface-container-lowest border border-error/30 hover:bg-error-container/20 text-on-error-container p-3 rounded-lg text-left transition text-xs font-semibold"
                      >
                        <span className="material-symbols-outlined text-error text-lg">cancel</span>
                        <div>
                          <div>Minor Profile (&lt;21)</div>
                          <div className="text-[10px] text-error font-normal">Name: Kabir Sharma (Age 14)</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {ocrError && (
                    <div className="p-4 bg-error-container border border-error/20 rounded-lg text-on-error-container text-sm flex gap-2 items-center">
                      <span className="material-symbols-outlined text-lg">warning</span>
                      <span>{ocrError}</span>
                    </div>
                  )}

                  {/* OCR Loading Overlay */}
                  {ocrLoading && (
                    <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant/30 flex flex-col items-center justify-center gap-4">
                      <div className="relative w-full h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
                        <div className="absolute top-0 bottom-0 left-0 bg-primary animate-pulse w-3/4"></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                        <p className="text-sm font-label text-primary italic font-medium">{ocrProgress || 'Analyzing document image...'}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-4 border-t border-outline-variant/15 pt-6">
                    <button
                      onClick={() => setModalStep(1)}
                      className="px-6 py-3 font-label text-xs uppercase tracking-widest hover:bg-surface-container transition rounded"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => handleVerifyAadhaar()}
                      disabled={ocrLoading || !selectedFile}
                      className="bg-primary text-on-primary font-label text-xs tracking-widest uppercase px-8 py-3 rounded hover:opacity-90 transition disabled:opacity-50"
                    >
                      Run OCR Scanner
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DETAILS REVIEW & VERIFICATION */}
              {modalStep === 3 && (
                <form onSubmit={(e) => { e.preventDefault(); setModalStep(4); }} className="space-y-8">
                  <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant/20 flex items-center justify-between">
                    <div>
                      <span className="label-sm uppercase tracking-widest text-on-surface-variant">Extracted Profile Status</span>
                      <h4 className="font-headline text-lg font-bold text-primary mt-1">Age Verification</h4>
                    </div>
                    {isAgeValid ? (
                      <span className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-full font-label text-xs uppercase tracking-wider font-bold">
                        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Verified (Age {calculatedAge})
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 bg-error-container border border-error/20 text-on-error-container px-4 py-2 rounded-full font-label text-xs uppercase tracking-wider font-bold animate-bounce">
                        <span className="material-symbols-outlined text-base">warning</span>
                        Restricted (Age {calculatedAge})
                      </span>
                    )}
                  </div>

                  {/* Minor Restriction Banner */}
                  {!isAgeValid && (
                    <div className="p-6 bg-error-container border-l-4 border-error rounded-r-lg text-on-error-container space-y-2">
                      <div className="flex items-center gap-2 font-headline text-lg font-bold">
                        <span className="material-symbols-outlined">gavel</span>
                        <span>Government Compliance Issue</span>
                      </div>
                      <p className="text-sm leading-relaxed">
                        We apologize, but memberships are strictly restricted to individuals aged 21 and above in compliance with local restobar liquor licensing laws. Minors are not permitted to register.
                      </p>
                    </div>
                  )}

                  {/* Interactive form fields */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant mb-2 block">Extracted Full Name</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-surface-container-lowest border border-outline/30 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-primary transition-all font-body"
                        />
                      </div>
                      <div>
                        <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant mb-2 block">Date of Birth</label>
                        <input
                          type="date"
                          required
                          value={dob}
                          onChange={handleDobChange}
                          className="w-full bg-surface-container-lowest border border-outline/30 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-primary transition-all font-body"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant mb-2 block">Aadhaar (Last 4 Digits)</label>
                        <input
                          type="text"
                          required
                          maxLength="4"
                          value={aadhaarLastFour}
                          onChange={(e) => setAadhaarLastFour(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 5678"
                          className="w-full bg-surface-container-lowest border border-outline/30 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-primary transition-all font-body tracking-wider"
                        />
                      </div>
                      <div>
                        <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant mb-2 block">Customer ID (Membership Link)</label>
                        <input
                          type="text"
                          disabled
                          value={auth.user?.phone ? `CUST-${auth.user.phone.slice(-6)}` : 'CUST-XXXXXX'}
                          className="w-full bg-surface-container-low border border-outline-variant/20 text-on-surface-variant rounded-lg px-4 py-3 text-base focus:outline-none font-body"
                        />
                      </div>
                    </div>
                  </div>

                  {submitError && (
                    <div className="p-4 bg-error-container border border-error/20 rounded-lg text-on-error-container text-sm flex gap-2 items-center">
                      <span className="material-symbols-outlined text-lg">warning</span>
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-4 border-t border-outline-variant/15 pt-6">
                    <button
                      type="button"
                      onClick={() => setModalStep(2)}
                      className="px-6 py-3 font-label text-xs uppercase tracking-widest hover:bg-surface-container transition rounded"
                    >
                      Back
                    </button>
                    {isAgeValid ? (
                      <button
                        type="submit"
                        disabled={isSubmitting || !fullName || !dob || aadhaarLastFour.length !== 4}
                        className="bg-emerald-600 text-white font-label text-xs tracking-widest uppercase px-8 py-3 rounded hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        Proceed to Payment
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="bg-stone-300 text-stone-500 font-label text-xs tracking-widest uppercase px-8 py-3 rounded cursor-not-allowed"
                      >
                        Age Check Failed
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* STEP 4: CHOOSE PAYMENT METHOD */}
              {modalStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center max-w-md mx-auto space-y-2">
                    <span className="material-symbols-outlined text-5xl text-emerald-800">payments</span>
                    <h4 className="font-headline text-xl font-bold text-primary">Choose Payment Method</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed font-body">
                      Complete your payment to activate your {selectedTier === 'BASIC' ? 'Grove Saver' : 'Grove Elite'} membership benefits.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                    {/* Option A: PhonePe Online */}
                    <button
                      onClick={() => setPaymentFlow('ONLINE')}
                      className={`flex flex-col items-center justify-center p-6 rounded-xl border text-center transition-all ${paymentFlow === 'ONLINE'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold shadow-inner'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                        }`}
                    >
                      <span className="material-symbols-outlined text-3xl text-emerald-850 mb-2">qr_code_2</span>
                      <span className="font-label text-sm uppercase tracking-wider font-bold">Online via PhonePe</span>
                      <span className="text-[10px] text-stone-500 mt-1">Instant Activation</span>
                    </button>

                    {/* Option B: Pay In Person */}
                    <button
                      onClick={() => setPaymentFlow('IN_PERSON')}
                      className={`flex flex-col items-center justify-center p-6 rounded-xl border text-center transition-all ${paymentFlow === 'IN_PERSON'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold shadow-inner'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                        }`}
                    >
                      <span className="material-symbols-outlined text-3xl text-emerald-850 mb-2">point_of_sale</span>
                      <span className="font-label text-sm uppercase tracking-wider font-bold">Pay In Person (Cash)</span>
                      <span className="text-[10px] text-stone-500 mt-1">Pay at the counter</span>
                    </button>
                  </div>

                  {/* Online Flow Simulator */}
                  {paymentFlow === 'ONLINE' && (
                    <div className="bg-stone-100 border border-stone-200 p-6 rounded-xl space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-label text-[10px] tracking-widest uppercase text-emerald-900 font-bold">📱 PhonePe UPI Gateway Simulator</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-label font-bold uppercase tracking-wider">UPI</span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed font-body">
                        Choose a simulation option below to test the integration (including the fallback admin mark-paid flow):
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          onClick={() => submitWithPayment('PAID', 'ONLINE')}
                          disabled={isSubmitting}
                          className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-label text-[10px] uppercase tracking-wider py-3 rounded-lg font-bold transition disabled:opacity-50"
                        >
                          {isSubmitting ? 'Processing...' : 'Simulate Success'}
                        </button>
                        <button
                          onClick={() => submitWithPayment('FAILED', 'ONLINE')}
                          disabled={isSubmitting}
                          className="flex-1 bg-red-650 hover:bg-red-700 text-white font-label text-[10px] uppercase tracking-wider py-3 rounded-lg font-bold transition disabled:opacity-50"
                        >
                          {isSubmitting ? 'Processing...' : 'Simulate Failure'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* In-Person Payment Instructions */}
                  {paymentFlow === 'IN_PERSON' && (
                    <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl space-y-4">
                      <p className="text-xs text-emerald-900 leading-relaxed font-body">
                        Your application details will be saved securely. When you approach the lobby counter, notify the administrator and pay the membership fee in person (Cash/UPI/Card).
                      </p>
                      <button
                        onClick={() => submitWithPayment('PENDING', 'IN_PERSON')}
                        disabled={isSubmitting}
                        className="w-full bg-emerald-850 hover:bg-emerald-900 text-white font-label text-xs uppercase tracking-widest py-3.5 rounded-lg font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? 'Submitting...' : 'Confirm & Register (Pay In-Person)'}
                      </button>
                    </div>
                  )}

                  {submitError && (
                    <div className="p-4 bg-error-container border border-error/20 rounded-lg text-on-error-container text-sm flex gap-2 items-center">
                      <span className="material-symbols-outlined text-lg">warning</span>
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-4 border-t border-outline-variant/15 pt-6">
                    <button
                      onClick={() => setModalStep(3)}
                      className="px-6 py-3 font-label text-xs uppercase tracking-widest hover:bg-stone-100 transition rounded"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: DYNAMIC STATUS CONFIRMATION */}
              {modalStep === 5 && (
                <div className="text-center py-8 space-y-6">
                  {lastPaymentStatus === 'PAID' && (
                    <>
                      <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 animate-bounce">
                        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </div>
                      <div className="space-y-2 max-w-md mx-auto">
                        <h4 className="font-headline text-3xl italic text-primary">Membership Activated!</h4>
                        <p className="text-sm text-on-surface-variant leading-relaxed font-body">
                          Welcome to **The Grove** exclusive circle! Your payment was verified successfully. Your annual perks are now active.
                        </p>
                      </div>
                    </>
                  )}

                  {lastPaymentStatus === 'PENDING' && (
                    <>
                      <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-amber-50 border-2 border-amber-500 text-amber-600 animate-pulse">
                        <span className="material-symbols-outlined text-4xl">pending_actions</span>
                      </div>
                      <div className="space-y-2 max-w-md mx-auto">
                        <h4 className="font-headline text-3xl italic text-amber-800">Registration Pending!</h4>
                        <p className="text-sm text-on-surface-variant leading-relaxed font-body">
                          Your details are saved! Please pay the membership fee at the counter. Once the administrator confirms the amount, your membership will activate instantly.
                        </p>
                      </div>
                    </>
                  )}

                  {lastPaymentStatus === 'FAILED' && (
                    <>
                      <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-50 border-2 border-red-500 text-red-600">
                        <span className="material-symbols-outlined text-4xl">error</span>
                      </div>
                      <div className="space-y-2 max-w-md mx-auto">
                        <h4 className="font-headline text-3xl italic text-red-800">Payment Unsuccessful</h4>
                        <p className="text-sm text-on-surface-variant leading-relaxed font-body">
                          The online transaction failed, but we've saved your registration details! You can pay cash/UPI directly at the counter to activate your benefits.
                        </p>
                      </div>
                    </>
                  )}

                  <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant/20 max-w-sm mx-auto text-left space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant font-label text-xs uppercase tracking-wider">Tier</span>
                      <span className="font-semibold text-primary">{selectedTier === 'BASIC' ? 'Grove Saver' : 'Grove Elite'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant font-label text-xs uppercase tracking-wider">Owner Name</span>
                      <span className="font-semibold text-primary">{fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant font-label text-xs uppercase tracking-wider">Status</span>
                      <span className={`font-semibold uppercase tracking-wider text-xs ${lastPaymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                        {lastPaymentStatus === 'PAID' ? 'Active' : 'Pending Payment'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant font-label text-xs uppercase tracking-wider">Aadhaar Last 4</span>
                      <span className="font-semibold text-primary">•••• •••• {aadhaarLastFour}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-outline-variant/15 max-w-sm mx-auto">
                    <button
                      onClick={() => {
                        closeVerificationModal();
                        window.location.reload(); // Refresh to update visual navbar states
                      }}
                      className="w-full bg-primary text-on-primary font-label text-xs tracking-widest uppercase py-4 rounded hover:opacity-90 transition font-bold"
                    >
                      Finish & Go to Portal
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="w-full py-20 px-12 bg-stone-100 dark:bg-stone-950">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 items-start">
          <div className="col-span-1 md:col-span-1">
            <div className="font-serif text-lg text-emerald-950 dark:text-emerald-50 mb-6">The Verdant Gallery</div>
            <p className="text-stone-500 text-sm leading-relaxed max-w-xs">
              Curating experiences where nature and gastronomy intertwine in the heart of the city.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="font-sans text-xs tracking-widest uppercase text-emerald-900 dark:text-emerald-500 mb-2">Explore</div>
            <Link className="text-stone-500 hover:text-emerald-900 dark:hover:text-emerald-400 transition-all hover:translate-x-1 duration-200 text-xs tracking-widest uppercase" href="#">Sustainability</Link>
            <Link className="text-stone-500 hover:text-emerald-900 dark:hover:text-emerald-400 transition-all hover:translate-x-1 duration-200 text-xs tracking-widest uppercase" href="#">Careers</Link>
          </div>
          <div className="flex flex-col gap-4">
            <div className="font-sans text-xs tracking-widest uppercase text-emerald-900 dark:text-emerald-500 mb-2">Legal</div>
            <Link className="text-stone-500 hover:text-emerald-900 dark:hover:text-emerald-400 transition-all hover:translate-x-1 duration-200 text-xs tracking-widest uppercase" href="#">Privacy Policy</Link>
            <Link className="text-stone-500 hover:text-emerald-900 dark:hover:text-emerald-400 transition-all hover:translate-x-1 duration-200 text-xs tracking-widest uppercase" href="#">Terms of Service</Link>
          </div>
          <div className="flex flex-col gap-4">
            <div className="font-sans text-xs tracking-widest uppercase text-emerald-900 dark:text-emerald-500 mb-2">Follow</div>
            <div className="flex gap-4">
              <Link className="text-stone-500 hover:text-emerald-900 dark:hover:text-emerald-400 transition-all" href="#"><span className={`material-symbols-outlined ${styles.materialSymbolsOutlined}`}>camera</span></Link>
              <Link className="text-stone-500 hover:text-emerald-900 dark:hover:text-emerald-400 transition-all" href="#"><span className={`material-symbols-outlined ${styles.materialSymbolsOutlined}`}>alternate_email</span></Link>
              <Link className="text-stone-500 hover:text-emerald-900 dark:hover:text-emerald-400 transition-all" href="#"><span className={`material-symbols-outlined ${styles.materialSymbolsOutlined}`}>pin_drop</span></Link>
            </div>
          </div>
        </div>
        <div className="max-w-screen-2xl mx-auto mt-20 pt-8 border-t border-outline-variant/10">
          <p className="font-sans text-xs tracking-widest uppercase text-stone-500">© 2024 The Verdant Gallery. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
