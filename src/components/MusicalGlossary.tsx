import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, Music, Search, X } from 'lucide-react';
import { NoteDetail } from './NoteDetail';
import { Curriculums, MusicalFeatures, RhythmsExpressions } from '../data';
import { useInstrument } from '../contexts/InstrumentContext';
import { formatAccidentals, formatVexFlowKey } from '../utils/musicFormatter';
import { DynamicScore } from './ui/DynamicScore';

interface MusicalGlossaryProps {
  onBack: () => void;
  defaultView?: 'hub' | 'symbols' | 'notes';
}

type ViewState = 'hub' | 'symbols' | 'notes';
export interface NoteType {
  label: string;
  writtenNote: string;
  fingering: string;
  fingeringDisplay?: string;
  description: string;
}

export default function MusicalGlossary({ onBack, defaultView }: MusicalGlossaryProps) {
  const [view, setView] = useState<ViewState>(defaultView || 'hub');
  const { instrument } = useInstrument();
  const bassClefInstruments = ['Trombone', 'Tuba', 'Baritone/Euphonium', 'Cello', 'Double Bass', 'Bass Guitar'];
  const clef = bassClefInstruments.includes(instrument) ? 'bass' : 'treble';
const rawData = Curriculums[instrument as keyof typeof Curriculums] || Curriculums['Clarinet'] || [];
  const rocketLevelsData: any[] = Array.isArray(rawData) ? rawData : (rawData as any).default || [];
  const [selectedNote, setSelectedNote] = useState<NoteType | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<any | null>(null);

  const savedExpressionProgress = localStorage.getItem('expressionLevelProgress');
  const expressionProgress = savedExpressionProgress ? JSON.parse(savedExpressionProgress) : {};
  
  const savedRhythmProgress = localStorage.getItem('rhythmLevelProgress');
  const rhythmProgress = savedRhythmProgress ? JSON.parse(savedRhythmProgress) : {};
  
  const savedPizzeriaProgress = localStorage.getItem('pizzeriaLevelProgress');
  const pizzeriaProgress = savedPizzeriaProgress ? JSON.parse(savedPizzeriaProgress) : {};

  const combinedSymbolsMap: Record<number, { symbolData: any; levelId: number; progress: number }[]> = {};

  const addSymbolsToMap = (data: any[], progressMap: Record<string, number>, pizMap: Record<string, number>) => {
    data.forEach((lvl: any) => {
      if (lvl.introducedSymbols) {
        const groupIndex = Math.floor((lvl.id - 1) / 5);
        if (!combinedSymbolsMap[groupIndex]) combinedSymbolsMap[groupIndex] = [];
        
        lvl.introducedSymbols.forEach((sym: any) => {
           combinedSymbolsMap[groupIndex].push({
             symbolData: sym,
             levelId: lvl.id,
             progress: Math.max(progressMap[lvl.id] || 0, pizMap[lvl.id] || 0)
           });
        });
      }
    });
  };

  addSymbolsToMap(MusicalFeatures, expressionProgress, pizzeriaProgress);
  addSymbolsToMap(RhythmsExpressions, rhythmProgress, pizzeriaProgress);

  const symbolGroups = Object.keys(combinedSymbolsMap).map(key => {
    const groupIdx = parseInt(key);
    const start = groupIdx * 5 + 1;
    const end = start + 4;
    return {
      title: `Symbols from levels ${start}-${end}`,
      symbols: combinedSymbolsMap[groupIdx].sort((a, b) => a.levelId - b.levelId)
    };
  }).sort((a, b) => parseInt(a.title.match(/\d+/)![0]) - parseInt(b.title.match(/\d+/)![0]));

  
  const savedProgress = localStorage.getItem('rocketLevelProgress');
  const levelProgress = savedProgress ? JSON.parse(savedProgress) : {};
  
  const levelGroupsMap: Record<number, { noteData: NoteType & { isExtra?: boolean }; levelId: number; progress: number }[]> = rocketLevelsData.reduce((acc: any, lvl: any) => {
    if (lvl.introducedNotes) {
      const groupIndex = Math.floor((lvl.id - 1) / 5);
      if (!acc[groupIndex]) acc[groupIndex] = [];
      const isLevelExtra = lvl.id % 1 !== 0;
      lvl.introducedNotes.forEach((note: NoteType) => {
        acc[groupIndex].push({
          noteData: { ...note, isExtra: isLevelExtra },
          levelId: lvl.id,
          progress: levelProgress[lvl.id] || 0
        });
      });
    }
    return acc;
  }, {});

  const levelGroups = Object.keys(levelGroupsMap).map(key => {
    const groupIdx = parseInt(key);
    const start = groupIdx * 5 + 1;
    const end = start + 4;
    return {
      title: `Notes from levels ${start}-${end}`,
      notes: levelGroupsMap[groupIdx]
    };
  });

  return (
    <div className="absolute inset-0 z-50 bg-slate-50 flex flex-col" id="musical-glossary-arena">
      {/* Header */}
      <div className="bg-white p-4 flex justify-between items-center shadow-sm sticky top-0 z-10 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button onClick={() => view === 'hub' ? onBack() : setView('hub')} className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-all border border-slate-200 shadow-sm flex items-center gap-2 font-bold">
            <ArrowLeft className="w-5 h-5" /> {view === 'hub' ? 'Back' : 'Glossary Hub'}
          </button>
        </div>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-widest hidden sm:flex items-center gap-2">
          MUSICAL GLOSSARY & HELP
        </h1>
        <div className="w-24" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          
          {/* THE HUB (Split-Screen) */}
          {view === 'hub' && (
            <motion.div key="hub" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full flex flex-col justify-center max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[60vh] min-h-[400px]">
                {/* Symbols Gallery Card */}
                <button 
                  onClick={() => setView('symbols')}
                  className="bg-white rounded-[3rem] border-8 border-slate-200 hover:border-blue-400 p-8 flex flex-col items-center justify-center text-center shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all group"
                >
                  <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center text-6xl group-hover:bg-blue-100 transition-colors mb-6 shadow-inner">
                    𝄞
                  </div>
                  <h2 className="text-4xl font-black text-slate-800 uppercase tracking-widest mb-4">Symbols Gallery</h2>
                  <p className="text-lg text-slate-500 font-bold max-w-sm">Look up expressive markings, time signatures, and sheet music directions.</p>
                </button>

                {/* Notes Gallery Card */}
                <button 
                  onClick={() => setView('notes')}
                  className="bg-white rounded-[3rem] border-8 border-slate-200 hover:border-emerald-400 p-8 flex flex-col items-center justify-center text-center shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all group"
                >
                  <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center text-6xl group-hover:bg-emerald-100 transition-colors mb-6 shadow-inner">
                    🎼
                  </div>
                  <h2 className="text-4xl font-black text-slate-800 uppercase tracking-widest mb-4">Notes Gallery</h2>
                  <p className="text-lg text-slate-500 font-bold max-w-sm">View fingering charts and stave positions for every note on your instrument.</p>
                </button>
              </div>
            </motion.div>
          )}

          {/* SYMBOLS GALLERY */}
          {view === 'symbols' && (
            <motion.div key="symbols" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="max-w-5xl mx-auto flex flex-col">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-widest">Symbols Gallery</h2>
                <p className="text-slate-500 font-bold">Your chronological curriculum. Greyed-out symbols are still clickable to peek ahead!</p>
              </div>

              <div className="flex flex-col gap-12">
                {symbolGroups.map((group, idx) => (
                  <div key={idx}>
                    <div className="flex items-center gap-4 mb-6">
                      <h3 className="text-xl font-black text-slate-700 uppercase tracking-widest">{group.title}</h3>
                      <div className="flex-1 h-1 bg-slate-200 rounded-full" />
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {group.symbols.map((item, sIdx) => {
                        const isCleared = item.progress >= 100;
                        const isStarted = item.progress > 0;
                        
                        const borderClass = isCleared 
                            ? 'border-emerald-400 shadow-emerald-100 text-emerald-950 bg-emerald-50' 
                            : isStarted 
                              ? 'border-orange-400 shadow-orange-100 text-orange-950 bg-orange-50'
                              : 'border-slate-200 shadow-sm text-slate-400 opacity-60 grayscale bg-white hover:border-blue-400';
                            
                        const icon = item.symbolData.Notation || item.symbolData.Symbol || '?';
                        return (
                          <button
                            key={sIdx}
                            onClick={() => setSelectedSymbol(item.symbolData)}
                            className={`aspect-square rounded-3xl border-[6px] flex flex-col items-center justify-center p-2 transition-all hover:scale-105 hover:shadow-xl ${borderClass}`}
                          >
                            <span className={`text-6xl mb-2 font-serif ${icon.length > 3 ? 'text-2xl' : (icon.length > 1 ? 'text-4xl' : '')}`}>{icon}</span>
                            <span className="font-bold text-sm text-center uppercase tracking-wider truncate w-full px-2">{item.symbolData.Name}</span>
                            <span className="font-bold text-[10px] uppercase tracking-widest opacity-60 mt-1">Level {item.levelId}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* NOTES GALLERY */}
          {view === 'notes' && (
            <motion.div key="notes" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="max-w-5xl mx-auto flex flex-col">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-widest">Notes Gallery</h2>
                <p className="text-slate-500 font-bold">Your chronological curriculum. Greyed-out notes are still clickable to peek ahead!</p>
              </div>

              <div className="flex flex-col gap-12">
                {levelGroups.map((group, idx) => (
                  <div key={idx}>
                    <div className="flex items-center gap-4 mb-6">
                      <h3 className="text-xl font-black text-slate-700 uppercase tracking-widest">{group.title}</h3>
                      <div className="flex-1 h-1 bg-slate-200 rounded-full" />
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {group.notes.map((item, nIdx) => {
                        const isCleared = item.progress >= 100;
                        const isStarted = item.progress > 0;
                        
                        const borderClass = (item.noteData.isExtra && isCleared)
                          ? 'border-pink-300 shadow-pink-100 text-pink-950 bg-pink-50 hover:border-pink-500'
                          : isCleared 
                            ? 'border-emerald-400 shadow-emerald-100 text-emerald-950 bg-emerald-50' 
                            : isStarted 
                              ? 'border-orange-400 shadow-orange-100 text-orange-950 bg-orange-50'
                              : 'border-slate-200 shadow-sm text-slate-400 opacity-60 grayscale bg-white hover:border-blue-400';
                            
                        const isSuperHigh = item.noteData.writtenNote === 'B6' || item.noteData.writtenNote === 'C7';
                        return (
                          <button
                            key={nIdx}
                            onClick={() => setSelectedNote(item.noteData)}
                            className={`aspect-square rounded-3xl border-[6px] flex flex-col items-center justify-center p-2 transition-all hover:scale-105 hover:shadow-xl ${borderClass}`}
                          >
                            <span className="text-2xl font-black mb-1 leading-none text-center">{formatAccidentals(item.noteData.label)}</span>
                            <div className={`w-full flex-1 flex items-center justify-center -my-3 scale-[0.8] origin-center pointer-events-none ${isSuperHigh ? 'mt-2' : ''}`}>
                              <DynamicScore clef={clef as any} 
                                notes={[{ keys: [formatVexFlowKey(item.noteData.writtenNote)], duration: "w" }]} 
                                width={120} 
                                height={isSuperHigh ? 200 : 130} 
                              />
                            </div>
                            <span className="font-bold text-[10px] uppercase tracking-widest opacity-60">Level {item.levelId}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* NOTE DETAIL MODAL OVERLAY */}
      <AnimatePresence>
        {selectedNote && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/95 backdrop-blur-sm overflow-y-auto">
            <div className="w-full h-full p-0 sm:p-4 sm:max-w-7xl mx-auto flex flex-col relative pt-12 sm:pt-4">
              <NoteDetail note={selectedNote} onBack={() => setSelectedNote(null)} />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* SYMBOL DETAIL MODAL OVERLAY */}
      <AnimatePresence>
        {selectedSymbol && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedSymbol(null)}
                className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-slate-100 rounded-full transition-colors z-10"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
              
              <div className={`pt-12 pb-8 flex flex-col items-center justify-center bg-emerald-50 text-emerald-900`}>
                <span className={`font-serif mb-4 ${((selectedSymbol.Notation || selectedSymbol.Symbol || '').length > 3) ? 'text-5xl' : 'text-8xl'}`}>{selectedSymbol.Notation || selectedSymbol.Symbol || '?'}</span>
                <span className="px-4 py-1 bg-white/50 rounded-full text-sm font-bold uppercase tracking-widest border border-emerald-200">
                  {selectedSymbol.Category || 'Symbol'}
                </span>
              </div>
              
              <div className="p-8 text-center bg-white border-t-8 border-emerald-100">
                <h3 className="text-3xl font-black text-slate-800 uppercase tracking-widest mb-4">
                  {selectedSymbol.Name}
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {selectedSymbol.Description}
                </p>
                {selectedSymbol['Beats (4/4 time)'] && (
                  <p className="mt-4 text-emerald-600 font-bold uppercase tracking-wider text-sm">
                    Beats: {selectedSymbol['Beats (4/4 time)']}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
