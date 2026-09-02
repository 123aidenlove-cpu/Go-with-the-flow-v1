import React from 'react';
import { ArrowLeft, Headphones, CheckCircle } from 'lucide-react';

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

export default function SoundSleuth({ onBack, onComplete }: Props) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 relative">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 px-6 py-3 font-black text-white uppercase tracking-widest bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="bg-white p-12 rounded-[3rem] text-center max-w-2xl shadow-2xl border-4 border-indigo-300">
        <Headphones className="w-24 h-24 text-indigo-500 mx-auto mb-6" />
        <h1 className="text-4xl font-black text-slate-800 uppercase tracking-widest mb-4">Sound Sleuth</h1>
        <p className="text-xl text-slate-600 font-bold mb-8">
          Placeholder for V2 Minigame: Train your ears to become a musical detective! Listen to intervals and melodies to unlock clues.
        </p>

        <button 
          onClick={onComplete}
          className="bg-indigo-500 hover:bg-indigo-400 text-white px-10 py-5 rounded-2xl font-black text-xl uppercase tracking-widest shadow-[0_6px_0_#4338ca] active:translate-y-1.5 active:shadow-none transition-all flex items-center gap-3 mx-auto"
        >
          <CheckCircle className="w-6 h-6" /> Simulate Win
        </button>
      </div>
    </div>
  );
}
