import os

filepath = os.path.join(os.getcwd(), 'src', 'components', 'Pizzeria.tsx')

content = """import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChefHat, CheckCircle2, Play } from 'lucide-react';
import { APP_ASSETS } from '../config/assets';
import { SmartImage } from './ui/SmartImage';
import { UniversalGameHomepage, LevelCardData } from './ui/UniversalGameHomepage';
import { DynamicScore } from './ui/DynamicScore';
import { AudioManager } from '../utils/audioManager';
import { Curriculums, RhythmsExpressions, MusicalFeatures } from '../data';
import { useInstrument } from '../contexts/InstrumentContext';
import { formatAccidentals, formatVexFlowKey } from '../utils/musicFormatter';
import { getParsedFingeringKeys } from '../utils/fingeringParser';
import { FingeringChart } from './ui/FingeringChart';
import { BrassFingeringChart } from './ui/BrassFingeringChart';
import { FluteFingeringChart } from './ui/FluteFingeringChart';
import { SaxophoneFingeringChart } from './ui/SaxophoneFingeringChart';
import { ViolinFingeringChart } from './ui/ViolinFingeringChart';

type NoteType = { label: string; writtenNote: string; description?: string; fingering?: string; };

interface PizzeriaProps {
  onBack: () => void;
  onComplete?: () => void;
}

export default function Pizzeria({ onBack, onComplete }: PizzeriaProps) {
  const { instrument } = useInstrument();
  const rawData = Curriculums[instrument as keyof typeof Curriculums] || Curriculums['Clarinet'] || [];
  const curriculumLevelsData: any[] = Array.isArray(rawData) ? rawData : (rawData as any).default || [];
  
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  
  // Gameplay States
  const [pizzasBaked, setPizzasBaked] = useState(0);
  const targetPizzas = 3;
  const [lives, setLives] = useState(3);
  
  const [targetNote, setTargetNote] = useState<NoteType | null>(null);
  const [targetRhythm, setTargetRhythm] = useState<any>(null);
  const [targetFeatures, setTargetFeatures] = useState<any[]>([]);
  
  const [currentFingering, setCurrentFingering] = useState<string>('');
  const [currentRhythm, setCurrentRhythm] = useState<string>('');
  const [currentFeatures, setCurrentFeatures] = useState<Set<string>>(new Set());
  
  const [baked, setBaked] = useState(false);
  const [showOops, setShowOops] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);

  useEffect(() => {
    if (selectedLevel !== null) {
      setPizzasBaked(0);
      setLives(3);
      setLevelComplete(false);
      setBaked(false);
      setShowOops(false);
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
    setCurrentFingering('');

    const availableRhythms = RhythmsExpressions.filter((r: any) => parseInt(r.Level) <= selectedLevel && r.Category === 'Notes');
    if (availableRhythms.length > 0) {
      setTargetRhythm(availableRhythms[Math.floor(Math.random() * availableRhythms.length)]);
    } else {
      setTargetRhythm(null);
    }

    const availableDynamics = MusicalFeatures.filter((m: any) => parseInt(m.Level) <= selectedLevel && m.Category === 'Dynamics');
    const availableArticulations = MusicalFeatures.filter((m: any) => parseInt(m.Level) <= selectedLevel && m.Category === 'Articulations');
    
    let features: any[] = [];
    if (availableDynamics.length > 0 && Math.random() > 0.3) {
      features.push(availableDynamics[Math.floor(Math.random() * availableDynamics.length)]);
    }
    if (availableArticulations.length > 0 && Math.random() > 0.4) {
      features.push(availableArticulations[Math.floor(Math.random() * availableArticulations.length)]);
    }
    setTargetFeatures(features);
    setCurrentRhythm('');
    setCurrentFeatures(new Set());
  };

  const handleSendToOven = () => {
    if (!targetNote) return;
    
    const targetFingerings = (targetNote.fingering || '').split(' OR ');
    const sortedCurrent = currentFingering.split('-').filter(Boolean).sort().join('-');
    
    const isNoteCorrect = targetFingerings.some(tf => {
      const sortedTarget = tf.split('-').filter(Boolean).sort().join('-');
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
      setBaked(true);
      setTimeout(() => {
        const nextPizzas = pizzasBaked + 1;
        setPizzasBaked(nextPizzas);
        
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
      }, 2000);
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
    if (instrument === 'Trumpet' || instrument === 'Euphonium_and_Baritone' || instrument === 'Tuba' || instrument === 'French Horn') {
      return <div className="scale-[1.2] origin-center"><BrassFingeringChart fingeringString={currentFingering} interactive={true} onChange={setCurrentFingering} /></div>;
    } else if (instrument === 'Flute') {
      return <div className="scale-[1.2] origin-center"><FluteFingeringChart fingeringString={currentFingering} interactive={true} onChange={setCurrentFingering} /></div>;
    } else if (instrument === 'Alto Saxophone' || instrument === 'Tenor Saxophone') {
      return <div className="scale-[0.85] origin-center"><SaxophoneFingeringChart fingeringString={currentFingering} interactive={true} onChange={setCurrentFingering} /></div>;
    } else if (instrument === 'Violin' || instrument === 'Viola' || instrument === 'Cello' || instrument === 'Double Bass') {
      return <div className="scale-[1.1] origin-center"><ViolinFingeringChart fingeringString={currentFingering} interactive={true} onChange={setCurrentFingering} /></div>;
    } else {
      return <div className="scale-[0.9] origin-center"><FingeringChart fingeringString={currentFingering} interactive={true} onChange={setCurrentFingering} /></div>;
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
      
      const levelRhythms = RhythmsExpressions.filter((r: any) => parseInt(r.Level) === levelId).map((r: any) => r.Name).join(', ');
      const levelExpressions = MusicalFeatures.filter((m: any) => parseInt(m.Level) === levelId).map((m: any) => m.Name).join(', ');

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
        onLevelSelect={(id) => setSelectedLevel(id)}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[url('/images/Pizzeria%20Gameplay%20Background.png')] bg-cover bg-center flex flex-col relative select-none" id="pizzeria-container">
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 bg-orange-100/90 backdrop-blur-md border-b border-orange-200/50 shadow-sm">
        <button
          onClick={() => setSelectedLevel(null)}
          className="flex items-center gap-2 px-4 py-2 font-sans font-semibold text-orange-900 transition-all rounded-xl bg-white hover:bg-orange-100 border border-orange-200 active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Map
        </button>

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

      {/* Main Content Area - Split into 3 columns */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        
        {/* TOP LEFT: Order ticket (absolute positioned or floating) */}
        <div className="absolute top-6 left-12 bg-white p-6 rounded-sm shadow-xl border-t-8 border-yellow-300 rotate-[-3deg] z-20 max-w-sm font-mono w-72 h-64 flex flex-col">
           <h2 className="text-xl font-bold border-b-2 border-dashed border-gray-300 pb-2 mb-4 text-center">ORDER TICKET #{pizzasBaked + 1}</h2>
           <p className="text-xl leading-relaxed text-gray-800 font-semibold flex-1">
             {(() => {
               if (!targetNote) return '...';
               let text = targetRhythm ? `A ${targetRhythm['Beats (4/4 time)']} beat ${formatAccidentals(targetNote.label)}` : `A ${formatAccidentals(targetNote.label)}`;
               if (targetFeatures.length > 0) {
                 const names = targetFeatures.map(f => f.Name);
                 text += ` played ${names.join(' and ')}`;
               }
               return text;
             })()}
           </p>
        </div>

        {/* 1. Base (Durations/Rhythms) - Left Column */}
        <div className="w-1/3 bg-white/40 backdrop-blur-sm border-r border-white/20 p-6 flex flex-col mt-[12rem] overflow-y-auto hide-scrollbar">
          <h3 className="text-2xl font-black text-slate-700 mb-6 text-center uppercase tracking-widest drop-shadow-sm">Base</h3>
          <div className="grid grid-cols-2 gap-4">
            {RhythmsExpressions.filter((r: any) => parseInt(r.Level) <= (selectedLevel || 1) && r.Category === 'Notes').map((rhythm: any) => (
              <button
                key={rhythm.Name}
                onClick={() => setCurrentRhythm(rhythm.Name)}
                className={`p-4 rounded-xl flex items-center justify-center text-4xl border-4 transition-all ${
                  currentRhythm === rhythm.Name 
                  ? 'bg-amber-100 border-amber-500 shadow-md scale-105 text-amber-900' 
                  : 'bg-white/80 border-transparent hover:bg-white text-slate-700'
                }`}
              >
                {rhythm.Notation}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Sauce (Fingering) - Middle Column */}
        <div className="w-1/3 flex flex-col items-center p-6 pt-12 relative overflow-y-auto hide-scrollbar">
          <h3 className="text-2xl font-black text-slate-700 mb-12 uppercase tracking-widest drop-shadow-sm">Sauce</h3>
          {/* Chart rendered much bigger */}
          <div className="mt-4">
            {getFingeringComponent()}
          </div>
        </div>

        {/* 3. Toppings (Expressions) - Right Column */}
        <div className="w-1/3 bg-white/40 backdrop-blur-sm border-l border-white/20 p-6 flex flex-col overflow-y-auto hide-scrollbar">
          <h3 className="text-2xl font-black text-slate-700 mb-6 text-center uppercase tracking-widest drop-shadow-sm">Toppings</h3>
          <div className="grid grid-cols-2 gap-4">
            {MusicalFeatures.filter((m: any) => parseInt(m.Level) <= (selectedLevel || 1) && (m.Category === 'Dynamics' || m.Category === 'Articulations')).map((feature: any) => {
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
                  className={`p-4 rounded-xl flex flex-col items-center justify-center border-4 transition-all ${
                    isSelected 
                    ? 'bg-green-100 border-green-500 shadow-md scale-105 text-green-900' 
                    : 'bg-white/80 border-transparent hover:bg-white text-slate-700'
                  }`}
                >
                  <span className="text-4xl font-black mb-2">{feature.Symbol}</span>
                  <span className="text-xs font-bold truncate w-full text-center">{feature.Name}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer Area for Send Button */}
      <div className="relative z-10 p-6 bg-white/90 backdrop-blur-md border-t-4 border-orange-200 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] flex justify-center">
        <button
          onClick={handleSendToOven}
          disabled={baked || showOops}
          className={`px-12 py-5 rounded-full font-black text-2xl uppercase tracking-widest transition-all ${
            baked || showOops
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_8px_0_#991b1b] active:shadow-[0_0px_0_#991b1b] active:translate-y-2 cursor-pointer'
          }`}
        >
          {baked ? 'Baking...' : showOops ? 'Oops! Try Again' : 'Send Pizza To Oven'}
        </button>
      </div>
      
      {/* Level Complete Overlay */}
      <AnimatePresence>
        {levelComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="flex flex-col items-center p-12 bg-white border-8 shadow-2xl rounded-3xl border-orange-400"
            >
              <div className="relative mb-6">
                <ChefHat className="w-32 h-32 text-orange-500" />
                <CheckCircle2 className="absolute bottom-0 right-0 w-12 h-12 text-green-500 bg-white rounded-full" />
              </div>
              <h2 className="mb-2 text-5xl font-black text-slate-800">Perfect Bake!</h2>
              <p className="mb-8 text-xl font-bold text-slate-500">You completed all the orders!</p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedLevel(null)}
                  className="px-8 py-4 text-xl font-black text-orange-900 transition-transform bg-orange-100 rounded-xl hover:bg-orange-200 active:scale-95"
                >
                  Back to Map
                </button>
                {selectedLevel < curriculumLevelsData.length && (
                  <button
                    onClick={() => setSelectedLevel(selectedLevel + 1)}
                    className="flex items-center gap-2 px-8 py-4 text-xl font-black text-white transition-transform bg-orange-500 rounded-xl hover:bg-orange-400 active:scale-95"
                  >
                    Next Shift <Play className="w-6 h-6 fill-current" />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
"""

with open(filepath, 'w') as f:
    f.write(content)
print("Updated Pizzeria.tsx")
