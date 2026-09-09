import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MiniLeaderboard from './MiniLeaderboard';
import { saveGameScore } from '../utils/supabaseSync';
import { useInstrument } from '../contexts/InstrumentContext';
import { ArrowLeft, Play, RotateCcw, Volume2 } from 'lucide-react';
import { UniversalGameHomepage, LevelCardData } from './ui/UniversalGameHomepage';

interface ExpressionNinjaProps {
  onBack: () => void;
  onComplete?: () => void;
}

export default function ExpressionNinja({ onBack, onComplete }: ExpressionNinjaProps) {
  const { instrument } = useInstrument();
  const hasSavedScoreRef = useRef(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  
  // Game States
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [obstacle, setObstacle] = useState<{ id: number, type: string, target: string, symbol: string } | null>(null);

  const ninjaLevels: LevelCardData[] = [
    {
      id: 1,
      title: 'Level 1: The Basics',
      targetSymbols: 'p, f, Staccato',
      isUnlocked: true,
      cardTheme: 'bg-neutral-800 border-2 border-amber-500',
      textTheme: 'text-amber-400'
    },
    {
      id: 2,
      title: 'Level 2: Advanced Moves',
      targetSymbols: 'mp, mf, Allegro',
      isUnlocked: false,
      cardTheme: 'bg-neutral-800 border-2 border-amber-500',
      textTheme: 'text-amber-400'
    },
    {
      id: 3,
      title: 'Level 3: Master Class',
      targetSymbols: 'Crescendo, Fermata',
      isUnlocked: false,
      cardTheme: 'bg-neutral-800 border-2 border-amber-500',
      textTheme: 'text-amber-400'
    }
  ];

  if (selectedLevel === null) {
    return (
      <UniversalGameHomepage
        gameTitle="Expression Ninja"
        titleColorClass="text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]"
        backgroundClass="bg-gradient-to-b from-slate-900 to-slate-800"
        levels={ninjaLevels}
        onLevelSelect={(id) => setSelectedLevel(id)}
        onBack={onBack}
      />
    );
  }

  // Simplified auto-runner logic
  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    spawnObstacle();
  };

  const spawnObstacle = () => {
    const obstacles = [
      { id: Date.now(), type: 'Dynamic', target: 'f', symbol: 'f' },
      { id: Date.now() + 1, type: 'Dynamic', target: 'p', symbol: 'p' },
      { id: Date.now() + 2, type: 'Articulation', target: 'Staccato', symbol: '.' }
    ];
    setObstacle(obstacles[Math.floor(Math.random() * obstacles.length)]);
  };

  const handleInput = (input: string) => {
    if (!obstacle || gameOver) return;
    
    if (input === obstacle.target) {
      setScore(s => s + 100);
      spawnObstacle();
    } else {
      setGameOver(true);
      setIsPlaying(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-900 overflow-hidden flex flex-col items-center select-none" id="expression-ninja-arena">
      {/* Background */}
      <div className="absolute inset-0 opacity-30 bg-[url('/images/Concert Hall.png')] bg-cover bg-center mix-blend-overlay" />
      
      {/* HUD */}
      <div className="relative z-10 w-full p-6 flex justify-between items-center bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <button
          onClick={() => setSelectedLevel(null)}
          className="flex items-center gap-2 px-4 py-2 font-sans font-semibold text-white/95 transition-all rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 shadow border border-white/10 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <h2 className="text-xl font-black text-amber-400 uppercase tracking-widest font-mono">
          Score: {score}
        </h2>
      </div>

      {/* Game Area */}
      <div className="flex-1 w-full max-w-4xl flex flex-col justify-center items-center relative z-10 p-6">
        
        {!isPlaying && !gameOver && (
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-black text-amber-400 uppercase tracking-widest drop-shadow-xl mb-8">
              Prepare to Run
            </h1>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-full font-black text-2xl uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(245,158,11,0.5)] cursor-pointer"
            >
              Start Level {selectedLevel}
            </button>
          </div>
        )}

        {isPlaying && obstacle && (
          <div className="flex flex-col items-center w-full max-w-lg">
            {/* Action Area */}
            <div className="bg-slate-800/80 border-2 border-slate-600 rounded-3xl p-10 w-full text-center shadow-2xl mb-12 relative overflow-hidden">
              <div className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                Incoming {obstacle.type}
              </div>
              <motion.div
                key={obstacle.id}
                initial={{ x: 200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-8xl font-serif font-bold text-white my-8 italic"
              >
                {obstacle.symbol}
              </motion.div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <button
                onClick={() => handleInput('f')}
                className="py-4 bg-rose-600/20 hover:bg-rose-600/40 border-2 border-rose-500 text-rose-400 rounded-2xl font-bold text-2xl uppercase tracking-widest transition-all active:scale-95"
              >
                Forte (f)
              </button>
              <button
                onClick={() => handleInput('p')}
                className="py-4 bg-blue-600/20 hover:bg-blue-600/40 border-2 border-blue-500 text-blue-400 rounded-2xl font-bold text-2xl uppercase tracking-widest transition-all active:scale-95"
              >
                Piano (p)
              </button>
              <button
                onClick={() => handleInput('Staccato')}
                className="py-4 bg-amber-600/20 hover:bg-amber-600/40 border-2 border-amber-500 text-amber-400 rounded-2xl font-bold text-xl uppercase tracking-widest transition-all active:scale-95 col-span-2"
              >
                Staccato (.)
              </button>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="text-center bg-slate-800/90 border border-amber-500/30 p-10 rounded-3xl shadow-2xl">
            <h1 className="text-4xl font-black text-white uppercase tracking-widest mb-2">
              Run Ended
            </h1>
            <p className="text-amber-400 font-mono text-2xl mb-8">Final Score: {score}</p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl font-bold text-lg uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                Retry
              </button>
              <button
                onClick={() => setSelectedLevel(null)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-lg uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
              >
                Levels
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
