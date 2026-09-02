import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Volume2, Music, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

type Mode = 'repertoire' | 'instrument';

const REPERTOIRE_OPTIONS = ['Mary Had a Little Lamb', 'Twinkle Twinkle', 'Hot Cross Buns', 'Jingle Bells'];
const INSTRUMENT_OPTIONS = ['Piano', 'Violin', 'Flute', 'Trumpet'];

export default function ListeningLagoon({ onBack, onComplete }: Props) {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState<Mode>('repertoire');
  const [target, setTarget] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateLevel = (currentMode: Mode) => {
    const list = currentMode === 'repertoire' ? REPERTOIRE_OPTIONS : INSTRUMENT_OPTIONS;
    const correct = list[Math.floor(Math.random() * list.length)];
    let wrong1 = list[Math.floor(Math.random() * list.length)];
    let wrong2 = list[Math.floor(Math.random() * list.length)];
    
    while (wrong1 === correct) {
      wrong1 = list[Math.floor(Math.random() * list.length)];
    }
    while (wrong2 === correct || wrong2 === wrong1) {
      wrong2 = list[Math.floor(Math.random() * list.length)];
    }

    const shuffled = [correct, wrong1, wrong2].sort(() => Math.random() - 0.5);
    setTarget(correct);
    setOptions(shuffled);
    setIsPlaying(true);
    
    // Simulate audio playing duration
    setTimeout(() => {
      setIsPlaying(false);
    }, 1500);
  };

  const handleStart = () => {
    setScore(0);
    setGameState('playing');
    generateLevel(mode);
  };

  const handleChoice = (choice: string) => {
    if (choice === target) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore >= 5) {
        setGameState('gameover');
      } else {
        generateLevel(mode);
      }
    } else {
      setScore(0);
      generateLevel(mode);
    }
  };

  const playAudio = () => {
    setIsPlaying(true);
    setTimeout(() => {
      setIsPlaying(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-cyan-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 z-50 flex items-center gap-2 px-6 py-3 font-black text-white uppercase tracking-widest bg-cyan-800 rounded-full hover:bg-cyan-700 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      {/* Decorative background waves */}
      <div className="absolute inset-0 opacity-20 pointer-events-none flex flex-col justify-end">
        <motion.div 
          animate={{ x: [-100, 0, -100] }} 
          transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
          className="h-32 bg-cyan-400 rounded-t-[100%]" 
        />
        <motion.div 
          animate={{ x: [0, -100, 0] }} 
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          className="h-32 bg-cyan-300 rounded-t-[100%] -mt-16" 
        />
      </div>

      {gameState === 'start' && (
        <div className="bg-white p-12 rounded-[3rem] text-center max-w-2xl shadow-2xl border-4 border-cyan-300 z-10">
          <h1 className="text-4xl font-black text-slate-800 uppercase tracking-widest mb-4">Listening Lagoon</h1>
          <p className="text-xl text-slate-600 font-bold mb-8">
            Listen closely to the magical frogs and lily pads. Can you identify the tune or the instrument?
          </p>
          
          <div className="flex justify-center gap-4 mb-8">
            <button 
              onClick={() => setMode('repertoire')} 
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${mode === 'repertoire' ? 'bg-cyan-500 text-white shadow-lg scale-105' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            >
              <Music className="w-5 h-5" /> Tunes
            </button>
            <button 
              onClick={() => setMode('instrument')} 
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${mode === 'instrument' ? 'bg-cyan-500 text-white shadow-lg scale-105' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            >
              <Disc className="w-5 h-5" /> Instruments
            </button>
          </div>

          <button 
            onClick={handleStart}
            className="bg-cyan-500 hover:bg-cyan-400 text-white px-10 py-5 rounded-2xl font-black text-xl uppercase tracking-widest shadow-[0_6px_0_#0891b2] active:translate-y-1.5 active:shadow-none transition-all"
          >
            Dive In
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full max-w-4xl flex flex-col items-center z-10 gap-12">
          <div className="bg-white px-8 py-3 rounded-full font-black text-2xl text-cyan-900 shadow-xl border-4 border-cyan-200">
            Score: {score}/5
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={playAudio}
            className={`w-48 h-48 rounded-full flex flex-col items-center justify-center gap-4 shadow-[0_10px_0_#0e7490] active:translate-y-2 active:shadow-none transition-all border-8 border-cyan-200 ${isPlaying ? 'bg-cyan-400' : 'bg-cyan-500'}`}
          >
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 0.5 }}
                  exit={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute w-48 h-48 rounded-full bg-cyan-300 -z-10"
                />
              )}
            </AnimatePresence>
            <Volume2 className="w-16 h-16 text-white" />
            <span className="text-white font-black uppercase tracking-widest text-sm">
              {isPlaying ? 'Listening...' : 'Play Sound'}
            </span>
          </motion.button>

          <div className="w-full flex justify-center gap-6 flex-wrap">
            {options.map((opt, i) => (
              <motion.button
                key={`${opt}-${i}`}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChoice(opt)}
                className="bg-white hover:bg-cyan-50 text-cyan-900 px-8 py-6 rounded-3xl font-black text-xl shadow-[0_8px_0_#0891b2] active:translate-y-2 active:shadow-none transition-all border-4 border-cyan-200 w-64 text-center"
              >
                {opt}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="bg-white p-12 rounded-[3rem] text-center max-w-2xl shadow-2xl border-4 border-cyan-300 z-10">
          <h2 className="text-5xl font-black text-cyan-600 uppercase tracking-widest mb-6">Perfect Pitch!</h2>
          <p className="text-xl text-slate-600 font-bold mb-8">
            You successfully identified the sounds of the lagoon.
          </p>
          <button 
            onClick={onComplete}
            className="bg-cyan-500 hover:bg-cyan-400 text-white px-10 py-5 rounded-2xl font-black text-xl uppercase tracking-widest shadow-[0_6px_0_#0891b2] active:translate-y-1.5 active:shadow-none transition-all flex items-center gap-3 mx-auto"
          >
            <CheckCircle className="w-6 h-6" /> Complete Mini-Game
          </button>
        </div>
      )}
    </div>
  );
}
