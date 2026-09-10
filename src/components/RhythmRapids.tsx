import React, { useState, useEffect, useRef } from 'react';
import { saveGameScore } from '../utils/supabaseSync';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, Volume2, Heart } from 'lucide-react';
import MiniLeaderboard from './MiniLeaderboard';
import { useInstrument } from '../contexts/InstrumentContext';
import { APP_ASSETS } from '../config/assets';
import { SmartImage } from './ui/SmartImage';
import { UniversalGameHomepage, LevelCardData } from './ui/UniversalGameHomepage';
import { DynamicScore, VexNoteDef } from './ui/DynamicScore';
import { NoteHelpOverlay } from './ui/NoteHelpOverlay';
import { NoteHelpButton } from './ui/NoteHelpButton';
import { addXP } from '../utils/economy';
import { RhythmsExpressions } from '../data';

interface RhythmRapidsProps {
  onBack: () => void;
  isDailyChallenge?: boolean;
  onChallengeComplete?: (score: any) => void;
  onComplete?: () => void;
}

// Helper to synthesize a woodblock-like tick
const playRhythm = (notes: VexNoteDef[], timeSignature: string, onComplete?: () => void) => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  
  let tempo = 120; // BPM
  const beatDuration = (timeSignature === '6/8' ? 1.5 : 1) * (60 / tempo); // duration of a beat in seconds

  let beatsPerBar = 4;
  if (timeSignature === '3/4') beatsPerBar = 3;
  if (timeSignature === '6/8') beatsPerBar = 2;
  if (timeSignature === '2/4') beatsPerBar = 2;

  let startTime = ctx.currentTime + 0.1;

  // Play count-in (light ticks)
  for (let i = 0; i < beatsPerBar; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine'; // Sine wave for a pure click
    osc.frequency.setValueAtTime(i === 0 ? 1500 : 1000, startTime + i * beatDuration);
    osc.frequency.exponentialRampToValueAtTime(100, startTime + i * beatDuration + 0.02);
    
    gain.gain.setValueAtTime(0, startTime + i * beatDuration);
    gain.gain.linearRampToValueAtTime(0.5, startTime + i * beatDuration + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + i * beatDuration + 0.03);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(startTime + i * beatDuration);
    osc.stop(startTime + i * beatDuration + 0.04);
  }
  
  startTime += beatsPerBar * beatDuration;

  // Pre-calculate playback events, grouping tied notes into single sustained events
  interface PlaybackEvent {
    isRest: boolean;
    durationS: number;
  }
  const events: PlaybackEvent[] = [];
  let activeTieEvent: PlaybackEvent | null = null;
  
  notes.forEach((note) => {
    if (note.isBarline) return;
    
    let beats = 1;
    const dur = note.duration.replace('r', '');
    if (dur === 'w') beats = 4;
    else if (dur === 'h') beats = 2;
    else if (dur === 'hd') beats = 3;
    else if (dur === 'q') beats = 1;
    else if (dur === 'qd') beats = 1.5;
    else if (dur === '8') beats = 0.5;
    else if (dur === '8d') beats = 0.75;
    else if (dur === '16') beats = 0.25;
    
    if (note.isTriplet) beats *= (2.0 / 3.0);
    
    const durationS = beats * beatDuration;
    const isRest = note.duration.includes('r');
    
    if (activeTieEvent) {
       activeTieEvent.durationS += durationS;
       if (note.tieStop) {
          activeTieEvent = null;
       }
    } else {
       const newEvent = { isRest, durationS };
       events.push(newEvent);
       if (note.tieStart) {
           activeTieEvent = newEvent;
       }
    }
  });
  
  events.forEach((event) => {
    if (!event.isRest) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(392.00, startTime); // Middle G
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.8, startTime + 0.02);
      
      // Decay smoothly over the full duration of the event (whether single or tied)
      const sustainS = Math.max(0.1, event.durationS - 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + sustainS);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + sustainS + 0.1);
    }
    startTime += event.durationS;
  });

  // Close context after playback completes
  setTimeout(() => {
    ctx.close();
    if (onComplete) onComplete();
  }, (startTime - ctx.currentTime + 1) * 1000);
};

