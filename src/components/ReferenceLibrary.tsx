import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Music, CornerDownLeft, HelpCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { NoteDetail } from './NoteDetail';
import { Analytics } from '../utils/analyticsService';

interface ReferenceLibraryProps {
  onBack: () => void;
}

export const ReferenceLibrary: React.FC<ReferenceLibraryProps> = ({ onBack }) => {
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [advancedTopic, setAdvancedTopic] = useState<string | null>(null);

  const handleSelectNote = (note: string) => {
    // Increment the Source of Truth open counter
    const opensStr = localStorage.getItem('sourceOfTruthOpens') || '0';
    const opens = parseInt(opensStr, 10) + 1;
    localStorage.setItem('sourceOfTruthOpens', String(opens));
    
    Analytics.trackHelpMenuOpened(note);
    setSelectedNote(note);
  };

  const handleSelectAdvanced = (topic: string) => {
    setAdvancedTopic(topic);
  };

  if (selectedNote) {
    return (
      <NoteDetail
        noteName={selectedNote}
        onBack={() => setSelectedNote(null)}
      />
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen text-slate-800 p-6 flex flex-col items-center select-none" id="reference-library-container">
      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          aria-label="Back to Concert Hall"
          className="bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Concert Hall
        </Button>

        <div className="flex items-center gap-2">
          <BookOpen className="text-blue-600 w-6 h-6" />
          <h1 className="text-xl font-display font-bold text-slate-700">Source of Truth</h1>
        </div>
      </div>

      <div className="w-full max-w-5xl text-center mb-10">
        <h2 className="text-4xl font-display font-black text-slate-900 tracking-tight">
          Help with the Notes?
        </h2>
        <p className="text-slate-500 mt-2 text-sm md:text-base font-medium max-w-lg mx-auto">
          Unlock your musical potential! Choose a natural note to see its sheet music staff position and clarinet keys.
        </p>
      </div>

      {advancedTopic ? (
        <Card className="w-full max-w-3xl bg-white border border-slate-200 shadow-xl p-8 mb-8 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-2xl font-display font-bold text-slate-900">
              {advancedTopic === 'high' && 'Very High Notes'}
              {advancedTopic === 'low' && 'Very Low Notes'}
              {advancedTopic === 'flats' && 'Flats, Sharps & Naturals'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAdvancedTopic(null)}
              className="bg-slate-50 hover:bg-slate-100"
            >
              Back to Directory
            </Button>
          </div>

          {advancedTopic === 'high' && (
            <div className="space-y-4 text-slate-600">
              <p>
                When notes go way above the 5-line stave (like high C, D, or E), we use additional helper lines called <strong>ledger lines</strong>.
              </p>
              <p>
                To play notes in this register on the clarinet, you cover your regular finger holes and engage the <strong>Register Key</strong> (on the back, operated by your left thumb). This acts as a octave vent that splits the air column, allowing the note to jump up by a musical interval of a twelfth!
              </p>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center gap-2">
                <span className="text-xl">🚀</span>
                <span className="text-xs font-semibold text-blue-800 uppercase">Pro tip: Blow faster, highly focused air to support high notes!</span>
              </div>
            </div>
          )}

          {advancedTopic === 'low' && (
            <div className="space-y-4 text-slate-600">
              <p>
                Very low notes (like low E, F, or G below middle C) sit below the stave, requiring multiple ledger lines.
              </p>
              <p>
                These low notes produce a deep, wooden tone (called the <strong>chalumeau register</strong>). To play them, you close nearly all the finger holes on your instrument, including both your left and right hand joints.
              </p>
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center gap-2">
                <span className="text-xl">💨</span>
                <span className="text-xs font-semibold text-orange-800 uppercase">Pro tip: Relax your jaw and blow warm, broad air for rich low notes!</span>
              </div>
            </div>
          )}

          {advancedTopic === 'flats' && (
            <div className="space-y-4 text-slate-600">
              <p>
                Accidentals change the pitch of notes by a half-step:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Flat (♭):</strong> Lowers the pitch by one half-step. It makes the note sound slightly lower!</li>
                <li><strong>Sharp (♯):</strong> Raises the pitch by one half-step. It makes the note sound slightly higher!</li>
                <li><strong>Natural (♮):</strong> Cancels a previous flat or sharp, returning the note to its normal "natural" pitch.</li>
              </ul>
              <p>
                On the clarinet, flats and sharps are played using specialized side keys (spatula keys) or custom "forked" fingerings!
              </p>
            </div>
          )}
        </Card>
      ) : (
        <div className="w-full max-w-5xl flex flex-col gap-10">
          
          {/* SECTION A: THE BASICS */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <Music size={14} className="text-blue-500" />
              The Basics
            </h3>

            {/* Grid of 7 Notes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
              {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((note) => (
                <button
                  key={note}
                  onClick={() => handleSelectNote(note)}
                  aria-label={`Learn about the note ${note}`}
                  className="bg-white border border-slate-200/80 shadow-md hover:shadow-xl hover:border-blue-300 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-150 cursor-pointer active:scale-95 text-center group"
                >
                  <span className="text-3xl font-display font-black text-slate-700 group-hover:text-blue-600 transition-colors">
                    {note}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold font-display group-hover:text-blue-400">
                    View Fingering
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* SECTION B: THE ADVANCED */}
          <section className="space-y-4 bg-slate-100 p-8 rounded-3xl border border-slate-200/60 shadow-inner">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <HelpCircle size={14} className="text-slate-500" />
              Not one of these?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Very High Notes */}
              <button
                onClick={() => handleSelectAdvanced('high')}
                className="bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 rounded-2xl p-5 flex items-center justify-between text-left transition-all duration-150 cursor-pointer group active:scale-[0.98]"
              >
                <div>
                  <h4 className="font-display font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-base">
                    Very High Notes (?)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Notes high above the stave.
                  </p>
                </div>
                {/* Micro stave drawing */}
                <div className="w-12 h-8 bg-[#fffcf5] border border-slate-200 rounded relative overflow-hidden flex flex-col justify-center shrink-0">
                  <div className="h-[1px] bg-slate-300 w-full my-[2px]" />
                  <div className="h-[1px] bg-slate-300 w-full my-[2px]" />
                  <div className="h-[1px] bg-slate-300 w-full my-[2px]" />
                  <div className="h-[1px] bg-slate-300 w-full my-[2px]" />
                  {/* Note way above */}
                  <div className="absolute top-1 right-2 w-2 h-1.5 border border-slate-900 rounded-full bg-white" />
                </div>
              </button>

              {/* Very Low Notes */}
              <button
                onClick={() => handleSelectAdvanced('low')}
                className="bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 rounded-2xl p-5 flex items-center justify-between text-left transition-all duration-150 cursor-pointer group active:scale-[0.98]"
              >
                <div>
                  <h4 className="font-display font-bold text-slate-800 group-hover:text-emerald-600 transition-colors text-base">
                    Very Low Notes (?)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Deep tones below the stave.
                  </p>
                </div>
                {/* Micro stave drawing */}
                <div className="w-12 h-8 bg-[#fffcf5] border border-slate-200 rounded relative overflow-hidden flex flex-col justify-center shrink-0">
                  <div className="h-[1px] bg-slate-300 w-full my-[2px]" />
                  <div className="h-[1px] bg-slate-300 w-full my-[2px]" />
                  <div className="h-[1px] bg-slate-300 w-full my-[2px]" />
                  <div className="h-[1px] bg-slate-300 w-full my-[2px]" />
                  {/* Note way below */}
                  <div className="absolute bottom-1 right-2 w-2 h-1.5 border border-slate-900 rounded-full bg-white" />
                </div>
              </button>

              {/* Flats & Naturals */}
              <button
                onClick={() => handleSelectAdvanced('flats')}
                className="bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-200 rounded-2xl p-5 flex items-center justify-between text-left transition-all duration-150 cursor-pointer group active:scale-[0.98]"
              >
                <div>
                  <h4 className="font-display font-bold text-slate-800 group-hover:text-amber-600 transition-colors text-base">
                    Flats & Naturals (♭ / ♮)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Accidentals and pitch alterations.
                  </p>
                </div>
                <div className="text-2xl font-black text-slate-400 group-hover:text-amber-500 shrink-0 select-none">
                  ♭ / ♮
                </div>
              </button>
            </div>
          </section>

        </div>
      )}
    </div>
  );
};
