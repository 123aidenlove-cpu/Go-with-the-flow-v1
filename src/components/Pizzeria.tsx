import React, { useState, useEffect, useRef } from 'react';
import { saveGameScore } from '../utils/supabaseSync';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChefHat, CheckCircle2, Play } from 'lucide-react';
import * as Tone from 'tone';
import { APP_ASSETS } from '../config/assets';
import { AudioManager } from '../utils/audioManager';
import { UniversalGameHomepage, LevelCardData } from './ui/UniversalGameHomepage';
import { NoteHelpOverlay } from './ui/NoteHelpOverlay';
import { NoteHelpButton } from './ui/NoteHelpButton';
import { addXP } from '../utils/economy';
import { DynamicScore } from './ui/DynamicScore';
import { Curriculums, RhythmsExpressions, MusicalFeatures } from '../data';
import { useInstrument } from '../contexts/InstrumentContext';
import { formatAccidentals, formatVexFlowKey } from '../utils/musicFormatter';
import { getParsedFingeringKeys } from '../utils/fingeringParser';
import { FingeringChart } from './ui/FingeringChart';
import { BrassFingeringChart } from './ui/BrassFingeringChart';
import { FluteFingeringChart } from './ui/FluteFingeringChart';
import { SaxophoneFingeringChart } from './ui/SaxophoneFingeringChart';
import { ViolinFingeringChart } from './ui/ViolinFingeringChart';
import { CelloFingeringChart } from './ui/CelloFingeringChart';
import { PianoFingeringChart } from './ui/PianoFingeringChart';
import { VoicePitchDisplay } from './ui/VoicePitchDisplay';

const vocalSynth = new Tone.Synth().toDestination();

type NoteType = { label: string; writtenNote: string; description?: string; fingering?: string; };

const getVexDuration = (beats: string) => {
  if (beats === '4') return 'w';
  if (beats === '3') return 'hd';
  if (beats === '2') return 'h';
  if (beats === '1.5') return 'qd';
  if (beats === '1') return 'q';
  if (beats === '0.5' || beats === '1/2') return '8';
  if (beats === '0.25' || beats === '16') return '16';
  return 'q';
};

interface PizzeriaProps {
  onBack: () => void;
  isDailyChallenge?: boolean;
  onChallengeComplete?: (score: any) => void;
  onComplete?: () => void;
}

