import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Lock, Star, ChevronRight, Map, Music, Mic, Award, Play } from 'lucide-react';
import { APP_ASSETS } from '../config/assets';

interface SetRepertoireProps {
  onBack: () => void;
  onNavigateToGame: (game: 'pizzeria' | 'rocket-reading' | 'rhythm-rapids' | 'finger-fishing' | 'sight-read-soaring') => void;
}

type ViewState = 'carousel' | 'map' | 'briefing' | 'minigame' | 'finale' | 'reward';

interface Song {
  id: string;
  title: string;
  checkpoints: { id: number; title: string; minigame: string; completed: boolean }[];
  finaleCompleted: boolean;
}

const INITIAL_LEVELS = [
  {
    level: 1,
    unlocked: true,
    songs: [
      { id: 'ode', title: 'Ode to Joy', checkpoints: [
        { id: 1, title: 'Measures 1-4 Rhythm', minigame: 'Rhythm Rapids', completed: false },
        { id: 2, title: 'Note Reading Drill', minigame: 'Rocket Reading', completed: false },
        { id: 3, title: 'Fingering Practice', minigame: 'Finger Fishing', completed: false },
      ], finaleCompleted: false },
      { id: 'twinkle', title: 'Twinkle Twinkle', checkpoints: [
        { id: 1, title: 'Pitch Accuracy', minigame: 'Music Pizzeria', completed: false },
        { id: 2, title: 'Rhythm Consistency', minigame: 'Rhythm Rapids', completed: false },
      ], finaleCompleted: false }
    ]
  },
  {
    level: 2,
    unlocked: false,
    songs: [
      { id: 'au-clair', title: 'Au Clair de la Lune', checkpoints: [], finaleCompleted: false },
      { id: 'minuet', title: 'Minuet in G', checkpoints: [], finaleCompleted: false }
    ]
  }
];

