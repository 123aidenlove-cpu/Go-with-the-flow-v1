import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Check, Plus, Music, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useInstrument } from '../contexts/InstrumentContext';

const ALL_INSTRUMENTS = [
  'Clarinet', 'Trumpet', 'Flute', 'Alto Saxophone', 'Tenor Saxophone', 
  'Trombone', 'French Horn', 'Baritone/Euphonium', 'Tuba', 'Violin', 
  'Viola', 'Cello', 'Double Bass', 'Oboe', 'Mallet Percussion',
  'Piano', 'Soprano Voice', 'Alto Voice', 'Tenor Voice', 'Bass Voice'
];

export default function InstrumentSelection({ onBack, onNavigate }: { onBack: () => void, onNavigate: (scr: string) => void }) {
  const { setInstrument } = useInstrument();
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [unlockedInstruments, setUnlockedInstruments] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profileId = localStorage.getItem('activeProfileId');
    setActiveProfileId(profileId);
    if (profileId) {
      loadInstruments(profileId);
    }
  }, []);

  const loadInstruments = async (profileId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('student_instruments')
      .select('instrument_name')
      .eq('profile_id', profileId);
      
    if (data) {
      setUnlockedInstruments(data.map(d => d.instrument_name));
      // Set the first unlocked instrument as front and center initially
      if (data.length > 0) {
        const firstInst = data[0].instrument_name;
        const idx = ALL_INSTRUMENTS.indexOf(firstInst);
        if (idx !== -1) setCurrentIndex(idx);
      }
    }
    setLoading(false);
  };

  const addInstrument = async () => {
    if (!activeProfileId) return;
    const instToAdd = ALL_INSTRUMENTS[currentIndex];
    
    // Add to supabase
    await supabase.from('student_instruments').insert({
      profile_id: activeProfileId,
      instrument_name: instToAdd
    });
    
    setUnlockedInstruments(prev => [...prev, instToAdd]);
  };

  const selectInstrumentAndPlay = () => {
    const inst = ALL_INSTRUMENTS[currentIndex];
    setInstrument(inst as any);
    localStorage.setItem('instrument', inst);
    onNavigate('student-hub');
  };

  const nextInst = () => setCurrentIndex(i => (i + 1) % ALL_INSTRUMENTS.length);
  const prevInst = () => setCurrentIndex(i => (i - 1 + ALL_INSTRUMENTS.length) % ALL_INSTRUMENTS.length);

  const currentInst = ALL_INSTRUMENTS[currentIndex];
  const isUnlocked = unlockedInstruments.includes(currentInst);

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden flex flex-col items-center justify-center font-sans text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-black pointer-events-none" />
      
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full font-bold backdrop-blur-md transition-all active:scale-95 z-50 border border-white/20 shadow-lg"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest mb-12 drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
          Select Your Instrument
        </h1>

        <div className="flex items-center justify-center gap-8 w-full px-8">
          <button onClick={prevInst} className="p-4 rounded-full bg-white/5 hover:bg-white/20 transition-all border border-white/10 shadow-xl active:scale-90 z-20">
            <ChevronLeft className="w-12 h-12" />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentInst}
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -50 }}
              className={`w-64 h-64 md:w-80 md:h-80 rounded-full flex flex-col items-center justify-center border-8 shadow-2xl transition-all ${isUnlocked ? 'bg-gradient-to-br from-indigo-600 to-purple-800 border-indigo-400' : 'bg-slate-800 border-slate-600 grayscale'}`}
            >
              <Music className={`w-24 h-24 md:w-32 md:h-32 mb-4 ${isUnlocked ? 'text-amber-300' : 'text-slate-500'}`} />
              <h2 className="text-2xl md:text-3xl font-black text-center px-4 drop-shadow-md">{currentInst}</h2>
            </motion.div>
          </AnimatePresence>

          <button onClick={nextInst} className="p-4 rounded-full bg-white/5 hover:bg-white/20 transition-all border border-white/10 shadow-xl active:scale-90 z-20">
            <ChevronRight className="w-12 h-12" />
          </button>
        </div>

        <div className="mt-16 h-20 flex items-center justify-center relative z-20">
          {loading ? (
            <div className="animate-pulse flex gap-2"><div className="w-3 h-3 bg-white rounded-full"></div><div className="w-3 h-3 bg-white rounded-full delay-75"></div><div className="w-3 h-3 bg-white rounded-full delay-150"></div></div>
          ) : isUnlocked ? (
            <button 
              onClick={selectInstrumentAndPlay}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-12 py-4 rounded-full font-black text-2xl uppercase tracking-widest shadow-[0_8px_0_#047857] active:translate-y-2 active:shadow-none transition-all flex items-center gap-3 border-4 border-emerald-300"
            >
              <Check className="w-8 h-8" /> Play This Instrument
            </button>
          ) : (
            <button 
              onClick={addInstrument}
              className="bg-sky-500 hover:bg-sky-400 text-white px-10 py-4 rounded-full font-black text-xl uppercase tracking-widest shadow-[0_8px_0_#0284c7] active:translate-y-2 active:shadow-none transition-all flex items-center gap-3 border-4 border-sky-300"
            >
              <Plus className="w-6 h-6" /> Add to My Instruments
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
