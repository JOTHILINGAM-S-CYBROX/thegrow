import React, { useRef } from 'react';

const MembershipCard = ({ member, onClose }) => {
  const cardRef = useRef();

  const handlePrint = () => {
    // In a real scenario, this would open a print window specifically for the card
    const printContent = cardRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    // Minimal print setup
    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; padding: 2rem;">
        ${printContent}
      </div>
    `;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  if (!member) return null;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center p-4 bg-stone-950/90 backdrop-blur-md">
      
      {/* Controls */}
      <div className="mb-6 flex gap-4 w-full max-w-[800px] justify-end">
        <button 
          onClick={handlePrint}
          className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2 rounded-md font-label uppercase tracking-widest text-xs font-bold flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">print</span>
          Print Card
        </button>
        <button 
          onClick={onClose}
          className="bg-stone-800 hover:bg-stone-700 text-white px-6 py-2 rounded-md font-label uppercase tracking-widest text-xs font-bold flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">close</span>
          Close
        </button>
      </div>

      {/* Printable Card Area */}
      <div 
        ref={cardRef} 
        className="relative bg-stone-100 overflow-hidden shadow-2xl"
        style={{
          width: '800px', // Standard ID Card aspect ratio scaled up for high res
          height: '500px',
          borderRadius: '24px',
          // A subtle gradient to mimic the provided design background
          background: 'linear-gradient(135deg, #d3e1d1 0%, #f4f6ec 20%, #f4f6ec 80%, #d3e1d1 100%)',
          fontFamily: "'Times New Roman', serif"
        }}
      >
        {/* Decorative corner swooshes (mimicking the leafy overlay) */}
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-emerald-900/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-24 -right-16 w-80 h-80 bg-emerald-900/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-900/5 rounded-full blur-xl"></div>
        
        {/* Wine Bottle Watermark (Simulated) */}
        <div className="absolute bottom-10 right-10 text-emerald-900/5 select-none pointer-events-none" style={{ transform: 'scale(8) rotate(-10deg)', transformOrigin: 'bottom right' }}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>wine_bar</span>
        </div>
        <div className="absolute bottom-10 right-28 text-emerald-900/5 select-none pointer-events-none" style={{ transform: 'scale(10) rotate(5deg)', transformOrigin: 'bottom right' }}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>liquor</span>
        </div>

        {/* Big G Watermark */}
        <div className="absolute top-1/4 right-20 text-emerald-900/5 font-serif select-none pointer-events-none" style={{ fontSize: '300px', lineHeight: 1 }}>
          G
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col items-center pt-8 pb-10 px-16 h-full border-[10px] border-transparent" style={{boxShadow: 'inset 0 0 0 1px rgba(6, 78, 59, 0.1)', borderRadius: '24px'}}>
          
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-6 text-[#2A442A]">
            <div className="w-20 h-20 border-2 border-[#2A442A] rounded-full flex items-center justify-center mb-2 relative bg-white/50">
              <span className="font-serif text-5xl font-bold italic mr-1">G</span>
              {/* Leaf detail mock */}
              <span className="material-symbols-outlined absolute -left-2 bottom-2 text-3xl" style={{ fontVariationSettings: "'FILL' 1", transform: 'rotate(-45deg)' }}>eco</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-serif uppercase tracking-[0.3em] font-bold">
              <span>—</span>
              <div className="text-center">
                <div className="text-xl tracking-[0.4em]">THE GROVE</div>
                <div className="text-[8px] tracking-[0.5em] mt-1 text-[#2A442A]/70">RESTO • BAR</div>
              </div>
              <span>—</span>
            </div>
          </div>

          {/* Suthy Running Club */}
          <h1 className="text-5xl font-bold font-serif text-[#2A442A] mb-2 text-center" style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.8)' }}>
            SUTHY RUNNING CLUB
          </h1>
          
          <div className="flex items-center justify-center gap-4 w-full mb-6 text-[#2A442A]">
            <div className="h-px bg-[#2A442A]/30 flex-1 max-w-[150px]"></div>
            <h2 className="text-2xl font-serif italic font-light tracking-wide">Exclusive Membership</h2>
            <div className="h-px bg-[#2A442A]/30 flex-1 max-w-[150px]"></div>
          </div>

          {/* Membership Card Ribbon */}
          <div className="bg-[#2A442A] text-[#f4f6ec] px-10 py-2 rounded mb-8 relative flex items-center gap-4 border border-[#1a2d1a]">
            <span className="text-xs">✦</span>
            <span className="text-xl uppercase tracking-[0.3em] font-serif font-bold">Membership Card</span>
            <span className="text-xs">✦</span>
          </div>

          {/* Member Details */}
          <div className="w-full max-w-2xl space-y-4">
            
            <div className="flex items-center gap-6 border-b border-[#2A442A]/20 pb-3">
              <div className="w-12 h-12 bg-[#2A442A] rounded-full flex items-center justify-center text-white border-4 border-white/50 shadow-sm">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              </div>
              <div className="flex-1 flex text-[#2A442A]">
                <span className="w-48 text-base font-sans tracking-widest uppercase font-semibold">Member Name</span>
                <span className="mr-4">:</span>
                <span className="text-2xl font-serif font-bold">{member.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-6 border-b border-[#2A442A]/20 pb-3">
              <div className="w-12 h-12 bg-[#2A442A] rounded-full flex items-center justify-center text-white border-4 border-white/50 shadow-sm">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
              </div>
              <div className="flex-1 flex text-[#2A442A] items-center">
                <span className="w-48 text-base font-sans tracking-widest uppercase font-semibold">Membership ID</span>
                <span className="mr-4">:</span>
                <span className="text-2xl font-serif font-bold tracking-wider">SRC TG {member.customerNumber?.replace('CUST-', '') || member.aadhaarLastFour}</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default MembershipCard;
