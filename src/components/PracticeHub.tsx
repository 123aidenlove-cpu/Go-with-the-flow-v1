import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { ArrowLeft, Timer, BookOpen, Target, RotateCcw, Award, Settings } from 'lucide-react';
import PracticeGuide from './PracticeGuide';
import MusicalGlossary from './MusicalGlossary';
import SetRepertoire from './SetRepertoire';
import PracticeLog from './PracticeLog';
import SettingsHub from './SettingsHub';
import AcousticChallenges from './AcousticChallenges';

interface PracticeHubProps {
  onBack: () => void;
  onNavigateToGame: (game: any) => void;
}

type ModalState = 'none' | 'challenges' | 'practice' | 'repertoire' | 'log' | 'glossary' | 'settings';

export default function PracticeHub({ onBack, onNavigateToGame }: PracticeHubProps) {
  const [activeModal, setActiveModal] = useState<ModalState>('none');

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center overflow-hidden font-sans">
      <div 
        className="relative w-full max-w-[1920px] h-full shadow-2xl flex flex-col"
        style={{
          backgroundImage: "url('/Concerthallbackground.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Header HUD */}
        <div className="absolute top-8 left-8 z-40">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-4 font-black text-xl text-slate-700 uppercase tracking-widest transition-all rounded-full bg-white/90 backdrop-blur-sm hover:bg-white active:scale-95 shadow-xl border-4 border-slate-200 hover:scale-105"
          >
            <ArrowLeft className="w-6 h-6" /> Back to Campus
          </button>
        </div>

        {/* 6 BIG BUTTONS GRID */}
        <div className="absolute inset-0 flex items-center justify-center pt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-12 w-full max-w-6xl">
            {/* 1. Flow Practice */}
            <button 
              onClick={() => setActiveModal('practice')} 
              className="bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 border-4 border-emerald-300 rounded-3xl p-8 flex flex-col items-center justify-center gap-6 shadow-[0_15px_35px_rgba(16,185,129,0.3)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(16,185,129,0.5)] transition-all group"
            >
              <div className="bg-white/20 p-6 rounded-full group-hover:scale-110 transition-transform">
                <Timer className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-widest uppercase">Flow Practice</h2>
            </button>

            {/* 2. Repertoire */}
            <button 
              onClick={() => setActiveModal('repertoire')} 
              className="bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 border-4 border-purple-300 rounded-3xl p-8 flex flex-col items-center justify-center gap-6 shadow-[0_15px_35px_rgba(168,85,247,0.3)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(168,85,247,0.5)] transition-all group"
            >
              <div className="bg-white/20 p-6 rounded-full group-hover:scale-110 transition-transform">
                <Award className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-widest uppercase">Repertoire</h2>
            </button>

            {/* 3. Practice Log */}
            <button 
              onClick={() => setActiveModal('log')} 
              className="bg-gradient-to-br from-sky-500 to-sky-700 hover:from-sky-400 hover:to-sky-600 border-4 border-sky-300 rounded-3xl p-8 flex flex-col items-center justify-center gap-6 shadow-[0_15px_35px_rgba(14,165,233,0.3)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(14,165,233,0.5)] transition-all group"
            >
              <div className="bg-white/20 p-6 rounded-full group-hover:scale-110 transition-transform">
                <RotateCcw className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-widest uppercase">Practice Log</h2>
            </button>

            {/* 4. Acoustic Challenges (Tonguing / Long Note ONLY) */}
            <button 
              onClick={() => setActiveModal('challenges')} 
              className="bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600 border-4 border-orange-300 rounded-3xl p-8 flex flex-col items-center justify-center gap-6 shadow-[0_15px_35px_rgba(249,115,22,0.3)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(249,115,22,0.5)] transition-all group"
            >
              <div className="bg-white/20 p-6 rounded-full group-hover:scale-110 transition-transform">
                <Target className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-widest uppercase">Challenges</h2>
            </button>

            {/* 5. Musical Glossary */}
            <button 
              onClick={() => setActiveModal('glossary')} 
              className="bg-gradient-to-br from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600 border-4 border-rose-300 rounded-3xl p-8 flex flex-col items-center justify-center gap-6 shadow-[0_15px_35px_rgba(244,63,94,0.3)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(244,63,94,0.5)] transition-all group"
            >
              <div className="bg-white/20 p-6 rounded-full group-hover:scale-110 transition-transform">
                <BookOpen className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-widest uppercase">Glossary</h2>
            </button>

            {/* 6. Settings */}
            <button 
              onClick={() => setActiveModal('settings')} 
              className="bg-gradient-to-br from-slate-500 to-slate-700 hover:from-slate-400 hover:to-slate-600 border-4 border-slate-300 rounded-3xl p-8 flex flex-col items-center justify-center gap-6 shadow-[0_15px_35px_rgba(100,116,139,0.3)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(100,116,139,0.5)] transition-all group"
            >
              <div className="bg-white/20 p-6 rounded-full group-hover:scale-110 transition-transform">
                <Settings className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-widest uppercase">Settings</h2>
            </button>
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {activeModal === 'practice' && (
            <PracticeGuide onBack={() => setActiveModal('none')} />
          )}
          {activeModal === 'repertoire' && (
            <SetRepertoire 
              onBack={() => setActiveModal('none')} 
              onNavigateToGame={onNavigateToGame}
            />
          )}
          {activeModal === 'log' && (
            <PracticeLog onBack={() => setActiveModal('none')} />
          )}
          {activeModal === 'challenges' && (
            <AcousticChallenges onBack={() => setActiveModal('none')} />
          )}
          {activeModal === 'glossary' && (
            <MusicalGlossary onBack={() => setActiveModal('none')} />
          )}
          {activeModal === 'settings' && (
            <SettingsHub onBack={() => setActiveModal('none')} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
