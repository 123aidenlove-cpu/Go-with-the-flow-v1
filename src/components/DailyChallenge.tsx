import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, Star, Trophy, Sparkles, Zap, Flame, Award } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useProfile } from '../context/ProfileContext';
import { AudioManager } from '../utils/audioManager';
import RhythmRapids from './RhythmRapids';
import Pizzeria from './Pizzeria';
import RocketReading from './RocketReading';

interface DailyChallengeProps {
  onBack: () => void;
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({ onBack }) => {
  const { completeDailyChallenge, profile } = useProfile();
  
  // State logic: currentPhase can be 1, 2, 3 or 4 (for final summary screen)
  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const [phaseTransition, setPhaseTransition] = useState<boolean>(false);
  const [scores, setScores] = useState<{ phase1: number; phase2: number; phase3: number }>({
    phase1: 0,
    phase2: 0,
    phase3: 0,
  });

  const handlePhaseComplete = (phaseScore: number) => {
    AudioManager.playSuccess();
    
    // Save scores
    setScores((prev) => ({
      ...prev,
      [`phase${currentPhase}`]: phaseScore,
    }));

    // Trigger visual phase transition overlay
    setPhaseTransition(true);

    setTimeout(() => {
      setPhaseTransition(false);
      setCurrentPhase((prev) => {
        const next = prev + 1;
        if (next === 4) {
          // Final phase completed - register global context updates
          completeDailyChallenge();
        }
        return next;
      });
    }, 2500); // 2.5 seconds showcase
  };

  return (
    <div className="w-full h-screen bg-slate-900 text-white select-none overflow-hidden relative" id="daily-challenge-arena">
      {/* Visual Phase Transition overlay */}
      <AnimatePresence>
        {phaseTransition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.2, rotate: -20 }}
              animate={{ scale: 1.1, rotate: 0 }}
              exit={{ scale: 0.5 }}
              transition={{ type: 'spring', damping: 10, stiffness: 100 }}
              className="text-center"
            >
              <CheckCircle2 className="w-28 h-28 text-emerald-400 mx-auto drop-shadow-[0_0_20px_rgba(52,211,153,0.4)] animate-bounce" />
              <h2 className="text-4xl font-display font-black text-white mt-6 uppercase tracking-wider">
                Phase Complete!
              </h2>
              <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
                {currentPhase === 1 && 'Rhythm practice complete! Moving to trumpet fingering theory...'}
                {currentPhase === 2 && 'Trumpet fingerings verified! Final stage: Sight Reading...'}
                {currentPhase === 3 && 'All daily music routines finished! Loading summary...'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER THE ACTIVE SUB-GAME OR SUMMARY */}
      {currentPhase === 1 && (
        <RhythmRapids
          isDailyChallenge={true}
          onChallengeComplete={(score) => handlePhaseComplete(score)}
          onBack={onBack}
        />
      )}

      {currentPhase === 2 && (
        <Pizzeria
          isDailyChallenge={true}
          onChallengeComplete={(score) => handlePhaseComplete(score)}
          onBack={onBack}
        />
      )}

      {currentPhase === 3 && (
        <RocketReading
          isDailyChallenge={true}
          onChallengeComplete={(score) => handlePhaseComplete(score)}
          onBack={onBack}
        />
      )}

      {currentPhase === 4 && (
        <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-full max-w-xl bg-slate-900 border border-indigo-500/20 p-8 rounded-3xl shadow-2xl text-center relative overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 animate-pulse" />

            <div className="inline-flex p-4 bg-yellow-500/10 text-yellow-400 rounded-full mb-4 relative">
              <Trophy className="w-14 h-14 animate-bounce" />
              <Sparkles className="absolute top-2 right-2 text-yellow-300 w-5 h-5 animate-pulse" />
            </div>

            <h1 className="text-3xl font-display font-black text-white uppercase tracking-wider">
              Challenge Finished!
            </h1>
            <p className="text-slate-400 text-xs mt-1.5 uppercase font-bold tracking-widest text-indigo-400 font-display">
              Daily Practice Quest Achieved
            </p>

            {/* Performance breakdown */}
            <div className="my-6 grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-800/60 border border-slate-700/40 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Rhythm</span>
                <span className="font-mono text-base font-extrabold text-white">{scores.phase1} m</span>
              </div>
              <div className="p-3 bg-slate-800/60 border border-slate-700/40 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Fingering</span>
                <span className="font-mono text-base font-extrabold text-white">{scores.phase2} / 5</span>
              </div>
              <div className="p-3 bg-slate-800/60 border border-slate-700/40 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Reading</span>
                <span className="font-mono text-base font-extrabold text-white">{scores.phase3} m</span>
              </div>
            </div>

            {/* Large Audiovisual Reward Section */}
            <div className="bg-emerald-950/40 border border-emerald-500/20 p-4 rounded-2xl flex flex-col items-center gap-1.5 mb-8 animate-pulse">
              <div className="flex items-center gap-1 text-emerald-400 font-display font-black text-sm uppercase">
                <Zap className="w-4 h-4 fill-current" />
                DAILY QUEST REWARD
              </div>
              <div className="flex justify-center items-center gap-6">
                <div className="flex items-center gap-1">
                  <Star className="text-yellow-400 fill-yellow-400 w-5 h-5" />
                  <span className="text-xl font-black font-display text-white">+10 Stars</span>
                </div>
                <div className="text-slate-600 font-mono">|</div>
                <div className="flex items-center gap-1">
                  <Flame className="text-orange-500 fill-orange-500 w-5 h-5 animate-pulse" />
                  <span className="text-xl font-black font-display text-white">Streak: {profile.streakDays + 1}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="primary"
                size="md"
                onClick={onBack}
                aria-label="Back to Map"
                className="flex-1 animate-pulse"
              >
                Back to Map
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
