import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Rocket, ShieldAlert, RotateCcw, Award, HelpCircle, AlertTriangle, Play } from 'lucide-react';
import { NoteDetail } from './NoteDetail';
import { DifficultyEngine } from '../utils/difficultyManager';
import { AudioManager } from '../utils/audioManager';
import { Analytics } from '../utils/analyticsService';

interface RocketReadingProps {
  onBack: () => void;
  onComplete?: () => void;
  isDailyChallenge?: boolean;
  onChallengeComplete?: (score: number, accuracy: number) => void;
}

type NoteType = 'D' | 'E' | 'F' | 'G' | 'A' | 'B' | 'C';

interface FeedbackPop {
  id: number;
  text: string;
  type: 'success' | 'error';
}

export default function RocketReading({
  onBack,
  onComplete,
  isDailyChallenge = false,
  onChallengeComplete,
}: RocketReadingProps) {
  // Core states
  const [air, setAir] = useState(100);
  const [altitude, setAltitude] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [targetNote, setTargetNote] = useState<NoteType>('E');
  const [options, setOptions] = useState<NoteType[]>(['D', 'E']);
  const [feedback, setFeedback] = useState<FeedbackPop | null>(null);
  const feedbackIdCounter = useRef(0);

  // High score tracking
  const [bestAltitude, setBestAltitude] = useState(0);

  // In-Game Help & Pause state
  const [isPaused, setIsPaused] = useState(false);
  const [helpNoteRequested, setHelpNoteRequested] = useState<string | null>(null);
  const [resumeCountdown, setResumeCountdown] = useState<number | null>(null);

  // Adaptive Difficulty states
  const [currentDifficulty, setCurrentDifficulty] = useState(1);
  const [correctHits, setCorrectHits] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [recentAccuracy, setRecentAccuracy] = useState(100);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load High Score on mount
  useEffect(() => {
    const savedBest = localStorage.getItem('rocketHighScore');
    if (savedBest) {
      setBestAltitude(parseInt(savedBest, 10));
    }
  }, []);

  // 1-Minute Daily Challenge Timer
  useEffect(() => {
    if (!isDailyChallenge || gameOver || isPaused) return;

    const timer = setTimeout(() => {
      setGameOver(true);
      AudioManager.playSuccess();
      if (onChallengeComplete) {
        const accuracy = totalAttempts > 0 ? (correctHits / totalAttempts) * 100 : 0;
        onChallengeComplete(altitude, accuracy);
      }
    }, 60000); // 1 minute limit

    return () => clearTimeout(timer);
  }, [isDailyChallenge, gameOver, isPaused, altitude, correctHits, totalAttempts, onChallengeComplete]);

  // Interval for draining air supply
  useEffect(() => {
    if (gameOver || isPaused || resumeCountdown !== null) return;

    const timer = setInterval(() => {
      setAir((prev) => {
        // Base rate
        const baseRate = 1 + Math.floor(altitude / 1000);
        // Multiply by fall speed/difficulty multiplier
        const speedMultiplier = DifficultyEngine.getFallSpeed(currentDifficulty);
        const rate = Math.max(1, Math.round(baseRate * speedMultiplier * 0.45));

        const nextAir = prev - rate;
        if (nextAir <= 0) {
          setGameOver(true);
          clearInterval(timer);
          
          // Trigger high score updates
          const storedBest = localStorage.getItem('rocketHighScore') || '0';
          const bestNum = parseInt(storedBest, 10);
          if (altitude > bestNum) {
            localStorage.setItem('rocketHighScore', String(altitude));
            setBestAltitude(altitude);
          }

          if (isDailyChallenge && onChallengeComplete) {
            const accuracy = totalAttempts > 0 ? (correctHits / totalAttempts) * 100 : 0;
            onChallengeComplete(altitude, accuracy);
          }

          return 0;
        }
        return nextAir;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [gameOver, isPaused, resumeCountdown, altitude, currentDifficulty, isDailyChallenge, onChallengeComplete, correctHits, totalAttempts]);

  // Resume countdown timer effect
  useEffect(() => {
    if (resumeCountdown === null) return;

    if (resumeCountdown > 0) {
      const timer = setTimeout(() => {
        setResumeCountdown((prev) => (prev !== null ? prev - 1 : null));
        AudioManager.playClick();
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setResumeCountdown(null);
      setIsPaused(false);
    }
  }, [resumeCountdown]);

  // Generate target note and options
  const generateLevel = () => {
    const notes: NoteType[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const selectedTarget = notes[Math.floor(Math.random() * notes.length)];
    
    // Pick another note for the wrong option
    let wrongOption = notes[Math.floor(Math.random() * notes.length)];
    while (wrongOption === selectedTarget) {
      wrongOption = notes[Math.floor(Math.random() * notes.length)];
    }

    setTargetNote(selectedTarget);
    // Shuffle options left/right
    const opts = Math.random() > 0.5 ? [selectedTarget, wrongOption] : [wrongOption, selectedTarget];
    setOptions(opts);
  };

  useEffect(() => {
    generateLevel();
  }, []);

  const handleChoice = (note: NoteType) => {
    if (gameOver || isPaused || resumeCountdown !== null) return;

    const isCorrect = note === targetNote;
    feedbackIdCounter.current += 1;

    setTotalAttempts((t) => t + 1);

    if (isCorrect) {
      AudioManager.playClick();
      setCorrectHits((c) => c + 1);
      setCorrectStreak((s) => {
        const nextStreak = s + 1;
        // Calculate recent accuracy
        const total = totalAttempts + 1;
        const correct = correctHits + 1;
        const accuracy = (correct / total) * 100;
        setRecentAccuracy(accuracy);

        // Every 5 spawns, run difficulty check
        if (total % 5 === 0) {
          setCurrentDifficulty((prevDiff) => {
            const nextDiff = DifficultyEngine.calculateNextLevel(prevDiff, accuracy, nextStreak);
            if (nextDiff > prevDiff) {
              setToastMessage('Speed Up! 🚀');
              setTimeout(() => setToastMessage(null), 2000);
            } else if (nextDiff < prevDiff) {
              setToastMessage('Taking it easy... 💨');
              setTimeout(() => setToastMessage(null), 2000);
            }
            return nextDiff;
          });
        }

        return nextStreak;
      });

      setAltitude((prev) => {
        const next = prev + 100;
        if (next >= 1000 && onComplete && !isDailyChallenge) {
          onComplete(); // Lesson advancement trigger
        }
        return next;
      });
      setAir((prev) => Math.min(prev + 20, 100));
      setFeedback({
        id: feedbackIdCounter.current,
        text: '+20 Air! 🚀',
        type: 'success',
      });
    } else {
      AudioManager.playError();
      setCorrectStreak(0);
      const total = totalAttempts + 1;
      const accuracy = (correctHits / total) * 100;
      setRecentAccuracy(accuracy);

      // Every 5 spawns, run difficulty check
      if (total % 5 === 0) {
        setCurrentDifficulty((prevDiff) => {
          const nextDiff = DifficultyEngine.calculateNextLevel(prevDiff, accuracy, 0);
          if (nextDiff < prevDiff) {
            setToastMessage('Taking it easy... 💨');
            setTimeout(() => setToastMessage(null), 2000);
          }
          return nextDiff;
        });
      }

      setAir((prev) => Math.max(prev - 20, 0));
      setFeedback({
        id: feedbackIdCounter.current,
        text: '-20 Air! 💥',
        type: 'error',
      });
    }

    // Auto clear feedback
    setTimeout(() => {
      setFeedback(null);
    }, 600);

    // Load next question
    generateLevel();
  };

  const handlePause = () => {
    setIsPaused(true);
    setHelpNoteRequested(null);
  };

  const handleResumeClick = () => {
    setHelpNoteRequested(null);
    setResumeCountdown(3);
  };

  const restartGame = () => {
    setAir(100);
    setAltitude(0);
    setGameOver(false);
    setFeedback(null);
    setCurrentDifficulty(1);
    setCorrectHits(0);
    setTotalAttempts(0);
    setCorrectStreak(0);
    setRecentAccuracy(100);
    generateLevel();
  };

  // Render stave helper for choice box
  const renderMiniStave = (note: NoteType) => {
    let topPosition = 'top-[45px]'; // fallback
    let extraLedger = false;

    if (note === 'C') {
      topPosition = 'top-[74px]';
      extraLedger = true;
    } else if (note === 'D') {
      topPosition = 'top-[62px]';
    } else if (note === 'E') {
      topPosition = 'top-[53px]';
    } else if (note === 'F') {
      topPosition = 'top-[43px]';
    } else if (note === 'G') {
      topPosition = 'top-[34px]';
    } else if (note === 'A') {
      topPosition = 'top-[24px]';
    } else if (note === 'B') {
      topPosition = 'top-[14px]';
    }

    return (
      <div className="relative w-full h-24 bg-white border-2 border-neutral-300 rounded-xl flex items-center justify-center p-2 shadow hover:border-amber-400 hover:shadow-lg transition-all duration-200">
        <div className="relative w-40 h-16">
          {/* 5 thin black lines */}
          <div className="absolute inset-x-0 top-1.5 h-[1px] bg-neutral-900" />
          <div className="absolute inset-x-0 top-5 h-[1px] bg-neutral-900" />
          <div className="absolute inset-x-0 top-8.5 h-[1px] bg-neutral-900" />
          <div className="absolute inset-x-0 top-12 h-[1px] bg-neutral-900" />
          <div className="absolute inset-x-0 top-[62px] h-[1px] bg-neutral-900" />
          
          {/* Treble clef logo */}
          <span className="absolute left-1 top-[-2px] text-2xl font-bold select-none text-neutral-800">🎼</span>
          
          {/* Ledger line for C */}
          {extraLedger && (
            <div className="absolute left-[58px] top-[79px] h-[1.5px] w-6 bg-neutral-950" />
          )}

          {/* Note Head placement */}
          <div
            style={{ top: topPosition }}
            className="absolute left-16 w-4 h-3 bg-neutral-900 rounded-full rotate-[-15deg] flex items-center justify-center transition-all"
          >
            <div className="absolute left-[14px] bottom-[3px] w-[1px] h-10 bg-neutral-900" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 flex flex-col justify-between" id="rocket-reading-arena">
      {/* Moving Starry Background Speed connected dynamically */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 z-0 transition-all duration-500"
        style={{
          transform: `translateY(${(altitude % 500) * -0.5}px)`,
        }}
      >
        <div className="absolute w-1 h-1 bg-white rounded-full top-[10%] left-[20%] animate-ping" />
        <div className="absolute w-1 h-1 bg-white rounded-full top-[30%] left-[70%] animate-pulse" />
        <div className="absolute w-1 h-1 bg-white rounded-full top-[50%] left-[40%] animate-ping" />
        <div className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full top-[80%] left-[10%] animate-pulse" />
        <div className="absolute w-1.5 h-1.5 bg-blue-300 rounded-full top-[25%] left-[90%] animate-ping" />
      </div>

      {/* Speed Toast Notification */}
      {toastMessage && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-indigo-600 border border-indigo-400 px-5 py-2.5 rounded-full shadow-2xl text-white font-display font-bold animate-bounce z-40">
          {toastMessage}
        </div>
      )}

      {/* Top HUD Row */}
      <div className="relative z-10 flex items-center justify-between p-6 bg-slate-900/60 backdrop-blur-md border-b border-white/5">
        <button
          id="rocket-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 font-sans font-semibold text-white/95 transition-all rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 shadow-lg border border-white/15"
        >
          <ArrowLeft className="w-5 h-5" />
          Exit
        </button>

        <div className="text-center">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-0.5">Altitude Achieved</span>
          <h2 className="text-2xl font-black text-white font-mono tracking-wider">
            {altitude} m
          </h2>
          {/* Best high score indicator */}
          <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider block">
            BEST: {Math.max(bestAltitude, altitude)} m
          </span>
        </div>

        {/* HUD right elements: Difficulty + Pause */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end text-right font-mono">
            <span className="text-[9px] text-slate-400 uppercase font-bold">Difficulty</span>
            <span className="text-xs text-indigo-400 font-extrabold">Level {currentDifficulty}/10</span>
          </div>

          <button
            onClick={handlePause}
            aria-label="Pause Game"
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white border border-white/10 transition-all cursor-pointer"
          >
            <HelpCircle size={20} />
          </button>
        </div>
      </div>

      {/* Main Game Interface */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 z-10">
        
        {/* Floating pop-up feedback indicator */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1.2, y: -40 }}
              exit={{ opacity: 0, y: -60 }}
              className={`absolute top-[15%] font-sans font-black text-3xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${
                feedback.type === 'success' 
                  ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]' 
                  : 'text-rose-500'
              }`}
            >
              {feedback.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Massive countdown display */}
        {resumeCountdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-25 backdrop-blur-sm">
            <motion.div
              key={resumeCountdown}
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2.5, opacity: 0 }}
              className="text-8xl font-display font-black text-yellow-400"
            >
              {resumeCountdown === 0 ? 'GO!' : resumeCountdown}
            </motion.div>
          </div>
        )}

        {/* Note Targets Choice Row */}
        <div className="grid grid-cols-2 gap-6 max-w-lg w-full mb-10">
          {options.map((note, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleChoice(note)}
              className="cursor-pointer"
              id={`choice-box-${note}`}
            >
              {renderMiniStave(note)}
            </motion.div>
          ))}
        </div>

        {/* Alien Commander Instructions Bubble */}
        <div className="flex flex-col items-center gap-2 mb-4" id="alien-commander-box">
          <div className="relative bg-violet-600 border-2 border-violet-400 p-4 rounded-2xl shadow-2xl max-w-xs text-center">
            {/* Speach bubble bottom triangle arrow */}
            <div className="absolute bottom-[-10px] left-1/2 -ml-2.5 h-5 w-5 rotate-45 bg-violet-600 border-r-2 border-b-2 border-violet-400 transform" />
            <h4 className="font-sans font-black text-white text-lg tracking-wide uppercase">
              Aim for the {targetNote}'s! 👾
            </h4>
          </div>
          
          {/* Commander Avatar */}
          <div className="relative">
            <span className="text-5xl animate-bounce" role="img" aria-label="Alien Commander">👾</span>
            <div className="absolute top-0 right-0 p-0.5 bg-indigo-500 rounded-full border border-white">
              <span className="text-[9px] font-bold text-white px-1">CMD</span>
            </div>
          </div>
        </div>

        {/* Vector Clarinet Rocket */}
        <motion.div 
          className="relative text-neutral-400 drop-shadow-[0_0_24px_rgba(219,39,119,0.3)] mt-2"
          animate={{ y: [0, -4, 4, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <Rocket className="w-16 h-16 text-indigo-400 fill-indigo-950" />
          {/* Flame particles */}
          {air > 0 && (
            <div className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5">
              <span className="w-3 h-5 bg-orange-500 rounded-b-full animate-pulse" />
              <span className="w-1.5 h-3 bg-yellow-400 rounded-b-full animate-pulse" />
            </div>
          )}
        </motion.div>

      </div>

      {/* Bottom HUD - AIR Meter */}
      <div className="relative z-10 bg-slate-900/80 backdrop-blur-md p-6 border-t border-white/5 w-full flex flex-col items-center" id="air-hud">
        <div className="max-w-md w-full">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">
              {isDailyChallenge ? 'Practice Timer Running' : 'Air Supply'}
            </span>
            <span className={`text-xs font-bold font-mono ${air < 30 ? 'text-rose-500 animate-pulse' : 'text-neutral-400'}`}>
              {air}% Left
            </span>
          </div>
          <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden border border-white/10">
            <motion.div 
              className={`h-full ${air < 30 ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-cyan-400 to-indigo-500'}`} 
              animate={{ width: `${air}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      </div>

      {/* HELP & PAUSE OVERLAY MENU */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/95 z-40 flex items-center justify-center p-6 backdrop-blur-sm overflow-y-auto"
          >
            {helpNoteRequested ? (
              // Note Encyclopedia Detail View
              <div className="w-full max-w-4xl bg-white text-slate-800 rounded-3xl overflow-hidden p-2 shadow-2xl relative">
                <NoteDetail
                  noteName={helpNoteRequested}
                  onBack={() => setHelpNoteRequested(null)}
                />
                <div className="absolute top-6 right-6 z-50">
                  <button
                    onClick={handleResumeClick}
                    className="px-5 py-2.5 font-display font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg cursor-pointer text-sm"
                  >
                    Resume Game
                  </button>
                </div>
              </div>
            ) : (
              // Default Pause Menu Notes Selector
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-slate-900 border border-slate-700/60 p-8 rounded-3xl max-w-xl w-full shadow-2xl text-center"
              >
                <div className="inline-flex p-4 bg-indigo-500/10 text-indigo-400 rounded-full mb-4">
                  <HelpCircle className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-display font-black text-white uppercase tracking-wider">Game Paused</h2>
                <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
                  Need a quick reminder on how to play a note? Click on any note below to view its visual fingering chart!
                </p>

                {/* Grid of Note Buttons */}
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 my-8">
                  {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((note) => (
                    <button
                      key={note}
                      onClick={() => setHelpNoteRequested(note)}
                      className="p-3 bg-slate-800 hover:bg-indigo-600 hover:text-white border border-slate-700 hover:border-indigo-400 text-slate-300 font-mono font-black text-lg rounded-xl transition-all cursor-pointer active:scale-95"
                    >
                      {note}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleResumeClick}
                    className="flex-1 px-6 py-3 font-display font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play size={16} fill="currentColor" />
                    Resume Game
                  </button>
                  <button
                    onClick={onBack}
                    className="px-6 py-3 font-display font-bold text-slate-400 border border-slate-700 hover:bg-slate-800 rounded-2xl transition-all cursor-pointer"
                  >
                    Exit to Map
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Screen */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/90 z-30 flex items-center justify-center p-4"
            id="game-over-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="p-8 text-center bg-slate-900 border border-indigo-500/30 rounded-3xl max-w-sm shadow-2xl"
            >
              <div className="inline-flex p-4 bg-rose-500/10 text-rose-500 rounded-full mb-4">
                <ShieldAlert className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">Flight Ended</h2>
              <p className="mt-2 text-sm text-slate-400">
                You ran out of air! Excellent navigation practice. You rocketed to an impressive:
              </p>
              
              <div className="my-6 p-4 bg-indigo-950/40 border border-indigo-500/20 rounded-2xl flex items-center justify-center gap-3">
                <Award className="w-8 h-8 text-yellow-400" />
                <span className="font-mono text-3xl font-black text-white">{altitude} m</span>
              </div>

              <div className="flex gap-3">
                <button
                  id="over-restart-btn"
                  onClick={restartGame}
                  className="flex-1 px-5 py-3 font-sans font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  Relaunch
                </button>
                <button
                  id="over-map-btn"
                  onClick={onBack}
                  className="px-5 py-3 font-sans font-semibold text-slate-400 border border-slate-700 hover:bg-slate-800 rounded-xl transition-all"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