export default function SetRepertoire({ onBack, onNavigateToGame }: SetRepertoireProps) {
  const [view, setView] = useState<ViewState>('carousel');
  const [levels, setLevels] = useState(INITIAL_LEVELS);
  
  const [activeSongId, setActiveSongId] = useState<string | null>(null);
  const [activeCheckpointId, setActiveCheckpointId] = useState<number | null>(null);
  
  // Timer for finale
  const [finaleTimer, setFinaleTimer] = useState(0);
  const [isPerforming, setIsPerforming] = useState(false);

  // Derived active objects
  const activeLevel = levels.find(l => l.songs.some(s => s.id === activeSongId));
  const activeSong = activeLevel?.songs.find(s => s.id === activeSongId);
  const activeCheckpoint = activeSong?.checkpoints.find(c => c.id === activeCheckpointId);
  
  const allCheckpointsCleared = activeSong?.checkpoints.every(c => c.completed) || false;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPerforming) {
      interval = setInterval(() => {
        setFinaleTimer(prev => prev + 1);
        if (finaleTimer > 8) {
          setIsPerforming(false);
          // Mark song complete
          setLevels(prev => prev.map(l => ({
            ...l,
            songs: l.songs.map(s => s.id === activeSongId ? { ...s, finaleCompleted: true } : s)
          })));
          setView('reward');
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPerforming, finaleTimer, activeSongId]);

  const handleClearCheckpoint = () => {
    setLevels(prev => prev.map(l => ({
      ...l,
      songs: l.songs.map(s => {
        if (s.id === activeSongId) {
          return {
            ...s,
            checkpoints: s.checkpoints.map(c => c.id === activeCheckpointId ? { ...c, completed: true } : c)
          };
        }
        return s;
      })
    })));
    setView('map');
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col font-sans overflow-hidden" id="set-repertoire-arena">
      {/* Header */}
      <div className="bg-purple-900 p-4 flex justify-between items-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] z-20 border-b-4 border-purple-500">
        <button 
          onClick={() => {
            if (view === 'map') setView('carousel');
            else if (view === 'briefing') setView('map');
            else if (view === 'minigame') setView('briefing');
            else if (view === 'finale') setView('map');
            else if (view === 'reward') setView('carousel');
            else onBack();
          }} 
          className="p-2 hover:bg-white/20 rounded-xl text-white transition-all flex items-center gap-2 font-bold"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <h1 className="text-2xl font-black text-amber-400 uppercase tracking-widest flex items-center gap-2 drop-shadow-md">
          <Star className="w-6 h-6" /> Set Repertoire <Star className="w-6 h-6" />
        </h1>
        <div className="w-24" /> {/* Spacer */}
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          
          {/* VIEW 1: THE LEVEL CAROUSEL HUB */}
          {view === 'carousel' && (
            <motion.div key="carousel" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="absolute inset-0 bg-gradient-to-b from-purple-900 via-indigo-900 to-slate-900 overflow-y-auto p-8 flex flex-col items-center">
              <p className="text-purple-300 font-bold mb-12 max-w-2xl text-center text-lg">Select a repertoire tier. Unlock new tiers by clearing mini-game milestones on the main campus!</p>
              
              <div className="w-full max-w-4xl flex gap-8 overflow-x-auto pb-12 snap-x snap-mandatory">
                {levels.map((lvl) => (
                  <div key={lvl.level} className={`snap-center shrink-0 w-80 rounded-[3rem] border-8 p-6 shadow-2xl relative ${lvl.unlocked ? 'bg-white border-amber-400' : 'bg-slate-800 border-slate-700'}`}>
                    
                    {!lvl.unlocked && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-[2.5rem] flex flex-col items-center justify-center z-10 text-slate-300">
                        <Lock className="w-16 h-16 mb-4 text-slate-500" />
                        <span className="font-black uppercase tracking-widest">Locked</span>
                        <span className="text-xs font-bold text-center mt-2 px-6">Clear Level 2 on the Map to Unlock</span>
                      </div>
                    )}

                    <h2 className="text-3xl font-black text-center uppercase tracking-widest mb-6 border-b-4 pb-4">
                      <span className={lvl.unlocked ? 'text-purple-900' : 'text-slate-500'}>Level {lvl.level}</span>
                    </h2>

                    <div className="space-y-4">
                      {lvl.songs.map((song) => (
                        <button 
                          key={song.id} 
                          disabled={!lvl.unlocked}
                          onClick={() => { setActiveSongId(song.id); setView('map'); }}
                          className={`w-full text-left p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${lvl.unlocked ? 'bg-purple-50 border-purple-200 hover:border-purple-500 hover:scale-105 shadow-md' : 'bg-slate-700 border-slate-600'}`}
                        >
                          <div>
                            <h3 className={`font-black ${lvl.unlocked ? 'text-purple-900' : 'text-slate-400'}`}>{song.title}</h3>
                            {lvl.unlocked && <span className="text-xs font-bold text-amber-600 uppercase flex items-center gap-1 mt-1">{song.finaleCompleted ? <><Star className="w-3 h-3 fill-amber-500" /> Mastered</> : 'In Progress'}</span>}
                          </div>
                          <ChevronRight className={lvl.unlocked ? 'text-purple-400' : 'text-slate-500'} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* VIEW 2: SONG MASTERY MAP */}
          {view === 'map' && activeSong && (
            <motion.div key="map" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-indigo-950 overflow-y-auto p-8 flex flex-col items-center">
              <h2 className="text-4xl font-black text-white uppercase tracking-widest mb-2 drop-shadow-lg text-center">{activeSong.title}</h2>
              <p className="text-indigo-300 font-bold mb-12 uppercase tracking-widest text-sm">Song Mastery Pathway</p>

              <div className="relative w-full max-w-lg flex flex-col items-center py-12">
                {/* Winding Path Line */}
                <div className="absolute top-0 bottom-0 w-4 bg-indigo-800/50 rounded-full" />

                {activeSong.checkpoints.map((cp, idx) => (
                  <div key={cp.id} className={`relative flex items-center w-full mb-24 ${idx % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <button 
                      onClick={() => { setActiveCheckpointId(cp.id); setView('briefing'); }}
                      className={`relative z-10 w-48 p-4 rounded-2xl border-4 shadow-xl transition-all hover:scale-110 flex flex-col items-center text-center ${
                        cp.completed ? 'bg-emerald-500 border-emerald-300 text-white' : 'bg-white border-indigo-400 text-indigo-900'
                      }`}
                    >
                      <span className="font-black uppercase text-sm mb-1">Checkpoint {cp.id}</span>
                      <span className="font-bold text-xs opacity-80 leading-tight">{cp.title}</span>
                      {cp.completed && <div className="absolute -top-3 -right-3 bg-amber-400 text-white rounded-full p-1 border-2 border-white"><Star className="w-4 h-4 fill-white" /></div>}
                    </button>
                    {/* Connecting line to center */}
                    <div className={`absolute top-1/2 w-1/2 h-2 ${cp.completed ? 'bg-emerald-500' : 'bg-indigo-400'} ${idx % 2 === 0 ? 'left-1/2' : 'right-1/2'}`} style={{ zIndex: 0 }} />
                  </div>
                ))}

                {/* Grand Finale Stage */}
                <div className="relative z-10 mt-12">
                  <button 
                    onClick={() => setView('finale')}
                    disabled={!allCheckpointsCleared}
                    className={`w-64 h-64 rounded-full border-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center transition-all ${
                      allCheckpointsCleared 
                        ? 'bg-amber-400 border-yellow-200 hover:scale-105 hover:bg-amber-300 cursor-pointer text-amber-900' 
                        : 'bg-slate-800 border-slate-600 text-slate-500 grayscale opacity-80 cursor-not-allowed'
                    }`}
                  >
                    {!allCheckpointsCleared && <Lock className="w-12 h-12 mb-2" />}
                    <Award className={`w-20 h-20 mb-2 ${allCheckpointsCleared ? 'text-amber-700' : ''}`} />
                    <span className="font-black text-2xl uppercase tracking-widest text-center leading-tight">Grand<br/>Finale</span>
                    {!allCheckpointsCleared && <span className="text-xs font-bold mt-4 uppercase">Clear checkpoints first</span>}
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* VIEW 3: CHECKPOINT BRIEFING */}
          {view === 'briefing' && activeCheckpoint && (
            <motion.div key="briefing" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-white max-w-md w-full rounded-[3rem] border-8 border-indigo-500 p-8 text-center shadow-2xl flex flex-col items-center">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6 border-4 border-indigo-200">
                  <Map className="w-12 h-12 text-indigo-500" />
                </div>
                <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest mb-2">Checkpoint {activeCheckpoint.id}</h3>
                <h2 className="text-3xl font-black text-indigo-900 mb-6">{activeCheckpoint.title}</h2>
                <p className="text-slate-600 font-bold mb-8">
                  Pedagogical Focus: We need to master this tricky section before we can perform the full song! We will launch a customized <strong>{activeCheckpoint.minigame}</strong> arena loaded only with notes from this measure.
                </p>
                <button 
                  onClick={() => setView('minigame')}
                  className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xl uppercase rounded-2xl shadow-[0_6px_0_#4338ca] active:translate-y-1.5 active:shadow-none transition-all"
                >
                  Start Checkpoint Drill
                </button>
              </div>
            </motion.div>
          )}

          {/* VIEW 4: INTEGRATED MINIGAME (SIMULATION) */}
          {view === 'minigame' && activeCheckpoint && (
            <motion.div key="minigame" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 bg-slate-800 flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative">
                 <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                 <h2 className="text-4xl font-black text-white uppercase tracking-widest mb-4 z-10">Simulation Arena</h2>
                 <p className="text-xl text-slate-300 font-bold max-w-lg mb-12 z-10">
                   (In production, this dynamically loads <strong>{activeCheckpoint.minigame}</strong> configured with custom checkpoint JSON data).
                 </p>
                 <button 
                   onClick={handleClearCheckpoint}
                   className="z-10 px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-2xl uppercase rounded-3xl shadow-[0_8px_0_#059669] active:translate-y-2 active:shadow-none transition-all flex items-center gap-3"
                 >
                   Simulate Win & Clear Checkpoint
                 </button>
              </div>
            </motion.div>
          )}

          {/* VIEW 5: GRAND FINALE STAGE */}
          {view === 'finale' && activeSong && (
            <motion.div key="finale" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900 flex flex-col overflow-hidden">
              {/* Top Half: Sheet Music */}
              <div className="flex-1 bg-white p-8 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-4 left-4 bg-amber-100 text-amber-800 font-black px-4 py-1 rounded-full uppercase text-xs tracking-widest border border-amber-300">
                  Digital Sheet Music Reader
                </div>
                {/* Fake Sheet Music Display */}
                <div className="w-full max-w-4xl h-48 border-y-4 border-slate-300 flex flex-col justify-evenly opacity-30 relative">
                  {[1,2,3,4,5].map(i => <div key={i} className="w-full h-1 bg-slate-800" />)}
                  <div className="absolute left-12 text-8xl -mt-6">𝄞</div>
                  <div className="absolute left-32 text-6xl font-serif">4<br/>4</div>
                  <div className="absolute left-56 flex gap-12">
                    <div className="w-4 h-4 bg-slate-900 rounded-full mt-4" />
                    <div className="w-4 h-4 bg-slate-900 rounded-full mt-8" />
                    <div className="w-4 h-4 bg-slate-900 rounded-full mt-12" />
                  </div>
                  {/* Highlight bar that moves */}
                  {isPerforming && (
                    <motion.div 
                      initial={{ left: '0%' }} 
                      animate={{ left: '100%' }} 
                      transition={{ duration: 10, ease: 'linear' }} 
                      className="absolute top-0 bottom-0 w-16 bg-blue-500/20 border-l-4 border-blue-500 z-10" 
                    />
                  )}
                </div>
              </div>
              
              {/* Bottom Half: Performance UI */}
              <div className="h-64 bg-slate-800 p-8 flex flex-col items-center justify-center border-t-8 border-slate-700 relative">
                {!isPerforming ? (
                  <button 
                    onClick={() => { setFinaleTimer(0); setIsPerforming(true); }}
                    className="w-80 py-5 bg-amber-500 hover:bg-amber-400 text-white font-black text-2xl uppercase rounded-full shadow-[0_8px_0_#d97706] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-4"
                  >
                    <Play className="w-8 h-8 fill-white" /> Perform Song
                  </button>
                ) : (
                  <div className="flex flex-col items-center w-full max-w-2xl">
                    <div className="flex gap-2 items-center mb-6 h-16 w-full px-12">
                      <Mic className="w-8 h-8 text-rose-500 animate-pulse mr-4" />
                      {/* Fake Audio Waveform */}
                      {Array.from({ length: 30 }).map((_, i) => (
                        <motion.div 
                          key={i} 
                          animate={{ height: [10, Math.random() * 50 + 10, 10] }} 
                          transition={{ repeat: Infinity, duration: 0.2 + Math.random() * 0.5 }}
                          className="flex-1 bg-emerald-400 rounded-full w-2"
                        />
                      ))}
                    </div>
                    <p className="text-amber-400 font-black uppercase tracking-widest animate-pulse text-xl">
                      {finaleTimer < 3 ? `Countdown: ${3 - finaleTimer}...` : 'Listening & Evaluating...'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* VIEW 6: REWARD / CONFETTI STAGE */}
          {view === 'reward' && activeSong && (
            <motion.div key="reward" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 bg-purple-900 flex flex-col items-center justify-center text-center z-50">
               <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-9xl mb-6">🏆</motion.div>
               <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-5xl font-black text-amber-400 uppercase tracking-widest mb-4">Repertoire Mastered!</motion.h2>
               <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="text-2xl text-purple-200 font-bold mb-12 max-w-lg">
                 You successfully performed "{activeSong.title}". The curtain closes with thunderous applause!
               </motion.p>
               <motion.button 
                 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}
                 onClick={() => setView('carousel')} 
                 className="px-10 py-5 bg-white text-purple-900 font-black text-xl uppercase rounded-full shadow-[0_6px_0_#cbd5e1] active:translate-y-1.5 active:shadow-none transition-all flex items-center gap-3"
               >
                 Return to Hub
               </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
