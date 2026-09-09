import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicScore } from './ui/DynamicScore';
import { formatVexFlowKey } from '../utils/musicFormatter';

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

const NOTES = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'];

export default function ClefCliffs({ onBack, onComplete }: Props) {
  const { instrument } = useInstrument();
  const hasSavedScoreRef = useRef(false);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [targetNote, setTargetNote] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [clef, setClef] = useState<'treble' | 'bass'>('bass');

  const generateLevel = () => {
    const target = NOTES[Math.floor(Math.random() * NOTES.length)];
    let wrong = NOTES[Math.floor(Math.random() * NOTES.length)];
    while (wrong === target) {
      wrong = NOTES[Math.floor(Math.random() * NOTES.length)];
    }
    const shuffled = Math.random() > 0.5 ? [target, wrong] : [wrong, target];
    setTargetNote(target);
    setOptions(shuffled);
  };

  const handleStart = () => {
    setScore(0);
    setGameState('playing');
    generateLevel();
  };

  const handleChoice = (note: string) => {
    if (note === targetNote) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore >= 5) {
        setGameState('gameover');
      } else {
        generateLevel();
      }
    } else {
      setScore(0);
      generateLevel();
    }
  };

  return (
    <div className="min-h-screen bg-sky-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 z-50 flex items-center gap-2 px-6 py-3 font-black text-white uppercase tracking-widest bg-sky-800 rounded-full hover:bg-sky-700 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      {gameState === 'start' && (
        <div className="bg-white p-12 rounded-[3rem] text-center max-w-2xl shadow-2xl border-4 border-sky-300 z-10">
          <h1 className="text-4xl font-black text-slate-800 uppercase tracking-widest mb-4">Clef Cliffs</h1>
          <p className="text-xl text-slate-600 font-bold mb-8">
            Jump off the cliff! Quickly select the trampoline with the correct note to survive. Watch out for water!
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <button onClick={() => setClef('treble')} className={`px-6 py-2 rounded-xl font-bold ${clef === 'treble' ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-600'}`}>Treble Clef</button>
            <button onClick={() => setClef('bass')} className={`px-6 py-2 rounded-xl font-bold ${clef === 'bass' ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-600'}`}>Bass Clef</button>
          </div>
          <button 
            onClick={handleStart}
            className="bg-sky-500 hover:bg-sky-400 text-white px-10 py-5 rounded-2xl font-black text-xl uppercase tracking-widest shadow-[0_6px_0_#0369a1] active:translate-y-1.5 active:shadow-none transition-all"
          >
            Start Jumping
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full max-w-4xl h-[80vh] bg-sky-950 rounded-3xl relative border-8 border-slate-700 overflow-hidden flex flex-col items-center">
          <div className="absolute top-4 right-4 bg-white px-6 py-2 rounded-full font-black text-xl text-sky-900 z-10">
            Score: {score}/5
          </div>
          
          <div className="absolute top-1/4 bg-white p-6 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center z-10 border-4 border-slate-200">
            <span className="text-slate-500 font-bold mb-2 uppercase tracking-widest text-sm">Read this Note</span>
            <div className="-mt-4 pointer-events-none filter drop-shadow-md">
              <DynamicScore clef={clef as any} keySignature="C" notes={[{ keys: [formatVexFlowKey(targetNote, clef)], duration: "q" }]} width={160} height={180} />
            </div>
            <span className="text-sky-500 font-bold mt-2 uppercase text-xs">{clef} Clef</span>
          </div>

          <AnimatePresence mode="popLayout">
            <motion.div
              key={targetNote}
              initial={{ y: -200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="mt-12 z-20"
            >
              <div className="w-24 h-24 bg-orange-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                <span className="text-4xl">😎</span>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-0 w-full flex justify-between px-12 pb-12 gap-8 z-30">
            {options.map((opt, i) => (
              <motion.button
                key={`${opt}-${i}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChoice(opt)}
                className="flex-1 h-32 bg-emerald-500 rounded-2xl border-b-8 border-emerald-700 shadow-xl flex flex-col items-center justify-center gap-2 hover:bg-emerald-400"
              >
                <Music className="text-white w-8 h-8" />
                <span className="text-3xl font-black text-white">{opt}</span>
              </motion.button>
            ))}
          </div>

          {/* Background cliffs */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-slate-800 border-r-8 border-slate-900"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-slate-800 border-l-8 border-slate-900"></div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="bg-white p-12 rounded-[3rem] text-center max-w-2xl shadow-2xl border-4 border-emerald-300 z-10">
          <h2 className="text-5xl font-black text-emerald-500 uppercase tracking-widest mb-6">You Survived!</h2>
          <p className="text-xl text-slate-600 font-bold mb-8">
            You successfully navigated the Clef Cliffs!
          </p>
          <button 
            onClick={onComplete}
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-5 rounded-2xl font-black text-xl uppercase tracking-widest shadow-[0_6px_0_#059669] active:translate-y-1.5 active:shadow-none transition-all flex items-center gap-3 mx-auto"
          >
            <CheckCircle className="w-6 h-6" /> Complete Mini-Game
          </button>
        </div>
      )}
    </div>
  );
}
