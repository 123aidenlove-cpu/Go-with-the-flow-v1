import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ShieldAlert, RotateCcw, Award, HelpCircle, Info, Play, Shield } from 'lucide-react';
import { AudioManager } from '../utils/audioManager';
import { APP_ASSETS } from '../config/assets';
import { DynamicScore } from './ui/DynamicScore';
import { Curriculums } from '../data';
import { useInstrument } from '../contexts/InstrumentContext';
import { UniversalGameHomepage, LevelCardData } from './ui/UniversalGameHomepage';
import { NoteHelpOverlay } from './ui/NoteHelpOverlay';
import { NoteHelpButton } from './ui/NoteHelpButton';
import { addXP } from '../utils/economy';
import { saveGameScore } from '../utils/supabaseSync';
import { formatAccidentals, formatVexFlowKey } from '../utils/musicFormatter';
import masterDescriptions from '../data/masterDescriptions.json';
import { FingeringChart } from './ui/FingeringChart';
import MiniLeaderboard from './MiniLeaderboard';
import { BrassFingeringChart } from './ui/BrassFingeringChart';
import { FluteFingeringChart } from './ui/FluteFingeringChart';
import { SaxophoneFingeringChart } from './ui/SaxophoneFingeringChart';
import { ViolinFingeringChart } from './ui/ViolinFingeringChart';
import { CelloFingeringChart } from './ui/CelloFingeringChart';
import { PianoFingeringChart } from './ui/PianoFingeringChart';
import { VoicePitchDisplay } from './ui/VoicePitchDisplay';

interface RocketReadingProps {
  onBack: () => void;
  isDailyChallenge?: boolean;
  onChallengeComplete?: (score: any) => void;
  onComplete?: () => void;
}

export type NoteType = { label: string; writtenNote: string; description?: string; fingering?: string; };

interface FeedbackPop {
  id: number;
  text: string;
  type: 'success' | 'error';
}

