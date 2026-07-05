import React from 'react';
import { ArrowLeft, BookOpen, Music, ShieldAlert } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Analytics } from '../utils/analyticsService';

interface NoteDetailProps {
  noteName: string;
  onBack: () => void;
}

interface NoteInfo {
  desc: string;
  staveOffset: number; // Position from top of the stave container in px
  hasLedgerLine?: boolean;
  // Fingering array: [Thumb, L1, L2, L3, R1, R2, R3]
  fingers: boolean[];
  fingeringDesc: string;
}

const NOTE_INFO_MAP: Record<string, NoteInfo> = {
  'C': {
    desc: 'Middle C is the anchor note of the piano and clarinet. On sheet music, it sits on a short ledger line below the five main stave lines, looking like a little planet with a ring!',
    staveOffset: 84, // sits well below bottom line
    hasLedgerLine: true,
    fingers: [true, true, true, true, true, true, true], // all covered
    fingeringDesc: 'Thumb (back), all 3 Left Hand holes, and all 3 Right Hand holes are covered.',
  },
  'D': {
    desc: 'Middle D sits in the cozy space directly underneath the bottom line of the stave. It sounds deep, warm, and rich.',
    staveOffset: 72, // sits right below bottom line
    fingers: [true, true, true, true, true, true, false], // all except R3
    fingeringDesc: 'Thumb (back), all 3 Left Hand holes, and top 2 Right Hand holes are covered.',
  },
  'E': {
    desc: 'Middle E sits exactly on the bottom-most line (the 1st line) of the musical stave. It is the very first note clarinet students learn!',
    staveOffset: 60, // sits on bottom line (Line 1)
    fingers: [true, true, false, false, false, false, false], // Thumb + L1
    fingeringDesc: 'Thumb (back) and the top Left Hand pointer finger hole are covered.',
  },
  'F': {
    desc: 'Middle F sits in the space between the 1st line (bottom) and the 2nd line of the stave. It has a beautiful, resonant voice.',
    staveOffset: 48, // sits in bottom space (Space 1)
    fingers: [true, true, true, true, false, false, false], // Thumb + LH all
    fingeringDesc: 'Thumb (back) and all 3 Left Hand holes are covered.',
  },
  'G': {
    desc: 'The note G sits on the 2nd line from the bottom of the stave. It is the "open" note of the clarinet because you do not press any key to play it!',
    staveOffset: 36, // sits on second line (Line 2)
    fingers: [false, false, false, false, false, false, false], // all open
    fingeringDesc: 'All holes are open! Do not press any holes down.',
  },
  'A': {
    desc: 'Note A sits in the space between the 2nd and 3rd line of the stave. It is bright, airy, and beautiful.',
    staveOffset: 24, // sits in second space
    fingers: [false, true, false, false, false, false, false], // L1 throat A
    fingeringDesc: 'Press the front throat A key or Left Hand pointer finger hole.',
  },
  'B': {
    desc: 'Note B sits right in the middle on the 3rd line of the stave. It is a high-spirited note that bridges low and high registers.',
    staveOffset: 12, // sits on third line
    fingers: [true, true, true, true, true, true, true], // using register key
    fingeringDesc: 'Thumb (back), all LH, all RH, plus the speaker/register key on the back!',
  },
};

