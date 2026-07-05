import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle, Star, Sparkles, Navigation, BookOpen, Flame, Users } from 'lucide-react';
import { Screen } from '../types';

interface WorldMapProps {
  onNavigate: (screen: Screen) => void;
  onOpenAiden: () => void;
  currentStep: number;
}

export default function WorldMap({ onNavigate, onOpenAiden, currentStep }: WorldMapProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-emerald-100" id="world-map-canvas">
      
      {/* 2D Vector Background Canvas with River & Yellow Brick Road */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        {/* River Flowing from Top-Center to Bottom-Left */}
        <path
          d="M 500,0 C 450,200 200,300 150,600 C 100,800 50,900 0,1000"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="60"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Inner River Wave Line */}
        <path
          d="M 500,0 C 450,200 200,300 150,600 C 100,800 50,900 0,1000"
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="20, 25"
          opacity="0.5"
        />

        {/* Yellow Brick Road crossing horizontally */}
        <path
          d="M 0,450 Q 300,400 600,480 T 1200,420"
          fill="none"
          stroke="#facc15"
          strokeWidth="35"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* Yellow brick road dash block effect */}
        <path
          d="M 0,450 Q 300,400 600,480 T 1200,420"
          fill="none"
          stroke="#eab308"
          strokeWidth="35"
          strokeLinecap="round"
          strokeDasharray="8, 12"
          opacity="0.6"
        />

        {/* Custom styled bridge element where road crosses the river */}
        {/* The intersection is approximately (230, 420) based on curve math */}
        <g opacity="0.95">
          <rect x="195" y="380" width="70" height="75" rx="8" fill="#78350f" stroke="#451a03" strokeWidth="4" />
          {/* Bridge rails */}
          <line x1="195" y1="385" x2="265" y2="385" stroke="#f59e0b" strokeWidth="3" />
          <line x1="195" y1="450" x2="265" y2="450" stroke="#f59e0b" strokeWidth="3" />
        </g>
      </svg>

      {/* Decorative Vector Assets on the map */}
      <div className="absolute top-[10%] left-[25%] pointer-events-none text-2xl select-none">🌳</div>
      <div className="absolute top-[35%] left-[5%] pointer-events-none text-2xl select-none">🏡</div>
      <div className="absolute top-[70%] left-[30%] pointer-events-none text-2xl select-none">🌲</div>
      <div className="absolute top-[15%] left-[80%] pointer-events-none text-2xl select-none">🌻</div>
      <div className="absolute top-[55%] left-[85%] pointer-events-none text-2xl select-none">🏔️</div>
      <div className="absolute top-[80%] left-[65%] pointer-events-none text-2xl select-none">🍄</div>

      {/* Interactive Map Nodes / Buttons */}

      {/* 1. CONCERT HALL (Center) */}
      <motion.button
        id="node-concert-hall"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate('concert-hall')}
        className="absolute top-[40%] left-[45%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer"
      >
        {/* Glowing ring under important node */}
        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
        
        {/* Golden theatre shape */}
        <div className="relative w-28 h-28 border-4 border-amber-500 rounded-3xl bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 shadow-2xl flex flex-col items-center justify-center p-2">
          {/* Crimson curtains effect */}
          <div className="absolute inset-y-1 left-1 w-5 bg-red-600 rounded-l-2xl border-r border-amber-500/30" />
          <div className="absolute inset-y-1 right-1 w-5 bg-red-600 rounded-r-2xl border-l border-amber-500/30" />
          
          <span className="text-4xl z-10" role="img" aria-label="Concert Hall">🎭</span>
          <span className="text-[10px] font-black text-amber-950 uppercase tracking-widest bg-yellow-100 border border-amber-400 px-1.5 rounded-full mt-1.5 shadow-sm z-10">
            Concert Hall
          </span>
        </div>
      </motion.button>

      {/* 2. ROCKET READING (Top Left) */}
      <motion.button
        id="node-rocket-reading"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate('rocket-reading')}
        className="absolute top-[15%] left-[15%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer"
      >
        <div className="relative w-22 h-22 border-3 border-sky-400 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 shadow-xl flex flex-col items-center justify-center">
          <span className="text-3xl animate-bounce" role="img" aria-label="Rocket">🚀</span>
          <span className="text-[9px] font-extrabold text-white uppercase tracking-wider bg-sky-500 border border-sky-300 px-1.5 rounded-full mt-1.5 shadow-sm">
            Rocket Read
          </span>
        </div>
      </motion.button>

      {/* 3. SIGHT READ SOARING (Middle Left) */}
      <motion.button
        id="node-sight-read-soaring"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate('sight-read-soaring')}
        className="absolute top-[38%] left-[10%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer"
      >
        <div className="relative w-22 h-22 border-3 border-amber-400 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 shadow-xl flex flex-col items-center justify-center">
          <span className="text-3xl" role="img" aria-label="Biplane">✈️</span>
          <span className="text-[9px] font-extrabold text-amber-950 uppercase tracking-wider bg-amber-400 border border-amber-500 px-1.5 rounded-full mt-1.5 shadow-sm">
            Soaring Read
          </span>
        </div>
      </motion.button>

      {/* 4. PIZZERIA (Bottom Left) */}
      <motion.button
        id="node-pizzeria"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate('pizzeria')}
        className="absolute top-[75%] left-[15%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer"
      >
        <div className="relative w-22 h-22 border-3 border-orange-500 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 shadow-xl flex flex-col items-center justify-center">
          <span className="text-3xl" role="img" aria-label="Pizza Slice">🍕</span>
          <span className="text-[9px] font-extrabold text-orange-950 uppercase tracking-wider bg-orange-400 border border-orange-500 px-1.5 rounded-full mt-1.5 shadow-sm">
            Pizzeria
          </span>
        </div>
      </motion.button>

      {/* 5. RHYTHM RAPIDS (Top Right) */}
      <motion.button
        id="node-rhythm-rapids"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate('rhythm-rapids')}
        className="absolute top-[18%] left-[70%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer"
      >
        <div className="relative w-22 h-22 border-3 border-emerald-500 rounded-2xl bg-gradient-to-br from-emerald-100 to-sky-100 shadow-xl flex flex-col items-center justify-center">
          <span className="text-3xl" role="img" aria-label="Canoe">🛶</span>
          <span className="text-[9px] font-extrabold text-emerald-950 uppercase tracking-wider bg-emerald-400 border border-emerald-500 px-1.5 rounded-full mt-1.5 shadow-sm">
            Rapids Shack
          </span>
        </div>
      </motion.button>

      {/* 6. FINGER FISHING (Bottom Right) */}
      <motion.button
        id="node-finger-fishing"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate('finger-fishing')}
        className="absolute top-[72%] left-[75%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer"
      >
        <div className="relative w-22 h-22 border-3 border-cyan-500 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-200 shadow-xl flex flex-col items-center justify-center">
          <span className="text-3xl" role="img" aria-label="Fishing Rod">🎣</span>
          <span className="text-[9px] font-extrabold text-cyan-950 uppercase tracking-wider bg-cyan-400 border border-cyan-500 px-1.5 rounded-full mt-1.5 shadow-sm">
            Fishing Dock
          </span>
        </div>
      </motion.button>

      {/* 7. LESSON 1 PATHWAY TRIGGER (Right Yellow Button) */}
      <motion.button
        id="node-lesson-one"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate('lesson-one')}
        className="absolute top-[48%] left-[82%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer"
      >
        {/* Highlight ring for active path */}
        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-30 animate-pulse" />
        
        <div className="relative w-24 h-24 border-4 border-amber-400 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 shadow-2xl flex flex-col items-center justify-center">
          <span className="text-4xl" role="img" aria-label="Curriculum Book">📖</span>
          <span className="text-[9px] font-black text-amber-950 uppercase tracking-widest bg-yellow-100 border border-amber-400 px-1.5 rounded-full mt-1 shadow-sm">
            Syllabus
          </span>
          <div className="absolute -top-2 -right-2 bg-rose-500 text-white border-2 border-white text-[9px] font-bold rounded-full px-1.5 py-0.5 shadow-md">
            Step {currentStep}
          </div>
        </div>
      </motion.button>

      {/* 8. ASK AIDEN SIGNPOST (Top Right) */}
      <motion.button
        id="node-ask-aiden"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => onNavigate('ask-aiden')}
        className="absolute top-[10%] right-[6%] z-30 flex items-center gap-2 bg-amber-50 border-3 border-amber-400 rounded-2xl p-2 shadow-lg hover:bg-amber-100 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-center w-11 h-11 border border-amber-300 rounded-full bg-amber-200 shadow-inner text-2xl">
          🦉
        </div>
        <div className="text-left font-sans pr-1">
          <span className="text-[8px] font-bold text-amber-500 uppercase tracking-wider block">Tutor Chat</span>
          <h4 className="text-xs font-black text-amber-950">Ask Aiden</h4>
        </div>
        <div className="p-1 rounded-full bg-amber-400 border border-amber-500 text-white ml-1">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </motion.button>

      {/* 9. DAILY QUEST CHALLENGE SIGNPOST (Top Center) */}
      <motion.button
        id="node-daily-challenge"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => onNavigate('daily-challenge')}
        className="absolute top-[10%] left-[45%] -translate-x-1/2 z-30 flex items-center gap-2.5 bg-orange-50 border-3 border-orange-400 rounded-2xl p-2 shadow-xl hover:bg-orange-100 transition-all cursor-pointer animate-pulse"
      >
        <div className="flex items-center justify-center w-11 h-11 border border-orange-300 rounded-full bg-orange-100 text-xl">
          🔥
        </div>
        <div className="text-left font-sans">
          <span className="text-[8px] font-bold text-orange-500 uppercase tracking-wider block">Daily Challenge</span>
          <h4 className="text-xs font-black text-orange-950">Daily Quest Loop</h4>
        </div>
        <div className="p-1 rounded-full bg-orange-400 border border-orange-500 text-white">
          <Flame className="w-3.5 h-3.5 fill-current" />
        </div>
      </motion.button>

      {/* 10. REFERENCE LIBRARY SIGNPOST (Middle Right) */}
      <motion.button
        id="node-reference-library"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => onNavigate('reference-library')}
        className="absolute top-[44%] right-[10%] z-30 flex items-center gap-2.5 bg-sky-50 border-3 border-sky-400 rounded-2xl p-2 shadow-lg hover:bg-sky-100 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-center w-11 h-11 border border-sky-300 rounded-full bg-sky-100 text-xl">
          📚
        </div>
        <div className="text-left font-sans">
          <span className="text-[8px] font-bold text-sky-500 uppercase tracking-wider block font-display">Reference</span>
          <h4 className="text-xs font-black text-sky-950">Library Center</h4>
        </div>
        <div className="p-1 rounded-full bg-sky-400 border border-sky-500 text-white">
          <BookOpen className="w-3.5 h-3.5" />
        </div>
      </motion.button>

      {/* Bottom status overview panel overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm bg-white/90 backdrop-blur-md border border-neutral-200 px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center text-xl">
            🏆
          </div>
          <div>
            <h5 className="font-sans font-extrabold text-sm text-neutral-800">Syllabus Progress</h5>
            <p className="text-[10px] text-neutral-500">Lesson 1: Mastering Middle E</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Accuracy</span>
            <span className="font-mono text-xs font-black text-emerald-600">88% OK</span>
          </div>
        </div>
      </div>

      {/* Subtle "Parents" Button in bottom corner */}
      <motion.button
        id="node-parents-dashboard"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate('parent-dashboard')}
        className="absolute bottom-6 right-6 z-30 flex items-center gap-2 bg-slate-800 hover:bg-slate-900 border border-slate-700/60 rounded-full py-2.5 px-4 text-white text-xs font-black uppercase tracking-wider shadow-xl transition-all cursor-pointer"
      >
        <Users size={14} className="text-slate-400" />
        Parents Area
      </motion.button>

    </div>
  );
}