export default function RocketReading({ onBack, onComplete }: RocketReadingProps) {
  const { instrument } = useInstrument();
  const bassClefInstruments = ['Trombone', 'Tuba', 'Baritone/Euphonium', 'Cello', 'Double Bass', 'Bass Guitar'];
  const clef = bassClefInstruments.includes(instrument) ? 'bass' : 'treble';
  const rawData = Curriculums[instrument as keyof typeof Curriculums] || Curriculums['Clarinet'] || [];
  const rocketLevelsData: any[] = Array.isArray(rawData) ? rawData : (rawData as any).default || [];
  
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [shields, setShields] = useState(3);
  const [altitude, setAltitude] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [targetNote, setTargetNote] = useState<NoteType | null>(null);
  const [options, setOptions] = useState<NoteType[]>([]);
  const [feedback, setFeedback] = useState<FeedbackPop | null>(null);
  const feedbackIdCounter = useRef(0);
  const [bestAltitude, setBestAltitude] = useState(0);
  const [levelProgress, setLevelProgress] = useState<Record<number, number>>({});
  
  const [airLevel, setAirLevel] = useState(100);
  const [correctNotesCount, setCorrectNotesCount] = useState(0);
  
  const [isPaused, setIsPaused] = useState(false);
  const [resumeCountdown, setResumeCountdown] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [levelCleared, setLevelCleared] = useState(false);
  const [isInfiniteMode, setIsInfiniteMode] = useState(false);

  const [gamePhase, setGamePhase] = useState<'stage-select' | 'preview' | 'playing'>('stage-select');
  const [showNoteHelp, setShowNoteHelp] = useState(false);
  const [selectedPreviewNote, setSelectedPreviewNote] = useState<NoteType | null>(null);
  const [flashTargetNote, setFlashTargetNote] = useState(false);

  useEffect(() => {
    const savedBest = localStorage.getItem('rocketHighScore');
    if (savedBest) setBestAltitude(parseInt(savedBest, 10));
    
    const savedProgress = localStorage.getItem('rocketLevelProgress');
    if (savedProgress) setLevelProgress(JSON.parse(savedProgress));
  }, []);

  useEffect(() => {
    if (gameOver || isPaused || resumeCountdown !== null || selectedLevel === null || levelCleared || gamePhase === 'preview') return;
    
    const drainRate = 0.5 + (correctNotesCount * 0.05);

    const interval = setInterval(() => {
      setAirLevel(prev => {
        const next = prev - drainRate;
        if (next <= 0) {
          setGameOver(true);
          return 0;
        }
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [gameOver, isPaused, resumeCountdown, selectedLevel, levelCleared, correctNotesCount, gamePhase]);

  useEffect(() => {
    if (resumeCountdown === null) return;
    if (resumeCountdown > 0) {
      const timer = setTimeout(() => {
        setResumeCountdown(prev => prev !== null ? prev - 1 : null);
        AudioManager.playClick();
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setResumeCountdown(null);
      setIsPaused(false);
    }
  }, [resumeCountdown]);

  useEffect(() => {
    if (selectedLevel !== null) {
      setGamePhase('preview');
      setSelectedPreviewNote(null);
      setShields(3);
      setAltitude(0);
      setAirLevel(100);
      setCorrectNotesCount(0);
      setGameOver(false);
      setLevelCleared(false);
    }
  }, [selectedLevel]);

  const hasSavedScoreRef = useRef(false);
  useEffect(() => {
    if (selectedLevel !== null) hasSavedScoreRef.current = false;
  }, [selectedLevel]);

  useEffect(() => {
    if ((gameOver || levelCleared) && selectedLevel !== null && !hasSavedScoreRef.current) {
      saveGameScore('Rocket Reading', selectedLevel, altitude, 0);
      hasSavedScoreRef.current = true;
    }
  }, [gameOver, levelCleared, selectedLevel, altitude]);

  const generateLevel = () => {
    if (!selectedLevel) return;

    const availableLevels = rocketLevelsData.filter(l => l.id <= selectedLevel);
    const newNotes = rocketLevelsData.find(l => l.id === selectedLevel)?.introducedNotes || [];
    
    let allAvailable: NoteType[] = [];
    availableLevels.forEach(lvl => {
      allAvailable = allAvailable.concat(lvl.introducedNotes as any[]);
    });

    if (allAvailable.length === 0) return;

    let selectedTarget: NoteType;

    if (selectedLevel <= 4 || newNotes.length === 0) {
      selectedTarget = allAvailable[Math.floor(Math.random() * allAvailable.length)];
    } else {
      const r = Math.random();
      if (r < 0.4) {
        selectedTarget = newNotes[Math.floor(Math.random() * newNotes.length)];
      } else {
        const oldNotes = allAvailable.filter(n => !newNotes.some(nn => nn.label === n.label && nn.writtenNote === n.writtenNote));
        if (oldNotes.length > 0) {
          selectedTarget = oldNotes[Math.floor(Math.random() * oldNotes.length)];
        } else {
          selectedTarget = newNotes[Math.floor(Math.random() * newNotes.length)];
        }
      }
    }

    let wrongOption = allAvailable[Math.floor(Math.random() * allAvailable.length)];
    let attempts = 0;
    while (wrongOption.label === selectedTarget.label && wrongOption.writtenNote === selectedTarget.writtenNote && attempts < 50) {
      wrongOption = allAvailable[Math.floor(Math.random() * allAvailable.length)];
      attempts++;
    }

    setTargetNote(selectedTarget);
    setOptions(Math.random() > 0.5 ? [selectedTarget, wrongOption] : [wrongOption, selectedTarget]);
    
    setFlashTargetNote(true);
    setTimeout(() => setFlashTargetNote(false), 800);
  };

  const handleChoice = (note: NoteType) => {
    if (gameOver || isPaused || resumeCountdown !== null) return;

    const isCorrect = note.label === targetNote?.label && note.writtenNote === targetNote?.writtenNote;
    feedbackIdCounter.current += 1;

    if (isCorrect) {
      if (note.writtenNote) {
        AudioManager.playNote(note.writtenNote, instrument);
      } else {
        AudioManager.playClick();
      }
      
      addXP(10);
      const nextCorrect = correctNotesCount + 1;
      setCorrectNotesCount(nextCorrect);
      setAirLevel(prev => Math.min(100, prev + 20));

      if (selectedLevel !== null) {
        const percentage = Math.min(100, Math.floor((nextCorrect / 30) * 100));
        setLevelProgress(prev => {
          const current = prev[selectedLevel] || 0;
          if (percentage > current) {
            const nextProg = { ...prev, [selectedLevel]: percentage };
            localStorage.setItem('rocketLevelProgress', JSON.stringify(nextProg));
            return nextProg;
          }
          return prev;
        });
      }

      if (nextCorrect > 0 && nextCorrect % 10 === 0) {
        setShields(s => Math.min(4, s + 1));
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }

      setAltitude(prev => {
        const next = prev + 100;
        
        if (next > bestAltitude) {
          localStorage.setItem('rocketHighScore', String(next));
          setBestAltitude(next);
        }

        return next;
      });

      if (nextCorrect >= 30 && !isInfiniteMode) {
        setLevelCleared(true);
        if (onComplete) onComplete();
      }

      setFeedback({ id: feedbackIdCounter.current, text: 'Blast! 🚀', type: 'success' });
    } else {
      AudioManager.playError();
      setAirLevel(prev => {
        const next = prev - 5;
        if (next <= 0) setGameOver(true);
        return next;
      });
      setShields(prev => {
        const next = prev - 1;
        if (next <= 0) setGameOver(true);
        return Math.max(0, next);
      });
      setFeedback({ id: feedbackIdCounter.current, text: 'Asteroid Hit! 💥', type: 'error' });
    }

    setTimeout(() => setFeedback(null), 600);
    generateLevel();
  };

  const restartGame = () => {
    setShields(3);
    setAltitude(0);
    setGameOver(false);
    setLevelCleared(false);
    setIsInfiniteMode(false);
    setShowConfetti(false);
    setFeedback(null);
    setAirLevel(100);
    setCorrectNotesCount(0);
    setGamePhase('preview');
  };

  const devModeUnlockAll = true;
  const rocketLevels = rocketLevelsData.map(l => ({
    ...l,
    isUnlocked: devModeUnlockAll ? true : l.isUnlocked,
      clef: clef,
    completionPercentage: levelProgress[l.id] || 0
  }));

  if (selectedLevel === null) {
    return (
      <UniversalGameHomepage
        gameTitle="Rocket Reading"
        titleColorClass="text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]"
        backgroundClass="bg-black bg-[url('/images/Reading%20Rocket.png')] bg-cover bg-center"
        levels={rocketLevels as any}
        onLevelSelect={(id) => {
          setSelectedLevel(id);
          setGamePhase('preview');
        }}
        onNoteHelp={() => setShowNoteHelp(true)}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 flex flex-col justify-between" id="rocket-reading-arena">
      <div className="absolute inset-0 pointer-events-none opacity-40 z-0 transition-all duration-500" style={{ transform: `translateY(${(altitude % 500) * -0.5}px)` }}>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[10%] left-[20%] animate-ping" />
        <div className="absolute w-1 h-1 bg-white rounded-full top-[30%] left-[70%] animate-pulse" />
        <div className="absolute w-1 h-1 bg-white rounded-full top-[50%] left-[40%] animate-ping" />
        <div className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full top-[80%] left-[10%] animate-pulse" />
        <div className="absolute w-1.5 h-1.5 bg-blue-300 rounded-full top-[25%] left-[90%] animate-ping" />
      </div>

      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center flex-col"
          >
            <div className="text-8xl">✨</div>
            <h2 className="text-4xl font-black text-yellow-400 mt-4 drop-shadow-xl">+1 Energy Shield!</h2>
          </motion.div>
        )}
      </AnimatePresence>
      <NoteHelpOverlay isOpen={showNoteHelp} onClose={() => setShowNoteHelp(false)} defaultView="notes" />

      {selectedLevel !== null && gamePhase === 'preview' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md p-6">
          <div className="max-w-2xl w-full bg-slate-800 rounded-3xl p-8 shadow-2xl border border-white/10 flex flex-col items-center text-center">
            
            <div className="flex items-center gap-4 mb-6 bg-slate-900 p-4 rounded-2xl w-full border border-slate-700">
              <img src="/astronaut_aiden_1784462702713.jpg" alt="Aiden" className="w-24 h-24 object-cover rounded-full border-2 border-purple-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-bounce" />
              <div className="text-left">
                <h3 className="text-3xl font-black text-white">Commander Aiden</h3>
                <p className="text-cyan-300 font-bold text-lg">"Click on the correct note to keep flying higher! Review your targets before we launch."</p>
              </div>
            </div>

            <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-wider">Level {selectedLevel} Targets</h2>
            
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {rocketLevels.find(l => l.id === selectedLevel)?.introducedNotes?.map((n: any, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPreviewNote(n)}
                  className={`px-6 py-3 rounded-xl font-mono font-black text-2xl transition-all ${selectedPreviewNote?.label === n.label ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)]' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  {formatAccidentals(n.label)}
                </button>
              ))}
            </div>

            {selectedPreviewNote && (() => {
              const masterDesc = (masterDescriptions as any)[clef.charAt(0).toUpperCase() + clef.slice(1)]?.[selectedPreviewNote.writtenNote] || selectedPreviewNote.description || "No description available.";
              const fingeringString = (selectedPreviewNote.fingeringDisplay || selectedPreviewNote.fingering || "").split(' OR ')[0];

              return (
                <div className="bg-slate-900 p-6 rounded-2xl w-full mb-8 border border-indigo-500/30 text-left relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10 text-9xl leading-none font-black translate-x-4 -translate-y-4">
                    {formatAccidentals(selectedPreviewNote.label)}
                  </div>
                  <h4 className="text-3xl font-black text-indigo-400 mb-4">{formatAccidentals(selectedPreviewNote.label)}</h4>
                  <p className="text-slate-300 mb-4 text-lg"><span className="text-white font-bold">Description:</span> {masterDesc}</p>
                  
                  <div className="flex flex-col items-start">
                    <span className="text-white font-bold text-lg mb-2">Fingering:</span>
                    {fingeringString ? (
                      <div className="transform scale-[0.6] origin-top-left -mb-[20%] lg:-mb-[10%]">
                        {instrument === 'Clarinet' && <FingeringChart fingeringString={fingeringString} />}
                        {(instrument === 'Trumpet' || instrument === 'Baritone/Euphonium') && <BrassFingeringChart fingeringString={fingeringString} />}
                        {instrument === 'Flute' && <FluteFingeringChart fingeringString={fingeringString} />}
                        {instrument === 'Alto Saxophone' && <SaxophoneFingeringChart fingeringString={fingeringString} />}
                        {instrument === 'Tenor Saxophone' && <SaxophoneFingeringChart fingeringString={fingeringString} />}
                        {instrument === 'Violin' && <ViolinFingeringChart fingeringString={fingeringString} />}
                        {instrument === 'Cello' && <CelloFingeringChart fingeringString={fingeringString} />}
                        {instrument === 'Piano' && <PianoFingeringChart fingeringString={fingeringString} />}
                        {instrument.includes('Voice') && <VoicePitchDisplay fingeringString={fingeringString} />}
                        {(!['Clarinet', 'Trumpet', 'Flute', 'Alto Saxophone', 'Tenor Saxophone', 'Violin', 'Cello', 'Piano', 'Soprano Voice', 'Alto Voice', 'Tenor Voice', 'Bass Voice', 'Baritone/Euphonium'].includes(instrument)) && (
                          <p className="text-slate-400 italic">Chart for {instrument} coming soon!</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500">N/A</span>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setSelectedLevel(null)}
                className="py-5 px-8 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-black text-2xl uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center"
              >
                <ArrowLeft className="w-8 h-8" />
              </button>
              <button 
                onClick={() => { AudioManager.unlockAudio(); setGamePhase('playing'); generateLevel(); }}
                className="flex-1 py-5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-2xl font-black text-4xl uppercase tracking-widest shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all active:scale-95 flex items-center justify-center gap-4"
              >
                Start Rocket! 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Altitude Graph */}
      {selectedLevel !== null && gamePhase === 'playing' && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 h-[70vh] w-16 bg-slate-900/60 backdrop-blur-md rounded-[2rem] border border-white/10 z-20 flex flex-col items-center py-6 shadow-2xl">
          <div className="relative w-full flex-1 flex flex-col justify-between items-center px-2">
            <div className="w-2 bg-slate-800 h-full absolute left-1/2 -translate-x-1/2 rounded-full overflow-hidden shadow-inner border border-slate-700/50">
              <div className="w-full bg-gradient-to-t from-indigo-600 via-cyan-400 to-emerald-400 absolute bottom-0 transition-all duration-500" style={{ height: `${Math.min(100, (altitude / 3000) * 100)}%` }} />
            </div>
            
            {[3000, 2500, 2000, 1500, 1000, 500, 0].map(mark => (
              <div key={mark} className="relative w-full flex items-center justify-center z-10 text-[10px] font-black text-white/50">
                <div className="absolute w-full h-[2px] bg-white/20" />
                <span className="bg-slate-900 px-1 rounded absolute -left-2 tracking-tighter">{mark}</span>
              </div>
            ))}

            <motion.div 
              className="absolute left-1/2 -translate-x-1/2 z-20 text-3xl drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
              style={{ bottom: `${Math.min(100, (altitude / 3000) * 100)}%`, marginBottom: '-18px' }}
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              🚀
            </motion.div>
          </div>
        </div>
      )}

      {/* Top HUD */}
      <div className="relative z-10 flex items-center justify-between p-6 bg-slate-900/60 backdrop-blur-md border-b border-white/5">
        <button onClick={() => setSelectedLevel(null)} className="flex items-center gap-2 px-4 py-2 font-sans font-bold text-white transition-all rounded-xl bg-white/10 hover:bg-white/20 active:scale-95">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl font-mono font-black border border-emerald-500/30">
            <Award className="w-5 h-5" /> {altitude}m
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl font-mono font-black border border-cyan-500/30">
            <Shield className="w-5 h-5" /> {shields} / 4
          </div>
          {gamePhase === 'playing' && (
            <button onClick={() => setShowNoteHelp(true)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all cursor-pointer">
              <HelpCircle size={24} />
            </button>
          )}
        </div>
      </div>

      {/* Air Bar */}
      {selectedLevel !== null && !gameOver && !levelCleared && gamePhase === 'playing' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[66%] max-w-2xl z-20 pointer-events-none ml-8">
          <div className="w-full bg-slate-900/80 p-3 rounded-2xl border border-white/20 backdrop-blur-md shadow-2xl">
            <div className="flex justify-between items-center px-2 mb-2">
              <span className="text-sm font-black uppercase text-cyan-400 tracking-widest">Air Remaining</span>
              <span className="text-sm font-black text-cyan-100">{Math.max(0, Math.round(airLevel))}%</span>
            </div>
            <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
              <div 
                className={`h-full transition-all duration-200 ${airLevel > 30 ? 'bg-cyan-400' : 'bg-rose-500 animate-pulse'}`} 
                style={{ width: `${Math.max(0, Math.min(100, airLevel))}%` }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 z-10 pb-28 pl-24">
        <AnimatePresence>
          {feedback && (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, scale: 0.5, y: 10 }} animate={{ opacity: 1, scale: 1.2, y: -40 }} exit={{ opacity: 0, y: -60 }}
              className={`absolute top-[15%] font-sans font-black text-5xl drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)] z-30 ${feedback.type === 'success' ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]' : 'text-rose-500'}`}
            >
              {feedback.text}
            </motion.div>
          )}
        </AnimatePresence>

        {resumeCountdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30 backdrop-blur-sm">
            <motion.div key={resumeCountdown} initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: 1.5, opacity: 1 }} exit={{ scale: 2.5, opacity: 0 }} className="text-9xl font-display font-black text-yellow-400 drop-shadow-2xl">
              {resumeCountdown === 0 ? 'GO!' : resumeCountdown}
            </motion.div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-12">
          <div className="bg-white/95 rounded-3xl p-8 shadow-[0_0_30px_rgba(168,85,247,0.3)] flex flex-col items-center relative border-4 border-purple-500 min-w-[280px]">
            <h2 className="text-xl font-black text-slate-500 mb-2 uppercase tracking-widest text-center">
              Aim for the
            </h2>
            <div className={`${(targetNote?.label || '').length > 2 ? 'text-7xl py-12' : 'text-[12rem]'} font-black text-purple-600 leading-none pb-4 drop-shadow-md`}>
              {formatAccidentals(targetNote?.label || '')}
            </div>
          </div>
          
          <AnimatePresence>
            {flashTargetNote && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className="text-9xl font-black text-emerald-400 drop-shadow-[0_0_40px_rgba(52,211,153,1)] z-10"
              >
                {formatAccidentals(targetNote?.label || '')}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-2 gap-8 max-w-2xl w-full">
          {options.map((note, index) => (
            <button
              key={index}
              onClick={() => handleChoice(note)}
              disabled={gameOver || isPaused || resumeCountdown !== null || levelCleared}
              className="p-4 bg-white hover:bg-slate-50 text-slate-900 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all active:scale-95 border-4 border-slate-200 hover:border-purple-400 flex flex-col items-center justify-center disabled:opacity-50 min-h-[220px]"
            >
              <div className={`pointer-events-none filter drop-shadow-md -mt-4 relative z-10 transition-all ${selectedLevel !== null && selectedLevel <= 10 ? 'scale-150' : 'scale-125'}`}>
                <DynamicScore clef={clef as any} keySignature={rocketLevelsData.find((l: any) => l.id === selectedLevel)?.keySignature} notes={[{ keys: [formatVexFlowKey(note.writtenNote, clef)], duration: "q" }]} width={160} height={180} />
              </div>
            </button>
          ))}
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-40 backdrop-blur-md">
            <div className="absolute top-8 left-8 z-50 flex items-center gap-4">
              <button
                onClick={restartGame}
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-white px-5 py-3 rounded-2xl shadow-xl transition-all border-2 border-white/20 backdrop-blur-md font-black uppercase tracking-wider"
              >
                <ArrowLeft className="w-6 h-6" /> Quit
              </button>
              <NoteHelpButton onClick={() => setShowNoteHelp(true)} className="bg-slate-800/80 border-white/20 backdrop-blur-md hover:bg-slate-700 w-14 h-14" />
            </div>
            <ShieldAlert className="w-24 h-24 text-rose-500 mb-6 animate-pulse" />
            <h2 className="text-6xl font-black text-white mb-4">Hull Breach!</h2>
            <p className="text-2xl text-slate-300 mb-4 font-bold">Altitude reached: <span className="text-emerald-400">{altitude}m</span></p>
            <div className="w-full max-w-md mb-8">
              <MiniLeaderboard gameName="Rocket Reading" instrument={instrument} currentScore={altitude} />
            </div>
            <div className="flex gap-6">
              <button onClick={restartGame} className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-2xl transition-all active:scale-95 shadow-lg shadow-indigo-500/30">
                <RotateCcw className="w-6 h-6" /> Try Again
              </button>
              <button onClick={() => setSelectedLevel(null)} className="flex items-center gap-3 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold text-2xl transition-all active:scale-95">
                <ArrowLeft className="w-6 h-6" /> Missions
              </button>
            </div>
          </div>
        )}

        {levelCleared && (
          <div className="absolute inset-0 bg-emerald-900/90 flex flex-col items-center justify-center z-40 backdrop-blur-md">
            <Award className="w-24 h-24 text-yellow-400 mb-6 animate-bounce" />
            <h2 className="text-6xl font-black text-white mb-4">Mission Complete!</h2>
            <p className="text-2xl text-emerald-200 mb-4 font-bold">You reached <span className="text-white">{altitude}m</span> in orbit!</p>
            <div className="w-full max-w-md mb-8">
              <MiniLeaderboard className="!bg-emerald-800/80 !border-emerald-600 !text-white" gameName="Rocket Reading" instrument={instrument} currentScore={altitude} />
            </div>
            <div className="flex gap-6">
              {!isInfiniteMode && (
                <button onClick={() => { setIsInfiniteMode(true); setLevelCleared(false); hasSavedScoreRef.current = false; }} className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold text-2xl transition-all active:scale-95 shadow-lg shadow-cyan-500/30">
                  Continue (Endless)
                </button>
              )}
              <button onClick={() => setSelectedLevel(null)} className="flex items-center gap-3 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold text-2xl transition-all active:scale-95">
                <ArrowLeft className="w-6 h-6" /> Missions
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Aiden Helper Avatar Popup */}
      {selectedLevel !== null && gamePhase === 'playing' && !gameOver && !levelCleared && (
        <div className="absolute bottom-6 right-6 z-30 flex items-end gap-4 pointer-events-none">
          <div className="bg-white text-slate-800 p-4 rounded-2xl rounded-br-none shadow-2xl max-w-[200px] border-2 border-purple-200 animate-pulse">
            {selectedLevel <= 4 && correctNotesCount === 0 ? (
              <p className="font-bold text-sm text-purple-600">Click on the correct note to keep flying higher!</p>
            ) : (
              <p className="font-bold text-sm">Press on the <span className="bg-purple-100 text-purple-700 px-1 rounded">?</span> button if you need help remembering the notes!</p>
            )}
          </div>
          <img src="/astronaut_aiden_1784462702713.jpg" alt="Aiden Astronaut" className="w-24 h-24 object-contain rounded-full border-4 border-white shadow-xl shadow-purple-500/50" />
        </div>
      )}
    </div>
  );
}
