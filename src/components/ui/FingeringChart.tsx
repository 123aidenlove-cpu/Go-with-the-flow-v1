import React from 'react';

interface FingeringChartProps {
  onChange?: (fingering: string) => void;
  fingeringString?: string;
  interactive?: boolean;
}

export const FingeringChart: React.FC<FingeringChartProps> = ({ fingeringString = "", interactive = false, onChange }) => {
  const active = new Set<string>();
  
  const toggleKey = (id: string) => {
    if (!interactive || !onChange) return;
    const newActive = new Set(active);
    if (newActive.has(id)) newActive.delete(id);
    else newActive.add(id);
    // Generic order: T, 1, 2, 3, 4, 5, 6
    const order = ['T', '1', '2', '3', '4', '5', '6'];
    const sorted = Array.from(newActive).sort((a, b) => order.indexOf(a) - order.indexOf(b));
    onChange(sorted.join('-'));
  };

  const s = fingeringString.toLowerCase();
  
  if (s.includes('thumb')) active.add('thumb');
  if (s.includes('8ve') || s.includes('register') || s.includes('+8ve')) active.add('register');
  if (s.includes('no thumb')) active.delete('thumb');

  // Parse main holes robustly
  const parts = fingeringString.split(',').map(p => p.trim().toLowerCase());
  const holeGroups = parts.filter(p => /^[123_\s]+$/.test(p) && p.length > 0);
  
  if (holeGroups.length > 0) {
    const lh = holeGroups[0];
    if (lh.includes('1')) active.add('LH1');
    if (lh.includes('2')) active.add('LH2');
    if (lh.includes('3')) active.add('LH3');
  }
  if (holeGroups.length > 1) {
    const rh = holeGroups[1];
    if (rh.includes('1')) active.add('RH1');
    if (rh.includes('2')) active.add('RH2');
    if (rh.includes('3')) active.add('RH3');
  }

  // Side Keys
  if (s.includes('sk1') || s.includes('side 1')) active.add('SK1');
  if (s.includes('sk2') || s.includes('side 2')) active.add('SK2');
  if (s.includes('sk3') || s.includes('side 3')) active.add('SK3');
  if (s.includes('sk4') || s.includes('side 4')) active.add('SK4');
  if (s.includes('side key') || s.includes('side of pointer')) active.add('SK1');

  // Pointer
  if (s.includes(' a ') || s.includes('a key') || s.match(/\ba\b/)) active.add('A');
  if (s.includes('g#') || s.includes('ab')) active.add('G#');

  // Banana Keys
  if (s.includes('banana')) {
    if (s.includes('l banana') || s.includes('left banana')) active.add('L_Banana');
    else active.add('R_Banana');
  }

  // Exact ID fallback for strict mode
  fingeringString.split('-').forEach(t => {
    if (['thumb','register','LH1','LH2','LH3','RH1','RH2','RH3','SK1','SK2','SK3','SK4','A','G#','L1','L2','L3','L4','R1','R2','R3','R4','L_Banana','R_Banana'].includes(t)) {
      active.add(t);
    }
  });

  // Left Pinky
  if (s.includes('l1') || s.includes('left 1')) active.add('L1');
  if (s.includes('l2') || s.includes('left 2')) active.add('L2');
  if (s.includes('l3') || s.includes('left 3')) active.add('L3');
  if (s.includes('l4') || s.includes('left 4')) active.add('L4');
  if (s.includes('left pinky') || s.includes('l pinky')) active.add('L1'); // default to L1

  // Right Pinky
  if (s.includes('r1') || s.includes('right 1')) active.add('R1');
  if (s.includes('r2') || s.includes('right 2')) active.add('R2');
  if (s.includes('r3') || s.includes('right 3')) active.add('R3');
  if (s.includes('r4') || s.includes('right 4')) active.add('R4');
  if (s.includes('right pinky') || s.includes('r pinky') || s.includes('r2 pinky')) active.add('R2'); // common

  const hasRightPinky = active.has('R1') || active.has('R2') || active.has('R3') || active.has('R4');
  const hasAdvancedLeft = true; // Always show thumb/left side
  const hasAdvancedRight = active.has('L1') || active.has('L2') || active.has('L3') || active.has('L4');
  const isWide = hasAdvancedLeft || hasAdvancedRight;

  const Hole = ({ id, label, className = "" }: { id: string, label?: string, className?: string }) => {
    const isFilled = active.has(id);
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div 
          onClick={() => toggleKey(id)}
          className={`w-8 h-8 rounded-full border-[3px] transition-all duration-300 flex items-center justify-center ${interactive ? 'cursor-pointer hover:border-slate-400' : ''} ${isFilled ? 'bg-slate-900 border-slate-900 shadow-md scale-105' : 'bg-white border-slate-300'}`}>
          {label && <span className={`text-[9px] font-black uppercase tracking-widest ${isFilled ? 'text-white' : 'text-slate-400'}`}>{label}</span>}
        </div>
      </div>
    );
  };

  const Pill = ({ id, label, className = "", vertical = false }: { id: string, label: string, className?: string, vertical?: boolean }) => {
    const isFilled = active.has(id);
    return (
      <div 
        onClick={() => toggleKey(id)}
        className={`border-[3px] rounded-full transition-all duration-300 flex items-center justify-center ${interactive ? 'cursor-pointer hover:border-slate-400' : ''} ${isFilled ? 'bg-slate-900 border-slate-900 shadow-md scale-105' : 'bg-white border-slate-300'} ${vertical ? 'w-6 h-12' : 'w-12 h-6'} ${className}`}>
        <span className={`text-[8px] font-black uppercase tracking-widest ${isFilled ? 'text-white' : 'text-slate-400'}`}>{label}</span>
      </div>
    );
  };

  const BananaKey = ({ id }: { id: string }) => {
    const isFilled = active.has(id);
    return <div onClick={() => toggleKey(id)} className={`w-8 h-[6px] rounded-full border-[2px] transition-all duration-300 ${interactive ? 'cursor-pointer hover:border-slate-400' : ''} ${isFilled ? 'bg-slate-900 border-slate-900 shadow-md scale-105' : 'bg-white border-slate-300'}`} />;
  };

  return (
    <div className={`bg-[#f8fafc] border-2 border-slate-200 rounded-[2rem] p-6 flex flex-col shadow-inner relative overflow-hidden transition-all duration-500 mx-auto ${isWide ? 'w-[280px]' : 'w-[140px]'}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
      
      <div className="relative z-10 w-full h-[400px] flex justify-center">
        
        {/* Left Column (Pointer, Register, Side Keys) */}
        {hasAdvancedLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-20 flex flex-col items-end py-4 gap-8">
            <div className="flex flex-col gap-2 items-end mt-4">
              <div className="flex flex-col items-center gap-1 mb-2">
                {(interactive || active.has('register')) && <Pill id="register" label="8ve" vertical className="h-10" />}
                <Hole id="thumb" label="T" />
              </div>
            </div>
            
            {(interactive || active.has('SK1') || active.has('SK2') || active.has('SK3') || active.has('SK4')) && (
              <div className="flex flex-col gap-1 items-end mt-12">
                <Pill id="SK4" label="SK4" className="!w-8" />
                <Pill id="SK3" label="SK3" className="!w-8" />
                <Pill id="SK2" label="SK2" className="!w-8" />
                <Pill id="SK1" label="SK1" className="!w-8" />
              </div>
            )}

            {/* Right Pinky Cluster (Appears near RH3 on left side) */}
            {(interactive || active.has('R1') || active.has('R2') || active.has('R3') || active.has('R4')) && (
              <div className="absolute top-[320px] right-2 grid grid-cols-2 gap-2 w-16">
                <Pill id="R3" label="R3" className="w-8" />
                <Pill id="R1" label="R1" className="w-8" />
                <Pill id="R4" label="R4" className="w-8" />
                <Pill id="R2" label="R2" className="w-8" />
              </div>
            )}
          </div>
        )}

        {/* Center Column (Main Holes) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-16 border-x-2 border-slate-200/50 bg-slate-100/50 flex flex-col items-center py-2 rounded-full">
          
          <div className="flex flex-col gap-2 mb-2 mt-16 relative">
            
            {/* Front Pointer Keys (A, G#) directly above LH1 */}
            {(interactive || active.has('A') || active.has('G#')) && (
              <div className="absolute -top-6 left-1/2">
                <Pill id="A" label="A" vertical className="h-10 absolute -left-3 bottom-0" />
                <Pill id="G#" label="G#" vertical className="h-10 absolute left-4 -bottom-3" />
              </div>
            )}

            <Hole id="LH1" />
            <div className="relative flex justify-center w-full">
              <Hole id="LH2" />
              <div className="absolute -left-6 -bottom-3 z-10">
                <BananaKey id="L_Banana" />
              </div>
            </div>
            <div className="relative flex justify-center w-full">
              <Hole id="LH3" />
              {(interactive || hasAdvancedRight) && (
                <Pill id="L4" label="L4" className="w-10 absolute -right-[52px] top-2 z-10" />
              )}
            </div>
          </div>

          <div className="w-full h-[2px] bg-slate-300 my-2" />
          <div className="flex flex-col gap-2">
            <Hole id="RH1" />
            <div className="relative flex justify-center w-full">
              <Hole id="RH2" />
              <div className="absolute -left-6 -bottom-3 z-10">
                <BananaKey id="R_Banana" />
              </div>
            </div>
            <Hole id="RH3" />
          </div>
        </div>

        {/* Right Column (Left Pinky Cluster only) */}
        {(interactive || hasAdvancedRight) && (
          <div className="absolute right-0 top-0 bottom-0 w-16 flex flex-col py-4 gap-12">
            {/* Left Pinky Cluster (Appears near LH3) */}
            {(interactive || active.has('L1') || active.has('L2') || active.has('L3')) && (
              <div className="absolute top-[185px] -left-1 flex flex-col items-center gap-1 w-16">
                <div className="w-full flex justify-center"><Pill id="L3" label="L3" className="w-12" /></div>
                <div className="flex gap-1 w-full justify-center mt-1">
                  <Pill id="L1" label="L1" vertical />
                  <Pill id="L2" label="L2" vertical />
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
