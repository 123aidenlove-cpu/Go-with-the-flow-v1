import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Check, Plus, Music, ArrowLeft, X } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const profileId = localStorage.getItem('activeProfileId');
    setActiveProfileId(profileId);
    if (profileId) {
      loadInstruments(profileId);
    }
  }, []);

  const loadInstruments = async (profileId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('student_instruments')
      .select('instrument_name')
      .eq('profile_id', profileId);
      
    if (data && data.length > 0) {
      setUnlockedInstruments(data.map(d => d.instrument_name));
    } else {
      // Fallback if migration hasn't happened or new user
      const { data: pData } = await supabase.from('profiles').select('instrument').eq('id', profileId).single();
      if (pData && pData.instrument) {
        setUnlockedInstruments([pData.instrument]);
        // Auto-add to table
        await supabase.from('student_instruments').insert({ profile_id: profileId, instrument_name: pData.instrument });
      }
    }
    setLoading(false);
  };

  const selectInstrumentAndPlay = (inst: string) => {
    setInstrument(inst as any);
    localStorage.setItem('instrument', inst);
    onNavigate('student-hub');
  };

  const availableToAdd = ALL_INSTRUMENTS.filter(inst => !unlockedInstruments.includes(inst));
  const currentToAdd = availableToAdd[carouselIndex] || ALL_INSTRUMENTS[0];

  const nextAdd = () => setCarouselIndex(i => (i + 1) % availableToAdd.length);
  const prevAdd = () => setCarouselIndex(i => (i - 1 + availableToAdd.length) % availableToAdd.length);

  const confirmAddInstrument = async () => {
    if (!activeProfileId || unlockedInstruments.length >= 3) return;
    
    await supabase.from('student_instruments').insert({
      profile_id: activeProfileId,
      instrument_name: currentToAdd
    });
    
    setUnlockedInstruments(prev => [...prev, currentToAdd]);
    setShowAddModal(false);
    setCarouselIndex(0);
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden flex flex-col items-center justify-center font-sans text-white">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-black pointer-events-none" />
      
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full font-bold backdrop-blur-md transition-all active:scale-95 z-50 border border-white/20 shadow-lg"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest mb-4 drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-cyan-400 text-center">
          My Instruments
        </h1>
        <p className="text-slate-300 mb-12 text-lg text-center max-w-lg">
          Select which instrument you want to play right now. High scores and progress are saved separately!
        </p>

        {loading ? (
          <div className="animate-pulse flex gap-2"><div className="w-4 h-4 bg-white rounded-full"></div><div className="w-4 h-4 bg-white rounded-full delay-75"></div><div className="w-4 h-4 bg-white rounded-full delay-150"></div></div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8 w-full px-8">
            {unlockedInstruments.map((inst) => (
              <motion.button
                key={inst}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                onClick={() => selectInstrumentAndPlay(inst)}
                className="w-56 h-56 md:w-64 md:h-64 rounded-[3rem] flex flex-col items-center justify-center border-4 shadow-2xl transition-all bg-slate-800 border-slate-600 hover:border-emerald-400 hover:bg-slate-700 hover:-translate-y-2 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Music className="w-20 h-20 md:w-24 md:h-24 mb-4 text-emerald-400 group-hover:scale-110 transition-transform relative z-10" />
                <h2 className="text-xl md:text-2xl font-black text-center px-4 drop-shadow-md relative z-10">{inst}</h2>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-500 text-white text-sm font-bold px-4 py-1 rounded-full relative z-10">
                  Play Now
                </div>
              </motion.button>
            ))}

            {unlockedInstruments.length < 3 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                onClick={() => setShowAddModal(true)}
                className="w-56 h-56 md:w-64 md:h-64 rounded-[3rem] flex flex-col items-center justify-center border-4 shadow-2xl transition-all bg-slate-800/50 border-slate-700 border-dashed hover:border-sky-400 hover:bg-slate-800 hover:-translate-y-2 group"
              >
                <Plus className="w-16 h-16 mb-4 text-sky-400 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                <h2 className="text-lg md:text-xl font-bold text-center px-4 text-sky-200/70 group-hover:text-sky-200">Learn a New Instrument</h2>
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-slate-900 rounded-3xl p-8 shadow-2xl border border-sky-500/30 relative flex flex-col items-center"
            >
              <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/10 p-2 rounded-full transition-colors">
                <X size={24} />
              </button>
              
              <h2 className="text-3xl font-black mb-2 text-sky-400">Add an Instrument</h2>
              <p className="text-slate-400 mb-8 text-center">Scroll to find the instrument you want to learn next.</p>

              <div className="flex items-center justify-center gap-8 w-full mb-10">
                <button onClick={prevAdd} className="p-3 rounded-full bg-white/5 hover:bg-white/20 transition-all border border-white/10 active:scale-90 z-20">
                  <ChevronLeft className="w-10 h-10" />
                </button>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentToAdd}
                    initial={{ opacity: 0, scale: 0.8, x: 50 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.8, x: -50 }}
                    className="w-48 h-48 md:w-64 md:h-64 rounded-full flex flex-col items-center justify-center border-4 shadow-xl transition-all bg-gradient-to-br from-sky-600 to-indigo-800 border-sky-400"
                  >
                    <Music className="w-16 h-16 md:w-20 md:h-20 mb-4 text-amber-300" />
                    <h3 className="text-xl md:text-2xl font-black text-center px-2">{currentToAdd}</h3>
                  </motion.div>
                </AnimatePresence>

                <button onClick={nextAdd} className="p-3 rounded-full bg-white/5 hover:bg-white/20 transition-all border border-white/10 active:scale-90 z-20">
                  <ChevronRight className="w-10 h-10" />
                </button>
              </div>

              <button 
                onClick={confirmAddInstrument}
                className="bg-sky-500 hover:bg-sky-400 text-white px-10 py-4 rounded-full font-black text-xl uppercase tracking-widest shadow-[0_6px_0_#0284c7] active:translate-y-1 active:shadow-none transition-all flex items-center gap-3 border-4 border-sky-300"
              >
                <Plus className="w-6 h-6" /> Confirm Selection
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
