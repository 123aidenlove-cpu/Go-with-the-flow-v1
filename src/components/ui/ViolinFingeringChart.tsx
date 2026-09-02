import React from 'react';

interface FingeringChartProps {
  onChange?: (fingering: string) => void;
  fingeringString?: string;
  interactive?: boolean;
  showNoteNames?: boolean;
}

export const ViolinFingeringChart: React.FC<FingeringChartProps> = ({ fingeringString = "", interactive = false, showNoteNames = false, onChange }) => {
  const active = new Set<string>();
  
  const togglePosition = (id: string) => {
    if (!interactive || !onChange) return;
    const newActive = new Set(active);
    if (newActive.has(id)) newActive.delete(id);
    else newActive.add(id);
    onChange(Array.from(newActive).join(' '));
  };

  const s = fingeringString.toLowerCase();
  
  // Parse fingers: e.g., "G1", "D2", "A3", "E4", "E0", "D3+"
  const tokens = s.split(/[\s,]+/);
  tokens.forEach(token => {
    // allow G3+, G4-, etc.
    const match = token.match(/([gdae])(\d[\+\-]?)/i);
    if (match) {
      let pos = match[2];
      if (pos === '4-') pos = '3+'; // Map 4- to 3+ internally
      active.add(`${match[1].toUpperCase()}${pos}`);
    }
  });

  const strings = ['G', 'D', 'A', 'E']; // Left to right
  
  // Array of position objects
  const positions = [
    { id: '1-', label: 'Low 1', isMain: false, semitones: 1 },
    { id: '1', label: '1', isMain: true, semitones: 2 },
    { id: '2-', label: 'Low 2', isMain: false, semitones: 3 },
    { id: '2', label: '2', isMain: true, semitones: 4 },
    { id: '3', label: '3', isMain: true, semitones: 5 },
    { id: '3+', label: 'High 3 / Low 4', isMain: false, semitones: 6 },
    { id: '4', label: '4', isMain: true, semitones: 7 },
    { id: '4+', label: 'High 4', isMain: false, semitones: 8 }
  ];

  const noteMap: Record<string, Record<string, string>> = {
    'G': { '0': 'G', '1-': 'G#', '1': 'A', '2-': 'Bb', '2': 'B', '3': 'C', '3+': 'C#', '4': 'D', '4+': 'D#' },
    'D': { '0': 'D', '1-': 'Eb', '1': 'E', '2-': 'F', '2': 'F#', '3': 'G', '3+': 'G#', '4': 'A', '4+': 'Bb' },
    'A': { '0': 'A', '1-': 'Bb', '1': 'B', '2-': 'C', '2': 'C#', '3': 'D', '3+': 'D#', '4': 'E', '4+': 'F' },
    'E': { '0': 'E', '1-': 'F', '1': 'F#', '2-': 'G', '2': 'G#', '3': 'A', '3+': 'Bb', '4': 'B', '4+': 'C' }
  };

  return (
    <div className="bg-[#f8fafc] border-2 border-slate-200 rounded-[2rem] p-8 flex flex-col shadow-inner relative mx-auto w-[360px]">
      
      {/* Fingerboard Container */}
      <div className={`relative w-full flex flex-col pt-4 pb-8 ${showNoteNames ? 'pl-12 pr-28' : 'pl-8 pr-24'}`}>
        
        {/* String Labels at Top */}
        <div className="relative w-full h-8 mb-2 z-20">
          {strings.map((str, idx) => (
            <div key={str} className="absolute font-black text-slate-800 text-lg w-8 text-center -ml-4" style={{ left: `${idx * 33.333}%` }}>{str}</div>
          ))}
        </div>

        {/* The Fingerboard Coordinate System */}
        <div className="relative w-full h-[320px] mt-4 z-20">
          
          {/* Vertical Strings (now relative to the fingerboard length) */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {strings.map((str, idx) => (
              <div key={str} className="absolute w-[2px] h-full bg-slate-400 shadow-sm -ml-[1px]" style={{ left: `${idx * 33.333}%` }} />
            ))}
          </div>

          {/* The Nut (0 position) */}
          <div className="absolute w-full group" style={{ top: '0%' }}>
            <div className="absolute left-[-10px] right-[-10px] h-4 bg-slate-800 rounded-sm shadow-md -mt-2" />
            <div className="absolute -right-24 font-bold text-slate-500 text-sm -mt-2 pointer-events-none">
              0 (Nut)
            </div>
            {/* Open string dots */}
            <div className="absolute inset-x-0">
              {strings.map((str, idx) => {
                const id = `${str}0`;
                const isFilled = active.has(id);
                return (
                  <div key={str} className={`absolute w-12 h-12 flex items-center justify-center -ml-6 -mt-6 z-40 ${interactive ? 'cursor-pointer' : ''}`} style={{ left: `${idx * 33.333}%` }} onClick={() => togglePosition(id)}>
                    {(isFilled || interactive) && (
                      <div className={`rounded-full border-2 transition-all duration-300 flex items-center justify-center ${showNoteNames ? 'w-7 h-7' : 'w-6 h-6'} ${isFilled ? `bg-blue-500 border-blue-500 shadow-md ${showNoteNames ? 'scale-110' : ''}` : 'bg-white border-slate-300 opacity-0 group-hover:opacity-50'}`}>
                         {isFilled && showNoteNames && <span className="text-white text-[9px] font-bold">{noteMap[str]['0']}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Positions */}
          {positions.map((pos) => {
            const visualPct = ((1 - Math.pow(2, -pos.semitones / 12)) / (1 - Math.pow(2, -9/12))) * 100;
            return (
            <div key={pos.id} className="absolute w-full group" style={{ top: `${visualPct}%` }}>
              
              {/* Horizontal Fret Line */}
              <div className={`absolute left-[-10px] right-[-10px] ${pos.isMain ? 'h-[4px] bg-slate-700 -mt-[2px]' : 'h-[1px] bg-slate-400 opacity-50'}`} />
              
              {/* Label on Right */}
              <div className={`absolute -right-24 font-bold text-sm -mt-2 ${pos.isMain ? 'text-slate-700' : 'text-slate-400'}`}>
                {pos.label}
              </div>

              {/* Note Intersections */}
              <div className="absolute inset-x-0">
                {strings.map((str, idx) => {
                  const id = `${str}${pos.id}`;
                  const isFilled = active.has(id);
                  const noteName = noteMap[str][pos.id];
                  return (
                    <div key={str} className="absolute w-8 flex justify-center -ml-4" style={{ left: `${idx * 33.333}%` }}>
                      <div 
                        onClick={() => togglePosition(id)}
                        className={`rounded-full border-2 transition-all duration-300 z-30 flex items-center justify-center -mt-3 ${showNoteNames ? 'w-7 h-7' : 'w-6 h-6'} ${isFilled ? `bg-blue-500 border-blue-500 shadow-md ${showNoteNames ? 'scale-110' : ''}` : 'bg-white border-slate-300 opacity-0 group-hover:opacity-50'} ${interactive ? 'cursor-pointer' : ''}`}>
                        {isFilled && showNoteNames && <span className="text-white text-[9px] font-bold">{noteName}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
        </div>

      </div>
    </div>
  );
};
