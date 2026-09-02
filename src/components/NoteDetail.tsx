import React from 'react';
import { ArrowLeft, BookOpen, Music, ShieldAlert } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Analytics } from '../utils/analyticsService';
import { DynamicScore } from './ui/DynamicScore';
import { FingeringChart } from './ui/FingeringChart';
import { BrassFingeringChart } from './ui/BrassFingeringChart';
import { FluteFingeringChart } from './ui/FluteFingeringChart';
import { SaxophoneFingeringChart } from './ui/SaxophoneFingeringChart';
import { ViolinFingeringChart } from './ui/ViolinFingeringChart';
import { CelloFingeringChart } from './ui/CelloFingeringChart';
import { PianoFingeringChart } from './ui/PianoFingeringChart';
import { VoicePitchDisplay } from './ui/VoicePitchDisplay';
import { NoteType } from './MusicalGlossary';
import { formatAccidentals, formatVexFlowKey } from '../utils/musicFormatter';
import { useInstrument } from '../contexts/InstrumentContext';

interface NoteDetailProps {
  note: NoteType;
  onBack: () => void;
}

import masterDescriptions from '../data/masterDescriptions.json';

export const NoteDetail: React.FC<NoteDetailProps> = ({ note, onBack }) => {
  const [activeFingeringIndex, setActiveFingeringIndex] = React.useState(0);
  const displayString = note.fingeringDisplay || note.fingering;
  const fingerings = displayString.split(/ OR | or /);
  const currentFingering = fingerings[activeFingeringIndex] || fingerings[0];
  
  const { instrument } = useInstrument();
  const bassClefInstruments = ['Trombone', 'Tuba', 'Baritone/Euphonium', 'Cello', 'Double Bass', 'Bass Guitar'];
  const clef = bassClefInstruments.includes(instrument) ? 'bass' : 'treble';
const masterDesc = (masterDescriptions as any)[clef.charAt(0).toUpperCase() + clef.slice(1)]?.[note.writtenNote] || note.description;

  const isSuperHigh = note.writtenNote === 'B6' || note.writtenNote === 'C7';
  // Trigger Analytics event on mount
  React.useEffect(() => {
    Analytics.trackHelpMenuOpened(note.label);
  }, [note]);

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
            <span className="bg-blue-600 text-white min-w-12 h-12 px-4 rounded-2xl flex items-center justify-center text-2xl font-mono shadow-md animate-pulse">
              {formatAccidentals(note.label)}
            </span>
            The Note {formatAccidentals(note.label)}
          </h2>
          <p className="text-sm text-slate-400 mt-1 uppercase tracking-wider font-semibold font-display">
            {instrument} Reference Guide
          </p>
        </div>

        {/* 2 Columns: Stave & Fingering */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Column 1: The Stave */}
          <div className="flex flex-col items-center bg-slate-50 rounded-2xl p-8 border border-slate-100 text-center shadow-sm">
            <h3 className="text-xl font-display font-black text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200/60 pb-2 w-full justify-center">
              <span>🎼</span>
              Sheet Music Stave
            </h3>

            {/* Stave Drawing Canvas */}
            <div className={`relative w-72 ${isSuperHigh ? 'h-72' : 'h-56'} bg-[#fffdfa] border-4 border-slate-200 rounded-xl shadow-inner flex items-center justify-center overflow-hidden`}>
              <div className={`scale-[1.5] origin-center -ml-2 ${isSuperHigh ? 'mt-4' : '-mt-2'}`}>
                <DynamicScore clef={(note.clef || clef) as any} 
                  notes={[{ keys: [formatVexFlowKey(note.writtenNote, note.clef || clef)], duration: "w" }]} 
                  width={140} 
                  height={isSuperHigh ? 220 : 130} 
                />
              </div>
            </div>

            <p className="text-sm text-slate-500 mt-6 font-mono font-bold bg-white px-4 py-2 border border-slate-200/60 rounded-xl">
              Written As: {formatAccidentals(note.writtenNote)}
            </p>
          </div>

          {/* Column 2: The Fingering Chart */}
          <div className="flex flex-col items-center bg-slate-50 rounded-2xl p-8 border border-slate-100 text-center shadow-sm">
            <h3 className="text-xl font-display font-black text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200/60 pb-2 w-full justify-center">
              <span>🥢</span>
              Fingering Chart
            </h3>

            <div className="w-full flex flex-col items-center justify-center min-h-[224px]">
              {instrument === 'Clarinet' && <FingeringChart fingeringString={currentFingering} />}
              {(instrument === 'Trumpet' || instrument === 'Baritone/Euphonium') && <BrassFingeringChart fingeringString={currentFingering} />}
              {instrument === 'Flute' && <FluteFingeringChart fingeringString={currentFingering} />}
              {instrument === 'Alto Saxophone' && <SaxophoneFingeringChart fingeringString={currentFingering} />}
              {instrument === 'Tenor Saxophone' && <SaxophoneFingeringChart fingeringString={currentFingering} />}
              {instrument === 'Violin' && <ViolinFingeringChart fingeringString={currentFingering} showNoteNames={true} />}
              {instrument === 'Cello' && <CelloFingeringChart fingeringString={currentFingering} showNoteNames={true} />}
              {instrument === 'Piano' && <PianoFingeringChart fingeringString={currentFingering} showNoteNames={true} />}
              {instrument.includes('Voice') && <VoicePitchDisplay fingeringString={currentFingering} />}
              {(!['Clarinet', 'Trumpet', 'Flute', 'Alto Saxophone', 'Tenor Saxophone', 'Violin', 'Cello', 'Piano', 'Soprano Voice', 'Alto Voice', 'Tenor Voice', 'Bass Voice', 'Baritone/Euphonium'].includes(instrument)) && (
                <p className="text-slate-400 italic">Chart for {instrument} coming soon!</p>
              )}
            </div>

            {fingerings.length > 1 && (
              <Button
                variant="primary"
                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all active:scale-95"
                onClick={() => setActiveFingeringIndex((prev) => (prev + 1) % fingerings.length)}
              >
                🔄 View Alternate Fingering
              </Button>
            )}

            <p className="text-sm text-slate-600 mt-6 font-semibold bg-white px-4 py-3 border border-slate-100 rounded-xl leading-snug w-full">
              <strong>Code:</strong> {currentFingering}
            </p>
          </div>

        </div>

        {/* Bottom Section: Description & Tips */}
        <div className="flex flex-col bg-blue-50/50 rounded-2xl p-8 border border-blue-100 mt-4">
          <h3 className="text-xl font-display font-black text-slate-800 mb-4 flex items-center gap-2 border-b border-blue-200 pb-3">
            <BookOpen className="text-blue-500 w-6 h-6" />
            Description & Details
          </h3>
          <p className="text-slate-700 text-lg leading-relaxed font-sans font-medium mb-6 whitespace-pre-line">
            {formatAccidentals(masterDesc)}
          </p>
          
          {/* Fingering & Tips */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col gap-8 items-start">
            <div className="flex-1 w-full">
              <h3 className="text-xl font-display font-black text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-amber-100 text-amber-600 p-2 rounded-xl">💡</span>
                Fingering Guide
              </h3>
              <p className="text-slate-600 font-medium text-lg leading-relaxed mb-4">
                <strong>Curriculum Shorthand:</strong> <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-800">{currentFingering || 'Not specified'}</span>
              </p>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                <p className="text-blue-800 font-medium">
                  <em>More advanced keys (register key, side keys, and pinkies) will automatically appear in the chart above if required by the note.</em>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
