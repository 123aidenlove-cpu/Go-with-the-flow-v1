import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Check, AlertTriangle, RotateCcw, Volume2 } from 'lucide-react';

interface SightReadSoaringProps {
  onBack: () => void;
  onComplete?: () => void;
}

type NoteType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'REST';

export default function SightReadSoaring({ onBack, onComplete }: SightReadSoaringProps) {
  const targetSequence: NoteType[] = ['E', 'D', 'C', 'D', 'E', 'E', 'E'];
  const [userInputs, setUserInputs] = useState<NoteType[]>([]);
  const [gamePhase, setGamePhase] = useState<'writing' | 'playing'>('writing');
  const [shakeStave, setShakeStave] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<string | null>(null);

  const handleKeyClick = (note: NoteType) => {
    if (gamePhase !== 'writing') return;

    const currentIndex = userInputs.length;
    const expectedNote = targetSequence[currentIndex];

    if (note === expectedNote) {
      setUserInputs((prev) => {
        const next = [...prev, note];
        if (next.length === targetSequence.length) {
          // All 7 correct, switch to playing phase
          setGamePhase('playing');
        }
        return next;
      });
      
      // Play a little synthesized synth note to give feedback
      playSynthNote(note);
    } else {
      // Mistake! Shake stave
      setShakeStave(true);
      setTimeout(() => setShakeStave(false), 500);
    }
  };

  // Simple Web Audio synth to play a tone
  const playSynthNote = (note: string) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      const freqs: Record<string, number> = {
        'C': 261.63, 'D': 293.66, 'E': 329.63, 'F': 349.23, 'G': 392.00, 'A': 440.00, 'B': 493.88
      };
      
      osc.type = 'sine';
      osc.frequency.value = freqs[note] || 440;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn("Audio Context not allowed or initialized yet", e);
    }
  };

  const handleSelfAssessment = (result: 'perfect' | 'missed' | 'review') => {
    if (result === 'perfect') {
      setAssessmentResult('cleared');
      if (onComplete) onComplete();
    } else {
      // Reset back to writing to practice again
      setGamePhase('writing');
      setUserInputs([]);
      setAssessmentResult(null);
    }
  };

  const resetGame = () => {
    setUserInputs([]);
    setGamePhase('writing');
    setAssessmentResult(null);
  };

  return (
    <div className="min-h-screen bg-sky-400 p-6 flex flex-col justify-between overflow-hidden relative" id="sight-read-soaring-arena">
      
      {/* Clouds decorative elements in the background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-10 left-[10%] w-36 h-12 bg-white rounded-full blur-[1px]" />
        <div className="absolute top-28 left-[45%] w-48 h-16 bg-white rounded-full blur-[1px]" />
        <div className="absolute top-16 right-[15%] w-40 h-14 bg-white rounded-full blur-[1px]" />
      </div>

      {/* Top HUD */}
      <div className="relative z-10 flex items-center justify-between">
        <button
          id="soaring-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 font-sans font-semibold text-sky-900 transition-all rounded-xl bg-white/95 hover:bg-white active:scale-95 shadow-md border border-sky-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Map
        </button>

        <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl border border-sky-200 shadow-md">
          <span className="text-3xl animate-[bounce_3s_infinite]" role="img" aria-label="Biplane">✈️</span>
          <span className="text-sm font-black text-sky-950 uppercase tracking-wider font-sans">Sight Read Soaring</span>
        </div>

        <button
          id="soaring-reset-btn"
          onClick={resetGame}
          className="p-2 text-sky-800 bg-white/90 hover:bg-white rounded-xl transition-all border border-sky-200"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Center Stave & Inputs Display */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-6">
        <AnimatePresence mode="wait">
          {gamePhase === 'writing' ? (
            <motion.div
              key="writing-board"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`w-full max-w-2xl bg-white border-4 border-sky-500 rounded-3xl p-6 shadow-2xl relative transition-all duration-300 ${
                shakeStave ? 'translate-x-1 ring-4 ring-rose-400' : ''
              }`}
              id="stave-drawing-board"
            >
              {/* Treble Stave with 7 notes */}
              <div className="relative h-24 border-neutral-300 border-b pb-1 mb-8">
                {/* 5 Staff lines */}
                <div className="absolute inset-x-0 top-2 h-[1.5px] bg-neutral-800" />
                <div className="absolute inset-x-0 top-[22px] h-[1.5px] bg-neutral-800" />
                <div className="absolute inset-x-0 top-[42px] h-[1.5px] bg-neutral-800" />
                <div className="absolute inset-x-0 top-[62px] h-[1.5px] bg-neutral-800" />
                <div className="absolute inset-x-0 top-[82px] h-[1.5px] bg-neutral-800" />
                
                {/* Treble Clef label */}
                <span className="absolute left-2 top-[1px] text-5xl select-none text-neutral-800">🎼</span>

                {/* 7 Notes inline row */}
                <div className="absolute left-20 right-4 top-0 bottom-0 flex justify-between px-2">
                  {targetSequence.map((note, index) => {
                    const isTyped = index < userInputs.length;
                    
                    return (
                      <div key={index} className="relative w-8 h-full flex items-center justify-center">
                        {/* Note Head placement based on pitch */}
                        <div 
                          className={`absolute w-5 h-3.5 rounded-full rotate-[-15deg] transition-all duration-300 ${
                            isTyped ? 'bg-emerald-500' : 'bg-neutral-800'
                          }`}
                          style={{
                            top: note === 'E' 
                              ? '75px'  // bottom line
                              : note === 'D'
                                ? '85px'  // hanging below
                                : '95px'  // C (middle C ledger line space)
                          }}
                        >
                          {/* Stem */}
                          <div className={`absolute left-[18px] bottom-[3px] w-[1.5px] h-10 ${
                            isTyped ? 'bg-emerald-500' : 'bg-neutral-800'
                          }`} />
                          
                          {/* Middle C Ledger line helper */}
                          {note === 'C' && (
                            <div className="absolute left-[-4px] top-[5px] w-7 h-[1.5px] bg-neutral-800 z-10 pointer-events-none" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Typed letters boxes row */}
              <div className="grid grid-cols-7 gap-3 max-w-lg mx-auto" id="typing-feedback-boxes">
                {targetSequence.map((_, index) => {
                  const inputVal = userInputs[index];
                  const isActive = index === userInputs.length;
                  
                  return (
                    <div
                      key={index}
                      className={`h-12 border-2 rounded-xl flex items-center justify-center font-sans font-black text-lg shadow-sm transition-all duration-200 ${
                        inputVal
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : isActive
                            ? 'bg-sky-50 border-sky-400 scale-105 animate-pulse'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-300'
                      }`}
                    >
                      {inputVal || ''}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="playing-board"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-xl bg-white border-4 border-amber-400 rounded-3xl p-8 shadow-2xl text-center flex flex-col justify-between min-h-[280px]"
              id="playing-phase-card"
            >
              <div>
                <span className="text-5xl" role="img" aria-label="Music stars">⭐🎶</span>
                <h3 className="text-xl font-extrabold text-amber-950 mt-3">
                  Play the Melody!
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  The notes have faded. Rely on your short-term memory to physically play the melody on your clarinet:
                </p>
                <div className="my-5 inline-flex items-center gap-1.5 bg-amber-50 px-4 py-2 border border-amber-200 rounded-2xl">
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span className="font-mono text-base font-black text-amber-950 tracking-widest">
                    {targetSequence.join(' - ')}
                  </span>
                </div>
              </div>

              {/* Assessment Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4" id="self-assessment-choices">
                <button
                  id="assessment-perfect"
                  onClick={() => handleSelfAssessment('perfect')}
                  className="flex flex-col items-center p-3 border-2 border-emerald-300 hover:border-emerald-500 rounded-2xl bg-emerald-50 hover:bg-emerald-100 transition-all group hover:scale-102"
                >
                  <span className="text-2xl" role="img" aria-label="Perfect">🟢</span>
                  <span className="font-bold text-xs text-emerald-900 mt-1">Perfect!</span>
                </button>

                <button
                  id="assessment-missed"
                  onClick={() => handleSelfAssessment('missed')}
                  className="flex flex-col items-center p-3 border-2 border-amber-300 hover:border-amber-500 rounded-2xl bg-amber-50 hover:bg-amber-100 transition-all group hover:scale-102"
                >
                  <span className="text-2xl" role="img" aria-label="Missed">🟡</span>
                  <span className="font-bold text-xs text-amber-900 mt-1">I missed a few.</span>
                </button>

                <button
                  id="assessment-review"
                  onClick={() => handleSelfAssessment('review')}
                  className="flex flex-col items-center p-3 border-2 border-rose-300 hover:border-rose-500 rounded-2xl bg-rose-50 hover:bg-rose-100 transition-all group hover:scale-102"
                >
                  <span className="text-2xl" role="img" aria-label="Review">🔴</span>
                  <span className="font-bold text-xs text-rose-900 mt-1">Too fast, review.</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* On-screen keyboard alphabet layout at the bottom */}
      <div className="relative z-10 bg-sky-950/80 backdrop-blur-md p-5 border-t border-sky-800 rounded-t-3xl w-full flex flex-col items-center">
        {/* Pilot Avatar speech bubble (Bottom Right) */}
        <div className="absolute right-6 top-[-95px] flex items-center gap-3 bg-white border border-sky-300 p-3 rounded-2xl shadow-xl max-w-xs" id="pilot-bubble">
          <div className="text-left">
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Captain Claire</span>
            <p className="font-sans text-xs font-bold text-sky-950">
              {gamePhase === 'writing'
                ? 'Type out the pitch names shown on the stave above!'
                : 'Superb! Now play from memory and self-assess!'}
            </p>
          </div>
          <div className="w-10 h-10 border border-sky-200 bg-sky-100 rounded-full flex items-center justify-center text-xl shadow flex-shrink-0">
            👩‍✈️
          </div>
        </div>

        {/* Note letter buttons */}
        <div className="flex gap-2 max-w-lg w-full justify-center">
          {(['A', 'B', 'C', 'D', 'E', 'F', 'G'] as NoteType[]).map((letter) => (
            <button
              key={letter}
              id={`soaring-keyboard-${letter}`}
              disabled={gamePhase !== 'writing'}
              onClick={() => handleKeyClick(letter)}
              className={`w-12 h-14 font-sans font-black text-lg border-2 rounded-xl shadow-lg transition-all flex items-center justify-center ${
                gamePhase === 'writing'
                  ? 'bg-white hover:bg-neutral-50 active:scale-90 border-neutral-300 text-neutral-800 hover:border-sky-400'
                  : 'bg-neutral-200 text-neutral-400 border-neutral-300 cursor-not-allowed'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Success Cleared Banner */}
      <AnimatePresence>
        {assessmentResult === 'cleared' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-neutral-950/85 z-40 flex items-center justify-center p-4"
            id="clear-success-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="p-8 text-center bg-white border-4 border-emerald-400 rounded-3xl max-w-sm shadow-2xl"
            >
              <div className="inline-flex p-4 bg-emerald-50 text-emerald-500 rounded-full mb-4">
                <Check className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-black text-emerald-950 uppercase tracking-wide">Level Cleared!</h2>
              <p className="mt-2 text-sm text-neutral-600">
                Congratulations! You successfully memorized and identified all note pitches! Claire is thrilled to fly with you.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  id="success-back-map"
                  onClick={onBack}
                  className="flex-1 px-4 py-2.5 font-sans font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all shadow-md active:scale-95"
                >
                  Return to Map
                </button>
                <button
                  id="success-play-again"
                  onClick={resetGame}
                  className="px-4 py-2.5 font-sans font-semibold text-neutral-600 border border-neutral-300 hover:bg-neutral-50 rounded-xl transition-all"
                >
                  Play Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