export const NoteDetail: React.FC<NoteDetailProps> = ({ noteName, onBack }) => {
  // Fallback to 'G' if not found
  const info = NOTE_INFO_MAP[noteName.toUpperCase()] || NOTE_INFO_MAP['G'];

  // Trigger Analytics event on mount
  React.useEffect(() => {
    Analytics.trackHelpMenuOpened(noteName);
  }, [noteName]);

  return (
    <div className="w-full bg-slate-50 min-h-screen text-slate-800 p-6 flex flex-col items-center select-none" id="note-detail-container">
      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          aria-label="Back to Library"
          className="bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Library
        </Button>

        <div className="flex items-center gap-2">
          <BookOpen className="text-blue-600 w-6 h-6" />
          <h1 className="text-xl font-display font-bold text-slate-700">Note Encyclopedia</h1>
        </div>
      </div>

      {/* Main Content */}
      <Card className="w-full max-w-5xl bg-white border border-slate-200 shadow-xl p-8 flex flex-col gap-8">
        {/* Title */}
        <div className="text-center md:text-left border-b border-slate-100 pb-5">
          <h2 className="text-3xl md:text-4xl font-display font-black text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
            <span className="bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-mono shadow-md animate-pulse">
              {noteName}
            </span>
            The Note {noteName}
          </h2>
          <p className="text-sm text-slate-400 mt-1 uppercase tracking-wider font-semibold font-display">
            Clarinet Reference Guide
          </p>
        </div>

        {/* 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Column 1: Description */}
          <div className="flex flex-col justify-between bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <div>
              <h3 className="text-lg font-display font-bold text-slate-800 mb-3 flex items-center gap-2 border-b border-slate-200/60 pb-2">
                <Music className="text-blue-500 w-5 h-5" />
                Description
              </h3>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed font-sans">
                {info.desc}
              </p>
            </div>
            
            <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-start gap-2.5">
              <ShieldAlert className="text-blue-600 w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 font-medium leading-relaxed">
                <strong>Pedagogy Tip:</strong> Keep your fingers close to the holes even when not playing so you can close them quickly and smoothly!
              </p>
            </div>
          </div>

          {/* Column 2: The Stave */}
          <div className="flex flex-col items-center bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
            <h3 className="text-lg font-display font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200/60 pb-2 w-full justify-center">
              <span>🎼</span>
              Sheet Music Stave
            </h3>

            {/* Stave Drawing Canvas */}
            <div className="relative w-56 h-40 bg-[#fffdfa] border-2 border-slate-200 rounded-xl shadow-inner flex items-center justify-center">
              {/* 5 lines */}
              <div className="relative w-44 h-24">
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-slate-900" />
                <div className="absolute inset-x-0 top-[18px] h-[1.5px] bg-slate-900" />
                <div className="absolute inset-x-0 top-[36px] h-[1.5px] bg-slate-900" />
                <div className="absolute inset-x-0 top-[54px] h-[1.5px] bg-slate-900" />
                <div className="absolute inset-x-0 top-[72px] h-[1.5px] bg-slate-900" />

                {/* Treble Clef */}
                <span className="absolute left-1 top-[-2px] text-4xl font-bold text-slate-800 pointer-events-none select-none">
                  🎼
                </span>

                {/* Ledger Line for Middle C */}
                {info.hasLedgerLine && (
                  <div
                    className="absolute left-[88px] h-[2px] w-10 bg-slate-950"
                    style={{ top: `${info.staveOffset + 5}px` }}
                  />
                )}

                {/* Whole Note (Semibreve) positioned programmatically */}
                <div
                  className="absolute left-[98px] w-[18px] h-3.5 border-[3px] border-slate-950 rounded-full rotate-[-12deg] bg-white flex items-center justify-center transition-all duration-300"
                  style={{ top: `${info.staveOffset - 2}px` }}
                >
                  {/* Subtle inner center shading */}
                  <div className="w-1.5 h-1 bg-slate-100 rounded-full" />
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-4 leading-relaxed font-mono font-medium bg-white px-3 py-1.5 border border-slate-200/60 rounded-lg">
              Treble Clef: Note {noteName}
            </p>
          </div>

          {/* Column 3: The Fingering Chart */}
          <div className="flex flex-col items-center bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
            <h3 className="text-lg font-display font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200/60 pb-2 w-full justify-center">
              <span>🥢</span>
              Fingering Chart
            </h3>

            {/* Vertical Clarinet Fingering Visualizer (Non-Interactive) */}
            <div className="relative w-28 py-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center gap-3 shadow-sm scale-105">
              {/* Back Thumb (Left offset) */}
              <div className="flex items-center w-full justify-start pl-4">
                <div
                  className={`w-5 h-5 rounded-full border-2 border-slate-800 transition-all ${
                    info.fingers[0] ? 'bg-slate-900' : 'bg-slate-50'
                  }`}
                />
                <span className="text-[8px] font-bold uppercase font-mono text-slate-500 ml-1.5">Thumb</span>
              </div>

              <div className="w-5/6 h-[1.5px] bg-slate-100" />

              {/* Left Hand (3 stacked circles) */}
              <div className="flex flex-col gap-1.5 items-center">
                <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Left Hand</span>
                {[1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-5 h-5 rounded-full border-2 border-slate-800 transition-all ${
                      info.fingers[idx] ? 'bg-slate-900' : 'bg-slate-50'
                    }`}
                  />
                ))}
              </div>

              <div className="w-5/6 h-[1.5px] bg-slate-100" />

              {/* Right Hand (3 stacked circles) */}
              <div className="flex flex-col gap-1.5 items-center">
                <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Right Hand</span>
                {[4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    className={`w-5 h-5 rounded-full border-2 border-slate-800 transition-all ${
                      info.fingers[idx] ? 'bg-slate-900' : 'bg-slate-50'
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-5 font-semibold bg-white px-3 py-2 border border-slate-100 rounded-xl leading-snug">
              {info.fingeringDesc}
            </p>
          </div>

        </div>
      </Card>
    </div>
  );
};
