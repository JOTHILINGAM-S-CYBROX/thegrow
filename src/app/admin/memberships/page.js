'use client';

import { useState, useEffect, useRef } from 'react';

export default function AdminMemberships() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('ALL');
  
  // Modal for Viewing Aadhaar Image
  const [activeAadhaarFilename, setActiveAadhaarFilename] = useState('');
  const [activeMemberName, setActiveMemberName] = useState('');
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Manual Membership Form State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualStep, setManualStep] = useState(1); // 1: Aadhaar Upload & OCR, 2: Review details & register
  const [manualFile, setManualFile] = useState(null);
  const [manualFilePreview, setManualFilePreview] = useState(null);
  const [manualOcrLoading, setManualOcrLoading] = useState(false);
  const [manualOcrProgress, setManualOcrProgress] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualDob, setManualDob] = useState('');
  const [manualAadhaarLastFour, setManualAadhaarLastFour] = useState('');
  const [manualPlanType, setManualPlanType] = useState('BASIC');
  const [manualAge, setManualAge] = useState(0);
  const [isManualAgeValid, setIsManualAgeValid] = useState(false);
  const [manualError, setManualError] = useState('');
  const [manualSuccess, setManualSuccess] = useState('');
  const [manualLoading, setManualLoading] = useState(false);

  const manualFileInputRef = useRef(null);

  // Action states
  const [markingPaidId, setMarkingPaidId] = useState('');

  // Fetch verified members
  const fetchMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/memberships');
      const data = await res.json();
      if (res.ok && data.success) {
        setMembers(data.members || []);
      } else {
        setError(data.error || 'Failed to retrieve memberships list.');
      }
    } catch (err) {
      setError('Network error fetching memberships.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenViewer = (filename, name) => {
    setActiveAadhaarFilename(filename);
    setActiveMemberName(name);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setActiveAadhaarFilename('');
    setActiveMemberName('');
  };

  const handleMarkAsPaid = async (membershipId) => {
    if (!confirm('Are you sure you have received the payment for this membership in-person and want to activate it?')) {
      return;
    }
    setMarkingPaidId(membershipId);
    try {
      const res = await fetch('/api/admin/memberships/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipId, paymentDetails: 'Marked paid by admin (Cash/UPI received in person)' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Payment verified and membership activated successfully!');
        fetchMembers();
      } else {
        alert(data.error || 'Failed to update payment status.');
      }
    } catch (err) {
      alert('Network error verifying payment.');
    } finally {
      setMarkingPaidId('');
    }
  };

  const handleManualFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setManualError('Only image files (JPEG, PNG) are allowed.');
        return;
      }
      setManualFile(file);
      setManualError('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setManualFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualVerifyAadhaar = async (fileToUpload = manualFile) => {
    if (!fileToUpload) {
      setManualError('Please select or upload an image file first.');
      return;
    }

    setManualOcrLoading(true);
    setManualError('');
    setManualOcrProgress('Uploading image...');

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const progressSteps = [
        'Uploading document...',
        'Parsing layout structure...',
        'Running Tesseract.js OCR engine locally...',
        'Extracting identification text patterns...'
      ];
      
      let stepIdx = 0;
      const progressInterval = setInterval(() => {
        if (stepIdx < progressSteps.length) {
          setManualOcrProgress(progressSteps[stepIdx]);
          stepIdx++;
        }
      }, 700);

      const res = await fetch('/api/memberships/verify-aadhaar', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      const data = await res.json();

      if (data.success) {
        if (data.details.name) {
          setManualName(data.details.name);
        }
        let formattedDob = '';
        if (data.details.dob) {
          const parts = data.details.dob.split('/');
          if (parts.length === 3) {
            formattedDob = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          } else {
            formattedDob = data.details.dob;
          }
        }
        setManualDob(formattedDob);
        setManualAadhaarLastFour(data.details.aadhaarLastFour || '');
        setManualAge(data.age);
        setIsManualAgeValid(data.isAdult);
        setManualStep(2); // Go to review step
      } else {
        setManualError(data.message || 'Failed to extract text. Please upload a clearer image.');
      }
    } catch (err) {
      setManualError('An error occurred during OCR verification.');
    } finally {
      setManualOcrLoading(false);
      setManualOcrProgress('');
    }
  };

  const handleManualSelectMock = async (type) => {
    setManualOcrLoading(true);
    setManualError('');
    setManualOcrProgress('Loading mock test card...');
    try {
      const filename = type === 'adult' ? 'mock_adult.webp' : 'mock_minor.webp';
      const res = await fetch(`/images/${filename}`);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: 'image/png' });
      
      setManualFile(file);
      setManualFilePreview(`/images/${filename}`);
      await handleManualVerifyAadhaar(file);
    } catch (err) {
      setManualError('Failed to load mock testing asset.');
      setManualOcrLoading(false);
    }
  };

  const handleManualDobChange = (e) => {
    const newDob = e.target.value;
    setManualDob(newDob);
    if (!newDob) return;
    
    const birthDate = new Date(newDob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    setManualAge(age);
    setIsManualAgeValid(age >= 21);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!isManualAgeValid) {
      setManualError('Verification Failed: Minors under 21 cannot register for memberships.');
      return;
    }
    setManualError('');
    setManualSuccess('');
    setManualLoading(true);

    const formData = new FormData();
    formData.append('phone', manualPhone);
    formData.append('name', manualName);
    formData.append('dob', manualDob);
    formData.append('aadhaarLastFour', manualAadhaarLastFour);
    formData.append('planType', manualPlanType);
    formData.append('file', manualFile);

    try {
      const res = await fetch('/api/admin/memberships/manual-create', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setManualSuccess('Membership manually registered and activated successfully!');
        setManualPhone('');
        setManualName('');
        setManualDob('');
        setManualAadhaarLastFour('');
        setManualPlanType('BASIC');
        setManualFile(null);
        setManualFilePreview(null);
        setManualStep(1);
        fetchMembers();
      } else {
        setManualError(data.error || 'Failed to create membership.');
      }
    } catch (err) {
      setManualError('Network error registering membership.');
    } finally {
      setManualLoading(false);
    }
  };

  // Helper: Format Date of Birth
  const formatDOB = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  // Helper: Format Date (timestamp)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateString;
    }
  };

  // Filtered members
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm) ||
      member.customerNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesPlan = 
      selectedPlanFilter === 'ALL' || 
      member.planType === selectedPlanFilter;
      
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="p-8 space-y-8 min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[clamp(2rem,6vw,3rem)] font-serif italic text-stone-850 mb-2">Memberships Management</h2>
          <p className="text-stone-500 font-body text-sm">
            Monitor verified members, check age compliance, and review uploaded identity documents.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-label text-xs uppercase tracking-widest px-5 py-3 rounded-lg shadow-sm transition"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Register Offline
          </button>
          <button 
            onClick={fetchMembers}
            className="flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-label text-xs uppercase tracking-widest px-5 py-3 rounded-lg border border-stone-200 transition"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Refresh List
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">search</span>
          <input
            type="text"
            placeholder="Search by name, phone, or customer ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 transition"
          />
        </div>
        
        <div className="flex gap-3">
          {['ALL', 'BASIC', 'PREMIUM'].map(plan => (
            <button
              key={plan}
              onClick={() => setSelectedPlanFilter(plan)}
              className={`px-4 py-2 text-xs font-label uppercase tracking-wider rounded-lg border transition ${
                selectedPlanFilter === plan
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                  : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-600'
              }`}
            >
              {plan === 'ALL' ? 'All Plans' : plan === 'BASIC' ? 'Grove Saver (Basic)' : 'Grove Elite (Premium)'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table/Grid */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200/50 p-16 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-stone-500 text-sm font-label">Retrieving secure membership files...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm border border-error/20 p-8 text-center text-on-error-container bg-error-container/20">
          <span className="material-symbols-outlined text-4xl text-error mb-2">warning</span>
          <p className="font-semibold text-lg">Failed to load memberships</p>
          <p className="text-sm text-stone-500 mt-1">{error}</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200/50 p-16 text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-stone-300">group_off</span>
          <div>
            <h4 className="font-headline text-xl font-bold text-stone-700">No Members Found</h4>
            <p className="text-sm text-stone-500 mt-1">
              {searchTerm || selectedPlanFilter !== 'ALL' 
                ? 'Try adjusting your search query or filter options.'
                : 'Customers who pass Aadhaar age verification will appear here.'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100 text-stone-500 text-xs font-label uppercase tracking-wider">
                  <th className="px-6 py-4">Customer ID</th>
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Plan Tier</th>
                  <th className="px-6 py-4">Verified DOB</th>
                  <th className="px-6 py-4">Aadhaar (Last 4)</th>
                  <th className="px-6 py-4">Pay Method</th>
                  <th className="px-6 py-4">Pay Status</th>
                  <th className="px-6 py-4">Verification Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-body text-sm text-stone-700">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-stone-50/50 transition">
                    <td className="px-6 py-4 font-mono text-xs text-stone-500">{member.customerNumber}</td>
                    <td className="px-6 py-4 font-semibold text-stone-900">{member.name}</td>
                    <td className="px-6 py-4">{member.phone}</td>
                    <td className="px-6 py-4">
                      {member.planType === 'PREMIUM' ? (
                        <span className="bg-purple-100 text-purple-800 border border-purple-200 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider">Grove Elite</span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider">Grove Saver</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>{formatDOB(member.dob)}</div>
                      <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Age Verified</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono bg-stone-100 border border-stone-200 px-2 py-1 rounded text-xs">
                        •••• •••• {member.aadhaarLastFour}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {member.paymentMethod === 'IN_PERSON' ? (
                        <span className="inline-flex items-center gap-1 text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded text-xs uppercase tracking-wider font-semibold">
                          <span className="material-symbols-outlined text-[10px]">payments</span>
                          In-Person
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-150 px-2 py-0.5 rounded text-xs uppercase tracking-wider font-semibold">
                          <span className="material-symbols-outlined text-[10px]">qr_code_2</span>
                          Online
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {member.paymentStatus === 'PAID' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-850 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded text-xs uppercase tracking-wider font-bold">
                          <span className="material-symbols-outlined text-[10px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                          Paid
                        </span>
                      ) : member.paymentStatus === 'FAILED' ? (
                        <span className="inline-flex items-center gap-1 text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-xs uppercase tracking-wider font-bold">
                          <span className="material-symbols-outlined text-[10px]">error</span>
                          Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-xs uppercase tracking-wider font-bold animate-pulse">
                          <span className="material-symbols-outlined text-[10px]">pending_actions</span>
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-500">{formatDate(member.createdAt)}</td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2 mt-1">
                      {member.aadhaarImage && member.aadhaarImage !== 'manual_admin_registration.webp' ? (
                        <button
                          onClick={() => handleOpenViewer(member.aadhaarImage, member.name)}
                          className="inline-flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200/50 text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded font-bold transition shadow-sm"
                        >
                          <span className="material-symbols-outlined text-xs">visibility</span>
                          Card
                        </button>
                      ) : (
                        <span className="text-[10px] text-stone-400 italic mr-2">No Image</span>
                      )}

                      {(member.paymentStatus === 'PENDING' || member.paymentStatus === 'FAILED') && (
                        <button
                          onClick={() => handleMarkAsPaid(member.id)}
                          disabled={markingPaidId === member.id}
                          className="inline-flex items-center gap-1 bg-emerald-800 hover:bg-emerald-900 text-white border border-emerald-950 text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded font-bold transition shadow-sm disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-xs">paid</span>
                          {markingPaidId === member.id ? '...' : 'Mark Paid'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECURE AADHAAR IMAGE VIEWER MODAL */}
      {isViewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-xl bg-white border border-stone-200 text-stone-850 shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-stone-100 bg-stone-50">
              <div>
                <span className="label-sm uppercase tracking-widest text-emerald-700 font-bold">Secure Document Access</span>
                <h3 className="font-serif italic text-2xl text-stone-800 mt-1">Aadhaar Card: {activeMemberName}</h3>
              </div>
              <button 
                onClick={handleCloseViewer}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition rounded-full"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Modal Image Area */}
            <div className="flex-1 overflow-auto p-8 bg-stone-100/50 flex items-center justify-center min-h-[400px]">
              {/* Pointing directly to our secure proxy endpoint.
                  Since cookies are sent, it will authenticate properly on the server. */}
              <img 
                src={`/api/admin/memberships/aadhaar-image/${activeAadhaarFilename}`} 
                alt={`${activeMemberName} Aadhaar Document`} 
                className="max-h-[60vh] max-w-full object-contain rounded-lg border border-stone-200 shadow"
                onError={(e) => {
                  e.target.src = '';
                  e.target.style.display = 'none';
                  setError('Failed to load secure document image.');
                }}
              />
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center px-8 py-5 border-t border-stone-100 bg-stone-50 text-xs text-stone-500">
              <div className="flex items-center gap-1 text-emerald-700 font-bold uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">security</span>
                Admin Encrypted Access
              </div>
              <button
                onClick={handleCloseViewer}
                className="bg-stone-800 hover:bg-stone-900 text-white font-label text-xs uppercase tracking-widest px-6 py-3 rounded-lg transition font-bold"
              >
                Close Document
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MANUAL MEMBERSHIP REGISTRATION MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-xl overflow-hidden rounded-xl bg-white border border-stone-200 text-stone-850 shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-stone-100 bg-stone-50">
              <div>
                <span className="label-sm uppercase tracking-widest text-emerald-700 font-bold">Offline Registration</span>
                <h3 className="font-serif italic text-2xl text-stone-800 mt-1">Register Customer Membership</h3>
              </div>
              <button 
                onClick={() => {
                  setIsManualModalOpen(false);
                  setManualError('');
                  setManualSuccess('');
                  setManualFile(null);
                  setManualFilePreview(null);
                  setManualStep(1);
                }}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition rounded-full"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-8">
              
              {manualError && (
                <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex gap-2 items-center">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  <span>{manualError}</span>
                </div>
              )}

              {manualSuccess && (
                <div className="p-4 mb-6 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-850 text-xs flex gap-2 items-center">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>{manualSuccess}</span>
                </div>
              )}

              {/* STEP 1: AADHAAR UPLOAD & OCR */}
              {manualStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center max-w-md mx-auto space-y-2">
                    <span className="material-symbols-outlined text-5xl text-emerald-850">id_card</span>
                    <h4 className="font-headline text-lg font-bold text-stone-800">Upload Aadhaar Card</h4>
                    <p className="text-xs text-stone-500 leading-relaxed font-body">
                      Scan the customer&apos;s Aadhaar Card to extract identity details and verify age compliance (21+).
                    </p>
                  </div>

                  {/* Drag and drop zone */}
                  <div 
                    onClick={() => manualFileInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-300 hover:border-emerald-700 hover:bg-stone-50 transition rounded-xl p-8 text-center cursor-pointer flex flex-col items-center justify-center gap-3 group"
                  >
                    <input
                      type="file"
                      ref={manualFileInputRef}
                      onChange={handleManualFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {manualFilePreview ? (
                      <div className="relative aspect-[3/2] w-48 overflow-hidden rounded border border-stone-200 bg-stone-100">
                        <img src={manualFilePreview} alt="Aadhaar Preview" className="h-full w-full object-contain" />
                      </div>
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-stone-400 group-hover:scale-110 transition">cloud_upload</span>
                    )}
                    
                    <div>
                      <p className="font-label text-xs font-semibold text-emerald-800">
                        {manualFile ? manualFile.name : 'Click or Drag photo here'}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-1">Supports JPEG, PNG. Max 5MB.</p>
                    </div>
                  </div>

                  {/* Sandbox test */}
                  <div className="bg-stone-50 p-4 rounded-lg border border-stone-200/50 space-y-3">
                    <span className="font-label text-[10px] tracking-widest uppercase text-stone-500 font-bold block font-sans">🧪 Admin Sandbox Test Profiles</span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleManualSelectMock('adult')}
                        disabled={manualOcrLoading}
                        className="flex items-center gap-2 bg-white border border-emerald-250 hover:bg-emerald-50 text-emerald-950 p-2.5 rounded-lg text-left transition text-[11px] font-semibold"
                      >
                        <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                        <div>
                          <div>Adult Profile (21+)</div>
                          <div className="text-[9px] text-stone-500 font-normal">Arjun Mehta (Age 30)</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => handleManualSelectMock('minor')}
                        disabled={manualOcrLoading}
                        className="flex items-center gap-2 bg-white border border-red-200 hover:bg-red-50 text-red-950 p-2.5 rounded-lg text-left transition text-[11px] font-semibold"
                      >
                        <span className="material-symbols-outlined text-red-650 text-sm">cancel</span>
                        <div>
                          <div>Minor Profile (&lt;21)</div>
                          <div className="text-[9px] text-stone-500 font-normal">Kabir Sharma (Age 14)</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {manualOcrLoading && (
                    <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 flex flex-col items-center justify-center gap-3">
                      <div className="relative w-full h-1 bg-stone-200 rounded-full overflow-hidden">
                        <div className="absolute top-0 bottom-0 left-0 bg-emerald-800 animate-pulse w-3/4"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-3.5 w-3.5 border-2 border-emerald-800 border-t-transparent rounded-full"></div>
                        <p className="text-xs font-label text-emerald-900 italic font-medium">{manualOcrProgress || 'Analyzing document...'}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 border-t border-stone-100 pt-5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualModalOpen(false);
                        setManualError('');
                        setManualSuccess('');
                        setManualFile(null);
                        setManualFilePreview(null);
                      }}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-600 font-label text-xs uppercase tracking-widest px-5 py-3 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleManualVerifyAadhaar()}
                      disabled={manualOcrLoading || !manualFile}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white font-label text-xs uppercase tracking-widest px-6 py-3 rounded-lg transition disabled:opacity-50"
                    >
                      Scan Aadhaar Card
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: REVIEW & SUBMIT */}
              {manualStep === 2 && (
                <form onSubmit={handleManualSubmit} className="space-y-5">
                  <div className="bg-stone-50 p-4 rounded-lg border border-stone-200/50 flex items-center justify-between">
                    <div>
                      <span className="font-label text-[10px] tracking-widest uppercase text-stone-500">Compliance Age Check</span>
                      <h4 className="font-serif italic font-bold text-stone-850 mt-0.5">Verification Result</h4>
                    </div>
                    {isManualAgeValid ? (
                      <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-250 text-emerald-800 px-3.5 py-1.5 rounded-full font-label text-[10px] uppercase tracking-wider font-bold">
                        <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                        Verified (Age {manualAge})
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 bg-red-50 border border-red-250 text-red-800 px-3.5 py-1.5 rounded-full font-label text-[10px] uppercase tracking-wider font-bold animate-bounce">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        Restricted (Age {manualAge})
                      </span>
                    )}
                  </div>

                  {!isManualAgeValid && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-650 text-red-900 text-xs leading-relaxed font-body">
                      <strong>Restricted Profile:</strong> Minors under 21 cannot register for memberships. You are not allowed to override this compliance constraint.
                    </div>
                  )}

                  <div>
                    <label className="font-label text-[10px] tracking-widest uppercase text-stone-500 mb-1.5 block font-bold font-sans">WhatsApp Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 transition"
                    />
                  </div>

                  <div>
                    <label className="font-label text-[10px] tracking-widest uppercase text-stone-500 mb-1.5 block font-bold font-sans">Full Name (From ID)</label>
                    <input
                      type="text"
                      required
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-label text-[10px] tracking-widest uppercase text-stone-500 mb-1.5 block font-bold font-sans">Date of Birth</label>
                      <input
                        type="date"
                        required
                        value={manualDob}
                        onChange={handleManualDobChange}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 transition"
                      />
                    </div>
                    <div>
                      <label className="font-label text-[10px] tracking-widest uppercase text-stone-500 mb-1.5 block font-bold font-sans">Aadhaar Last 4 Digits</label>
                      <input
                        type="text"
                        required
                        maxLength="4"
                        value={manualAadhaarLastFour}
                        onChange={(e) => setManualAadhaarLastFour(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 transition tracking-wider"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-label text-[10px] tracking-widest uppercase text-stone-500 mb-1.5 block font-bold font-sans">Plan Tier</label>
                    <div className="flex gap-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer bg-stone-50 border border-stone-200/50 p-3 rounded-lg flex-1">
                        <input
                          type="radio"
                          name="manualPlan"
                          value="BASIC"
                          checked={manualPlanType === 'BASIC'}
                          onChange={() => setManualPlanType('BASIC')}
                          className="w-4 h-4 text-emerald-800 focus:ring-emerald-700"
                        />
                        <span className="text-xs font-label uppercase tracking-wider text-stone-700">Grove Saver</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer bg-stone-50 border border-stone-200/50 p-3 rounded-lg flex-1">
                        <input
                          type="radio"
                          name="manualPlan"
                          value="PREMIUM"
                          checked={manualPlanType === 'PREMIUM'}
                          onChange={() => setManualPlanType('PREMIUM')}
                          className="w-4 h-4 text-emerald-800 focus:ring-emerald-700"
                        />
                        <span className="text-xs font-label uppercase tracking-wider text-stone-700">Grove Elite</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setManualStep(1)}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-600 font-label text-xs uppercase tracking-widest px-5 py-3 rounded-lg transition"
                    >
                      Back
                    </button>
                    {isManualAgeValid ? (
                      <button
                        type="submit"
                        disabled={manualLoading || !manualPhone || !manualName || !manualDob || manualAadhaarLastFour.length !== 4}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white font-label text-xs uppercase tracking-widest px-6 py-3 rounded-lg transition font-bold disabled:opacity-50"
                      >
                        {manualLoading ? 'Activating...' : 'Mark Paid & Activate'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="bg-stone-300 text-stone-500 font-label text-xs tracking-widest uppercase px-6 py-3 rounded cursor-not-allowed"
                      >
                        Age Restrict Fail
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
