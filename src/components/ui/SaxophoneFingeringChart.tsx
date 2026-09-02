import React from 'react';

interface FingeringChartProps {
  onChange?: (fingering: string) => void;
  fingeringString?: string;
  interactive?: boolean;
}

export const SaxophoneFingeringChart: React.FC<FingeringChartProps> = ({ fingeringString = "", interactive = false, onChange }) => {
  const active = new Set<string>();
  
  const toggleKey = (id: string) => {
    if (!interactive || !onChange) return;
    const newActive = new Set(active);
    if (newActive.has(id)) newActive.delete(id);
    else newActive.add(id);
    
    // Sort generically based on saxophone string standard
    const order = ['T', 'B', 'A', 'G', 'F', 'E', 'D', 'C', 'Eb'];
    const sorted = Array.from(newActive).sort((a, b) => order.indexOf(a) - order.indexOf(b));
    onChange(sorted.join('-'));
  };

  const s = fingeringString.toLowerCase();
  
  if (s.includes('thumb') || s.includes('8ve') || s.includes('octave')) active.add('8ve');

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

  if (s.includes('lh1') || s.includes('lh 1')) active.add('LH1');
  if (s.includes('lh2') || s.includes('lh 2')) active.add('LH2');
  if (s.includes('lh3') || s.includes('lh 3')) active.add('LH3');
  if (s.includes('rh1') || s.includes('rh 1')) active.add('RH1');
  if (s.includes('rh2') || s.includes('rh 2')) active.add('RH2');
  if (s.includes('rh3') || s.includes('rh 3')) active.add('RH3');

  // Side Keys
  if (s.includes('sk1') || s.includes('side 1') || s.includes('side bb')) active.add('SK1');
  if (s.includes('sk2') || s.includes('side 2') || s.includes('side c')) active.add('SK2');
  if (s.includes('sk3') || s.includes('side 3') || s.includes('high e')) active.add('SK3');

  // Palm Keys
  if (s.includes('palm d')) active.add('PalmD');
  if (s.includes('palm eb')) active.add('PalmEb');
  if (s.includes('palm f')) active.add('PalmF');
  if (s.includes('front f')) active.add('FrontF');

  // Bis key
  if (s.includes('bis') || s.includes('bis bb')) active.add('Bis');

  // Alt F#
  if (s.includes('alt f#') || s.includes('alternate f#') || s.includes('altf#')) active.add('AltF#');

  // Left Pinky
  if (s.includes('l1') || s.includes('g#')) active.add('L1');
  if (s.includes('l2') || s.includes('c#')) active.add('L2');
  if (s.includes('l3') || s.includes('b key') || (s.includes('b') && s.includes('left pinky'))) active.add('L3');
  if (s.includes('l4') || s.includes('low bb')) active.add('L4');

  // Right Pinky
  if (s.includes('r1') || s.includes('eb key') || s.includes('low eb')) active.add('R1');
  if (s.includes('r2') || s.includes('c key') || s.includes('low c')) active.add('R2');

  fingeringString.split('-').forEach(t => {
    if (['8ve','LH1','LH2','LH3','RH1','RH2','RH3','SK1','SK2','SK3','PalmD','PalmEb','PalmF','FrontF','Bis','AltF#','L1','L2','L3','L4','R1','R2'].includes(t)) {
      active.add(t);
    }
  });

  const isWide = active.has('PalmD') || active.has('PalmEb') || active.has('PalmF') || active.has('SK1') || active.has('SK2') || active.has('SK3');

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

  return (
    <div className={`bg-[#f8fafc] border-2 border-slate-200 rounded-[2rem] p-6 flex flex-col shadow-inner relative overflow-hidden transition-all duration-500 mx-auto w-[280px]`}>
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
      
      <div className="relative z-10 w-full h-[360px] flex justify-center">
        
        {/* Left Column (Thumb, Register) */}
        <div className="absolute left-0 top-0 bottom-0 w-20 flex flex-col items-end py-4 gap-8">
          <div className="flex flex-col gap-2 items-end mt-4">
            <div className="flex flex-col items-center gap-1 mb-2">
              <div 
                onClick={() => toggleKey('8ve')}
                className={`w-6 h-12 rounded-l-full border-[3px] border-r-0 flex items-center justify-center transition-all duration-300 ${interactive ? 'cursor-pointer hover:border-slate-400' : ''} ${active.has('8ve') ? 'bg-slate-900 border-slate-900 shadow-md scale-105' : 'bg-white border-slate-300'}`}>
                <span className={`text-[8px] font-black uppercase tracking-widest -rotate-90 ${active.has('8ve') ? 'text-white' : 'text-slate-400'}`}>8ve</span>
              </div>
            </div>
          </div>
          
          {/* Side Keys */}
          <div className="flex flex-col gap-1 items-end absolute top-[160px] right-2">
            <Pill id="SK3" label="SK3" className="!w-6" />
            <Pill id="SK2" label="SK2" className="!w-6" />
            <Pill id="SK1" label="SK1" className="!w-6" />
          </div>

          {/* Right Pinky Cluster (R1=Eb, R2=C) */}
          <div className="absolute top-[280px] right-2 flex flex-col gap-0 w-8">
            <div onClick={() => toggleKey('R1')} className={`w-8 h-8 rounded-t-full border-[3px] flex items-center justify-center ${interactive ? 'cursor-pointer hover:border-slate-400' : ''} ${active.has('R1') ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>
              <span className="text-[8px] font-black">R1</span>
            </div>
            <div onClick={() => toggleKey('R2')} className={`w-8 h-8 rounded-b-full border-[3px] border-t-0 flex items-center justify-center ${interactive ? 'cursor-pointer hover:border-slate-400' : ''} ${active.has('R2') ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>
              <span className="text-[8px] font-black">R2</span>
            </div>
          </div>
        </div>

        {/* Center Column (Main Holes) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-16 border-x-2 border-slate-200/50 bg-slate-100/50 flex flex-col items-center py-2 rounded-full">
          
          <div className="flex flex-col gap-2 mb-2 mt-8 relative">
            
            <Hole id="FrontF" label="F" className="scale-75 absolute -top-8 left-1/2 -translate-x-1/2" />
            
            <Hole id="LH1" />
            <Hole id="Bis" label="B" className="scale-50 absolute top-5 left-[18px]" />
            <Hole id="LH2" />
            <Hole id="LH3" />
          </div>

          <div className="w-full h-[2px] bg-slate-300 my-2" />
          <div className="flex flex-col gap-2 relative">
            <Hole id="RH1" />
            <Hole id="RH2" />
            {/* Alt F# is a triangle on the left side */}
            <div onClick={() => toggleKey('AltF#')} className={`absolute top-[74px] -left-[24px] flex items-center justify-center w-6 h-6 ${interactive ? 'cursor-pointer' : ''}`}>
              <svg viewBox="0 0 100 100" className="w-full h-full absolute">
                <polygon points="0,50 100,0 100,100" fill={active.has('AltF#') ? '#0f172a' : '#cbd5e1'} />
              </svg>
              <span className={`text-[8px] font-bold absolute z-10 ml-2 ${active.has('AltF#') ? 'text-white' : 'text-slate-600'}`}>F#</span>
            </div>
            <Hole id="RH3" />
          </div>
        </div>

        {/* Right Column */}
        <div className="absolute right-0 top-0 bottom-0 w-24 flex flex-col py-4 gap-12">
          {/* Palm Keys (Eb, F, D) */}
          <div className="absolute top-4 left-6 relative h-20 w-12">
            <div className="absolute top-0 left-0">
               <Pill id="PalmEb" label="Eb" vertical className="!h-8 !w-4" />
            </div>
            <div className="absolute top-10 left-0">
               <Pill id="PalmF" label="F" vertical className="!h-8 !w-4" />
            </div>
            <div className="absolute top-5 left-5">
               <Pill id="PalmD" label="D" vertical className="!h-8 !w-4" />
            </div>
          </div>

          {/* Left Pinky Cluster (G#, C#, B, Bb) */}
          <div className="absolute top-[120px] left-4 flex flex-col gap-1 w-16 rotate-[-10deg] scale-[0.7] transform-origin-top-left">
            <Pill id="L1" label="G#" className="!w-16" />
            <div className="flex gap-1">
              <Pill id="L2" label="C#" className="!w-[30px] h-8" />
              <Pill id="L3" label="B" className="!w-[30px] h-8" />
            </div>
            <Pill id="L4" label="Bb" className="!w-16" />
          </div>
        </div>

      </div>
    </div>
  );
};
