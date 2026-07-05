import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RefreshCw, Check, AlertCircle, Play } from 'lucide-react';

interface PizzeriaProps {
  onBack: () => void;
  onComplete?: () => void;
  isDailyChallenge?: boolean;
  onChallengeComplete?: (score: number, accuracy: number) => void;
}

export default function Pizzeria({
  onBack,
  onComplete,
  isDailyChallenge = false,
  onChallengeComplete,
}: PizzeriaProps) {
  const [songProgress, setSongProgress] = useState(0);
  const [baseSelected, setBaseSelected] = useState<string | null>(null);
  const [baseStatus, setBaseStatus] = useState<'correct' | 'incorrect' | null>(null);
  
  // Fingering states: index 0: Back Thumb, indexes 1-3: Left Hand (top, mid, bottom), indexes 4-6: Right Hand (top, mid, bottom)
  const [fingers, setFingers] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [fingeringStatus, setFingeringStatus] = useState<'success' | 'error' | null>(null);
  
  const [baked, setBaked] = useState(false);

  const handleBaseSelect = (base: string, beats: number) => {
    setBaseSelected(base);
    if (beats === 2) {
      setBaseStatus('correct');
      // Reset fingers
      setFingers([false, false, false, false, false, false, false]);
      setFingeringStatus(null);
    } else {
      setBaseStatus('incorrect');
      setFingeringStatus(null);
    }
  };

  const toggleFinger = (index: number) => {
    if (baked) return;
    setFingers((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const checkFingering = () => {
    // For note E, ONLY the 'Back Thumb' (index 0) and the top 'Left Hand' pointer finger (index 1) should be filled.
    const isThumbCovered = fingers[0];
    const isL1Covered = fingers[1];
    const othersCovered = fingers.slice(2).some(f => f);

    if (isThumbCovered && isL1Covered && !othersCovered) {
      setFingeringStatus('success');
      setBaked(true);
      setSongProgress((prev) => {
        const next = prev + 1;
        if (isDailyChallenge && next >= 5) {
          if (onChallengeComplete) {
            onChallengeComplete(5, 100);
          }
        } else if (next >= 8 && onComplete) {
          onComplete();
        }
        return next;
      });
    } else {
      setFingeringStatus('error');
    }
  };

  const resetOrder = () => {
    setBaseSelected(null);
    setBaseStatus(null);
    setFingers([false, false, false, false, false, false, false]);
    setFingeringStatus(null);
    setBaked(false);
  };

  return (
    <div className="min-h-screen bg-orange-50/70 p-6 flex flex-col" id="pizzeria-container">
      {/* Header */}
      <div className="flex items-center justify-between max-w-6xl w-full mx-auto mb-6">
        <button
          id="pizzeria-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 font-sans font-semibold text-orange-900 transition-all rounded-xl bg-white hover:bg-orange-100 border border-orange-200 active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Map
        </button>

        <div className="text-center">
          <span className="text-3xl" role="img" aria-label="Pizza slice">🍕</span>
          <h1 className="text-2xl font-black text-orange-950 uppercase tracking-tight">
            Music Making Pizzeria
          </h1>
        </div>

        <button
          id="pizzeria-reset-btn"
          onClick={() => {
            setSongProgress(0);
            resetOrder();
          }}
          className="p-2 text-orange-700 bg-white hover:bg-orange-100 rounded-xl transition-all border border-orange-200"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Main Board Progress Tracker */}
      <div className="max-w-4xl w-full mx-auto mb-8 bg-white border-2 border-orange-200 p-4 rounded-2xl shadow-md">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-black text-orange-900 uppercase">Song Progress: Level 1</span>
          <span className="text-sm font-bold text-orange-700">{songProgress} / 8 Notes Baked</span>
        </div>
        <div className="w-full h-4 bg-orange-100 rounded-full overflow-hidden border border-orange-200">
          <motion.div 
            className="h-full bg-gradient-to-r from-orange-400 to-red-500" 
            animate={{ width: `${(songProgress / 8) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Grid of 4 Vertical Segments (Workflow columns) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl w-full mx-auto flex-1 items-stretch" id="pizzeria-segments">
        
        {/* Segment A: Order Ticket */}
        <div className="bg-white border-2 border-neutral-300 rounded-2xl shadow-xl flex flex-col overflow-hidden min-h-[420px]" id="segment-a">
          <div className="bg-neutral-800 text-white text-xs font-black uppercase tracking-wider py-2 px-4 text-center">
            A: Order Ticket
          </div>
          
          <div className="flex-1 p-6 flex flex-col justify-center">
            {/* Lined Paper notepad aesthetic */}
            <div className="relative border-2 border-amber-100 bg-[#fffdf0] rounded-xl shadow-md p-6 flex-1 flex flex-col justify-between before:absolute before:inset-y-0 before:left-6 before:w-[2px] before:bg-red-300">
              <div className="text-right border-b border-dashed border-neutral-300 pb-2 mb-4">
                <span className="font-mono text-xs font-bold text-red-500">Order #01E</span>
              </div>

              <div className="pl-6 text-center space-y-3 my-auto">
                <h4 className="font-mono text-lg font-bold text-neutral-500 uppercase tracking-widest">Papa's Pizzeris</h4>
                <div className="text-6xl font-black text-neutral-800 font-sans tracking-wide">E</div>
                <div className="inline-block px-3 py-1 font-sans text-xs font-bold text-amber-900 bg-amber-200 rounded-full">
                  2 beats required
                </div>
              </div>

              <div className="pl-6 mt-6 border-t border-dashed border-neutral-300 pt-2 text-center">
                <span className="font-mono text-[10px] text-neutral-400">Freshly prepared in real-time</span>
              </div>
            </div>
          </div>
        </div>

        {/* Segment B: Base Selection */}
        <div className="bg-white border-2 border-neutral-300 rounded-2xl shadow-xl flex flex-col overflow-hidden min-h-[420px]" id="segment-b">
          <div className="bg-neutral-800 text-white text-xs font-black uppercase tracking-wider py-2 px-4 text-center">
            B: Base Selection
          </div>
          
          <div className="flex-1 p-5 flex flex-col justify-between">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-2 block">Choose note duration:</span>
            
            <div className="space-y-3 flex-1 flex flex-col justify-center">
              {[
                { name: 'Crotchet', beats: 1, desc: '1 Beat', symbol: '♩' },
                { name: 'Quaver', beats: 0.5, desc: '1/2 Beat', symbol: '♫' },
                { name: 'Minim', beats: 2, desc: '2 Beats', symbol: '𝅗𝅥' },
                { name: 'Semibreve', beats: 4, desc: '4 Beats', symbol: '𝅗' }
              ].map((base) => (
                <button
                  key={base.name}
                  id={`base-btn-${base.name}`}
                  onClick={() => handleBaseSelect(base.name, base.beats)}
                  disabled={baked}
                  className={`w-full flex items-center justify-between p-3 border-2 rounded-xl transition-all font-sans ${
                    baseSelected === base.name
                      ? base.beats === 2
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 scale-[0.98]'
                        : 'bg-rose-50 border-rose-500 text-rose-950 scale-[0.98]'
                      : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-extrabold text-sm">{base.name}</div>
                    <div className="text-xs text-neutral-500">{base.desc}</div>
                  </div>
                  <span className="text-2xl font-bold select-none text-neutral-800">{base.symbol}</span>
                </button>
              ))}
            </div>

            {/* Success/Error message box */}
            <div className="mt-4 h-12 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {baseStatus === 'correct' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg w-full justify-center"
                  >
                    <Check className="w-4 h-4" />
                    Perfect Base!
                  </motion.div>
                )}
                {baseStatus === 'incorrect' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-1.5 text-rose-600 font-bold text-sm bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg w-full justify-center"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Try Again!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Segment C: Clarinet Toppings */}
        <div className="bg-white border-2 border-neutral-300 rounded-2xl shadow-xl flex flex-col overflow-hidden min-h-[420px]" id="segment-c">
          <div className="bg-neutral-800 text-white text-xs font-black uppercase tracking-wider py-2 px-4 text-center">
            C: Clarinet Toppings
          </div>
          
          <div className="flex-1 p-4 flex flex-col">
            {baseStatus === 'correct' ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex-1 flex flex-col justify-between"
              >
                <div className="text-center">
                  <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                    Press the right fingers down:
                  </h4>
                  
                  {/* Vertical Clarinet Fingering Visualizer */}
                  <div className="relative w-24 mx-auto py-3 bg-neutral-100 border border-neutral-200 rounded-2xl flex flex-col items-center gap-3">
                    {/* Back Thumb (Left offset) */}
                    <div className="flex items-center w-full justify-start pl-3">
                      <button
                        id="finger-btn-thumb"
                        onClick={() => toggleFinger(0)}
                        className={`w-6 h-6 rounded-full border-2 border-black transition-all ${
                          fingers[0] ? 'bg-black scale-90' : 'bg-white'
                        }`}
                      />
                      <span className="text-[8px] font-bold uppercase font-mono text-neutral-500 ml-1">Thumb</span>
                    </div>

                    <div className="w-5/6 h-[2px] bg-neutral-300" />

                    {/* Left Hand top joint (3 stacked circles) */}
                    <div className="flex flex-col gap-2 items-center">
                      <span className="text-[7px] font-bold text-neutral-400 uppercase tracking-widest">Left Hand</span>
                      {[1, 2, 3].map((idx) => (
                        <button
                          key={idx}
                          id={`finger-btn-l${idx}`}
                          onClick={() => toggleFinger(idx)}
                          className={`w-6 h-6 rounded-full border-2 border-black transition-all ${
                            fingers[idx] ? 'bg-black scale-90' : 'bg-white'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="w-5/6 h-[2px] bg-neutral-300" />

                    {/* Right Hand bottom joint (3 stacked circles) */}
                    <div className="flex flex-col gap-2 items-center">
                      <span className="text-[7px] font-bold text-neutral-400 uppercase tracking-widest">Right Hand</span>
                      {[4, 5, 6].map((idx) => (
                        <button
                          key={idx}
                          id={`finger-btn-r${idx - 3}`}
                          onClick={() => toggleFinger(idx)}
                          className={`w-6 h-6 rounded-full border-2 border-black transition-all ${
                            fingers[idx] ? 'bg-black scale-90' : 'bg-white'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bake Pizza Trigger */}
                <div className="mt-4">
                  {!baked ? (
                    <button
                      id="bake-pizza-btn"
                      onClick={checkFingering}
                      className="w-full py-2.5 font-sans font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl hover:from-orange-600 hover:to-red-600 active:scale-95 transition-all shadow-md text-sm"
                    >
                      Bake Pizza!
                    </button>
                  ) : (
                    <div className="w-full py-2.5 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-center border border-emerald-200 text-sm">
                      Successfully Baked!
                    </div>
                  )}

                  {fingeringStatus === 'error' && (
                    <p className="text-center text-xs font-bold text-rose-500 mt-1.5 animate-bounce">
                      Check your fingers! ❌
                    </p>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <span className="text-3xl opacity-40 mb-2">🔒</span>
                <p className="text-xs text-neutral-400 font-medium">
                  Select the correct Base pizza dough first to unlock toppings!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Segment D: The Oven */}
        <div className="bg-white border-2 border-neutral-300 rounded-2xl shadow-xl flex flex-col overflow-hidden min-h-[420px]" id="segment-d">
          <div className="bg-neutral-800 text-white text-xs font-black uppercase tracking-wider py-2 px-4 text-center">
            D: The Oven
          </div>
          
          <div className="flex-1 p-4 flex flex-col justify-between">
            {baked ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="flex-1 flex flex-col justify-between"
              >
                {/* Brick Pizza Oven Container */}
                <div className="bg-rose-800 p-4 border-4 border-amber-950 rounded-t-3xl shadow-inner relative overflow-hidden flex flex-col justify-center items-center h-48 border-b-8">
                  {/* Brick pattern overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] opacity-15" />
                  
                  {/* Sheet Music baked inside */}
                  <div className="relative w-40 h-28 bg-[#fffcf5] border-2 border-amber-950 rounded-lg shadow-xl p-3 flex flex-col justify-center">
                    {/* 5 horizontal black lines */}
                    <div className="relative w-full h-16">
                      <div className="absolute inset-x-0 top-1 h-[1.5px] bg-neutral-900" />
                      <div className="absolute inset-x-0 top-[14px] h-[1.5px] bg-neutral-900" />
                      <div className="absolute inset-x-0 top-[27px] h-[1.5px] bg-neutral-900" />
                      <div className="absolute inset-x-0 top-[40px] h-[1.5px] bg-neutral-900" />
                      <div className="absolute inset-x-0 top-[53px] h-[1.5px] bg-neutral-900" />
                      
                      {/* Treble clef */}
                      <span className="absolute left-1 top-0.5 text-3xl font-bold text-neutral-800">🎼</span>
                      
                      {/* Baked Minim note head sitting perfectly on bottom line (Middle E) */}
                      {/* Oval note head (unfilled, empty center, thick border, vertical stem) */}
                      <div className="absolute left-16 top-[47px] w-[14px] h-3 border-2 border-neutral-900 rounded-full rotate-[-15deg] bg-transparent flex items-center justify-center">
                        {/* Stem going up */}
                        <div className="absolute left-[11px] bottom-1 w-[1.5px] h-8 bg-neutral-900" />
                      </div>
                    </div>
                  </div>

                  {/* Hot glowing coals reflection */}
                  <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-orange-500 to-transparent opacity-80" />
                </div>

                <div className="mt-4 text-center">
                  <p className="text-xs font-bold text-amber-950 mb-2">
                    Perfect! That is a Minim E on the bottom line! 🥖✨
                  </p>

                  <button
                    id="pizzeria-next-btn"
                    onClick={resetOrder}
                    className="w-full py-2.5 font-sans font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all shadow-md text-sm flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Next Note!
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <span className="text-4xl opacity-40 mb-2">🔥</span>
                <p className="text-xs text-neutral-400 font-medium">
                  Complete Base Selection and Toppings to bake your note in the brick oven!
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
