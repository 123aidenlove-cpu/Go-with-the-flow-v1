import { BackButton } from './ui/BackButton';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DynamicScore, VexNoteDef } from './ui/DynamicScore';
import { ArrowLeft, ShieldAlert, Award } from 'lucide-react';

interface PlacementQuizProps {
  onComplete: (league: string, startingNotes: string[]) => void;
  onBack: () => void;
  clef?: 'treble' | 'bass';
}

// Leagues map directly to progressive note pools
const PROGRESSION_POOLS = [
  { tier: 'Bronze 1', notes: [{ key: 'c/4', label: 'C' }, { key: 'd/4', label: 'D' }, { key: 'e/4', label: 'E' }, { key: 'f/4', label: 'F' }, { key: 'g/4', label: 'G' }] },
  { tier: 'Bronze 2', notes: [{ key: 'a/4', label: 'A' }, { key: 'b/4', label: 'B' }, { key: 'c/5', label: 'C' }] },
  { tier: 'Bronze 3', notes: [{ key: 'f/4/sharp', label: 'F#' }, { key: 'b/4/flat', label: 'Bb' }] },
  { tier: 'Silver 1', notes: [{ key: 'd/5', label: 'D' }, { key: 'e/5', label: 'E' }] },
  { tier: 'Silver 2', notes: [{ key: 'f/5', label: 'F' }, { key: 'g/5', label: 'G' }] },
  { tier: 'Silver 3', notes: [{ key: 'a/5', label: 'A' }, { key: 'b/5', label: 'B' }, { key: 'c/6', label: 'C' }] },
];

export const PlacementQuiz: React.FC<PlacementQuizProps> = ({ onComplete, onBack, clef = 'treble' }) => {
  const [gameState, setGameState] = useState<'initial' | 'playing' | 'gameover'>('initial');
  
  // Game metrics
  const [currentPoolIndex, setCurrentPoolIndex] = useState(0);
  const [activeNotes, setActiveNotes] = useState<any[]>(PROGRESSION_POOLS[0].notes);
  const [strikes, setStrikes] = useState(0);
  const [score, setScore] = useState(0); 
  
  // Question state
  const [targetNote, setTargetNote] = useState<any>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(5000); 
  const [maxTime, setMaxTime] = useState(5000);
  
  const generateQuestion = (pool = activeNotes) => {
    const nextTarget = pool[Math.floor(Math.random() * pool.length)];
    
    // Generate 3 random wrong options from ALL possible notes, avoiding the correct answer
    const allLabels = PROGRESSION_POOLS.flatMap(p => p.notes.map(n => n.label));
    const wrongOptions = Array.from(new Set(allLabels.filter(l => l !== nextTarget.label)))
                             .sort(() => 0.5 - Math.random())
                             .slice(0, 3);
                             
    const newOptions = [...wrongOptions, nextTarget.label].sort(() => 0.5 - Math.random());
    
    setTargetNote(nextTarget);
    setOptions(newOptions);
  };

  const handleStart = (canRead: boolean) => {
    if (!canRead) {
      onComplete('Bronze 1', PROGRESSION_POOLS[0].notes.map(n => n.key));
      return;
    }
    generateQuestion();
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          handleWrongAnswer();
          return maxTime;
        }
        return prev - 100;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [gameState, maxTime, targetNote]);

  const handleWrongAnswer = () => {
    setStrikes(prev => {
      const newStrikes = prev + 1;
      if (newStrikes >= 3) {
        setGameState('gameover');
      } else {
        generateQuestion();
        setTimeLeft(maxTime);
      }
      return newStrikes;
    });
  };

  const handleAnswer = (selectedLabel: string) => {
    if (selectedLabel === targetNote.label) {
      const newScore = score + 1;
      setScore(newScore);
      
      // Progress to next tier if they get enough correct
      if (newScore > (currentPoolIndex + 1) * 4 && currentPoolIndex < PROGRESSION_POOLS.length - 1) {
        const nextIndex = currentPoolIndex + 1;
        setCurrentPoolIndex(nextIndex);
        const newActiveNotes = [...activeNotes, ...PROGRESSION_POOLS[nextIndex].notes];
        setActiveNotes(newActiveNotes);
        setMaxTime(prev => Math.max(2000, prev - 500)); // Shrink timer
        generateQuestion(newActiveNotes);
      } else {
        generateQuestion();
      }
      setTimeLeft(maxTime);
    } else {
      handleWrongAnswer();
    }
  };

  if (gameState === 'initial') {
    return (
      <div className="w-full h-screen bg-slate-900 text-white flex flex-col items-center justify-center relative p-8">
      <BackButton onClick={onBack} />
        
        <h1 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Placement Quiz</h1>
        <p className="text-xl mb-12 text-slate-300 text-center max-w-lg">
          Let's find the perfect starting point for you so you don't get bored or overwhelmed!
        </p>
        <div className="flex flex-col gap-4 w-full max-w-md">
          <button 
            onClick={() => handleStart(false)}
            className="w-full p-6 rounded-2xl bg-slate-800 border-2 border-slate-700 hover:border-slate-500 hover:bg-slate-700 transition-all font-bold text-xl"
          >
            I can't read much music yet
          </button>
          <button 
            onClick={() => handleStart(true)}
            className="w-full p-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 border-2 border-indigo-400 hover:scale-105 transition-all font-bold text-xl shadow-[0_0_20px_rgba(99,102,241,0.5)]"
          >
            I can read music already
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    const finalLeague = PROGRESSION_POOLS[currentPoolIndex].tier;
    return (
      <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center relative p-8">
        <Award className="w-24 h-24 text-yellow-400 mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
        <h1 className="text-5xl font-black mb-4 text-white">Placement Complete!</h1>
        <p className="text-2xl text-slate-300 mb-12">You have been placed in: <span className="font-bold text-yellow-400">{finalLeague}</span></p>
        <button 
          onClick={() => onComplete(finalLeague, activeNotes.map(n => n.key))}
          className="px-12 py-4 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-black text-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(52,211,153,0.5)]"
        >
          Start Playing
        </button>
      </div>
    );
  }

  const timePercent = (timeLeft / maxTime) * 100;
  let timerColor = 'bg-emerald-400';
  if (timePercent < 50) timerColor = 'bg-yellow-400';
  if (timePercent < 25) timerColor = 'bg-red-500';

  return (
    <div className="w-full h-screen bg-slate-900 flex flex-col relative">
      <div className="w-full h-24 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 flex items-center justify-between px-8">
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <ShieldAlert key={i} className={`w-8 h-8 ${i < strikes ? 'text-slate-600' : 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]'}`} />
          ))}
        </div>
        <div className="text-xl font-bold text-slate-400">Score: {score}</div>
      </div>

      <div className="w-full h-2 bg-slate-800">
        <motion.div 
          className={`h-full ${timerColor}`}
          initial={{ width: '100%' }}
          animate={{ width: `${timePercent}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-12">
        <div className="w-96 h-64 bg-slate-100 rounded-[3rem] shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center border-4 border-slate-700 relative overflow-hidden">
          {targetNote && (
            <DynamicScore 
              notes={[{ keys: [targetNote.key.replace(/[/]sharp/, '#').replace(/[/]flat/, 'b')], duration: 'q', color: '#000000' }]} 
              clef={clef} 
              width={250} 
              height={200} 
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              className="p-6 rounded-2xl bg-slate-800 border-2 border-slate-700 hover:border-indigo-500 hover:bg-slate-700 text-white font-black text-3xl transition-all shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
