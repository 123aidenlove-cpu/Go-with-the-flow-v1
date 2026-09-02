import React from 'react';
import { Mic, Volume2 } from 'lucide-react';
import * as Tone from 'tone';

interface FingeringChartProps {
  fingeringString?: string;
}

export const VoicePitchDisplay: React.FC<FingeringChartProps> = ({ fingeringString = "" }) => {
  
  const playPitch = async () => {
    if (!fingeringString) return;
    await Tone.start();
    // Just grab the first note if multiple
    const note = fingeringString.split(/[\s,]+/)[0];
    if (note) {
      const synth = new Tone.Synth().toDestination();
      synth.triggerAttackRelease(note, "8n");
    }
  };

  return (
    <div className="bg-[#f8fafc] border-2 border-slate-200 rounded-[2rem] p-8 flex flex-col items-center shadow-inner relative mx-auto w-[360px] h-[200px] justify-center">
      <Mic className="w-12 h-12 text-rose-300 mb-4" />
      <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-2">Vocal Pitch</h3>
      <p className="text-slate-500 font-bold mb-4 text-center text-sm">Sing the pitch shown on the staff. Tap below to hear the reference pitch.</p>
      <button 
        onClick={playPitch}
        className="px-6 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-full font-bold flex items-center gap-2 shadow-md transition-transform active:scale-95"
      >
        <Volume2 className="w-5 h-5" /> Hear Pitch
      </button>
    </div>
  );
};
