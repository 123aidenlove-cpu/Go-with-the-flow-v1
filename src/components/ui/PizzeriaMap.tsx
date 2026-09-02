import React from 'react';
import { ArrowLeft, Lock, Star, Pizza } from 'lucide-react';
import { motion } from 'motion/react';

interface PizzeriaMapProps {
  levelId: number;
  onBack: () => void;
  onSelectCheckpoint: (checkpointId: number) => void;
}

export default function PizzeriaMap({ levelId, onBack, onSelectCheckpoint }: PizzeriaMapProps) {
  // Mock checkpoints for the selected level
  const checkpoints = [
    { id: 1, title: 'Prep Station', isUnlocked: true, stars: 3, x: 20, y: 30 },
    { id: 2, title: 'Topping Bar', isUnlocked: true, stars: 1, x: 50, y: 25 },
    { id: 3, title: 'Brick Oven', isUnlocked: false, stars: 0, x: 80, y: 50 },
    { id: 4, title: 'Service Window', isUnlocked: false, stars: 0, x: 60, y: 80 },
  ];

  return (
    <div className="relative min-h-screen bg-orange-100 overflow-hidden select-none">
      {/* Map Background (Restaurant floor tiles) */}
      <div className="absolute inset-0 bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
      
      {/* Header */}
      <div className="relative z-10 w-full p-6 flex justify-between items-center bg-orange-900/10 backdrop-blur-md border-b border-orange-900/20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 font-sans font-semibold text-orange-900 transition-all rounded-xl bg-white hover:bg-orange-50 active:scale-95 shadow border border-orange-200 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Levels
        </button>

        <h1 className="text-2xl font-black text-orange-900 uppercase tracking-wider drop-shadow-sm">
          Level {levelId} Map
        </h1>
      </div>

      {/* Map Nodes Area */}
      <div className="relative w-full h-[calc(100vh-88px)] z-0 max-w-4xl mx-auto">
        {/* Draw SVG connecting lines (Footsteps / path) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0px 2px 4px rgba(234,88,12,0.3))' }}>
          <path 
            d="M 20% 30% L 50% 25% L 80% 50% L 60% 80%" 
            fill="none" 
            stroke="rgba(234,88,12,0.4)" 
            strokeWidth="6" 
            strokeDasharray="8 12" 
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
                  ? 'bg-white border-orange-500 text-orange-600 group-hover:bg-orange-50' 
                  : 'bg-orange-200 border-orange-300 text-orange-400'
              }`}>
                {cp.isUnlocked ? (
                  <Pizza className="w-8 h-8" />
                ) : (
                  <Lock className="w-6 h-6" />
                )}
              </div>

              {/* Title & Stars Label */}
              <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-orange-200 flex flex-col items-center min-w-max shadow-sm">
                <span className="text-xs font-bold text-orange-900 uppercase tracking-wider">{cp.title}</span>
                {cp.isUnlocked && (
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3].map(star => (
                      <Star 
                        key={star} 
                        className={`w-3 h-3 ${star <= cp.stars ? 'fill-orange-500 text-orange-500' : 'text-orange-200'}`} 
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
