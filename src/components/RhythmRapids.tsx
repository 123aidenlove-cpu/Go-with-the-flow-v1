import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RotateCcw, Heart, Info } from 'lucide-react';

interface RhythmRapidsProps {
  onBack: () => void;
  onComplete?: () => void;
  isDailyChallenge?: boolean;
  onChallengeComplete?: (score: number, accuracy: number) => void;
}

interface ObstacleOption {
  id: number;
  label: string;
  notes: string[]; // e.g. ['crotchet', 'crotchet', 'quaver-pair', 'crotchet']
  beats: string;
}

export default function RhythmRapids({
  onBack,
  onComplete,
  isDailyChallenge = false,
  onChallengeComplete,
}: RhythmRapidsProps) {
  const [metersPaddled, setMetersPaddled] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [options, setOptions] = useState<ObstacleOption[]>([]);
  const [canoeLane, setCanoeLane] = useState<'left' | 'right' | 'center'>('center');
  const [revealOutcome, setRevealOutcome] = useState<'safe' | 'crash' | null>(null);
  const [lastSelectedIdx, setLastSelectedIdx] = useState<number | null>(null);

  const rhythms: ObstacleOption[] = [
    {
      id: 1,
      label: 'Pattern A',
      notes: ['crotchet', 'crotchet', 'quaver-pair', 'crotchet'],
      beats: '1, 1, 0.5+0.5, 1'
    },
    {
      id: 2,
      label: 'Pattern B',
      notes: ['crotchet', 'quaver-pair', 'crotchet', 'crotchet'],
      beats: '1, 0.5+0.5, 1, 1'
    },
    {
      id: 3,
      label: 'Pattern C',
      notes: ['quaver-pair', 'crotchet', 'crotchet', 'crotchet'],
      beats: '0.5+0.5, 1, 1, 1'
    },
    {
      id: 4,
      label: 'Pattern D',
      notes: ['crotchet', 'crotchet', 'crotchet', 'quaver-pair'],
      beats: '1, 1, 1, 0.5+0.5'
    }
  ];

  const generateChallenge = () => {
    // Select two random patterns
    const idx1 = Math.floor(Math.random() * rhythms.length);
    let idx2 = Math.floor(Math.random() * rhythms.length);
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * rhythms.length);
    }

    const opt1 = rhythms[idx1];
    const opt2 = rhythms[idx2];
    
    setOptions([opt1, opt2]);
    // Pick one as the target
    const targetIdx = Math.random() > 0.5 ? 0 : 1;
    setTargetIndex(targetIdx);
    setRevealOutcome(null);
    setLastSelectedIdx(null);
    setCanoeLane('center');
  };

  useEffect(() => {
    generateChallenge();
  }, []);

  // 1-minute timer for daily challenge
  useEffect(() => {
    if (!isDailyChallenge || gameOver) return;
    const timer = setTimeout(() => {
      setGameOver(true);
      if (onChallengeComplete) {
        onChallengeComplete(metersPaddled, 100); // 100% accuracy for completion
      }
    }, 60000); // 1 minute limit
    return () => clearTimeout(timer);
  }, [isDailyChallenge, gameOver, metersPaddled, onChallengeComplete]);

  const handleSelectOption = (idx: number) => {
    if (revealOutcome || gameOver) return;

    setLastSelectedIdx(idx);
    const isCorrect = idx === targetIndex;
    setCanoeLane(idx === 0 ? 'left' : 'right');

    if (isCorrect) {
      setRevealOutcome('safe');
      setTimeout(() => {
        setMetersPaddled((prev) => {
          const next = prev + 50;
          if (isDailyChallenge && next >= 250) {
            if (onChallengeComplete) {
              onChallengeComplete(next, 100);
            }
          } else if (next >= 250 && onComplete) {
            onComplete();
          }
          return next;
        });
        generateChallenge();
      }, 1500);
    } else {
      setRevealOutcome('crash');
      setTimeout(() => {
        setLives((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            setGameOver(true);
          }
          return next;
        });
        generateChallenge();
      }, 1500);
    }
  };

  const handleRestart = () => {
    setMetersPaddled(0);
    setLives(3);
    setGameOver(false);
    generateChallenge();
  };

  const renderRhythmNotes = (notes: string[]) => {
    return (
      <div className="flex items-center gap-3 justify-center py-2 bg-white/10 rounded-lg px-4 border border-black/5 shadow-inner">
        {notes.map((note, idx) => (
          <div key={idx} className="flex flex-col items-center">
            {note === 'crotchet' ? (
              <span className="text-3xl font-bold select-none text-neutral-800">♩</span>
            ) : (
              <span className="text-3xl font-bold select-none text-neutral-800">♫</span>
            )}
            <span className="text-[9px] font-mono font-bold text-neutral-500">
              {note === 'crotchet' ? '1' : '0.5+0.5'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-emerald-800 relative overflow-hidden flex flex-col" id="rhythm-rapids-arena">
      {/* Background river stream layout */}
      <div className="absolute inset-x-[10%] inset-y-0 bg-sky-500/90 z-0 shadow-2xl border-l-8 border-r-8 border-emerald-950 flex justify-between px-8">
        {/* River current wave lines */}
        <div className="w-[1px] h-full border-l-2 border-dashed border-sky-300 opacity-30 animate-pulse" />
        <div className="w-[1px] h-full border-l-2 border-dashed border-sky-300 opacity-30 animate-pulse" />
        <div className="w-[1px] h-full border-l-2 border-dashed border-sky-300 opacity-30 animate-pulse" />
      </div>

      {/* Jungle foliage borders */}
      <div className="absolute left-0 inset-y-0 w-[10%] bg-gradient-to-r from-emerald-950 to-emerald-900 z-10 flex flex-col justify-around text-center pointer-events-none opacity-90">
        <span className="text-3xl">🌴</span>
        <span className="text-3xl">🌿</span>
        <span className="text-3xl">🐒</span>
        <span className="text-3xl">🍃</span>
      </div>
      <div className="absolute right-0 inset-y-0 w-[10%] bg-gradient-to-l from-emerald-950 to-emerald-900 z-10 flex flex-col justify-around text-center pointer-events-none opacity-90">
        <span className="text-3xl">🌴</span>
        <span className="text-3xl">🐍</span>
        <span className="text-3xl">🌿</span>
        <span className="text-3xl">🦜</span>
      </div>

      {/* Top HUD Row */}
      <div className="relative z-20 flex items-center justify-between p-6 bg-emerald-950/90 backdrop-blur-md border-b border-emerald-800">
        <button
          id="rapids-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 font-sans font-semibold text-emerald-100 transition-all rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 shadow border border-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Map
        </button>

        <h1 className="hidden sm:block text-xl font-black text-white uppercase tracking-wider font-sans">
          🛶 Rhythm Rapids Shack
        </h1>

        <div className="flex items-center gap-6" id="rapids-tracker">
          {/* Paddled Distance Counter */}
          <div className="text-right">
            <span className="text-[10px] font-bold text-sky-300 uppercase tracking-widest block">Paddled</span>
            <span className="font-mono text-lg font-black text-white">{metersPaddled}m</span>
          </div>

          {/* Canoe Lives Tracker */}
          <div className="flex gap-1 bg-black/30 p-2 rounded-xl border border-white/5">
            {[1, 2, 3].map((heart) => (
              <Heart
                key={heart}
                className={`w-5 h-5 ${
                  heart <= lives ? 'text-red-500 fill-red-500' : 'text-neutral-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Active gameplay space */}
      <div className="flex-1 relative z-10 flex flex-col justify-between items-center p-4">
        
        {/* Instruction overlay / Prompt */}
        <div className="w-full max-w-md bg-white border-2 border-sky-400 p-4 rounded-2xl shadow-xl text-center mb-4" id="rapids-prompt-box">
          <div className="flex items-center justify-center gap-1.5 text-sky-800 mb-1">
            <Info className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-wider">Listen to the rhythm sequence:</span>
          </div>
          {options.length > 0 && (
            <div className="space-y-2">
              <p className="font-sans text-sm font-bold text-neutral-800">
                Paddler, guide your canoe through the obstacle with this sequence:
              </p>
              <div className="inline-flex gap-2 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-100">
                {options[targetIndex]?.notes.map((note, i) => (
                  <span key={i} className="text-xl font-bold font-mono text-sky-950">
                    {note === 'crotchet' ? '♩' : '♫'}
                  </span>
                ))}
              </div>
              <p className="text-[10px] font-mono font-bold text-sky-600 uppercase">
                Beats: {options[targetIndex]?.beats}
              </p>
            </div>
          )}
        </div>

        {/* River Obstacle Nodes (Side-by-side targets) */}
        <div className="grid grid-cols-2 gap-8 w-full max-w-2xl px-6 my-auto" id="river-obstacles">
          {options.map((opt, index) => {
            const isSelected = lastSelectedIdx === index;
            const isTarget = targetIndex === index;

            return (
              <div key={index} className="relative flex flex-col items-center">
                <motion.div
                  whileHover={!revealOutcome ? { scale: 1.04 } : {}}
                  whileTap={!revealOutcome ? { scale: 0.98 } : {}}
                  onClick={() => handleSelectOption(index)}
                  className={`w-full bg-white/95 border-4 rounded-2xl shadow-xl p-5 cursor-pointer flex flex-col justify-between h-40 transition-all ${
                    revealOutcome && isSelected
                      ? isTarget
                        ? 'border-emerald-500 shadow-emerald-200 bg-emerald-50'
                        : 'border-rose-500 shadow-rose-200 bg-rose-50'
                      : 'border-neutral-300 hover:border-sky-400'
                  }`}
                  id={`obstacle-${index}`}
                >
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                    <span className="text-xs font-black text-neutral-400 uppercase tracking-wider">Obstacle {index + 1}</span>
                    <span className="text-xs font-bold text-sky-600">4/4 Rhythm</span>
                  </div>

                  <div className="my-auto">
                    {renderRhythmNotes(opt.notes)}
                  </div>

                  <div className="text-center text-[10px] font-mono text-neutral-400 uppercase font-black">
                    Tap to steers canoe
                  </div>
                </motion.div>

                {/* Outcome reveal layer overlay directly below the cards */}
                <AnimatePresence>
                  {revealOutcome && isSelected && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`absolute bottom-[-40px] px-4 py-1.5 rounded-full text-xs font-black uppercase text-white shadow-md ${
                        isTarget ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    >
                      {isTarget ? '💧 Safe Water' : '🪨 Crashed Rocks'}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Canoe Avatar Moving Lane Animation */}
        <div className="relative w-full h-24 max-w-md flex justify-between px-12 items-center" id="river-lanes">
          {/* Canoe Visual representation */}
          <motion.div
            className="absolute left-0 right-0 mx-auto flex flex-col items-center"
            animate={{
              x: canoeLane === 'left' ? -120 : canoeLane === 'right' ? 120 : 0,
              y: [0, -3, 3, 0]
            }}
            transition={{
              x: { type: 'spring', stiffness: 100 },
              y: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' }
            }}
          >
            <span className="text-5xl" role="img" aria-label="Canoe paddler">🛶</span>
            <span className="text-[10px] uppercase font-black font-sans text-white bg-sky-950/70 px-2 py-0.5 rounded-full border border-sky-400/20 shadow mt-1">
              Paddler
            </span>
          </motion.div>
        </div>

      </div>

      {/* Game Over Screen */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-neutral-950/90 z-30 flex items-center justify-center p-4"
            id="rapids-game-over-overlay"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="p-8 text-center bg-white border-4 border-rose-500 rounded-3xl max-w-sm shadow-2xl"
            >
              <div className="inline-flex p-4 bg-rose-100 text-rose-600 rounded-full mb-4">
                <RotateCcw className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-black text-rose-950 uppercase">Canoe Capsized</h2>
              <p className="mt-2 text-sm text-neutral-600">
                You hit crashed rocks and capsized! Excellent effort. You paddled an impressive:
              </p>

              <div className="my-5 p-3 bg-sky-50 border border-sky-200 rounded-xl">
                <span className="font-mono text-2xl font-black text-sky-950">{metersPaddled} meters</span>
              </div>

              <div className="flex gap-3">
                <button
                  id="rapids-restart"
                  onClick={handleRestart}
                  className="flex-1 px-4 py-2.5 font-sans font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md active:scale-95"
                >
                  Restart Run
                </button>
                <button
                  id="rapids-exit"
                  onClick={onBack}
                  className="px-4 py-2.5 font-sans font-semibold text-neutral-500 border border-neutral-300 hover:bg-neutral-50 rounded-xl transition-all"
                >
                  Exit Map
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
