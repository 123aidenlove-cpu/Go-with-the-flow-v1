import React, { useState, useEffect, useRef } from 'react';
import { saveGameScore } from '../utils/supabaseSync';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ShieldAlert, RotateCcw, Award, HelpCircle, Anchor, Heart } from 'lucide-react';
import { AudioManager } from '../utils/audioManager';
import { DynamicScore } from './ui/DynamicScore';
import { UniversalGameHomepage, LevelCardData } from './ui/UniversalGameHomepage';
import { NoteHelpOverlay } from './ui/NoteHelpOverlay';
import { NoteHelpButton } from './ui/NoteHelpButton';
import { addXP } from '../utils/economy';
import { Curriculums } from '../data';
import { useInstrument } from '../contexts/InstrumentContext';
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

export type NoteType = { label: string; writtenNote: string; description?: string; fingering?: string; fingeringDisplay?: string; };

interface FeedbackPop {
  id: number;
  text: string;
  type: 'success' | 'error';
}

interface FingerFishingProps {
  onBack: () => void;
  onComplete?: () => void;
}

export default function FingerFishing({ onBack, onComplete }: FingerFishingProps) {
  const { instrument } = useInstrument();
  const bassClefInstruments = ['Trombone', 'Tuba', 'Baritone/Euphonium', 'Cello', 'Double Bass', 'Bass Guitar'];
  const defaultClef = bassClefInstruments.includes(instrument) ? 'bass' : 'treble';
  const rawData = Curriculums[instrument as keyof typeof Curriculums] || Curriculums['Clarinet'] || [];
  const rocketLevelsData: any[] = Array.isArray(rawData) ? rawData : (rawData as any).default || [];
  
  const title = instrument.includes('Voice') ? 'Vocal Fishing' : 'Finger Fishing';

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [targetNote, setTargetNote] = useState<NoteType | null>(null);
  const [options, setOptions] = useState<NoteType[]>([]);
  const [feedback, setFeedback] = useState<FeedbackPop | null>(null);
  const feedbackIdCounter = useRef(0);
  const [bestScore, setBestScore] = useState(0);
  const [levelProgress, setLevelProgress] = useState<Record<number, number>>({});
  
      
  const [isPaused, setIsPaused] = useState(false);
  const [resumeCountdown, setResumeCountdown] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [levelCleared, setLevelCleared] = useState(false);
  const [isInfiniteMode, setIsInfiniteMode] = useState(false);

  const [gamePhase, setGamePhase] = useState<'stage-select' | 'preview' | 'playing'>('stage-select');
  const [showNoteHelp, setShowNoteHelp] = useState(false);
  const [selectedStage, setSelectedStage] = useState<1 | 2 | 3 | null>(null);
  const [basketsFilled, setBasketsFilled] = useState(0);
  const [fishCount, setFishCount] = useState(0);
  const [spilled, setSpilled] = useState(false);
  const [selectedPreviewNote, setSelectedPreviewNote] = useState<NoteType | null>(null);
  const [flashTargetNote, setFlashTargetNote] = useState(false);

  useEffect(() => {
    const savedBest = localStorage.getItem('fishingHighScore');
    if (savedBest) setBestScore(parseInt(savedBest, 10));
    
    const savedProgress = localStorage.getItem('fishingLevelProgress');
    if (savedProgress) setLevelProgress(JSON.parse(savedProgress));
  }, []);

  
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
      setGamePhase('stage-select');
      setSelectedStage(null);
      setSelectedPreviewNote(null);
      setLives(3);
      setScore(0);
      setBasketsFilled(0);
      setFishCount(0);
      setGameOver(false);
      setLevelCleared(false);
    }
  }, [selectedLevel]);

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

    const targetFingering = (selectedTarget.fingeringDisplay || selectedTarget.fingering || '').split(' OR ')[0];
    
    const validDistractors = allAvailable.filter(n => {
       if (n.label === selectedTarget.label && n.writtenNote === selectedTarget.writtenNote) return false;
       const nFingering = (n.fingeringDisplay || n.fingering || '').split(' OR ')[0];
       return !(targetFingering && nFingering && targetFingering === nFingering);
    });

    const shuffledOptions: NoteType[] = [selectedTarget];
    const numOptions = Math.min(4, 1 + validDistractors.length);
    
    let attempts = 0;
    while (shuffledOptions.length < numOptions && attempts < 100) {
      attempts++;
      const wrongOption = validDistractors[Math.floor(Math.random() * validDistractors.length)];
      if (!shuffledOptions.some(n => n.label === wrongOption.label && n.writtenNote === wrongOption.writtenNote)) {
        shuffledOptions.push(wrongOption);
      }
    }

    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }

    setTargetNote(selectedTarget);
    setOptions(shuffledOptions);
    
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
      
      addXP(5);
      const targetFish = 5;
      const nextFish = fishCount + 1;
      
      if (nextFish >= targetFish) {
        const nextBaskets = basketsFilled + 1;
        setBasketsFilled(nextBaskets);
        setFishCount(0);
        
        if (lives < 3) setLives(l => l + 1);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
        
        if (nextBaskets >= 3) {
          setLevelCleared(true);
          if (onComplete) onComplete();
        }
      } else {
        setFishCount(nextFish);
      }
      
      setScore(s => {
        const newScore = s + 10;
        if (newScore > bestScore) {
          localStorage.setItem('fishingHighScore', String(newScore));
          setBestScore(newScore);
        }
        return newScore;
      });

      setFeedback({ id: feedbackIdCounter.current, text: 'Great Catch! 🎣', type: 'success' });
    } else {
      AudioManager.playError();
      const nextLives = lives - 1;
      
      if (nextLives <= 0) {
        setSpilled(true);
        setFishCount(0);
        setLives(3);
        setFeedback({ id: feedbackIdCounter.current, text: 'Basket Spilled! 😭', type: 'error' });
        setTimeout(() => setSpilled(false), 2000);
      } else {
        setLives(nextLives);
        setFeedback({ id: feedbackIdCounter.current, text: 'Seaweed! 🌿', type: 'error' });
      }
    }

    setTimeout(() => setFeedback(null), 600);
    generateLevel();
  };

  const restartGame = () => {
    setLives(3);
    setScore(0);
    setGameOver(false);
    setLevelCleared(false);
    setIsInfiniteMode(false);
    setShowConfetti(false);
    setFeedback(null);
    setBasketsFilled(0);
    setFishCount(0);
    setGamePhase('stage-select');
  };

  const devModeUnlockAll = true;
  const fishingLevels = rocketLevelsData.map(l => ({
    ...l,
    isUnlocked: devModeUnlockAll ? true : l.isUnlocked,
    completionPercentage: levelProgress[l.id] || 0
  }));

  if (selectedLevel === null) {
    return (
      <UniversalGameHomepage
        gameTitle={title}
        titleColorClass="text-cyan-300 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]"
        backgroundClass="bg-black bg-[url('/images/Finger%20fishing.png')] bg-cover bg-center"
        levels={fishingLevels as any}
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
    <div className="relative min-h-screen overflow-hidden bg-black bg-[url('/images/Finger%20fishing.png')] bg-cover bg-center flex flex-col justify-between" id="finger-fishing-arena">
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />
      
      <div className="absolute top-4 left-0 right-0 flex justify-between items-start px-8 z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <button onClick={onBack} className="p-4 bg-white/20 hover:bg-white/40 rounded-2xl backdrop-blur-md transition-all text-white shadow-xl">
            <ArrowLeft className="w-8 h-8" />
          </button>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-white/90 backdrop-blur-md px-12 py-4 rounded-full shadow-2xl border-4 border-white/50 flex flex-col items-center pointer-events-auto">
            <h1 className="text-4xl font-black text-sky-900 uppercase tracking-widest">{title}</h1>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center flex-col"
          >
            <div className="text-8xl">🎉</div>
            <h2 className="text-4xl font-black text-white mt-4 drop-shadow-xl">+1 Life Awarded!</h2>
          </motion.div>
        )}
      </AnimatePresence>
      <NoteHelpOverlay isOpen={showNoteHelp} onClose={() => setShowNoteHelp(false)} defaultView="notes" />

      {selectedLevel !== null && gamePhase === 'stage-select' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-cyan-950/80 backdrop-blur-md p-6 overflow-y-auto">
          <h2 className="text-6xl font-black text-white mb-12 uppercase tracking-widest drop-shadow-[0_0_20px_rgba(6,182,212,0.8)] mt-12">Select Stage</h2>
          <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center items-center">
            <button onClick={() => { setSelectedStage(1); setGamePhase('preview'); }} className="group flex flex-col items-center gap-6 w-full max-w-sm">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border-8 border-white shadow-[0_20px_50px_rgba(6,182,212,0.5)] flex items-center justify-center transform transition-all group-hover:scale-110 group-active:scale-95">
                <span className="text-7xl font-black text-white drop-shadow-md">1</span>
              </div>
              <div className="bg-cyan-900/80 border-2 border-cyan-400 p-4 rounded-2xl text-center w-full min-h-[100px] flex items-center justify-center shadow-lg">
                <p className="text-cyan-100 font-bold text-xl uppercase tracking-wide">Reel in the<br/><span className="text-white text-2xl">Note Names</span></p>
              </div>
            </button>
            <button onClick={() => { setSelectedStage(2); setGamePhase('preview'); }} className="group flex flex-col items-center gap-6 w-full max-w-sm">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-600 border-8 border-white shadow-[0_20px_50px_rgba(192,38,211,0.5)] flex items-center justify-center transform transition-all group-hover:scale-110 group-active:scale-95">
                <span className="text-7xl font-black text-white drop-shadow-md">2</span>
              </div>
              <div className="bg-purple-900/80 border-2 border-purple-400 p-4 rounded-2xl text-center w-full min-h-[100px] flex items-center justify-center shadow-lg">
                <p className="text-purple-100 font-bold text-xl uppercase tracking-wide">Reel in the<br/><span className="text-white text-2xl">Musical Notes</span></p>
              </div>
            </button>
            <button onClick={() => { setSelectedStage(3); setGamePhase('preview'); }} className="group flex flex-col items-center gap-6 w-full max-w-sm">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-rose-400 to-orange-500 border-8 border-white shadow-[0_20px_50px_rgba(244,63,94,0.5)] flex items-center justify-center transform transition-all group-hover:scale-110 group-active:scale-95">
                <span className="text-7xl font-black text-white drop-shadow-md">3</span>
              </div>
              <div className="bg-rose-900/80 border-2 border-rose-400 p-4 rounded-2xl text-center w-full min-h-[100px] flex items-center justify-center shadow-lg">
                <p className="text-rose-100 font-bold text-xl uppercase tracking-wide">Combo!<br/><span className="text-white text-2xl">Staves & Letters</span></p>
              </div>
            </button>
          </div>
          <button onClick={() => setSelectedLevel(null)} className="mt-12 mb-12 flex items-center gap-2 px-8 py-4 font-sans font-black text-white text-2xl uppercase tracking-widest transition-all rounded-2xl bg-black/40 hover:bg-black/60 active:scale-95 border-2 border-white/20 backdrop-blur-md cursor-pointer">
             <ArrowLeft className="w-8 h-8" /> Back to Map
           </button>
        </div>
      )}

      {selectedLevel !== null && gamePhase === 'preview' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-cyan-950/95 backdrop-blur-md p-6">
          <div className="max-w-2xl w-full bg-cyan-900 rounded-3xl p-8 shadow-2xl border border-white/10 flex flex-col items-center text-center">
            <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-wider">Level {selectedLevel} Targets</h2>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {rocketLevelsData.find(l => l.id === selectedLevel)?.introducedNotes?.map((n: any, idx: number) => (
                <button key={idx} onClick={() => setSelectedPreviewNote(n)} className={`px-6 py-3 rounded-xl font-mono font-black text-2xl transition-all ${selectedPreviewNote?.label === n.label ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.6)]' : 'bg-cyan-800 text-cyan-200 hover:bg-cyan-700'}`}>
                  {formatAccidentals(n.label)}
                </button>
              ))}
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl shadow-inner mb-6 min-h-[160px] flex items-center justify-center relative border border-slate-100">
              {selectedPreviewNote ? (
                <DynamicScore clef={(selectedPreviewNote.clef || defaultClef) as any} keySignature={rocketLevelsData.find((l: any) => l.id === selectedLevel)?.keySignature} notes={[selectedPreviewNote.writtenNote]} width={180} height={140} />
              ) : (
                <p className="text-slate-400 font-medium">Select a note to view</p>
              )}
            </div>
            
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 min-h-[80px] w-full">
              {selectedPreviewNote ? (() => {
                const currentClefStr = selectedPreviewNote.clef || defaultClef;
                const masterDesc = (masterDescriptions as any)[currentClefStr.charAt(0).toUpperCase() + currentClefStr.slice(1)]?.[selectedPreviewNote.writtenNote] || selectedPreviewNote.description || "No description available.";
                const fingeringString = (selectedPreviewNote.fingeringDisplay || selectedPreviewNote.fingering || "").split(' OR ')[0];
                return (
                  <div className="bg-cyan-950 p-6 rounded-2xl w-full mb-8 border border-cyan-500/30 text-left relative overflow-hidden">
                    <h4 className="text-3xl font-black text-cyan-400 mb-4">{formatAccidentals(selectedPreviewNote.label)}</h4>
                    <p className="text-cyan-100 mb-4 text-lg"><span className="text-white font-bold">Description:</span> {formatAccidentals(masterDesc)}</p>
                    <div className="flex flex-col items-start">
                      <span className="text-white font-bold text-lg mb-2">Fingering/Pitch:</span>
                      {fingeringString ? (
                        <div className="transform scale-[0.6] origin-top-left -mb-[10%]">
                          {instrument === 'Clarinet' && <FingeringChart fingeringString={fingeringString} />}
                          {(instrument === 'Trumpet' || instrument === 'Baritone/Euphonium') && <BrassFingeringChart fingeringString={fingeringString} />}
                          {instrument === 'Flute' && <FluteFingeringChart fingeringString={fingeringString} />}
                          {instrument === 'Alto Saxophone' && <SaxophoneFingeringChart fingeringString={fingeringString} />}
                          {instrument === 'Tenor Saxophone' && <SaxophoneFingeringChart fingeringString={fingeringString} />}
                          {instrument === 'Violin' && <ViolinFingeringChart fingeringString={fingeringString} />}
                          {instrument === 'Cello' && <CelloFingeringChart fingeringString={fingeringString} />}
                          {instrument === 'Piano' && <PianoFingeringChart fingeringString={fingeringString} />}
                          {instrument.includes('Voice') && <VoicePitchDisplay fingeringString={fingeringString} />}
                        </div>
                      ) : <span className="text-cyan-500">N/A</span>}
                    </div>
                  </div>
                );
              })() : <p className="text-blue-400 font-bold">Select a note to learn more.</p>}
            </div>
            
            <button onClick={() => { setGamePhase('playing'); generateLevel(); }} className="flex-1 py-5 w-full bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 text-white rounded-2xl font-black text-4xl uppercase tracking-widest transition-all active:scale-95">
                Dive In! 🌊
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 flex items-center justify-between p-6 bg-cyan-900/60 backdrop-blur-md border-b border-white/5 mt-24">
        <div className="flex gap-4 items-center ml-auto">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl font-mono font-black border border-emerald-500/30">
            <Award className="w-5 h-5" /> {score} pts
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 text-rose-400 rounded-xl font-mono font-black border border-rose-500/30">
            <Heart className="w-5 h-5" /> {lives}
          </div>
          {gamePhase === 'playing' && (
            <button onClick={() => setShowNoteHelp(true)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all cursor-pointer">
              <HelpCircle size={24} />
            </button>
          )}
        </div>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center p-4 z-10 pb-28">
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-12 mt-12 w-full max-w-4xl">
          {(() => {
             const isVertical = ['Clarinet', 'Violin', 'Cello', 'Alto Saxophone', 'Tenor Saxophone'].includes(instrument);
             
             const boxClasses = isVertical 
               ? "w-[340px] h-[600px]"
               : "w-[90vw] md:w-[680px] lg:w-[760px] h-[340px]";
               
             const scaleClass = isVertical 
               ? "scale-95 lg:scale-100" 
               : "scale-75 md:scale-90 lg:scale-100";

             return (
               <div className={`bg-white/95 rounded-3xl p-6 shadow-[0_0_30px_rgba(34,211,238,0.3)] flex flex-col items-center relative border-4 border-cyan-400 ${boxClasses}`}>
                 <h2 className="text-2xl font-black text-slate-500 mb-2 uppercase tracking-widest text-center shrink-0">
                   Reel in the
                 </h2>
                 <div className={`pointer-events-none filter drop-shadow-md relative z-10 transition-all flex items-center justify-center w-full flex-1 transform ${scaleClass} origin-center`}>
                    {targetNote && (() => {
                       const fingeringString = (targetNote.fingeringDisplay || targetNote.fingering || "").split(' OR ')[0];
                       return (
                         <>
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
                             <p className="text-cyan-400 italic">Chart for {instrument} coming soon!</p>
                           )}
                         </>
                       );
                    })()}
                 </div>
               </div>
             );
          })()}
          
          <AnimatePresence>
            {flashTargetNote && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className="absolute text-9xl font-black text-emerald-400 drop-shadow-[0_0_40px_rgba(52,211,153,1)] z-10 pointer-events-none"
              >
                🎣
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 w-full max-w-lg">
            {options.map((note, index) => {
              const colors = ['bg-emerald-400', 'bg-amber-400', 'bg-rose-400', 'bg-purple-400'];
              const borders = ['border-emerald-500', 'border-amber-500', 'border-rose-500', 'border-purple-500'];
              const colorClass = colors[index % colors.length];
              const borderClass = borders[index % borders.length];
              
              const useStave = selectedStage === 2 || (selectedStage === 3 && Math.random() > 0.5);
              
              return (
                <button
                  key={index}
                  onClick={() => handleChoice(note)}
                  disabled={gameOver || isPaused || resumeCountdown !== null || levelCleared}
                  className="relative bg-transparent hover:scale-105 transition-all active:scale-95 flex flex-col items-center justify-center disabled:opacity-50 min-h-[140px] animate-[bounce_4s_infinite]"
                  style={{ animationDelay: `${index * 0.5}s` }}
                >
                  <div className={`relative flex items-center justify-center ${useStave ? 'w-56 h-32 rounded-[40px]' : 'w-52 h-28 rounded-[50%]'} ${colorClass} border-4 border-white shadow-[0_10px_20px_rgba(0,0,0,0.2)] overflow-visible`}>
                    <div className={`absolute right-[-24px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-l-[32px] ${borderClass} drop-shadow`} />
                    
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full flex items-center justify-center border border-black/20 z-30 transform -translate-y-8">
                      <div className="w-2.5 h-2.5 bg-black rounded-full" />
                    </div>
                    
                    <div className={`absolute z-20 flex items-center justify-center w-full h-full ${useStave ? 'pr-6 pl-4 py-3' : 'pr-4'}`}>
                      {useStave ? (
                        <div className="bg-white/95 rounded-2xl overflow-hidden w-full h-full flex items-center justify-center border border-black/10 shadow-inner">
                          <DynamicScore clef={(note.clef || defaultClef) as any} keySignature={rocketLevelsData.find((l: any) => l.id === selectedLevel)?.keySignature} 
                             notes={[{ keys: [formatVexFlowKey(note.writtenNote, note.clef || defaultClef)], duration: "q" }]} 
                             width={150} 
                             height={110} 
                          />
                        </div>
                      ) : (
                        <div className="text-6xl font-black text-white drop-shadow-md">
                          {formatAccidentals(note.label)}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-cyan-950/90 flex flex-col items-center justify-center z-40 backdrop-blur-md">
            <ShieldAlert className="w-24 h-24 text-rose-500 mb-6 animate-pulse" />
            <h2 className="text-6xl font-black text-white mb-4">Out of Oxygen!</h2>
            <p className="text-2xl text-cyan-100 mb-4 font-bold">Score reached: <span className="text-emerald-400">{score}</span> pts</p>
            <div className="w-full max-w-md mb-8">
              <MiniLeaderboard gameName="Finger Fishing" instrument={instrument} currentScore={score} />
            </div>
            <div className="absolute top-8 left-8 z-50 flex items-center gap-4">
              <button
                onClick={restartGame}
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-white px-5 py-3 rounded-2xl shadow-xl transition-all border-2 border-white/20 backdrop-blur-md font-black uppercase tracking-wider"
              >
                <ArrowLeft className="w-6 h-6" /> Quit
              </button>
              <NoteHelpButton onClick={() => setShowNoteHelp(true)} className="bg-slate-800/80 border-white/20 backdrop-blur-md hover:bg-slate-700 w-14 h-14" />
            </div>
            <div className="flex gap-6">
              <button onClick={restartGame} className="flex items-center gap-3 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold text-2xl transition-all active:scale-95 shadow-lg shadow-cyan-500/30">
                <RotateCcw className="w-6 h-6" /> Dive Again
              </button>
              <button onClick={() => setSelectedLevel(null)} className="flex items-center gap-3 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold text-2xl transition-all active:scale-95">
                <ArrowLeft className="w-6 h-6" /> Map
              </button>
            </div>
          </div>
        )}

        {levelCleared && (
          <div className="absolute inset-0 bg-emerald-900/90 flex flex-col items-center justify-center z-40 backdrop-blur-md">
            <Award className="w-24 h-24 text-yellow-400 mb-6 animate-bounce" />
            <h2 className="text-6xl font-black text-white mb-4">Level Cleared!</h2>
            <p className="text-2xl text-emerald-200 mb-4 font-bold">You scored <span className="text-white">{score}</span> points!</p>
            <div className="w-full max-w-md mb-8">
              <MiniLeaderboard className="!bg-emerald-800/80 !border-emerald-600 !text-white" gameName="Finger Fishing" instrument={instrument} currentScore={score} />
            </div>
            <div className="flex gap-6">
              {!isInfiniteMode && (
                <button onClick={() => { setIsInfiniteMode(true); setLevelCleared(false); hasSavedScoreRef.current = false; }} className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold text-2xl transition-all active:scale-95 shadow-lg shadow-cyan-500/30">
                  Keep Fishing
                </button>
              )}
              <button onClick={() => setSelectedLevel(null)} className="flex items-center gap-3 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold text-2xl transition-all active:scale-95">
                <ArrowLeft className="w-6 h-6" /> Map
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedLevel !== null && gamePhase === 'playing' && !gameOver && !levelCleared && (
        <div className="absolute bottom-6 right-6 z-30 flex items-end gap-4 pointer-events-none">
          <div className="bg-white text-slate-800 p-4 rounded-2xl rounded-br-none shadow-2xl max-w-[200px] border-2 border-cyan-200 animate-pulse">
            <p className="font-bold text-sm">Need a reminder? Press the <span className="bg-cyan-100 text-cyan-700 px-1 rounded">?</span> button for help!</p>
          </div>
          <img src="/astronaut_aiden_1784462702713.jpg" alt="Captain Aiden" className="w-24 h-24 object-contain rounded-full border-4 border-white shadow-xl shadow-cyan-500/50" />
        </div>
      )}
    </div>
  );
}
