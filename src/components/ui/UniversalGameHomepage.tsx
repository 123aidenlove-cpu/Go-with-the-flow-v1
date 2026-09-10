import React, { useState } from 'react';
import { ArrowLeft, Lock, Trophy, Play, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MiniLeaderboard from '../MiniLeaderboard';
import { useInstrument } from '../../contexts/InstrumentContext';
import { BrassFingeringChart } from './BrassFingeringChart';
import { FluteFingeringChart } from './FluteFingeringChart';
import { PianoFingeringChart } from './PianoFingeringChart';
import { VoicePitchDisplay } from './VoicePitchDisplay';
import { NoteHelpButton } from './NoteHelpButton';
import { BackButton } from './BackButton';
import { formatAccidentals, formatVexFlowKey } from '../../utils/musicFormatter';
import { DynamicScore } from './DynamicScore';

export interface LevelCardData {
  id: number;
  title: string;
  targetNotes?: string;
  targetRhythms?: string;
  targetExpressions?: string;
  targetSymbols?: string;
  targetAltitude?: string;
  timeSignature?: string;
  toppingComplexity?: string;
  clef?: string;
  keySignature?: string;
  isUnlocked: boolean;
  cardTheme: string;
  textTheme: string;
  introducedNotes?: { label: string; writtenNote: string; description?: string; fingering?: string; fingeringDisplay?: string; }[];
  completionPercentage?: number;
}

interface UniversalGameHomepageProps {
  gameTitle: string;
  titleColorClass: string; 
  backgroundClass: string; 
  headerFont?: string; 
  levels: LevelCardData[];
  onLevelSelect: (levelId: number) => void;
  onBack: () => void;
  onNoteHelp?: () => void;
}

export const UniversalGameHomepage: React.FC<UniversalGameHomepageProps> = ({
  gameTitle,
  titleColorClass,
  backgroundClass,
  headerFont = 'font-sans',
  levels,
  onLevelSelect,
  onBack,
  onNoteHelp
}) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<LevelCardData | null>(null);
  const { instrument } = useInstrument();
  
  // Chunk levels into biomes (4 levels per biome)
  const biomes = [];
  for (let i = 0; i < levels.length; i += 4) {
    biomes.push(levels.slice(i, i + 4));
  }

  // Check if a biome is unlocked (Biome 0 is always unlocked. Biome N is unlocked if all levels in Biome N-1 are 100% completed)
  const isBiomeUnlocked = (biomeIndex: number) => {
    if (localStorage.getItem('isTeacher') === 'true') return true;
    if (biomeIndex === 0) return true;
    const prevBiome = biomes[biomeIndex - 1];
    return prevBiome.every(l => l.completionPercentage === 100);
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden flex flex-col items-center justify-between py-8 select-none ${backgroundClass}`}>
      <BackButton onClick={onBack} label="Back to Map" />
      
      {/* Top Header Section */}
      <div className="w-full flex justify-end items-center px-6 relative z-20 mt-2 max-w-7xl mx-auto">
        {onNoteHelp && (
          <NoteHelpButton onClick={onNoteHelp} className="bg-black/20 hover:bg-black/40 border-white/10 backdrop-blur-md" />
        )}
      </div>

      <div className="w-full text-center relative z-20 mb-4 flex flex-col items-center justify-center gap-4">
        <h1 className={`text-4xl md:text-6xl ${headerFont} font-black ${titleColorClass} tracking-wider uppercase bg-slate-900/80 px-10 py-4 rounded-full border-4 border-white shadow-2xl drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]`}>
          {gameTitle}
        </h1>
        <button onClick={() => setShowLeaderboard(!showLeaderboard)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-6 py-2 rounded-full font-black uppercase tracking-widest shadow-lg border-2 border-white/50 transition-all active:scale-95 z-50">
          <Trophy className="w-5 h-5" /> View Leaderboards
        </button>

        <AnimatePresence>
          {showLeaderboard && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: -20, scale: 0.95 }} 
              className="absolute top-[110%] w-full max-w-md z-[100]"
            >
              <MiniLeaderboard gameName={gameTitle} instrument={instrument} currentScore={null} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BIOME SWIPE CAROUSEL */}
      <div className="w-full flex-1 flex items-center relative z-20 mb-8">
        <div className="w-full h-full flex items-center overflow-x-auto snap-x snap-mandatory px-[10vw] gap-12 pb-4 hide-scrollbar">
          {biomes.map((biomeLevels, biomeIndex) => {
            const unlocked = isBiomeUnlocked(biomeIndex);
            
            return (
              <motion.div 
                key={biomeIndex}
                className={`snap-center shrink-0 w-[80vw] max-w-4xl h-full max-h-[600px] rounded-3xl border-8 shadow-2xl flex flex-col overflow-hidden relative
                  ${unlocked ? 'border-white bg-slate-800/80 backdrop-blur-md' : 'border-slate-600 bg-slate-900/95 grayscale'}`}
              >
                {/* Biome Background (Can be customized later, currently uses generic styling) */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 z-0" />
                
                <div className="relative z-10 w-full p-6 text-center border-b-4 border-white/20 bg-black/40">
                  <h2 className="text-3xl font-black text-white uppercase tracking-widest">Biome {biomeIndex + 1}</h2>
                  {!unlocked && <p className="text-red-400 font-bold mt-2 flex items-center justify-center gap-2"><Lock className="w-5 h-5"/> Clear Biome {biomeIndex} to Unlock</p>}
                </div>

                <div className="relative z-10 flex-1 p-8 grid grid-cols-2 grid-rows-2 gap-6 place-items-center">
                  {biomeLevels.map((level) => {
                    const isPlayable = unlocked;
                    const isCleared = level.completionPercentage === 100;
                    
                    return (
                      <button
                        key={level.id}
                        disabled={!isPlayable}
                        onClick={() => setSelectedPreview(level)}
                        className={`w-full h-full max-h-48 rounded-2xl border-4 flex flex-col items-center justify-center p-4 transition-all relative overflow-hidden group
                          ${isPlayable 
                            ? `${level.cardTheme} hover:scale-105 active:scale-95 cursor-pointer border-white shadow-xl` 
                            : 'bg-slate-800 border-slate-600 cursor-not-allowed opacity-50'}`}
                      >
                        {isCleared && (
                          <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-lg border-2 border-white z-20">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                        )}
                        
                        <h3 className={`text-2xl md:text-3xl font-black mb-2 ${isPlayable ? level.textTheme : 'text-slate-500'}`}>
                          {level.title}
                        </h3>
                        
                        {isPlayable && (
                          <div className="flex flex-wrap justify-center gap-2 mt-2 max-w-[90%]">
                            {/* Just show note names/symbols on the square */}
                            {level.introducedNotes && level.introducedNotes.length > 0 && (
                              <div className="flex gap-2 bg-white/50 px-3 py-1 rounded-lg font-bold text-lg">
                                {level.introducedNotes.map((n, i) => (
                                  <span key={i}>{formatAccidentals(n.label)}</span>
                                ))}
                              </div>
                            )}
                            {level.targetSymbols && <span className="bg-white/50 px-3 py-1 rounded-lg font-bold text-lg">{level.targetSymbols}</span>}
                            {level.targetRhythms && <span className="bg-white/50 px-3 py-1 rounded-lg font-bold text-lg truncate max-w-[100px]">{level.targetRhythms}</span>}
                          </div>
                        )}
                        
                        {!isPlayable && <Lock className="w-12 h-12 text-slate-600" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* LEVEL PREVIEW MODAL */}
      <AnimatePresence>
        {selectedPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`w-full max-w-2xl bg-white rounded-3xl border-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]`}
            >
              <div className={`w-full p-6 text-center ${selectedPreview.cardTheme} border-b-4 border-black/10`}>
                <h2 className={`text-4xl font-black ${selectedPreview.textTheme}`}>{selectedPreview.title}</h2>
              </div>
              
              <div className="p-8 flex-1 overflow-y-auto flex flex-col items-center gap-8 hide-scrollbar">
                {/* FINGERING CHARTS GO HERE */}
                {selectedPreview.introducedNotes && selectedPreview.introducedNotes.length > 0 && (
                  <div className="w-full">
                    <h3 className="text-2xl font-black text-slate-800 text-center mb-6 uppercase tracking-wider">Target Notes</h3>
                    <div className="flex flex-wrap justify-center gap-8">
                      {selectedPreview.introducedNotes.map((n, i) => {
                         const fingeringString = (n.fingeringDisplay || n.fingering || "").split(' OR ')[0];
                         return (
                           <div key={i} className="flex flex-col items-center bg-slate-100 rounded-2xl p-4 shadow-inner border-2 border-slate-200">
                             <div className="flex items-center gap-4 mb-4">
                               <span className="text-3xl font-black text-slate-800">{formatAccidentals(n.label)}</span>
                               <div className="scale-75 origin-left h-24 flex items-center justify-center -my-4 pointer-events-none">
                                 <DynamicScore clef={selectedPreview.clef as any || 'treble'} keySignature={selectedPreview.keySignature} notes={[{ keys: [formatVexFlowKey(n.writtenNote, selectedPreview.clef || 'treble')], duration: 'q' }]} width={100} height={120} />
                               </div>
                             </div>
                             
                             <div className="relative w-full h-[150px] min-w-[120px] flex justify-center">
                                <div className="absolute left-1/2 -translate-x-1/2 origin-top scale-[0.6]">
                                  {(instrument === 'Trumpet' || instrument === 'Baritone/Euphonium') && <BrassFingeringChart fingeringString={fingeringString} />}
                                  {instrument === 'Flute' && <FluteFingeringChart fingeringString={fingeringString} />}
                                  {instrument === 'Piano' && <PianoFingeringChart fingeringString={fingeringString} />}
                                  {instrument.includes('Voice') && <VoicePitchDisplay fingeringString={fingeringString} />}
                                </div>
                             </div>
                           </div>
                         );
                      })}
                    </div>
                  </div>
                )}

                {selectedPreview.targetRhythms && (
                  <div className="text-center">
                    <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-wider">Target Rhythms</h3>
                    <div className="flex justify-center flex-wrap gap-2 text-3xl font-black text-emerald-600">
                       {selectedPreview.targetRhythms.split(',').map((r, i) => (
                         <span key={i} className="bg-emerald-50 px-4 py-2 rounded-xl border-2 border-emerald-200">{r.trim()}</span>
                       ))}
                    </div>
                  </div>
                )}
                
                {selectedPreview.targetSymbols && (
                  <div className="text-center">
                    <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-wider">Target Symbols</h3>
                    <p className="text-3xl font-black text-purple-600">{selectedPreview.targetSymbols}</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t-4 border-slate-200 flex gap-4">
                <button 
                  onClick={() => setSelectedPreview(null)}
                  className="flex-1 py-4 rounded-2xl font-black text-xl bg-slate-200 hover:bg-slate-300 text-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onLevelSelect(selectedPreview.id);
                    setSelectedPreview(null);
                  }}
                  className={`flex-[2] py-4 rounded-2xl font-black text-2xl text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400`}
                >
                  <Play className="w-8 h-8 fill-current" /> Play Level
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
