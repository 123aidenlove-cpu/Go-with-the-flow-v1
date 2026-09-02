import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Lock, Unlock } from 'lucide-react';
import { getXP } from '../utils/economy';
import { APP_ASSETS } from '../config/assets';

interface LevelPageProps {
  onBack: () => void;
}

const UNLOCKABLES = [
  { level: 1, name: "Flow Practice", unlocked: true },
  { level: 2, name: "Expression Ninja", unlocked: false },
  { level: 3, name: "Scale Sand Dunes", unlocked: false },
  { level: 4, name: "Rhythm Rapids Pro", unlocked: false },
  { level: 5, name: "Rocket Reading Expert", unlocked: false },
];

export default function LevelPage({ onBack }: LevelPageProps) {
  const [xp, setXP] = useState(0);

  useEffect(() => {
    setXP(getXP());
  }, []);

  const currentLevel = Math.floor(xp / 500) + 1;
  const currentLevelXP = xp % 500;
  const progressPercentage = (currentLevelXP / 500) * 100;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans p-8">
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={onBack}
            className="w-16 h-16 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-8 h-8" />
          </button>
          <h1 className="text-4xl font-black text-white tracking-widest uppercase">Your Level</h1>
          <div className="w-16 h-16" /> {/* Spacer */}
        </div>

        {/* Current Level Header Display */}
        <div className="bg-slate-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-md border-4 border-fuchsia-500/30 flex flex-col md:flex-row items-center gap-8 mb-12">
          {/* Level Circle */}
          <div className="w-32 h-32 rounded-full border-8 border-fuchsia-400 bg-slate-800 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(232,121,249,0.5)] flex-shrink-0">
            <span className="text-fuchsia-400 text-sm font-bold uppercase tracking-widest mb-[-5px]">Level</span>
            <span className="text-fuchsia-400 text-5xl font-black">{currentLevel}</span>
          </div>

          {/* XP Bar Details */}
          <div className="flex-1 w-full">
            <div className="flex justify-between items-end mb-4">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-fuchsia-400" fill="currentColor" />
                <span className="text-3xl font-black text-white">{currentLevelXP} <span className="text-xl text-slate-400">/ 500 XP</span></span>
              </div>
              <span className="text-fuchsia-400 font-bold uppercase tracking-widest text-sm">{500 - currentLevelXP} XP to Level {currentLevel + 1}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-6 w-full bg-slate-900 rounded-full overflow-hidden border-2 border-slate-700 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Unlockables List */}
        <div className="bg-slate-800/50 rounded-3xl p-8 backdrop-blur-md flex-1">
          <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-8 text-center">Unlockables</h2>
          <div className="flex flex-col gap-4">
            {UNLOCKABLES.map((item) => {
              const isUnlocked = currentLevel >= item.level;
              return (
                <div 
                  key={item.level} 
                  className={`p-6 rounded-2xl flex items-center justify-between border-2 transition-all ${
                    isUnlocked 
                      ? 'bg-fuchsia-500/10 border-fuchsia-500/50 shadow-[0_0_15px_rgba(232,121,249,0.2)]' 
                      : 'bg-slate-800/80 border-slate-700 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl ${
                      isUnlocked ? 'bg-fuchsia-500 text-white' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {item.level}
                    </div>
                    <span className={`text-2xl font-bold ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                      {item.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {isUnlocked ? (
                      <span className="bg-fuchsia-500/20 text-fuchsia-400 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                        <Unlock className="w-4 h-4" /> Unlocked
                      </span>
                    ) : (
                      <span className="bg-slate-700 text-slate-400 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Locked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
