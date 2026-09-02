import React from 'react';

interface FingeringChartProps {
  onChange?: (fingering: string) => void;
  fingeringString?: string;
  interactive?: boolean;
  showNoteNames?: boolean;
}

export const PianoFingeringChart: React.FC<FingeringChartProps> = ({ fingeringString = "", interactive = false, showNoteNames = false, onChange }) => {
  const active = new Set<string>();
  
  const togglePosition = (id: string) => {
    if (!interactive || !onChange) return;
    const newActive = new Set(active);
    if (newActive.has(id)) newActive.delete(id);
    else newActive.add(id);
    onChange(Array.from(newActive).join(' '));
  };

  const s = fingeringString;
  const tokens = s.split(/[\s,]+/);
  tokens.forEach(token => {
    // Just grab the note class C, C#, D etc., ignoring the octave for the chart itself
    const match = token.match(/([a-gA-G][#bB]?)/);
    if (match) {
      let note = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      active.add(note);
    }
  });

  const keys = [
    { id: 'C', type: 'white', label: 'C', alt: 'B#' },
    { id: 'C#', type: 'black', label: 'C#', alt: 'Db' },
    { id: 'D', type: 'white', label: 'D' },
    { id: 'Eb', type: 'black', label: 'Eb', alt: 'D#' },
    { id: 'E', type: 'white', label: 'E', alt: 'Fb' },
    { id: 'F', type: 'white', label: 'F', alt: 'E#' },
    { id: 'F#', type: 'black', label: 'F#', alt: 'Gb' },
    { id: 'G', type: 'white', label: 'G' },
    { id: 'G#', type: 'black', label: 'G#', alt: 'Ab' },
    { id: 'A', type: 'white', label: 'A' },
    { id: 'Bb', type: 'black', label: 'Bb', alt: 'A#' },
    { id: 'B', type: 'white', label: 'B', alt: 'Cb' }
  ];

  const isKeyActive = (id: string, altId?: string): boolean => {
    return !!(active.has(id) || (altId && active.has(altId)));
  };

  return (
    <div className="bg-[#f8fafc] border-2 border-slate-200 rounded-[2rem] p-8 flex flex-col items-center shadow-inner relative mx-auto w-[360px]">
      <div className="mb-4 text-center text-slate-500 font-bold uppercase tracking-widest text-sm">
        Piano Keyboard (1 Octave)
        <br/>
        <span className="text-xs normal-case text-slate-400">Highlights apply across all octaves</span>
      </div>
      
      <div className="relative h-48 w-full flex justify-center mt-2">
        {/* White Keys */}
        <div className="flex">
          {keys.filter(k => k.type === 'white').map((key, i) => {
            const filled = isKeyActive(key.id, key.alt);
            return (
              <div
                key={key.id}
                onClick={() => togglePosition(key.id)}
                className={`w-10 h-48 border-2 rounded-b-lg border-t-0 shadow-sm flex items-end justify-center pb-2 transition-colors ${filled ? 'bg-sky-400 border-sky-500' : 'bg-white border-slate-300 hover:bg-slate-100'} ${interactive ? 'cursor-pointer' : ''}`}
              >
                {showNoteNames && <span className={`font-bold text-xs ${filled ? 'text-white' : 'text-slate-400'}`}>{key.label}</span>}
              </div>
            );
          })}
        </div>
        
        {/* Black Keys */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex justify-center">
          <div className="relative w-[280px]"> {/* 7 white keys * 40px width */}
            {keys.filter(k => k.type === 'black').map(key => {
              // Calculate left position based on which black key it is
              const whiteIndex = keys.findIndex(k => k.id === key.id) - 1; 
              // C=0, C#=1. White index of C is 0. So C# is between 0 and 1.
              let offset = 0;
              if (key.id === 'C#') offset = 40 - 14;
              if (key.id === 'Eb') offset = 80 - 14;
              if (key.id === 'F#') offset = 160 - 14;
              if (key.id === 'G#') offset = 200 - 14;
              if (key.id === 'Bb') offset = 240 - 14;
              
              const filled = isKeyActive(key.id, key.alt);
              return (
                <div
                  key={key.id}
                  onClick={() => togglePosition(key.id)}
                  className={`absolute top-0 w-7 h-32 rounded-b-md shadow-md pointer-events-auto flex items-end justify-center pb-2 transition-colors ${filled ? 'bg-sky-500' : 'bg-slate-800 hover:bg-slate-700'} ${interactive ? 'cursor-pointer' : ''}`}
                  style={{ left: offset }}
                >
                  {showNoteNames && <span className={`font-bold text-[10px] ${filled ? 'text-white' : 'text-slate-300'}`}>{key.label}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
