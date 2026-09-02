import React, { useState } from 'react';
import { FingeringChart } from './ui/FingeringChart';
import { FluteFingeringChart } from './ui/FluteFingeringChart';
import { SaxophoneFingeringChart } from './ui/SaxophoneFingeringChart';
import { BrassFingeringChart } from './ui/BrassFingeringChart';
import { ViolinFingeringChart } from './ui/ViolinFingeringChart';

export default function FingeringChartMockups() {
  const [instrument, setInstrument] = useState('Flute');
  const [fingering, setFingering] = useState('Thumb B, LH1, LH2, LH3, L4, RH1, Trill1, R1, R2, R4');

  const presets = {
    Trumpet: 'Thumb, 8ve, LH1, LH2, LH3, L4, RH1, RH2, RH3, R2, R4, SK1, SK2, L_Banana',
    Flute: 'Thumb B, LH1, LH2, LH3, L4, RH1, RH2, RH3, Trill1, Trill2, R1, R2, R4, SK1',
    Saxophone: '8ve, LH1, LH2, LH3, Bis, RH1, RH2, RH3, Alt F#, L1, L2, L3, L4, R1, R2, SK1, SK2, SK3, Palm D, Palm Eb, Palm F, Front F',
    Brass: '1, 3',
    Violin: 'G1, D2, A3, E4'
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-slate-800 mb-8">Fingering Chart Mockups</h1>
      
      <div className="flex gap-4 mb-8">
        {Object.keys(presets).map(inst => (
          <button 
            key={inst}
            onClick={() => {
              setInstrument(inst);
              setFingering(presets[inst as keyof typeof presets]);
            }}
            className={`px-4 py-2 rounded-xl font-bold ${instrument === inst ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}
          >
            {inst}
          </button>
        ))}
      </div>

      <div className="mb-8">
        <label className="block text-sm font-bold text-slate-600 mb-2">Fingering String (used in Curriculum_Templates CSVs):</label>
        <input 
          type="text" 
          value={fingering}
          onChange={(e) => setFingering(e.target.value)}
          className="w-full p-4 rounded-xl border-2 border-slate-300 focus:border-indigo-500 text-lg font-mono"
        />
      </div>

      <div className="bg-white p-12 rounded-[2rem] shadow-sm border-2 border-slate-200">
        {(instrument === 'Trumpet' || instrument === 'Baritone/Euphonium') && <FingeringChart fingeringString={fingering} />}
        {instrument === 'Flute' && <FluteFingeringChart fingeringString={fingering} />}
        {instrument === 'Saxophone' && <SaxophoneFingeringChart fingeringString={fingering} />}
        {instrument === 'Brass' && <BrassFingeringChart fingeringString={fingering} />}
        {instrument === 'Violin' && <ViolinFingeringChart fingeringString={fingering} showNoteNames={true} />}
      </div>

      <div className="mt-8 bg-slate-100 p-6 rounded-2xl">
        <h3 className="font-bold mb-4">Supported Labels for {instrument}</h3>
        {(instrument === 'Trumpet' || instrument === 'Baritone/Euphonium') && <p>Thumb, 8ve, LH1, LH2, LH3, L1, L2, L3, L4, RH1, RH2, RH3, R1, R2, R3, R4, SK1, SK2, SK3, SK4, A, G#, L_Banana, R_Banana</p>}
        {instrument === 'Flute' && <p>Thumb B (T1), Thumb Bb (T2), LH1, LH2, LH3, L4 (G#), RH1, RH2, RH3, Trill1, Trill2, R1 (Eb), R2 (C#), R3 (C), R4 (B), SK1 (D Trill)</p>}
        {instrument === 'Saxophone' && <p>8ve, LH1, LH2, LH3, Bis, RH1, RH2, RH3, Alt F#, L1 (G#), L2 (C#), L3 (B), L4 (Bb), R1 (Eb), R2 (C), SK1, SK2, SK3, Palm D, Palm Eb, Palm F, Front F</p>}
        {instrument === 'Brass' && <p>1, 2, 3</p>}
        {instrument === 'Violin' && <p>G0, G1-, G1, G2-, G2, G3, G4, D1, A2, E3, etc. (String + Finger Position)</p>}
      </div>
    </div>
  );
}
