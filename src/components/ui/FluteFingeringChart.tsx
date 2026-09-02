import React from 'react';

interface FingeringChartProps {
  onChange?: (fingering: string) => void;
  fingeringString?: string;
  interactive?: boolean;
}

export const FluteFingeringChart: React.FC<FingeringChartProps> = ({ fingeringString = "", interactive = false, onChange }) => {
  const active = new Set<string>();
  
  const toggleKey = (id: string) => {
    if (!interactive || !onChange) return;
    const newActive = new Set(active);
    if (newActive.has(id)) newActive.delete(id);
    else newActive.add(id);
    
    // Sort generically based on flute string standard
    const order = ['T', '1', '2', '3', '4', '5', '6', 'Eb'];
    const sorted = Array.from(newActive).sort((a, b) => order.indexOf(a) - order.indexOf(b));
    onChange(sorted.join('-'));
  };

  const s = fingeringString.toLowerCase();
  
  // Parse fingers
  // Left Hand
  if (s.includes('thumb b') || s.includes('t1')) active.add('T1');
  if (s.includes('thumb bb') || s.includes('t2')) active.add('T2');
  
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

  // Left Pinky
  if (s.includes('l4') || s.includes('l1') || s.includes('g#')) active.add('L1');

  // Trills
  if (s.includes('trill 1') || s.includes('trill1')) active.add('Trill1');
  if (s.includes('trill 2') || s.includes('trill2')) active.add('Trill2');
  if (s.includes('sk1') || s.includes('d trill')) active.add('SK1');

  fingeringString.split('-').forEach(t => {
    if (['T1','T2','LH1','LH2','LH3','RH1','RH2','RH3','L1','Trill1','Trill2','SK1','R1','R2','R3','R4'].includes(t)) {
      active.add(t);
    }
  });

  // Right Pinky
  if (s.includes('r1') || s.includes('eb')) active.add('R1');
  if (s.includes('r2') || s.includes('c#')) active.add('R2');
  if (s.includes('r3') || s.includes('c key') || (s.includes('c') && s.includes('right pinky'))) active.add('R3');
  if (s.includes('r4') || s.includes('b key') || (s.includes('b') && s.includes('right pinky'))) active.add('R4');

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
    <div className={`bg-[#f8fafc] border-2 border-slate-200 rounded-[2rem] p-6 flex flex-col shadow-inner relative overflow-hidden transition-all duration-500 mx-auto w-[420px]`}>
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
      
      <div className="relative z-10 w-full h-[180px] flex justify-center items-center gap-2">
        
        {/* Left Box (Left Hand) */}
        <div className="border-2 border-slate-300 rounded-lg p-2 flex gap-2 relative">
          <Hole id="LH1" />
          <Hole id="LH2" />
          <Hole id="LH3" />
          
          {/* L1 / G# */}
          <div className="absolute -top-6 -right-8">
            <Pill id="L1" label="L1" vertical className="rotate-[-15deg] h-10" />
          </div>

          {/* Thumbs T1, T2 */}
          <div className="absolute -bottom-10 left-2 flex gap-1 items-end">
            <Pill id="T2" label="T2" className="!w-6" />
            <Pill id="T1" label="T1" className="!w-8" />
          </div>
        </div>

        {/* Right Box (Right Hand) */}
        <div className="border-2 border-slate-300 rounded-lg p-2 flex gap-2 relative ml-8">
          
          {/* SK1 / D Trill */}
          <div className="absolute -bottom-4 -left-4">
            <div onClick={() => toggleKey('SK1')} className={`w-6 h-4 rounded-b-full border-[2px] ${interactive ? 'cursor-pointer hover:border-slate-400' : ''} ${active.has('SK1') ? 'bg-slate-900 border-slate-900 shadow-md' : 'bg-white border-slate-300'}`} />
          </div>

          <Hole id="RH1" />
          <Hole id="RH2" />
          <Hole id="RH3" />

          {/* Trills aligned horizontally with SK1 */}
          <div className="absolute -bottom-4 left-[34px] flex items-center h-4">
            <div onClick={() => toggleKey('Trill1')} className={`w-3 h-3 rounded-full border-[2px] ${interactive ? 'cursor-pointer hover:border-slate-400' : ''} ${active.has('Trill1') ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300'}`} />
          </div>
          <div className="absolute -bottom-4 left-[74px] flex items-center h-4">
            <div onClick={() => toggleKey('Trill2')} className={`w-3 h-3 rounded-full border-[2px] ${interactive ? 'cursor-pointer hover:border-slate-400' : ''} ${active.has('Trill2') ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300'}`} />
          </div>
        </div>

        {/* Right Pinky Stack */}
        <div className="flex gap-2 ml-4">
          <Pill id="R1" label="R1" vertical className="h-12" />
          <div className="flex flex-col gap-1 justify-center">
            <Pill id="R4" label="R4" className="!w-10 !h-4 text-[6px]" />
            <Pill id="R3" label="R3" className="!w-10 !h-4 text-[6px]" />
            <div onClick={() => toggleKey('R2')} className={`w-10 h-4 rounded-b-full border-[2px] flex items-center justify-center mt-1 ${interactive ? 'cursor-pointer hover:border-slate-400' : ''} ${active.has('R2') ? 'bg-slate-900 border-slate-900 shadow-md scale-105' : 'bg-white border-slate-300'}`}>
              <span className={`text-[6px] font-black uppercase tracking-widest ${active.has('R2') ? 'text-white' : 'text-slate-400'}`}>R2</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
