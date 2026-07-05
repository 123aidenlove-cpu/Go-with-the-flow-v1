import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RefreshCw, Trophy, Anchor } from 'lucide-react';

interface FingerFishingProps {
  onBack: () => void;
  onComplete?: () => void;
}

interface Fish {
  id: number;
  color: string;
  note: 'F' | 'G';
  top: number; // percentage
  left: number; // percentage
  speed: number;
  direction: 'left' | 'right';
}

export default function FingerFishing({ onBack, onComplete }: FingerFishingProps) {
  const [caughtCount, setCaughtCount] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [shakeFishId, setShakeFishId] = useState<number | null>(null);
  const [fishList, setFishList] = useState<Fish[]>([]);

  // Generate initial list of 6 fish
  const generateFish = (id: number, forcedNote?: 'F' | 'G'): Fish => {
    const notes: ('F' | 'G')[] = ['F', 'G'];
    const selectedNote = forcedNote || (Math.random() > 0.35 ? 'G' : 'F');
    const colors = ['bg-rose-400', 'bg-emerald-400', 'bg-amber-400', 'bg-violet-400', 'bg-sky-400'];
    
    return {
      id,
      color: colors[Math.floor(Math.random() * colors.length)],
      note: selectedNote,
      top: Math.random() * 55 + 20, // keep between 20% and 75% height
      left: Math.random() * 60 + 10, // keep between 10% and 70% width
      speed: Math.random() * 1.5 + 1,
      direction: Math.random() > 0.5 ? 'left' : 'right'
    };
  };

  useEffect(() => {
    // Generate exactly 4 Gs and 2 Fs initially
    const initialFish: Fish[] = [
      generateFish(1, 'G'),
      generateFish(2, 'G'),
      generateFish(3, 'G'),
      generateFish(4, 'G'),
      generateFish(5, 'F'),
      generateFish(6, 'F')
    ];
    setFishList(initialFish);
  }, []);

  const handleFishClick = (fish: Fish) => {
    if (levelComplete) return;

    if (fish.note === 'G') {
      // Success! Remove fish, increment count
      setCaughtCount((prev) => {
        const next = prev + 1;
        if (next >= 8) {
          setLevelComplete(true);
          if (onComplete) onComplete();
        }
        return next;
      });

      // Remove and replace fish to keep Gs on screen
      setFishList((prev) => 
        prev.map((f) => f.id === fish.id ? generateFish(fish.id, 'G') : f)
      );
    } else {
      // Incorrect fish clicked! Shake it
      setShakeFishId(fish.id);
      setTimeout(() => setShakeFishId(null), 500);
    }
  };

  const handleRestart = () => {
    setCaughtCount(0);
    setLevelComplete(false);
    const initialFish: Fish[] = [
      generateFish(1, 'G'),
      generateFish(2, 'G'),
      generateFish(3, 'G'),
      generateFish(4, 'G'),
      generateFish(5, 'F'),
      generateFish(6, 'F')
    ];
    setFishList(initialFish);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-cyan-400 via-blue-500 to-indigo-800" id="finger-fishing-arena">
      {/* Ocean bubbles animation background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute w-4 h-4 bg-white/40 rounded-full bottom-0 left-[15%] animate-[bounce_5s_infinite]" />
        <div className="absolute w-2 h-2 bg-white/40 rounded-full bottom-0 left-[35%] animate-[bounce_8s_infinite]" />
        <div className="absolute w-3 h-3 bg-white/40 rounded-full bottom-0 left-[55%] animate-[bounce_6s_infinite]" />
        <div className="absolute w-5 h-5 bg-white/40 rounded-full bottom-0 left-[80%] animate-[bounce_7s_infinite]" />
      </div>

      {/* Top Header Row */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <button
          id="fishing-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 font-sans font-semibold text-sky-900 transition-all rounded-xl bg-white/80 hover:bg-white active:scale-95 shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Map
        </button>

        <h1 className="hidden sm:block text-2xl font-black tracking-wider text-white uppercase font-sans drop-shadow">
          🐠 Finger Fishing Dock
        </h1>

        <button
          id="fishing-reset-btn"
          onClick={handleRestart}
          className="p-2 text-white bg-white/20 hover:bg-white/30 rounded-xl transition-all border border-white/20"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Underwater Arena */}
      <div className="relative h-[calc(100vh-100px)] w-full">
        {/* Diver Avatar HUD (Top Right) */}
        <div className="absolute right-6 top-2 z-20 flex items-start gap-4" id="diver-hud">
          <div className="relative p-4 bg-white border-2 border-cyan-300 rounded-2xl shadow-xl max-w-xs">
            {/* Arrow decoration */}
            <div className="absolute right-4 top-1/2 -mr-3 h-4 w-4 rotate-45 border-r-2 border-t-2 border-cyan-300 bg-white transform -translate-y-1/2" />
            <p className="font-sans text-sm font-bold text-cyan-900">
              Catch all the <span className="font-extrabold text-orange-500 underline text-base">Gs</span> to fill up the basket!
            </p>
            <div className="flex justify-between mt-2 pt-2 border-t border-cyan-100">
              <span className="text-xs font-black text-cyan-600 uppercase">Level 3</span>
              <span className="text-xs font-black text-emerald-600">Goal: Catch 8 Gs</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-cyan-300 bg-cyan-100 rounded-full flex items-center justify-center text-3xl shadow-xl">
              🤿
            </div>
            <span className="mt-1 text-xs font-bold text-white uppercase tracking-wider drop-shadow">Diver Dan</span>
          </div>
        </div>

        {/* Floating seaweed illustration */}
        <div className="absolute bottom-0 left-4 w-12 h-40 bg-emerald-600/50 rounded-t-full pointer-events-none blur-[1px]" />
        <div className="absolute bottom-0 left-12 w-8 h-32 bg-emerald-500/40 rounded-t-full pointer-events-none blur-[1px]" />
        <div className="absolute bottom-0 right-16 w-16 h-48 bg-teal-600/50 rounded-t-full pointer-events-none blur-[1px]" />

        {/* Fish Entities */}
        <div className="absolute inset-0 z-10">
          <AnimatePresence>
            {fishList.map((fish) => {
              const isShaking = shakeFishId === fish.id;
              
              return (
                <motion.div
                  key={fish.id}
                  onClick={() => handleFishClick(fish)}
                  className={`absolute cursor-pointer select-none`}
                  style={{ top: `${fish.top}%`, left: `${fish.left}%` }}
                  animate={isShaking ? {
                    x: [0, -10, 10, -10, 10, 0],
                    transition: { duration: 0.4 }
                  } : {
                    y: [0, -6, 6, 0],
                    transition: {
                      repeat: Infinity,
                      duration: 3 + fish.id % 2,
                      ease: 'easeInOut'
                    }
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  id={`fish-${fish.id}`}
                >
                  <div className="relative">
                    {/* Fish Body Container */}
                    <div className={`relative flex items-center justify-center w-32 h-16 rounded-[50%] ${fish.color} border-2 border-white shadow-lg`}>
                      {/* Fish Tail */}
                      <div className={`absolute left-[-12px] top-4 w-0 h-0 border-t-[16px] border-t-transparent border-b-[16px] border-b-transparent border-r-[24px] ${fish.color.replace('bg-', 'border-r-')} filter drop-shadow`} />
                      
                      {/* Fish Eye */}
                      <div className="absolute right-4 top-4 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center border border-black/20">
                        <div className="w-1.5 h-1.5 bg-black rounded-full" />
                      </div>

                      {/* Music Staff Side Plate */}
                      <div className="absolute left-6 top-3 bg-white w-14 h-10 rounded-lg flex items-center justify-center border border-neutral-300 shadow-sm p-0.5">
                        <div className="relative w-full h-full">
                          {/* 5 lines */}
                          <div className="absolute inset-x-0 top-1 h-[1px] bg-neutral-400" />
                          <div className="absolute inset-x-0 top-3.5 h-[1px] bg-neutral-400" />
                          <div className="absolute inset-x-0 top-6 h-[1px] bg-neutral-400" />
                          <div className="absolute inset-x-0 top-8.5 h-[1px] bg-neutral-400" />
                          <div className="absolute inset-x-0 top-11 h-[1px] bg-neutral-400" />
                          
                          {/* Note head */}
                          {fish.note === 'G' ? (
                            // G sits perfectly centered on the 2nd line from bottom (top-8.5)
                            <div className="absolute left-[24px] top-[7.5px] w-2.5 h-2 bg-neutral-900 rounded-full rotate-[-15deg]" />
                          ) : (
                            // F sits in the first space (between bottom and second line, i.e., top-9.75)
                            <div className="absolute left-[24px] top-[9.75px] w-2.5 h-2 bg-neutral-900 rounded-full rotate-[-15deg]" />
                          )}
                          
                          {/* Treble Clef label/indicator */}
                          <span className="absolute left-0.5 top-[1px] text-[10px] text-neutral-500 font-bold font-sans">🎼</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Collection Basket & Tracker (Bottom Right) */}
        <div className="absolute bottom-6 right-6 z-20 flex flex-col items-center" id="basket-hud">
          {/* Basket Shape */}
          <div className="relative flex items-center justify-center w-40 h-24 bg-amber-800 border-t-8 border-amber-900 rounded-b-3xl shadow-2xl border-l-4 border-r-4">
            {/* Basket Weave pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
            
            <div className="text-center z-10 text-white">
              <Anchor className="w-8 h-8 mx-auto text-amber-300 opacity-60 mb-1" />
              <div className="font-mono text-xl font-black drop-shadow tracking-wider">
                {caughtCount} / 8
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-200">Gs Caught</span>
            </div>
          </div>
        </div>

        {/* Level Complete Overlay */}
        <AnimatePresence>
          {levelComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 flex items-center justify-center z-30"
              id="level-complete-overlay"
            >
              <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="p-8 text-center bg-white border-4 border-emerald-400 rounded-3xl max-w-sm shadow-2xl"
              >
                <div className="inline-flex p-4 bg-emerald-100 rounded-full mb-4">
                  <Trophy className="w-12 h-12 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black text-emerald-950">Level Complete!</h2>
                <p className="mt-2 text-sm text-neutral-600">
                  You caught all 8 G notes perfectly! Dan is proud. Your musical sight-reading is getting sharper!
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    id="complete-back-map"
                    onClick={onBack}
                    className="flex-1 px-4 py-2 font-sans font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all active:scale-95 shadow-md"
                  >
                    Next Game
                  </button>
                  <button
                    id="complete-restart"
                    onClick={handleRestart}
                    className="px-4 py-2 font-sans font-semibold text-neutral-600 border border-neutral-300 hover:bg-neutral-50 rounded-xl transition-all"
                  >
                    Play Again
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
