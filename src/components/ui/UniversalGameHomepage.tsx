import React from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { DynamicScore } from './DynamicScore';
import { useInstrument } from '../../contexts/InstrumentContext';
import { FingeringChart } from './FingeringChart';
import { BrassFingeringChart } from './BrassFingeringChart';
import { FluteFingeringChart } from './FluteFingeringChart';
import { SaxophoneFingeringChart } from './SaxophoneFingeringChart';
import { ViolinFingeringChart } from './ViolinFingeringChart';
import { PianoFingeringChart } from './PianoFingeringChart';
import { CelloFingeringChart } from './CelloFingeringChart';
import { VoicePitchDisplay } from './VoicePitchDisplay';
import { NoteHelpButton } from './NoteHelpButton';
import { BackButton } from './BackButton';
import { formatAccidentals, formatVexFlowKey } from '../../utils/musicFormatter';

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
  isUnlocked: boolean;
  cardTheme: string; // TailWind classes for the card background/borders
  textTheme: string; // TailWind classes for the text
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
  headerFont = 'font-display',
  levels,
  onLevelSelect,
  onBack,
  onNoteHelp
}) => {
  const { instrument } = useInstrument();
  const bassClefInstruments = ['Trombone', 'Tuba', 'Baritone/Euphonium', 'Cello', 'Double Bass', 'Bass Guitar'];
  const clef = bassClefInstruments.includes(instrument) ? 'bass' : 'treble';


  return (
    <div className={`relative w-full h-screen overflow-hidden flex flex-col items-center justify-between py-8 select-none ${backgroundClass}`}>
      <div className={`w-full max-w-7xl mx-auto flex flex-col h-full relative z-10 pt-6 pb-6 gap-6`}>
        
        <BackButton onClick={onBack} label="Back to Map" />

        {/* HEADER SECTION */}
        <div className="w-full flex justify-between items-center px-6 relative z-20 mt-16">
          <div className="flex items-center gap-2 px-4 py-2 opacity-0">
            {/* Invisible placeholder for flex alignment */}
            <ArrowLeft className="w-5 h-5" /> Back
          </div>
          {onNoteHelp && (
            <NoteHelpButton onClick={onNoteHelp} className="bg-black/20 hover:bg-black/40 border-white/10 backdrop-blur-md" />
          )}
        </div>
      </div>

      <div className="w-full text-center relative z-20 mb-4 flex justify-center">
        <h1 className={`text-4xl md:text-6xl ${headerFont} font-black ${titleColorClass} tracking-wider uppercase bg-slate-900/80 px-10 py-4 rounded-full border-4 border-white shadow-2xl drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]`}>
          {gameTitle}
        </h1>
      </div>

      {/* LEVEL CAROUSEL (Middle 2/3) */}
      <div className="w-full flex-1 flex items-center relative z-20">
        <div className="w-full h-[65vh] md:h-[60vh] flex items-center overflow-x-auto snap-x snap-mandatory px-[10vw] gap-8 pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Tailwind Safelist for dynamic button colors: bg-purple-600 bg-sky-600 bg-amber-600 bg-emerald-600 bg-rose-600 bg-fuchsia-600 bg-indigo-600 bg-orange-600 bg-cyan-600 bg-teal-600 bg-blue-600 bg-pink-600 border-purple-500 border-sky-500 border-amber-500 border-emerald-500 border-rose-500 border-fuchsia-500 border-indigo-500 border-orange-500 border-cyan-500 border-teal-500 border-blue-500 border-pink-500 shadow-purple-500/60 shadow-sky-500/60 shadow-amber-500/60 shadow-emerald-500/60 shadow-rose-500/60 shadow-fuchsia-500/60 shadow-indigo-500/60 shadow-orange-500/60 shadow-cyan-500/60 shadow-teal-500/60 shadow-blue-500/60 shadow-pink-500/60 */}
          {levels.map((level, index) => {
            const isCompleted = level.completionPercentage === 100;
            const isExtra = level.id % 1 !== 0;
            const isExtraCompleted = isExtra && isCompleted;
            const themeBase = level.textTheme ? level.textTheme.replace('text-', '').replace(/-[0-9]+$/, '') : 'purple';
            const btnColorClass = isExtraCompleted ? 'bg-pink-600' : `bg-${themeBase}-600`;
            const textTheme = isExtraCompleted ? 'text-pink-400' : (level.textTheme || '');
            const cardThemeClass = isExtraCompleted ? 'border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.15)]' : (level.cardTheme ? level.cardTheme.replace(/bg-slate-[0-9]+/, '') : 'border-white/10');
            const completedBorderClass = `border-[6px] border-${isExtraCompleted ? 'pink' : themeBase}-500 shadow-[0_0_25px_rgba(0,0,0,0.5)] shadow-${isExtraCompleted ? 'pink' : themeBase}-500/60`;
            
            return (
            <motion.div
              key={level.id}
              className={`min-w-[280px] w-[75vw] max-w-[340px] h-full flex-shrink-0 snap-center rounded-3xl p-6 shadow-2xl flex flex-col relative transition-all ${isCompleted ? completedBorderClass : cardThemeClass} ${gameTitle === 'Music Pizzeria' ? 'bg-[#F5DEB3]/60' : 'bg-slate-900/40'} backdrop-blur-md ${!level.isUnlocked ? 'opacity-80 grayscale-[0.5]' : 'hover:-translate-y-2 cursor-pointer'}`}
              onClick={() => {
                if (level.isUnlocked) onLevelSelect(level.id);
              }}
              whileHover={level.isUnlocked ? { scale: 1.02 } : {}}
              whileTap={level.isUnlocked ? { scale: 0.98 } : {}}
            >
              {/* Subtle Color Tint Overlay */}
              <div className={`absolute inset-0 rounded-3xl opacity-10 pointer-events-none ${btnColorClass}`} />
              
              {!level.isUnlocked && (
                <div className={`absolute inset-0 ${gameTitle === 'Music Pizzeria' ? 'bg-[#F5DEB3]/40' : 'bg-slate-900/40'} rounded-3xl z-10 flex items-center justify-center backdrop-blur-sm`}>
                  <div className={`p-4 rounded-full ${gameTitle === 'Music Pizzeria' ? 'bg-[#D4C4A8]/80' : 'bg-slate-800/80'}`}>
                    <Lock className={`w-8 h-8 ${gameTitle === 'Music Pizzeria' ? 'text-black/30' : 'text-white/50'}`} />
                  </div>
                </div>
              )}
              
              {/* Card Header */}
              <div className="border-b border-black/10 pb-4 mb-4 relative">
                {level.completionPercentage !== undefined && (
                  <div className={`absolute top-0 right-0 px-2 py-1 rounded-lg text-xs font-black ${gameTitle === 'Music Pizzeria' ? 'bg-black/20 text-black/70' : 'bg-black/40 text-white/80'}`}>
                    {level.completionPercentage}%
                  </div>
                )}
                <h2 className={`text-5xl font-black uppercase tracking-wide ${textTheme} drop-shadow-md [-webkit-text-stroke:1.5px_rgba(255,255,255,0.8)]`}>
                  {level.title}
                </h2>
              </div>

              {/* Card Content Data */}
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto hide-scrollbar pr-2 pb-2">
                {/* VEXFLOW NOTES FOR ROCKET READING */}
                {gameTitle === 'Rocket Reading' && level.introducedNotes && level.introducedNotes.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    <p className={`text-lg font-black uppercase ${level.textTheme || 'text-purple-400'} mb-1 drop-shadow-sm`}>Target Notes</p>
                    <div className="bg-white/95 rounded-xl p-3 shadow-inner border border-black/10 flex flex-col items-center max-w-full overflow-x-auto overflow-y-hidden">
                      <div className="scale-90 transform origin-left">
                        <DynamicScore clef={clef as any} 
                          notes={level.introducedNotes.map((n: any) => ({ keys: [formatVexFlowKey(n.writtenNote, clef)], duration: "q", label: formatAccidentals(n.label) }))} 
                          width={Math.max(120, level.introducedNotes.length * 60 + 40) + (level.keySignature ? 60 : 0)} 
                          height={160} 
                          keySignature={level.keySignature}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* MUSIC PIZZERIA DETAILS */}
                {gameTitle === 'Music Pizzeria' && (
                  <div className="flex flex-col gap-2 mt-2 text-white drop-shadow-md">
                    {level.targetNotes && (
                      <div className="bg-black/30 rounded-xl p-3 border border-white/10 shadow-inner flex flex-col items-center">
                        <span className="font-black text-sm text-white/80 uppercase tracking-widest mb-1">Target Notes</span>
                        <span className="font-bold text-2xl leading-tight">{level.targetNotes}</span>
                      </div>
                    )}
                    <div className="flex flex-row gap-2 w-full">
                      {level.targetRhythms && (
                        <div className="bg-black/30 rounded-xl py-3 px-1 border border-white/10 shadow-inner flex flex-col flex-1 items-center justify-center">
                          <span className="font-black text-[10px] text-white/80 uppercase tracking-widest mb-1">Rhythms</span>
                          <span className="font-bold text-5xl leading-tight">{level.targetRhythms}</span>
                        </div>
                      )}
                      {level.targetExpressions && (
                        <div className="bg-black/30 rounded-xl py-3 px-1 border border-white/10 shadow-inner flex flex-col flex-1 items-center justify-center">
                          <span className="font-black text-[10px] text-white/80 uppercase tracking-widest mb-1">Expressions</span>
                          <span className="font-bold text-5xl leading-tight">{level.targetExpressions}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* FINGERING CHARTS FOR INTRODUCED NOTES */}
                {(gameTitle === 'Finger Fishing') && level.introducedNotes && level.introducedNotes.length > 0 && (() => {
                  const isVertical = ['Clarinet', 'Alto Saxophone', 'Tenor Saxophone'].includes(instrument);
                  const isString = ['Violin'].includes(instrument);

                  if (isString) {
                    const combinedFingering = level.introducedNotes!.map(n => (n.fingeringDisplay || n.fingering || "").split(' OR ')[0]).join(', ');
                    return (
                      <div className="flex flex-col items-center bg-black/30 rounded-xl p-3 border border-white/10 shadow-inner mt-2 flex-shrink-0 w-full">
                        <span className="text-white font-black text-xl mb-2 drop-shadow-md">Target Notes</span>
                        <div className="relative w-full h-[180px] flex justify-center">
                          <div className="absolute left-1/2 -translate-x-1/2 origin-top scale-[0.55]">
                             {instrument === 'Violin' && <ViolinFingeringChart fingeringString={combinedFingering} showNoteNames={true} />}
                             {instrument === 'Cello' && <CelloFingeringChart fingeringString={combinedFingering} showNoteNames={true} />}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (isVertical) {
                     return (
                       <div className="flex flex-col gap-2 mt-2">
                         <p className={`text-lg font-black uppercase ${level.textTheme || 'text-purple-400'} mb-1 drop-shadow-sm`}>Target Notes</p>
                         <div className="grid grid-cols-2 gap-x-4 gap-y-12 mb-4 flex-shrink-0 w-full pb-16">
                         {level.introducedNotes.map((n, i) => {
                           const fingeringString = (n.fingeringDisplay || n.fingering || "").split(' OR ')[0];
                           if (!fingeringString) return null;
                           return (
                             <div key={i} className="flex flex-col items-center bg-black/30 rounded-lg p-2 border border-white/10 shadow-inner w-full">
                               <span className="text-white font-black text-xl mb-3 drop-shadow-md">{formatAccidentals(n.label)}</span>
                               <div className="relative w-full h-[175px]">
                                 <div className="absolute left-1/2 -translate-x-1/2 origin-top scale-[0.45]">
                                   {instrument === 'Clarinet' && <FingeringChart fingeringString={fingeringString} />}
                                   {instrument === 'Alto Saxophone' && <SaxophoneFingeringChart fingeringString={fingeringString} />}
                                   {instrument === 'Tenor Saxophone' && <SaxophoneFingeringChart fingeringString={fingeringString} />}
                                 </div>
                               </div>
                             </div>
                           );
                         })}
                       </div>
                       </div>
                     );
                  }

                  // Horizontal layout (Flute, Trumpet, Voice, Piano)
                  return (
                    <div className="flex flex-col gap-4 mt-2 flex-shrink-0 w-full">
                      <p className={`text-lg font-black uppercase ${level.textTheme || 'text-purple-400'} mb-1 drop-shadow-sm`}>Target Notes</p>
                      {level.introducedNotes.map((n, i) => {
                         const fingeringString = (n.fingeringDisplay || n.fingering || "").split(' OR ')[0];
                         if (!fingeringString) return null;
                         return (
                           <div key={i} className="flex flex-col items-center bg-black/30 rounded-xl p-3 border border-white/10 shadow-inner w-full overflow-hidden">
                             <span className="text-white font-black text-2xl mb-2 drop-shadow-md">{formatAccidentals(n.label)}</span>
                             <div className="relative w-full h-[130px]">
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
                  );
                })()}

                {level.targetSymbols && (
                  <div className="flex-shrink-0">
                    <p className="text-xs font-black uppercase opacity-60 mb-1">Symbols</p>
                    <p className="font-bold text-lg">{level.targetSymbols}</p>
                  </div>
                )}
                {level.targetRhythms && gameTitle !== 'Music Pizzeria' && (
                  <div className="flex-shrink-0">
                    <p className="text-xs font-black uppercase opacity-60 mb-1">Rhythms</p>
                    {gameTitle === 'Rhythm Rapids' ? (
                       <div className="flex flex-wrap gap-2 text-white font-black text-4xl">
                         {level.targetRhythms.split(',').map((r, i) => (
                           <span key={i} className="bg-cyan-900/50 p-2 rounded-xl shadow-inner border border-white/20 px-4">{r.trim()}</span>
                         ))}
                       </div>
                    ) : (
                      <p className="font-bold text-lg">{level.targetRhythms}</p>
                    )}
                  </div>
                )}
                {level.timeSignature && (
                  <div className="flex-shrink-0">
                    <p className="text-xs font-black uppercase opacity-60 mb-1">Time Signature</p>
                    <p className="font-bold text-lg">{level.timeSignature}</p>
                  </div>
                )}
                {level.targetAltitude && (
                  <div className="flex-shrink-0">
                    <p className="text-xs font-black uppercase opacity-60 mb-1">Passing Altitude</p>
                    <p className="font-bold text-lg">{level.targetAltitude}</p>
                  </div>
                )}
                {level.toppingComplexity && (
                  <div className="flex-shrink-0">
                    <p className="text-xs font-black uppercase opacity-60 mb-1">Topping Complexity</p>
                    <p className="font-bold text-lg">{level.toppingComplexity}</p>
                  </div>
                )}
              </div>

              {/* Action Button Indicator */}
              <div className="mt-auto pt-4">
                <div className={`w-full py-3 rounded-xl text-center font-black transition-all text-white shadow-lg ${level.isUnlocked ? btnColorClass + ' hover:opacity-80' : 'bg-black/20 text-white/30'}`}>
                  {level.isUnlocked ? 'Select Level' : 'Locked'}
                </div>
              </div>
            </motion.div>
          )})}
        </div>
      </div>
      
      {/* Add custom CSS to hide scrollbar but keep functionality */}
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