export default function RhythmRapids({ onBack, isDailyChallenge, onChallengeComplete }: RhythmRapidsProps) {
  const { instrument } = useInstrument();
  const hasSavedScoreRef = useRef(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showComboAlert, setShowComboAlert] = useState(false);
  const [earnedQuavits, setEarnedQuavits] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  
  const [challenge, setChallenge] = useState<{
    correctRhythm: VexNoteDef[];
    wrongRhythm: VexNoteDef[];
    timeSignature: string;
    correctSide: 'left' | 'right';
  } | null>(null);
  
  const [gamePhase, setGamePhase] = useState<'stage-select' | 'preview' | 'playing'>('stage-select');
  const [showNoteHelp, setShowNoteHelp] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const getAvailableSymbols = (level: number) => {
    const symbols: any[] = [];
    RhythmsExpressions.filter((l: any) => l.id <= level).forEach((l: any) => {
      if (l.introducedSymbols) {
        symbols.push(...l.introducedSymbols.filter((s: any) => 
          (s.Category === 'Notes' || s.Category === 'Rests' || s.Category === 'Groupings') &&
          true // Allow ties now
        ));
      }
    });
    return symbols;
  };

  type RhythmBlock = {
    beats: number;
    baseProb: number;
    notes: VexNoteDef[];
    reqSymbols: string[];
  };

  const RHYTHM_BLOCKS: RhythmBlock[] = [
    { beats: 1, baseProb: 0.15, notes: [{ duration: 'q', keys: ['b/4'] }], reqSymbols: ['Crotchet (Quarter Note)'] },
    { beats: 1, baseProb: 0.10, notes: [{ duration: 'qr', keys: ['b/4'] }], reqSymbols: ['Crotchet Rest'] },
    { beats: 1, baseProb: 0.15, notes: [{ duration: '8', keys: ['b/4'] }, { duration: '8', keys: ['b/4'] }], reqSymbols: ['Quaver Pair'] },
    { beats: 1, baseProb: 0.05, notes: [{ duration: '8', keys: ['b/4'] }, { duration: '8r', keys: ['b/4'] }], reqSymbols: ['Quaver (Eighth Note)', 'Quaver Rest'] },
    { beats: 1, baseProb: 0.05, notes: [{ duration: '8r', keys: ['b/4'] }, { duration: '8', keys: ['b/4'] }], reqSymbols: ['Quaver (Eighth Note)', 'Quaver Rest'] },
    { beats: 1, baseProb: 0.05, notes: [{ duration: '8', keys: ['b/4'] }, { duration: '16', keys: ['b/4'] }, { duration: '16', keys: ['b/4'] }], reqSymbols: ['Quaver (Eighth Note)', 'Semiquaver (Sixteenth Note)'] },
    { beats: 1, baseProb: 0.05, notes: [{ duration: '16', keys: ['b/4'] }, { duration: '16', keys: ['b/4'] }, { duration: '8', keys: ['b/4'] }], reqSymbols: ['Quaver (Eighth Note)', 'Semiquaver (Sixteenth Note)'] },
    { beats: 1, baseProb: 0.02, notes: [{ duration: '16', keys: ['b/4'] }, { duration: '8', keys: ['b/4'] }, { duration: '16', keys: ['b/4'] }], reqSymbols: ['Quaver (Eighth Note)', 'Semiquaver (Sixteenth Note)'] },
    { beats: 1, baseProb: 0.10, notes: [{ duration: '8', keys: ['b/4'], isTriplet: true }, { duration: '8', keys: ['b/4'], isTriplet: true }, { duration: '8', keys: ['b/4'], isTriplet: true }], reqSymbols: ['Triplet'] },
    { beats: 1, baseProb: 0.02, notes: [{ duration: '8r', keys: ['b/4'] }, { duration: '16', keys: ['b/4'] }, { duration: '16', keys: ['b/4'] }], reqSymbols: ['Quaver Rest', 'Semiquaver (Sixteenth Note)'] },
    { beats: 1, baseProb: 0.02, notes: [{ duration: '16r', keys: ['b/4'] }, { duration: '16', keys: ['b/4'] }, { duration: '16', keys: ['b/4'] }, { duration: '16', keys: ['b/4'] }], reqSymbols: ['Semiquaver Rest', 'Semiquaver (Sixteenth Note)'] },
    { beats: 1, baseProb: 0.06, notes: [{ duration: '16', keys: ['b/4'] }, { duration: '16', keys: ['b/4'] }, { duration: '16', keys: ['b/4'] }, { duration: '16', keys: ['b/4'] }], reqSymbols: ['Semiquaver Group'] },
    
    { beats: 2, baseProb: 0.10, notes: [{ duration: 'h', keys: ['b/4'] }], reqSymbols: ['Minim (Half Note)'] },
    { beats: 2, baseProb: 0.05, notes: [{ duration: 'hr', keys: ['b/4'] }], reqSymbols: ['Minim Rest'] },
    { beats: 2, baseProb: 0.05, notes: [{ duration: 'q', keys: ['b/4'], isTriplet: true }, { duration: 'q', keys: ['b/4'], isTriplet: true }, { duration: 'q', keys: ['b/4'], isTriplet: true }], reqSymbols: ['Super Triplet'] },
    
    { beats: 4, baseProb: 0.05, notes: [{ duration: 'w', keys: ['b/4'] }], reqSymbols: ['Semibreve (Whole Note)'] },
    { beats: 4, baseProb: 0.02, notes: [{ duration: 'wr', keys: ['b/4'] }], reqSymbols: ['Semibreve Rest'] },

    { beats: 3, baseProb: 0.05, notes: [{ duration: 'hd', keys: ['b/4'] }], reqSymbols: ['Dotted Minim'] },
    { beats: 2, baseProb: 0.08, notes: [{ duration: 'qd', keys: ['b/4'] }, { duration: '8', keys: ['b/4'] }], reqSymbols: ['Dotted Crotchet', 'Quaver Pair'] },
    { beats: 1, baseProb: 0.05, notes: [{ duration: '8d', keys: ['b/4'] }, { duration: '16', keys: ['b/4'] }], reqSymbols: ['Dotted Quaver'] }
  ];

  const SIX_EIGHT_BLOCKS: RhythmBlock[] = [
    { beats: 1, baseProb: 0.1, notes: [{ duration: 'qd', keys: ['b/4'] }], reqSymbols: ['Dotted Crotchet'] },
    { beats: 1, baseProb: 0.1, notes: [{ duration: '8', keys: ['b/4'] }, { duration: '8', keys: ['b/4'] }, { duration: '8', keys: ['b/4'] }], reqSymbols: ['Quaver Pair'] },
    { beats: 1, baseProb: 0.05, notes: [{ duration: 'q', keys: ['b/4'] }, { duration: '8', keys: ['b/4'] }], reqSymbols: ['Crotchet (Quarter Note)', 'Quaver Pair'] },
    { beats: 1, baseProb: 0.05, notes: [{ duration: '8', keys: ['b/4'] }, { duration: 'q', keys: ['b/4'] }], reqSymbols: ['Crotchet (Quarter Note)', 'Quaver Pair'] },
    { beats: 1, baseProb: 0.1, notes: [{ duration: '16', keys: ['b/4'] }, { duration: '16', keys: ['b/4'] }, { duration: '16', keys: ['b/4'] }, { duration: '16', keys: ['b/4'] }, { duration: '16', keys: ['b/4'] }, { duration: '16', keys: ['b/4'] }], reqSymbols: ['Semiquaver Group'] },
    { beats: 2, baseProb: 0.05, notes: [{ duration: 'hd', keys: ['b/4'] }], reqSymbols: ['Dotted Minim'] }
  ];

  const flattenBlocksToNotes = (phraseBlocks: RhythmBlock[], beatsPerBar: number, numBars: number, applyTies: boolean, level: number): VexNoteDef[] => {
    const allNotes: VexNoteDef[] = [];
    let currentBarBeats = 0;
    let barCount = 0;
    
    for (let i = 0; i < phraseBlocks.length; i++) {
       const b = phraseBlocks[i];
       allNotes.push(...JSON.parse(JSON.stringify(b.notes)));
       currentBarBeats += b.beats;
       
       if (currentBarBeats >= beatsPerBar) {
          barCount++;
          if (barCount < numBars) {
             allNotes.push({ keys: ['b/4'], duration: 'b', isBarline: true });
          }
          currentBarBeats = 0;
       }
    }
    
    if (applyTies && level >= 5) {
      for (let i = 0; i < allNotes.length - 2; i++) {
        if (allNotes[i+1].isBarline && !allNotes[i].duration.includes('r') && !allNotes[i+2].duration.includes('r')) {
          if (Math.random() < 0.3) {
            allNotes[i].tieStart = true;
            allNotes[i+2].tieStop = true;
          }
        }
      }
    }
    
    return allNotes;
  };

  const generateRhythmBlocks = (availableSymbolsList: any[], beatsPerBar: number, numBars: number, level: number, timeSig: string): RhythmBlock[] => {
    const phraseBlocks: RhythmBlock[] = [];
    const availableSymbolNames = availableSymbolsList.map(s => s.Name);
    
    let baseBlocks = timeSig === '6/8' ? SIX_EIGHT_BLOCKS : RHYTHM_BLOCKS;
    
    let validBlocks = baseBlocks.filter(b => b.reqSymbols.every(req => availableSymbolNames.includes(req)));
    if (validBlocks.length === 0) {
      validBlocks = [{ beats: 1, baseProb: 1, notes: [{ duration: timeSig === '6/8' ? 'qd' : 'q', keys: ['b/4'] }], reqSymbols: [] }];
    }

    const totalBaseProb = validBlocks.reduce((sum, b) => sum + b.baseProb, 0);
    const normalizedBlocks = validBlocks.map(b => ({
      ...b,
      normalizedProb: b.baseProb / totalBaseProb
    }));
    
    for (let bar = 0; bar < numBars; bar++) {
      let currentBeats = 0;
      let attempts = 0;
      
      while (currentBeats < beatsPerBar && attempts < 100) {
        attempts++;
        const remainingBeats = beatsPerBar - currentBeats;
        const fittingBlocks = normalizedBlocks.filter(b => b.beats <= remainingBeats);
        
        if (fittingBlocks.length === 0) {
          phraseBlocks.push({ beats: 1, baseProb: 1, notes: [{ duration: timeSig === '6/8' ? 'qdr' : 'qr', keys: ['b/4'] }], reqSymbols: [] });
          currentBeats += 1;
          continue;
        }

        const fittingProbSum = fittingBlocks.reduce((sum, b) => sum + b.normalizedProb, 0);
        let roll = Math.random() * fittingProbSum;
        let selectedBlock = fittingBlocks[0];
        
        for (const b of fittingBlocks) {
          roll -= b.normalizedProb;
          if (roll <= 0) {
            selectedBlock = b;
            break;
          }
        }
        
        phraseBlocks.push(selectedBlock);
        currentBeats += selectedBlock.beats;
      }
    }
    
    return phraseBlocks;
  };

  const generateChallenge = (level: number) => {
    let tsOptions = ['4/4'];
    let numBars = 1;
    
    if (level >= 5 && level <= 6) {
      tsOptions = ['4/4', '3/4'];
    } else if (level >= 7 && level <= 9) {
      tsOptions = ['4/4', '3/4', '2/4'];
    } else if (level >= 10) {
      tsOptions = ['4/4', '3/4', '2/4', '6/8'];
    }

    const timeSig = tsOptions[Math.floor(Math.random() * tsOptions.length)];
    let beatsPerBar = 4;
    if (timeSig === '3/4') beatsPerBar = 3;
    if (timeSig === '2/4') beatsPerBar = 2;
    if (timeSig === '6/8') beatsPerBar = 2;
    
    if (timeSig === '4/4') {
        if (level >= 2) numBars = 2;
        else numBars = 1;
    } else if (timeSig === '3/4') {
        if (level >= 7) numBars = 3;
        else if (level >= 2) numBars = 2;
        else numBars = 1;
    } else if (timeSig === '2/4') {
        if (level >= 7) numBars = 4;
        else if (level >= 2) numBars = 3;
        else numBars = 2;
    } else if (timeSig === '6/8') {
        numBars = 3;
    }

    const symbols = getAvailableSymbols(level);
    
    const correctBlocks = generateRhythmBlocks(symbols, beatsPerBar, numBars, level, timeSig);
    const correctRhythm = flattenBlocksToNotes(correctBlocks, beatsPerBar, numBars, true, level);
    
    let wrongBlocks = JSON.parse(JSON.stringify(correctBlocks));
      
      if (wrongBlocks.length >= 2) {
          const availableSymbolNames = symbols.map((sym: any) => sym.Name);
          let baseBlocks = timeSig === '6/8' ? SIX_EIGHT_BLOCKS : RHYTHM_BLOCKS;
          const validReplacements = baseBlocks.filter(b => b.reqSymbols.every(req => availableSymbolNames.includes(req)));
          
          let mutated = false;
          let attempts = 0;
          
          while (!mutated && attempts < 50) {
              attempts++;
              
              let currentPairs: number[][] = [];
              for (let x = 0; x < wrongBlocks.length; x++) {
                  for (let y = x + 1; y < wrongBlocks.length; y++) {
                      if (wrongBlocks[x].beats === wrongBlocks[y].beats && JSON.stringify(wrongBlocks[x].notes) !== JSON.stringify(wrongBlocks[y].notes)) {
                          currentPairs.push([x, y]);
                      }
                  }
              }
              
              if (currentPairs.length > 0) {
                  const numSwaps = level >= 4 ? 2 : 1;
                  for (let i=0; i<numSwaps; i++) {
                     let pairs: number[][] = [];
                     for (let x = 0; x < wrongBlocks.length; x++) {
                         for (let y = x + 1; y < wrongBlocks.length; y++) {
                             if (wrongBlocks[x].beats === wrongBlocks[y].beats && JSON.stringify(wrongBlocks[x].notes) !== JSON.stringify(wrongBlocks[y].notes)) {
                                 pairs.push([x, y]);
                             }
                         }
                     }
                     if (pairs.length > 0) {
                         const pair = pairs[Math.floor(Math.random() * pairs.length)];
                         const temp = wrongBlocks[pair[0]];
                         wrongBlocks[pair[0]] = wrongBlocks[pair[1]];
                         wrongBlocks[pair[1]] = temp;
                         mutated = true;
                     }
                  }
              } else if (validReplacements.length > 1) {
                  const idx1 = Math.floor(Math.random() * wrongBlocks.length);
                  const blockToReplace = wrongBlocks[idx1];
                  const sameDurationReplacements = validReplacements.filter(b => b.beats === blockToReplace.beats);
                  
                  if (sameDurationReplacements.length > 1) {
                      let newBlock = sameDurationReplacements[Math.floor(Math.random() * sameDurationReplacements.length)];
                      let escape = 0;
                      while (JSON.stringify(newBlock.notes) === JSON.stringify(blockToReplace.notes) && escape < 20) {
                          newBlock = sameDurationReplacements[Math.floor(Math.random() * sameDurationReplacements.length)];
                          escape++;
                      }
                      if (JSON.stringify(newBlock.notes) !== JSON.stringify(blockToReplace.notes)) {
                          wrongBlocks[idx1] = newBlock;
                          mutated = true;
                      }
                  }
              }
              
              if (JSON.stringify(wrongBlocks) === JSON.stringify(correctBlocks)) {
                  mutated = false;
              }
              
              if (!mutated) {
                  let newRhythm = generateRhythmBlocks(symbols, beatsPerBar, numBars, level, timeSig);
                  let esc = 0;
                  while (JSON.stringify(newRhythm) === JSON.stringify(correctBlocks) && esc < 10) {
                      newRhythm = generateRhythmBlocks(symbols, beatsPerBar, numBars, level, timeSig);
                      esc++;
                  }
                  if (JSON.stringify(newRhythm) !== JSON.stringify(correctBlocks)) {
                      wrongBlocks = newRhythm;
                      mutated = true;
                  }
              }
          }
      }
      
      const wrongRhythm = flattenBlocksToNotes(wrongBlocks, beatsPerBar, numBars, false, level);
    
    setChallenge({
      correctRhythm,
      wrongRhythm,
      timeSignature: timeSig,
      correctSide: Math.random() > 0.5 ? 'left' : 'right'
    });
  };

  useEffect(() => {
    if (selectedLevel !== null && !gameOver && !levelComplete) {
      generateChallenge(selectedLevel);
    }
  }, [selectedLevel, correctAnswers, gameOver, levelComplete]);

  useEffect(() => {
    if (challenge && !gameOver && !levelComplete && feedback === null) {
      setIsPlayingSound(true);
      playRhythm(challenge.correctRhythm, challenge.timeSignature, () => setIsPlayingSound(false));
    }
  }, [challenge]);

  const handleChoice = (side: 'left' | 'right') => {
    if (feedback !== null || !challenge) return;
    
    if (side === challenge.correctSide) {
      setFeedback('correct');
      addXP(10);
      
      const newCombo = combo + 1;
      setCombo(newCombo);
      const pointsEarned = 100 * (1 + (newCombo * 0.1));
      const newScore = score + pointsEarned;
      setScore(newScore);
      
      if (newCombo >= 5 && newCombo % 5 === 0) {
         setShowComboAlert(true);
         setTimeout(() => setShowComboAlert(false), 2000);
      }

      setTimeout(() => {
        setFeedback(null);
        const newAnswers = correctAnswers + 1;
        setCorrectAnswers(newAnswers);
        
        if (newAnswers === 5) {
          setLives(prev => Math.min(3, prev + 1));
        }
        
        if (newAnswers >= 10) {
          const quavits = calculateGameQuavits(newScore, 'rhythm-rapids');
          addQuavits(quavits);
          setEarnedQuavits(quavits);
          setLevelComplete(true);
          if (onChallengeComplete && isDailyChallenge) onChallengeComplete(10);
        }
      }, 1500);
    } else {
      setFeedback('wrong');
      setCombo(0);
      
      setTimeout(() => {
        setFeedback(null);
        const nextLives = lives - 1;
        setLives(nextLives);
        if (nextLives <= 0) {
          const quavits = calculateGameQuavits(score, 'rhythm-rapids');
          addQuavits(quavits);
          setEarnedQuavits(quavits);
          setGameOver(true);
        } else {
          if (selectedLevel) generateChallenge(selectedLevel);
        }
      }, 2500);
    }
  };

  // Convert RhythmsExpressions to LevelCards
  const levelCards: LevelCardData[] = RhythmsExpressions.map((levelData: any) => ({
    id: levelData.id,
    title: `Level ${levelData.id}`,
    description: `Master ${levelData.introducedSymbols?.map((s: any) => s.Name).join(', ') || 'new rhythms'}!`,
    isUnlocked: true,
    cardTheme: 'bg-cyan-50',
    textTheme: 'text-cyan-900',
    progress: 0,
    targetRhythms: levelData.introducedSymbols?.map((s: any) => s.Notation).filter(Boolean).join(', ') || ''
  }));

  if (selectedLevel === null) {
    return (
      <UniversalGameHomepage
        gameTitle="Rhythm Rapids"
        titleColorClass="text-cyan-400 drop-shadow-lg"
        backgroundClass="bg-[url('/assets/images/games/rhythm_rapids_background.png')] bg-cover bg-center"
        levels={levelCards}
        onLevelSelect={(id) => {
          setSelectedLevel(id);
          setGamePhase('preview');
        }}
        onNoteHelp={() => setShowNoteHelp(true)}
        onBack={onBack}
      />
    );
  }

  const restartGame = () => {
    setSelectedLevel(null);
    setCorrectAnswers(0);
    setLives(3);
    setGameOver(false);
    setScore(0);
    setCombo(0);
    setEarnedQuavits(0);
    setLevelComplete(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900 font-sans">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <SmartImage 
          src={APP_ASSETS.backgrounds.rhythmRapidsBackground} 
          alt="Rhythm Rapids Background"
          className="w-full h-full object-cover object-bottom"
        />
        {/* Dynamic Overlay if wrong */}
        <AnimatePresence>
          {feedback === 'wrong' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10"
            >
              <SmartImage 
                src={challenge?.correctSide === 'right' ? APP_ASSETS.backgrounds.rhythmRapidsRocksLeft : APP_ASSETS.backgrounds.rhythmRapidsRocksRight}
                alt="Crash Rocks"
                className="w-full h-full object-cover object-bottom"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div className="absolute top-8 left-8 z-50 flex items-center gap-4">
        <button
          onClick={restartGame}
          className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-white px-5 py-3 rounded-2xl shadow-xl transition-all border-2 border-white/20 backdrop-blur-md font-black uppercase tracking-wider"
        >
          <ArrowLeft className="w-6 h-6" /> Quit
        </button>
        <NoteHelpButton onClick={() => setShowNoteHelp(true)} className="bg-slate-800/80 border-white/20 backdrop-blur-md hover:bg-slate-700 w-14 h-14" />
      </div>  
      
      {/* Canoe Lives UI */}
      <div className="absolute top-6 right-6 z-30 flex flex-col items-center gap-2">
            <div className="flex gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${i < lives ? 'bg-orange-500 shadow-lg scale-100' : 'bg-slate-700/50 scale-90 opacity-50'}`}>
                  <span className="text-2xl">🛶</span>
                </div>
              ))}
            </div>
            <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border-2 border-white/50 text-white font-black text-xl tracking-widest shadow-lg">
                SCORE: {correctAnswers}/10
            </div>
      </div>

      {/* Main Gameplay Area */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pt-20">
        
        {/* Audio Prompt Button */}
        <button 
          onClick={() => {
            if (challenge && !isPlayingSound) {
              setIsPlayingSound(true);
              playRhythm(challenge.correctRhythm, challenge.timeSignature, () => setIsPlayingSound(false));
            }
          }}
          disabled={feedback !== null || isPlayingSound}
          className={`mb-12 bg-white shadow-2xl rounded-full px-10 py-5 flex items-center gap-4 transition-all border-4 ${feedback !== null || isPlayingSound ? 'opacity-50 grayscale cursor-not-allowed border-slate-400' : 'hover:bg-cyan-50 hover:scale-105 active:scale-95 group border-cyan-400'}`}
        >
          <div className={`rounded-full w-16 h-16 flex items-center justify-center ${feedback !== null || isPlayingSound ? 'bg-slate-400' : 'bg-cyan-500 group-hover:bg-cyan-600'}`}>
            <Volume2 className="w-8 h-8 text-white" />
          </div>
          <div className="flex flex-col items-start">
              <span className="text-xl font-black text-slate-800 uppercase tracking-widest">Listen to the Rhythm</span>
              <span className="text-md font-bold text-slate-500">and then choose the correct box</span>
          </div>
        </button>

        {/* The Two Rhythm Boxes */}
        <div className="flex gap-12 mt-12 w-full max-w-[1800px] px-8 justify-center">
            
            {/* LEFT BOX */}
            <AnimatePresence>
            {(feedback !== 'correct' || challenge?.correctSide === 'left') && (
                <motion.button
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ 
                        y: feedback === 'correct' && challenge?.correctSide === 'left' ? -200 : 0, 
                        opacity: feedback === 'correct' && challenge?.correctSide === 'right' ? 0 : 1 
                    }}
                    exit={{ opacity: 0 }}
                    onClick={() => handleChoice('left')}
                    disabled={feedback !== null}
                    className={`bg-white rounded-3xl p-6 shadow-2xl border-b-8 border-slate-300 w-full max-w-4xl transition-all hover:scale-[1.02] active:scale-[0.98]
                        ${feedback === 'wrong' && challenge?.correctSide === 'right' ? 'bg-red-100 border-red-500 scale-[0.95]' : ''}
                        ${feedback === 'wrong' && challenge?.correctSide === 'left' ? 'bg-green-100 border-green-500 scale-105' : ''}
                    `}
                >
                    {challenge && (
                        <div className="scale-110 transform origin-top w-[650px] mx-auto">
                            <DynamicScore 
                                notes={challenge.correctSide === 'left' ? challenge.correctRhythm : challenge.wrongRhythm}
                                timeSignature={challenge.timeSignature}
                                clef="percussion"
                                width={650}
                                height={150}
                            />
                        </div>
                    )}
                </motion.button>
            )}
            </AnimatePresence>

            {/* RIGHT BOX */}
            <AnimatePresence>
            {(feedback !== 'correct' || challenge?.correctSide === 'right') && (
                <motion.button
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ 
                        y: feedback === 'correct' && challenge?.correctSide === 'right' ? -200 : 0, 
                        opacity: feedback === 'correct' && challenge?.correctSide === 'left' ? 0 : 1 
                    }}
                    exit={{ opacity: 0 }}
                    onClick={() => handleChoice('right')}
                    disabled={feedback !== null}
                    className={`bg-white rounded-3xl p-6 shadow-2xl border-b-8 border-slate-300 w-full max-w-4xl transition-all hover:scale-[1.02] active:scale-[0.98]
                        ${feedback === 'wrong' && challenge?.correctSide === 'left' ? 'bg-red-100 border-red-500 scale-[0.95]' : ''}
                        ${feedback === 'wrong' && challenge?.correctSide === 'right' ? 'bg-green-100 border-green-500 scale-105' : ''}
                    `}
                >
                    {challenge && (
                        <div className="scale-110 transform origin-top w-[650px] mx-auto">
                            <DynamicScore 
                                notes={challenge.correctSide === 'right' ? challenge.correctRhythm : challenge.wrongRhythm}
                                timeSignature={challenge.timeSignature}
                                clef="percussion"
                                width={650}
                                height={150}
                            />
                        </div>
                    )}
                </motion.button>
            )}
            </AnimatePresence>
        </div>

      </div>

      {/* Overlays */}
      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <div className="bg-white px-12 py-6 rounded-full shadow-2xl border-4 border-cyan-400">
                <h2 className="text-4xl font-black text-cyan-600 uppercase tracking-widest whitespace-nowrap">Great Rhythm!</h2>
                <p className="text-center text-slate-500 font-bold mt-2">Keep on paddling!</p>
            </div>
          </motion.div>
        )}

        {feedback === 'wrong' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <div className="bg-white px-12 py-6 rounded-3xl shadow-2xl border-4 border-red-500 text-center">
                <h2 className="text-5xl font-black text-red-600 uppercase tracking-widest whitespace-nowrap mb-4">Oops!</h2>
                <p className="text-2xl text-slate-700 font-bold">You paddled the wrong way!</p>
                <div className="text-6xl mt-4">💥</div>
            </div>
          </motion.div>
        )}

        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-white p-12 rounded-3xl max-w-lg w-full text-center shadow-2xl border-b-8 border-slate-300">
              <h2 className="text-5xl font-black text-slate-800 mb-4">Canoe Sank!</h2>
              <p className="text-xl text-slate-600 mb-8 font-bold">You lost all your lives. Try again!</p>
              
              <div className="bg-slate-100 p-6 rounded-2xl mb-8 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xl font-bold text-slate-700">
                  <span>Score:</span>
                  <span>{Math.floor(score)}</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-black text-emerald-500">
                  <span>Quavits Earned:</span>
                  <span>+{earnedQuavits}</span>
                </div>
              </div>
              <div className="w-full max-w-md mb-8">
                  <MiniLeaderboard gameName="Rhythm Rapids" instrument={instrument} currentScore={Math.floor(score)} />
              </div>
              <button
                onClick={() => {
                  setGameOver(false);
    setScore(0);
    setCombo(0);
    setEarnedQuavits(0);
                  setCorrectAnswers(0);
                  setLives(3);
                }}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-black text-2xl py-6 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Try Again
              </button>
              <button
                onClick={() => setSelectedLevel(null)}
                className="w-full mt-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-xl py-4 rounded-2xl transition-all"
              >
                Change Level
              </button>
            </div>
          </motion.div>
        )}

        {levelComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-white p-12 rounded-3xl max-w-lg w-full text-center shadow-2xl border-b-8 border-slate-300">
              <div className="text-6xl mb-6">🏆</div>
              <h2 className="text-5xl font-black text-slate-800 mb-4">Level Cleared!</h2>
              <p className="text-xl text-slate-600 mb-4 font-bold">You successfully navigated the rapids!</p>
              <div className="w-full max-w-md mb-8">
                  <MiniLeaderboard gameName="Rhythm Rapids" instrument={instrument} currentScore={Math.floor(score)} />
              </div>
              <button
                onClick={() => {
                  setSelectedLevel(null);
                  setLevelComplete(false);
                  setCorrectAnswers(0);
                  setLives(3);
                }}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-black text-2xl py-6 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue Journey
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <NoteHelpOverlay isOpen={showNoteHelp} onClose={() => setShowNoteHelp(false)} defaultView="symbols" />
    </div>
  );
}
