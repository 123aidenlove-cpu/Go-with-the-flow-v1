import React from 'react';
import { ArrowLeft, Lock, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface RhythmRapidsMapProps {
  levelId: number;
  onBack: () => void;
  onSelectCheckpoint: (checkpointId: number) => void;
}

export default function RhythmRapidsMap({ levelId, onBack, onSelectCheckpoint }: RhythmRapidsMapProps) {
  // Mock checkpoints for the selected level
  const checkpoints = [
    { id: 1, title: 'Calm Delta', isUnlocked: true, stars: 3, x: 15, y: 85 },
    { id: 2, title: 'Mangrove Bend', isUnlocked: true, stars: 2, x: 45, y: 70 },
    { id: 3, title: 'Hidden Waterfall', isUnlocked: false, stars: 0, x: 80, y: 40 },
    { id: 4, title: 'Rapid Springs', isUnlocked: false, stars: 0, x: 20, y: 15 },
  ];

  return (
    <div className="relative min-h-screen bg-emerald-900 overflow-hidden select-none">
      {/* Map Background (Jungle forest gradient) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950 via-green-800 to-emerald-600" />
      
      {/* Header */}
      <div className="relative z-10 w-full p-6 flex justify-between items-center bg-black/20 backdrop-blur-sm border-b border-white/10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 font-sans font-semibold text-white/95 transition-all rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 shadow border border-white/10 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Levels
        </button>

        <h1 className="text-2xl font-black text-white uppercase tracking-wider drop-shadow-md">
          Level {levelId} Map
        </h1>
      </div>

      {/* Map Nodes Area */}
      <div className="relative w-full h-[calc(100vh-88px)] z-0 max-w-4xl mx-auto">
        {/* Draw SVG connecting lines (The River) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.5))' }}>
          <path 
            d="M 15% 85% C 30% 70%, 30% 80%, 45% 70% C 70% 60%, 70% 50%, 80% 40% C 90% 20%, 40% 10%, 20% 15%" 
            fill="none" 
            stroke="rgba(56,189,248,0.5)" 
            strokeWidth="16" 
            strokeLinecap="round"
          />
          <path 
            d="M 15% 85% C 30% 70%, 30% 80%, 45% 70% C 70% 60%, 70% 50%, 80% 40% C 90% 20%, 40% 10%, 20% 15%" 
            fill="none" 
            stroke="rgba(56,189,248,0.8)" 
            strokeWidth="8" 
            strokeLinecap="round"
            className="animate-pulse"
          />
        </svg>

        {checkpoints.map((cp) => (
          <motion.div
            key={cp.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${cp.x}%`, top: `${cp.y}%` }}
            whileHover={cp.isUnlocked ? { scale: 1.1 } : {}}
            whileTap={cp.isUnlocked ? { scale: 0.95 } : {}}
          >
            <button
              onClick={() => {
                if (cp.isUnlocked) onSelectCheckpoint(cp.id);
              }}
              disabled={!cp.isUnlocked}
              className={`relative flex flex-col items-center gap-2 group cursor-pointer ${!cp.isUnlocked ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              {/* Checkpoint Node Bubble */}
              <div className={`w-16 h-16 rounded-2xl rotate-45 border-4 flex items-center justify-center shadow-xl transition-all ${
                cp.isUnlocked 
                  ? 'bg-sky-500 border-white text-white group-hover:bg-sky-400 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.8)]' 
                  : 'bg-emerald-950 border-emerald-800 text-emerald-700'
              }`}>
                <div className="-rotate-45">
                  {cp.isUnlocked ? (
                    <span className="text-2xl font-black">{cp.id}</span>
                  ) : (
                    <Lock className="w-6 h-6" />
                  )}
                </div>
              </div>

              {/* Title & Stars Label */}
              <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex flex-col items-center min-w-max mt-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">{cp.title}</span>
                {cp.isUnlocked && (
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3].map(star => (
                      <Star 
                        key={star} 
                        className={`w-3 h-3 ${star <= cp.stars ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