export default function Pizzeria({ onBack, onComplete }: PizzeriaProps) {
  const { instrument } = useInstrument();
  const bassClefInstruments = ['Trombone', 'Tuba', 'Baritone/Euphonium', 'Cello', 'Double Bass', 'Bass Guitar'];
  const defaultClef = bassClefInstruments.includes(instrument) ? 'bass' : 'treble';
const rawData = Curriculums[instrument as keyof typeof Curriculums] || Curriculums['Clarinet'] || [];
  const curriculumLevelsData: any[] = Array.isArray(rawData) ? rawData : (rawData as any).default || [];
  
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  
  // Gameplay States
  const [pizzasBaked, setPizzasBaked] = useState(0);
  const targetPizzas = 3;
  const [lives, setLives] = useState(3);
  
  const [gamePhase, setGamePhase] = useState<'stage-select' | 'playing'>('stage-select');
  const [showNoteHelp, setShowNoteHelp] = useState(false);
  
  const [targetNote, setTargetNote] = useState<NoteType | null>(null);
  
  const [targetRhythm, setTargetRhythm] = useState<any>(null);
  const [targetFeatures, setTargetFeatures] = useState<any[]>([]);
  
  const [availableBases, setAvailableBases] = useState<any[]>([]);
  const [availableToppings, setAvailableToppings] = useState<any[]>([]);
  const [vocalOptions, setVocalOptions] = useState<any[]>([]);
  
  const [currentFingering, setCurrentFingering] = useState<string>('');
  const [currentRhythm, setCurrentRhythm] = useState<string>('');
  const [currentFeatures, setCurrentFeatures] = useState<Set<string>>(new Set());
  
  const [baked, setBaked] = useState(false);
  const [showOops, setShowOops] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const [showPizzaBake, setShowPizzaBake] = useState(false);
    const [strikeCount, setStrikeCount] = useState(0);
  
  // TEMPORARY CALIBRATION FLAG
  const [showCalibration, setShowCalibration] = useState(false);

  useEffect(() => {
    if (selectedLevel !== null) {
      setPizzasBaked(0);
      setLives(3);
      setLevelComplete(false);
      setBaked(false);
      setShowOops(false);
      setShowPizzaBake(false);
        setStrikeCount(0);
        setCurrentFingering('');
      setCurrentRhythm('');
      setCurrentFeatures(new Set());
      generateOrder();
    }
  }, [selectedLevel]);

  const generateOrder = () => {
    if (!selectedLevel) return;

    const availableLevels = curriculumLevelsData.filter(l => l.id <= selectedLevel);
    const newNotes = curriculumLevelsData.find(l => l.id === selectedLevel)?.introducedNotes || [];
    
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

    setTargetNote(selectedTarget);

    let allAvailableRhythms: any[] = [];
    RhythmsExpressions.filter((l: any) => l.id <= selectedLevel).forEach((l: any) => {
      allAvailableRhythms = allAvailableRhythms.concat((l.introducedSymbols || []).filter((s: any) => s.Category === 'Notes'));
    });

    if (allAvailableRhythms.length > 0) {
      const tgt = allAvailableRhythms[Math.floor(Math.random() * allAvailableRhythms.length)];
      setTargetRhythm(tgt);
      const others = allAvailableRhythms.filter(r => r.Name !== tgt.Name).sort(() => Math.random() - 0.5);
      setAvailableBases([tgt, ...others].slice(0, 6).sort(() => Math.random() - 0.5));
    } else {
      setTargetRhythm(null);
      setAvailableBases([]);
    }

    let allAvailableDynamics: any[] = [];
    let allAvailableArticulations: any[] = [];
    MusicalFeatures.filter((l: any) => l.id <= selectedLevel).forEach((l: any) => {
      allAvailableDynamics = allAvailableDynamics.concat((l.introducedSymbols || []).filter((s: any) => s.Category === 'Dynamics'));
      allAvailableArticulations = allAvailableArticulations.concat((l.introducedSymbols || []).filter((s: any) => s.Category === 'Articulations'));
    });

    const features: any[] = [];
    if (allAvailableDynamics.length > 0 && Math.random() > 0.3) {
      features.push(allAvailableDynamics[Math.floor(Math.random() * allAvailableDynamics.length)]);
    }
    if (allAvailableArticulations.length > 0 && Math.random() > 0.4) {
      features.push(allAvailableArticulations[Math.floor(Math.random() * allAvailableArticulations.length)]);
    }
    
    // Ensure at least 1 topping on all levels
    if (features.length === 0) {
       const combined = [...allAvailableDynamics, ...allAvailableArticulations];
       if (combined.length > 0) {
           features.push(combined[Math.floor(Math.random() * combined.length)]);
       }
    }
    setTargetFeatures(features);
    
    const allToppings = [...allAvailableDynamics, ...allAvailableArticulations];
    const featureNames = features.map(f => f.Name);
    const otherToppings = allToppings.filter(t => !featureNames.includes(t.Name)).sort(() => Math.random() - 0.5);
    setAvailableToppings([...features, ...otherToppings].slice(0, 9).sort(() => Math.random() - 0.5));

    setCurrentRhythm('');
    setCurrentFeatures(new Set());
    
    // Set vocal options if Voice
    if (instrument.includes('Voice') && selectedTarget) {
      const uniqueNotes = Array.from(new Map(allAvailable.map(n => [n.writtenNote, n])).values());
      const others = uniqueNotes.filter(n => n.writtenNote !== selectedTarget.writtenNote).sort(() => Math.random() - 0.5);
      
      const numOptions = selectedLevel === 1 ? 3 : 4;
      const opts = [selectedTarget];
      while (opts.length < numOptions && others.length > 0) {
        opts.push(others.pop());
      }
      setVocalOptions(opts.sort(() => Math.random() - 0.5));
    }
  };

  const restartGame = () => {
    setSelectedLevel(null);
    setGamePhase('stage-select');
  };

  const handleSendToOven = () => {
    if (!targetNote) return;
    
    const targetFingerings = (targetNote.fingering || '').split(' OR ');
    let sortedCurrent = currentFingering.split('-').filter(Boolean).sort().join('-');
    if (sortedCurrent === '0') sortedCurrent = '';
    
    const isNoteCorrect = targetFingerings.some(tf => {
      let sortedTarget = tf.split('-').filter(Boolean).sort().join('-');
      if (sortedTarget === '0') sortedTarget = '';
      return sortedTarget === sortedCurrent;
    });

    const isRhythmCorrect = targetRhythm ? currentRhythm === targetRhythm.Name : true;
    
    const targetFeatureNames = new Set(targetFeatures.map(f => f.Name));
    let isFeaturesCorrect = true;
    if (targetFeatureNames.size !== currentFeatures.size) {
      isFeaturesCorrect = false;
    } else {
      for (const f of targetFeatureNames) {
        if (!currentFeatures.has(f)) {
          isFeaturesCorrect = false;
          break;
        }
      }
    }
    
    const isCorrect = isNoteCorrect && isRhythmCorrect && isFeaturesCorrect;
    
    if (isCorrect) {
      AudioManager.playSuccess();
      addXP(5);
      setBaked(true);
      setShowPizzaBake(true);
      setTimeout(() => {
        const nextPizzas = pizzasBaked + 1;
        setPizzasBaked(nextPizzas);
        setShowPizzaBake(false);
        
        if (nextPizzas >= targetPizzas) {
          setLevelComplete(true);
          if (onComplete) onComplete();
        } else {
          setBaked(false);
          setCurrentFingering('');
          setCurrentRhythm('');
          setCurrentFeatures(new Set());
          setLives(3);
          generateOrder();
        }
      }, 3000);
    } else {
      AudioManager.playError();
      setShowOops(true);
      const nextLives = lives - 1;
      setLives(Math.max(0, nextLives));
      setTimeout(() => {
        setShowOops(false);
        if (nextLives <= 0) {
          setLives(3);
          setCurrentFingering('');
          setCurrentRhythm('');
          setCurrentFeatures(new Set());
        }
      }, 3000);
    }
  };

  const getFingeringComponent = () => {
    if ((instrument === 'Trumpet' || instrument === 'Baritone/Euphonium') || instrument === 'Baritone/Euphonium' || instrument === 'Tuba' || instrument === 'French Horn') {
      return <div className="scale-[1.2] origin-center"><BrassFingeringChart fingeringString={currentFingering} interactive={true} onChange={setCurrentFingering} /></div>;
    } else if (instrument === 'Flute') {
      return <div className="scale-[1.2] origin-center"><FluteFingeringChart fingeringString={currentFingering} interactive={true} onChange={setCurrentFingering} /></div>;
    } else if (instrument === 'Alto Saxophone' || instrument === 'Tenor Saxophone') {
      return <div className="scale-[0.8] origin-center -mt-8"><SaxophoneFingeringChart fingeringString={currentFingering} interactive={true} onChange={setCurrentFingering} /></div>;
    } else if (instrument === 'Violin') {
      return <div className="scale-[1.1] origin-center"><ViolinFingeringChart fingeringString={currentFingering} interactive={true} onChange={setCurrentFingering} /></div>;
    } else if (instrument === 'Cello') {
      return <div className="scale-[1.1] origin-center"><CelloFingeringChart fingeringString={currentFingering} interactive={true} onChange={setCurrentFingering} /></div>;
    } else if (instrument === 'Piano') {
      return <div className="scale-[1.1] origin-center"><PianoFingeringChart fingeringString={currentFingering} interactive={true} onChange={setCurrentFingering} /></div>;
    } else if (instrument.includes('Voice')) {
      return (
        <div className="flex flex-col items-center w-full max-w-[400px]">
           <button 
             onClick={async () => {
               await Tone.start();
               vocalSynth.triggerAttackRelease(targetNote?.fingering || '', "8n");
             }}
             className="mb-4 bg-rose-100 hover:bg-rose-200 text-rose-600 px-6 py-3 rounded-xl font-bold cursor-pointer transition-colors shadow-sm active:scale-95 flex items-center gap-2"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
             Listen to Note
           </button>
           <div className={`grid gap-4 w-full ${vocalOptions.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
             {vocalOptions.map((opt, i) => (
               <div 
                 key={i} 
                 onClick={() => setCurrentFingering(opt.fingeringDisplay || opt.fingering)}
                 className={`cursor-pointer rounded-2xl border-4 overflow-hidden bg-white/95 transition-all flex items-center justify-center min-h-[120px] ${(currentFingering === (opt.fingeringDisplay || opt.fingering)) ? 'border-sky-500 shadow-lg scale-105' : 'border-slate-200 hover:border-sky-300'}`}
               >
                 <div className="pointer-events-none p-2 scale-75 origin-center -ml-2 -mt-2">
                   <DynamicScore 
                     clef={(opt.clef || defaultClef) as any} 
                     notes={[{ keys: [formatVexFlowKey(opt.writtenNote, opt.clef || defaultClef)], duration: "q" }]} 
                     width={150} height={120} 
                   />
                 </div>
               </div>
             ))}
           </div>
        </div>
      );
    }
    return <div className="scale-[0.9] origin-center"><FingeringChart fingeringString={currentFingering} interactive={true} onChange={setCurrentFingering} /></div>;
  };

  
  
  const formatBeats = (beats: string | number) => {
    const val = typeof beats === 'string' ? parseFloat(beats) : beats;
    if (isNaN(val)) return beats;
    
    if (val === 0.25) return '1/4';
    if (val === 0.5) return '1/2';
    if (val === 0.75) return '3/4';
    
    const whole = Math.floor(val);
    const fraction = val - whole;
    
    let fracStr = '';
    if (fraction === 0.25) fracStr = '1/4';
    else if (fraction === 0.5) fracStr = '1/2';
    else if (fraction === 0.75) fracStr = '3/4';
    
    if (whole > 0 && fracStr) return `${whole} + ${fracStr}`;
    if (fracStr) return fracStr;
    return whole.toString();
  };

  const renderToppingSymbol = (name: string) => {
     switch (name) {
         case 'Forte': return <span className="font-serif italic font-black text-5xl">f</span>;
         case 'Piano': return <span className="font-serif italic font-black text-5xl">p</span>;
         case 'Mezzo Forte': return <span className="font-serif italic font-black text-5xl">mf</span>;
         case 'Mezzo Piano': return <span className="font-serif italic font-black text-5xl">mp</span>;
         case 'Fortissimo': return <span className="font-serif italic font-black text-5xl">ff</span>;
         case 'Pianissimo': return <span className="font-serif italic font-black text-5xl">pp</span>;
           case 'Fortississimo': return <span className="font-serif italic font-black text-5xl">fff</span>;
           case 'Pianississimo': return <span className="font-serif italic font-black text-5xl">ppp</span>;
         case 'Crescendo': return <svg viewBox="0 0 100 20" className="w-16 h-8"><path d="M100 0 L0 10 L100 20" fill="none" stroke="currentColor" strokeWidth="3"/></svg>;
         case 'Decrescendo': return <svg viewBox="0 0 100 20" className="w-16 h-8"><path d="M0 0 L100 10 L0 20" fill="none" stroke="currentColor" strokeWidth="3"/></svg>;
         case 'Staccato': return <span className="font-black text-7xl -translate-y-3">.</span>;
         case 'Accent': return <span className="font-black text-5xl scale-x-[1.5]">&gt;</span>;
         case 'Tenuto': return <span className="font-black text-6xl -translate-y-1">-</span>;
         case 'Marcato': return <span className="font-black text-4xl scale-y-[1.5] translate-y-1">^</span>;
           case 'Caesura': return <span className="font-black text-5xl">//</span>;
           case 'Breath Mark': return <span className="font-black text-6xl -translate-y-2">'</span>;
         case 'Fermata': return <span className="font-serif text-6xl">𝄐</span>;
         case 'Sforzando': return <span className="font-serif italic font-black text-4xl">sfz</span>;
         case 'Forte-piano': return <span className="font-serif italic font-black text-4xl">fp</span>;
         default: return <span className="text-xl font-bold text-center">{name}</span>;
     }
  };

  if (selectedLevel === null) {
    const pizzeriaLevels: LevelCardData[] = curriculumLevelsData.map((lvl: any) => {
      const levelId = lvl.id;
      let selectedTheme;
      if (lvl.isExtra) {
        selectedTheme = { cardTheme: 'bg-orange-500/20 border-2 border-orange-500', textTheme: 'text-orange-900' };
      } else if (levelId <= 10) {
        selectedTheme = { cardTheme: 'bg-red-500/10 border-2 border-red-500', textTheme: 'text-red-900' };
      } else if (levelId <= 20) {
        selectedTheme = { cardTheme: 'bg-[#F5F5DC]/40 border-2 border-[#D4C4A8]', textTheme: 'text-stone-900' }; // Beige
      } else if (levelId <= 30) {
        selectedTheme = { cardTheme: 'bg-[#FFDB58]/30 border-2 border-[#C1A024]', textTheme: 'text-yellow-900' }; // Mustard
      } else {
        selectedTheme = { cardTheme: 'bg-[#FFDAB9]/40 border-2 border-[#FFCBA4]', textTheme: 'text-rose-900' }; // Peach
      }
      
      const rhythmLevelObj = RhythmsExpressions.find((l: any) => l.id === levelId);
      const levelRhythms = (rhythmLevelObj?.introducedSymbols || []).filter((r: any) => r.Category === 'Notes').map((r: any) => r.Notation).join(', ');
      const featuresLevelObj = MusicalFeatures.find((l: any) => l.id === levelId);
      const levelExpressions = (featuresLevelObj?.introducedSymbols || []).filter((m: any) => m.Category === 'Dynamics' || m.Category === 'Articulations').map((m: any) => m.Symbol).join(', ');

      return {
        ...lvl,
        id: lvl.id,
        title: lvl.title,
        targetNotes: lvl.introducedNotes?.map((n: any) => formatAccidentals(n.label)).join(', ') || '',
        targetRhythms: levelRhythms,
        targetExpressions: levelExpressions,
        isUnlocked: true, // For MVP all unlocked
        cardTheme: selectedTheme.cardTheme,
        textTheme: selectedTheme.textTheme
      };
    });

    return (
      <UniversalGameHomepage
        gameTitle="Music Pizzeria"
        titleColorClass="text-red-600 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]"
        backgroundClass="bg-[url('/images/Pizzeria%20Background.png')] bg-cover bg-center"
        levels={pizzeriaLevels}
        onLevelSelect={(id) => {
          setSelectedLevel(id);
          setGamePhase('playing');
        }}
        onBack={onBack}
        onNoteHelp={() => setShowNoteHelp(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[url('/images/Pizzeria%20Gameplay%20Background.png')] bg-cover bg-center flex flex-col relative select-none" id="pizzeria-container">
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 bg-orange-100/90 backdrop-blur-md border-b border-orange-200/50 shadow-sm">
      <div className="absolute top-8 left-8 z-50 flex items-center gap-4">
        <button
          onClick={restartGame}
          className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-white px-5 py-3 rounded-2xl shadow-xl transition-all border-2 border-white/20 backdrop-blur-md font-black uppercase tracking-wider"
        >
          <ArrowLeft className="w-6 h-6" /> Quit
        </button>
        <NoteHelpButton onClick={() => setShowNoteHelp(true)} className="bg-slate-800/80 border-white/20 backdrop-blur-md hover:bg-slate-700 w-14 h-14" />
      </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <ChefHat key={i} className={`w-8 h-8 ${i < lives ? 'text-red-600 drop-shadow-sm' : 'text-slate-300'}`} />
            ))}
          </div>
          <div className="h-8 w-[2px] bg-orange-300" />
          <div className="font-black text-2xl text-orange-800 tracking-wider">
            PIZZAS: {pizzasBaked}/{targetPizzas}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
        <div className="flex-1 flex flex-row overflow-hidden relative">
          
          {/* TOP LEFT: Order ticket (absolute positioned or floating) */}
          <div className="absolute top-6 left-12 bg-white p-6 rounded-sm shadow-xl border-t-8 border-yellow-300 rotate-[-3deg] z-20 max-w-sm font-mono w-72 min-h-[16rem] h-fit pb-6 flex flex-col">
            <h2 className="text-xl font-bold border-b-2 border-dashed border-gray-300 pb-2 mb-4 text-center">ORDER TICKET #{pizzasBaked + 1}</h2>
             <div className="text-xl leading-relaxed text-slate-900 font-black flex-1 flex flex-col justify-center">
               <ul className="list-disc pl-6 space-y-3">
                 {targetRhythm && <li>Base: {formatBeats(targetRhythm['Beats (4/4 time)'])} {parseFloat(targetRhythm['Beats (4/4 time)']) <= 1 ? 'beat' : 'beats'}</li>}
                 {targetNote && <li>Sauce: {formatAccidentals((instrument === 'Cello' ? targetNote.writtenNote : targetNote.label))}</li>}
                 {targetFeatures.length > 0 && (
                   <li>
                     Toppings:
                     <ul className="list-[circle] pl-6 mt-1 space-y-1">
                       {targetFeatures.map((f, i) => (
                         <li key={`feature-${i}`}>{f.Name}</li>
                       ))}
                     </ul>
                   </li>
                 )}
               </ul>
             </div>
          </div>
  
          {instrument === 'Flute' ? (
            <>
              {/* 1. Base (Durations/Rhythms) - Left Column */}
              <div className="w-1/4 bg-white/40 backdrop-blur-sm border-r border-white/20 p-6 flex flex-col mt-[22rem] overflow-y-auto hide-scrollbar z-10">
                <h3 className="text-2xl font-black text-slate-700 mb-6 text-center uppercase tracking-widest drop-shadow-sm">Base</h3>
                <div className="grid grid-cols-2 gap-4">
                  {availableBases.map((rhythm: any) => (
                    <button
                      key={rhythm.Name}
                      onClick={() => setCurrentRhythm(rhythm.Name)}
                      className={`flex flex-col items-center justify-center h-32 rounded-2xl shadow-md transition-all border-4 ${currentRhythm === rhythm.Name ? 'bg-amber-100 border-amber-400 scale-105' : 'bg-white border-transparent hover:bg-slate-50'}`}
                    >
                      <span className="text-6xl mb-2">{rhythm.Notation}</span>
                      <span className="text-sm font-black text-slate-900 truncate w-full text-center px-1">{rhythm.Name.split(' (')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
      
              {/* RIGHT SIDE: Flex Col for Sauce and Toppings */}
              <div className="w-3/4 flex flex-col bg-slate-50/50">
              
                {/* 2. Sauce (Fingering) - Top Section */}
                <div className="flex-1 flex flex-col items-center p-6 pt-8 relative overflow-y-auto hide-scrollbar z-10 border-b border-slate-200">
                  <h3 className="text-2xl font-black text-slate-700 mb-6 uppercase tracking-widest drop-shadow-sm">Sauce</h3>
                  <div className="scale-[1.2] origin-top bg-white/80 p-8 rounded-3xl shadow-xl border-4 border-yellow-200 w-full max-w-5xl mx-auto flex justify-center overflow-hidden">
                    {getFingeringComponent()}
                  </div>
                </div>
        
                {/* 3. Toppings (Expressions) - Bottom Section */}
                <div className="h-64 bg-white/60 p-6 flex flex-col items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pl-48 relative">
                  <h3 className="text-2xl font-black text-slate-700 mb-4 text-center uppercase tracking-widest drop-shadow-sm">Toppings</h3>
                  <div className="flex flex-wrap gap-4 justify-center w-full max-w-5xl pr-48">
                    {availableToppings.map((feature: any) => {
                      const isSelected = currentFeatures.has(feature.Name);
                      return (
                        <button
                          key={feature.Name}
                          onClick={() => {
                            const next = new Set(currentFeatures);
                            if (next.has(feature.Name)) next.delete(feature.Name);
                            else next.add(feature.Name);
                            setCurrentFeatures(next);
                          }}
                          className={`flex flex-col items-center justify-center p-4 w-24 h-24 rounded-2xl shadow-md transition-all border-4 ${
                            isSelected 
                            ? 'bg-green-100 border-green-500 shadow-md scale-105' 
                            : 'bg-white border-transparent hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-center w-full h-full text-slate-800 scale-[0.8]">
                            {renderToppingSymbol(feature.Name)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
              </div>
            </>
          ) : (
            <>
              {/* 3-COLUMN LAYOUT FOR ALL OTHER INSTRUMENTS */}
              {/* 1. Base (Durations/Rhythms) - Left Column */}
              <div className="w-1/3 bg-white/40 backdrop-blur-sm border-r border-white/20 p-6 flex flex-col mt-[22rem] overflow-y-auto hide-scrollbar z-10">
                <h3 className="text-2xl font-black text-slate-700 mb-6 text-center uppercase tracking-widest drop-shadow-sm">Base</h3>
                <div className="grid grid-cols-2 gap-4">
                  {availableBases.map((rhythm: any) => (
                    <button
                      key={rhythm.Name}
                      onClick={() => setCurrentRhythm(rhythm.Name)}
                      className={`flex flex-col items-center justify-center h-32 rounded-2xl shadow-md transition-all border-4 ${currentRhythm === rhythm.Name ? 'bg-amber-100 border-amber-400 scale-105' : 'bg-white border-transparent hover:bg-slate-50'}`}
                    >
                      <span className="text-6xl mb-2">{rhythm.Notation}</span>
                      <span className="text-sm font-black text-slate-900 truncate w-full text-center px-1">{rhythm.Name.split(' (')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
      
              {/* 2. Sauce (Fingering) - Middle Column */}
              <div className="w-1/3 flex flex-col items-center p-6 pt-12 relative overflow-y-auto hide-scrollbar z-10 bg-slate-50/50">
                <h3 className="text-2xl font-black text-slate-700 mb-12 uppercase tracking-widest drop-shadow-sm">Sauce</h3>
                <div className="scale-[1.2] origin-top bg-white/80 p-8 rounded-3xl shadow-xl border-4 border-yellow-200">
                  {getFingeringComponent()}
                </div>
              </div>
      
              {/* 3. Toppings (Expressions) - Right Column */}
              <div className="w-1/3 bg-white/40 backdrop-blur-sm border-l border-white/20 p-6 flex flex-col overflow-y-auto hide-scrollbar">
                <h3 className="text-2xl font-black text-slate-700 mb-6 text-center uppercase tracking-widest drop-shadow-sm">Toppings</h3>
                <div className="grid grid-cols-3 gap-4 pb-32">
                  {availableToppings.map((feature: any) => {
                    const isSelected = currentFeatures.has(feature.Name);
                    return (
                      <button
                        key={feature.Name}
                        onClick={() => {
                          const next = new Set(currentFeatures);
                          if (next.has(feature.Name)) next.delete(feature.Name);
                          else next.add(feature.Name);
                          setCurrentFeatures(next);
                        }}
                        className={`flex flex-col items-center justify-center p-2 h-28 rounded-2xl shadow-md transition-all border-4 ${
                          isSelected 
                          ? 'bg-green-100 border-green-500 shadow-md scale-105' 
                          : 'bg-white border-transparent hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-center w-full h-full text-slate-800 scale-[0.8]">
                          {renderToppingSymbol(feature.Name)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Bake Pizza Button & Errors - Fixed at bottom middle */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none">
            {showOops && (
               <div className={`mb-4 px-6 py-2 rounded-full font-bold text-lg shadow-lg animate-bounce pointer-events-auto ${strikeCount >= 2 ? 'bg-red-500 text-white' : 'bg-orange-400 text-white'}`}>
                 {strikeCount >= 2 ? '🔥 Burnt Pizza! Lost a life.' : '⚠️ Oops, try again!'}
               </div>
            )}
            <button
              onClick={handleSendToOven}
              disabled={!currentRhythm}
              className={`pointer-events-auto px-10 py-6 rounded-3xl font-black text-3xl uppercase tracking-widest shadow-2xl transition-all border-4 ${
                (!currentRhythm) 
                ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed' 
                : 'bg-orange-500 text-white border-orange-400 hover:bg-orange-600 hover:scale-105 active:scale-95'
              }`}
            >
              Bake Pizza!
            </button>
          </div>
        

        <AnimatePresence>
          

          {showPizzaBake && targetNote && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <motion.div 
                className="relative bg-amber-100 w-[500px] h-[500px] rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-[24px] border-amber-600 flex flex-col items-center justify-center overflow-hidden"
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {/* Cheese / Sauce layer */}
                <div className="absolute inset-0 m-4 rounded-full bg-yellow-400 opacity-90 shadow-inner" />
                
                {/* Pizza texture */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#ff6b00_1px,transparent_2px)] [background-size:20px_20px]" />
                
                <div className="absolute top-12 z-20 text-4xl font-black text-white bg-red-600 px-6 py-2 rounded-full uppercase tracking-widest shadow-lg border-4 border-white">
                  Perfect Bake!
                </div>
                
                {/* Center Note (Base & Sauce only) */}
                <div className="scale-[1.8] relative z-10 bg-white/80 p-4 rounded-3xl shadow-xl border-4 border-amber-800/20 backdrop-blur-sm mt-8">
                  <DynamicScore clef={(targetNote?.clef || defaultClef) as any} 
                    notes={[{
                      keys: [formatVexFlowKey(targetNote?.writtenNote || '', targetNote?.clef || defaultClef)],
                      duration: getVexDuration(targetRhythm['Beats (4/4 time)'])
                    }]}
                    width={100}
                    height={120}
                    hideTimeSignature
                  />
                </div>
                
                {/* Render the Toppings Scattered Around the Pizza! */}
                {targetFeatures.map((f, i) => {
                  // Generate some pseudo-random but somewhat distributed positions around the circle
                  const angle = (i * (360 / targetFeatures.length)) * (Math.PI / 180);
                  const radius = 120 + (i % 2 * 30); // alternating distance from center
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  
                  return (
                    <div 
                      key={`bake-topping-${i}`}
                      className="absolute z-20 flex items-center justify-center bg-white p-3 rounded-full shadow-lg border-4 border-amber-500 text-amber-900"
                      style={{
                        transform: `translate(${x}px, ${y}px) scale(0.6) rotate(${Math.random() * 40 - 20}deg)`
                      }}
                    >
                      {renderToppingSymbol(f.Name)}
                    </div>
                  );
                })}
  
                {/* Success Checkmarks */}
                <div className="absolute bottom-12 flex gap-3 z-20">
                  {[...Array(pizzasBaked + 1)].map((_, i) => (
                    <CheckCircle2 key={i} className="w-12 h-12 text-green-500 fill-current bg-white rounded-full drop-shadow-lg border-2 border-green-700" />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      <NoteHelpOverlay isOpen={showNoteHelp} onClose={() => setShowNoteHelp(false)} defaultView="notes" />
</div>
      </div>
    );
  }
