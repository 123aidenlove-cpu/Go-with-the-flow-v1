import React from 'react';
import { ArrowLeft, Lock, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface FingerFishingMapProps {
  levelId: number;
  onBack: () => void;
  onSelectCheckpoint: (checkpointId: number) => void;
}

export default function FingerFishingMap({ levelId, onBack, onSelectCheckpoint }: FingerFishingMapProps) {
  // Mock checkpoints for the selected level
  const checkpoints = [
    { id: 1, title: 'Shallow Waters', isUnlocked: true, stars: 3, x: 20, y: 80 },
    { id: 2, title: 'Kelp Forest', isUnlocked: true, stars: 1, x: 50, y: 60 },
    { id: 3, title: 'Sunken Ship', isUnlocked: false, stars: 0, x: 30, y: 30 },
    { id: 4, title: 'Deep Trench', isUnlocked: false, stars: 0, x: 70, y: 15 },
  ];

  return (
    <div className="relative min-h-screen bg-cyan-900 overflow-hidden select-none">
      {/* Map Background (Ocean depth gradient) */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-400 via-blue-700 to-indigo-950" />
      
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
        {/* Draw SVG connecting lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.3))' }}>
          <path 
            d="M 20% 80% Q 40% 70% 50% 60% T 30% 30% T 70% 15%" 
            fill="none" 
            stroke="rgba(255,255,255,0.4)" 
            strokeWidth="8" 
            strokeDasharray="10 10" 
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
              <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center shadow-xl transition-all ${
                cp.isUnlocked 
                  ? 'bg-cyan-500 border-white text-white group-hover:bg-cyan-400 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.8)]' 
                  : 'bg-slate-800 border-slate-600 text-slate-400'
              }`}>
                {cp.isUnlocked ? (
                  <span className="text-2xl font-black">{cp.id}</span>
                ) : (
                  <Lock className="w-6 h-6" />
                )}
              </div>

              {/* Title & Stars Label */}
              <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex flex-col items-center min-w-max">
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
