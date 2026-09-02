import React from 'react';

interface FingeringChartProps {
  onChange?: (fingering: string) => void;
  fingeringString?: string;
  interactive?: boolean;
}

export const BrassFingeringChart: React.FC<FingeringChartProps> = ({ fingeringString = "", interactive = false, onChange }) => {
  const active = new Set<string>();
  
  const toggleValve = (id: string) => {
    if (!interactive || !onChange) return;
    const newActive = new Set(active);
    if (newActive.has(id)) newActive.delete(id);
    else newActive.add(id);
    onChange(Array.from(newActive).sort().join('-'));
  };

  const s = fingeringString.toLowerCase();
  
  // Parse main holes (valves)
  if (s.includes('1')) active.add('1');
  if (s.includes('2')) active.add('2');
  if (s.includes('3')) active.add('3');

  const Valve = ({ id }: { id: string }) => {
    const isFilled = active.has(id);
    return (
      <div className="flex flex-col items-center justify-center">
        <div 
          onClick={() => toggleValve(id)}
          className={`w-12 h-12 rounded-full border-[3px] transition-all duration-300 flex items-center justify-center ${interactive ? 'cursor-pointer hover:border-slate-400' : ''} ${isFilled ? 'bg-slate-900 border-slate-900 shadow-md scale-105' : 'bg-white border-slate-300 shadow-inner'}`}>
          <span className={`text-[12px] font-black ${isFilled ? 'text-white' : 'text-slate-400'}`}>{id}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#f8fafc] border-2 border-slate-200 rounded-[2rem] p-6 flex items-center justify-center shadow-inner relative overflow-hidden transition-all duration-500 mx-auto w-[280px] h-[160px]">
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
      <div className="relative z-10 flex items-center gap-4">
        <Valve id="1" />
        <Valve id="2" />
        <Valve id="3" />
        {/* Bell Shape to the right */}
        <div className="w-0 h-0 border-t-[30px] border-b-[30px] border-r-[40px] border-t-transparent border-b-transparent border-r-slate-300 ml-2" />
      </div>
    </div>
  );
};
