import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { DynamicScore } from './ui/DynamicScore';
import { NoteHelpOverlay } from './ui/NoteHelpOverlay';
import { NoteHelpButton } from './ui/NoteHelpButton';
import { addXP } from '../utils/economy';

interface MatchItProps {
  onBack: () => void;
  onComplete: (score: number) => void;
}

interface PuzzlePiece {
  id: string;
  type: 'symbol' | 'definition';
  content: string; // The text or symbol
  matchId: string; // The ID of the matching piece
  isMatched: boolean;
}

export default function MatchIt({ onBack, onComplete }: MatchItProps) {
  // Hardcoded Level 1 baseline for diagnostic
  const initialSymbols: PuzzlePiece[] = [
    { id: 's1', type: 'symbol', content: '♩', matchId: 'd1', isMatched: false },
    { id: 's2', type: 'symbol', content: 'p', matchId: 'd2', isMatched: false },
    { id: 's3', type: 'symbol', content: 'f', matchId: 'd3', isMatched: false },
    { id: 's4', type: 'symbol', content: '𝅗𝅥', matchId: 'd4', isMatched: false },
  ];
  
  const initialDefinitions: PuzzlePiece[] = [
    { id: 'd2', type: 'definition', content: 'Piano (Soft)', matchId: 's2', isMatched: false },
    { id: 'd4', type: 'definition', content: 'Minim (2 Beats)', matchId: 's4', isMatched: false },
    { id: 'd1', type: 'definition', content: 'Crotchet (1 Beat)', matchId: 's1', isMatched: false },
    { id: 'd3', type: 'definition', content: 'Forte (Loud)', matchId: 's3', isMatched: false },
  ];

  const [symbols, setSymbols] = useState<PuzzlePiece[]>(initialSymbols);
  const [definitions, setDefinitions] = useState<PuzzlePiece[]>(initialDefinitions);
  const [draggedItem, setDraggedItem] = useState<PuzzlePiece | null>(null);
  const [showNoteHelp, setShowNoteHelp] = useState(false);

  const handleDragStart = (e: React.DragEvent, piece: PuzzlePiece) => {
    setDraggedItem(piece);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetPiece: PuzzlePiece) => {
    e.preventDefault();
    if (!draggedItem) return;

    if (draggedItem.type !== targetPiece.type && draggedItem.matchId === targetPiece.id) {
      // Match successful!
      addXP(5);
      setSymbols(prev => prev.map(p => 
        (p.id === draggedItem.id || p.id === targetPiece.id) ? { ...p, isMatched: true } : p
      ));
      setDefinitions(prev => prev.map(p => 
        (p.id === draggedItem.id || p.id === targetPiece.id) ? { ...p, isMatched: true } : p
      ));

      // Check if all matched
      const allMatchedNow = symbols.filter(s => s.isMatched).length + 1 === symbols.length;
      if (allMatchedNow) {
        setTimeout(() => {
          onComplete(100);
        }, 2000);
      }
    }
    
    setDraggedItem(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center" id="match-it-diagnostic">
      {/* Header */}
      <div className="w-full bg-indigo-900 text-white p-4 flex items-center justify-between shadow-md z-10">
        <button
          onClick={onBack}
          className="p-2 bg-indigo-800 hover:bg-indigo-700 rounded-lg transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Quit
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-black tracking-wider uppercase">Expression Ninja</h1>
          <p className="text-xs text-indigo-300">Match the Concepts</p>
        </div>
        <NoteHelpButton onClick={() => setShowNoteHelp(true)} className="bg-indigo-800 border-indigo-700 hover:bg-indigo-700 w-12 h-12" />
      </div>

      <div className="flex-1 w-full max-w-4xl p-8 flex flex-col">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Connect the Concepts</h2>
          <p className="text-slate-500">Drag a symbol to its correct definition to prove your knowledge!</p>
        </div>

        {/* Puzzle Board */}
        <div className="flex-1 grid grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Symbols */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center mb-2">Symbols</h3>
            {symbols.map(piece => (
              <motion.div
                key={piece.id}
                layout
                draggable={!piece.isMatched}
                onDragStart={(e: any) => handleDragStart(e, piece)}
                onDragOver={handleDragOver}
                onDrop={(e: any) => handleDrop(e, piece)}
                className={`relative p-6 rounded-xl border-2 transition-all flex items-center justify-center min-h-[100px] ${
                  piece.isMatched 
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700 opacity-50 scale-[0.98]' 
                    : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-400 cursor-grab active:cursor-grabbing shadow-sm'
                }`}
              >
                <span className={`text-4xl ${piece.content.length > 2 ? 'font-serif' : 'font-sans font-bold'}`}>
                  {piece.content}
                </span>
                
                {!piece.isMatched && (
                  <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-8 bg-white border-y-2 border-r-2 border-slate-300 rounded-r-lg shadow-sm z-10" />
                )}
                {piece.isMatched && (
                  <CheckCircle2 className="absolute right-4 text-emerald-500 w-6 h-6" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Right Column: Definitions */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center mb-2">Definitions</h3>
            {definitions.map(piece => (
              <motion.div
                key={piece.id}
                layout
                draggable={!piece.isMatched}
                onDragStart={(e: any) => handleDragStart(e, piece)}
                onDragOver={handleDragOver}
                onDrop={(e: any) => handleDrop(e, piece)}
                className={`relative p-6 rounded-xl border-2 transition-all flex items-center justify-center min-h-[100px] ${
                  piece.isMatched 
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700 opacity-50 scale-[0.98]' 
                    : 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:border-indigo-400 cursor-grab active:cursor-grabbing shadow-sm'
                }`}
              >
                {!piece.isMatched && (
                  <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-4 h-6 bg-indigo-50 border-y-2 border-r-2 border-indigo-200 rounded-r-lg shadow-inner z-10" />
                )}
                <span className="text-lg font-bold">
                  {piece.content}
                </span>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
      <NoteHelpOverlay isOpen={showNoteHelp} onClose={() => setShowNoteHelp(false)} defaultView="notes" />
    </div>
  );
}
