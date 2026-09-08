import React, { useEffect, useState } from 'react';
import { ArrowLeft, User, ShoppingCart, Target, Play, Bell, ClipboardList, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useInstrument } from '../contexts/InstrumentContext';
import { APP_ASSETS } from '../config/assets';
import PracticeLog from './PracticeLog';
import { AnimatePresence } from 'motion/react';

interface StudentHubProps {
  onBack: () => void;
  onNavigateToGame: (screen: string) => void;
}

export default function TeacherStudentHub({ onBack, onNavigateToGame }: StudentHubProps) {
  const [profile, setProfile] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<'none' | 'practice' | 'log'>('none');
  const { instrument } = useInstrument();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const activeId = localStorage.getItem('teacherViewStudentId');
    if (!activeId) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', activeId)
      .single();
    
    if (data) {
      setProfile(data);
    }
  };

  const getQuavits = () => {
    return profile?.inventory?.quavits || 0;
  };

  const getRareQuavits = () => {
    return profile?.inventory?.rare_quavits || 0;
  };

  if (!profile) return <div className="h-screen bg-slate-900 flex items-center justify-center font-bold text-white">Loading Avatar...</div>;

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col font-sans overflow-hidden">
      
      {/* Top Left: Back Arrow */}
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={onBack}
          className="flex items-center justify-center w-12 h-12 bg-slate-800/80 rounded-full text-white hover:bg-slate-700 transition-colors shadow-lg border-2 border-slate-600"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Top Right: Student Stats & Quavits */}
      <div className="absolute top-6 right-6 z-50 flex flex-col items-end gap-2">
        <button 
          onClick={() => onNavigateToGame('teacher-student-profile')}
          className="bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-lg border-2 border-slate-600 flex items-center gap-3 transition-colors backdrop-blur-md"
        >
          <User className="w-5 h-5" /> Student Stats
        </button>
        
        <div className="bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-2xl flex flex-col items-end gap-1 border border-slate-700 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 font-black text-xl">
             <span>{getQuavits()}</span> 
             <img src={APP_ASSETS.ui.quavits} alt="Quavits" className="w-8 h-8 object-contain drop-shadow-md" />
          </div>
          <div className="flex items-center gap-2 text-cyan-400 font-black text-xl">
             <span>{getRareQuavits()}</span> 
             <img src={APP_ASSETS.ui.rareQuavits} alt="Rare Quavits" className="w-8 h-8 object-contain drop-shadow-md" />
          </div>
        </div>
      </div>

      {/* Center: Avatar */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 pt-10">
        <div className="w-64 h-64 md:w-80 md:h-80 relative group mb-8">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-400/30 transition-all duration-700"></div>
          <div className="w-full h-full bg-slate-800 border-8 border-slate-700 rounded-full flex items-center justify-center text-9xl shadow-2xl relative z-10 overflow-hidden">
            {profile.avatar_data?.url ? (
              <img src={`/avatars/${profile.avatar_data.url}`} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              profile.avatar_data?.emoji || '😎'
            )}
          </div>
        </div>
        <h1 className="text-4xl font-black text-white uppercase tracking-widest drop-shadow-md">{profile.name || 'Student'}</h1>
        <p className="text-emerald-400 font-bold uppercase tracking-widest mt-2">{profile.instrument || instrument}</p>
      </div>

      {/* Middle Left: Set a Goal */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-start gap-4">
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 w-48 shadow-lg">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Weekly Goal</p>
           <div className="w-full bg-slate-900 rounded-full h-2">
             <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '0%' }}></div>
           </div>
           <p className="text-xs font-bold text-white mt-2">0 / 2 Sessions</p>
        </div>
      </div>

      {/* Bottom Layout */}
      <div className="absolute bottom-10 left-0 w-full px-10 flex justify-between items-end z-50 max-w-7xl mx-auto right-0">
        
        {/* Bottom Left: Assign Repertoire */}
        <div className="flex flex-col items-center gap-4 w-72 md:w-80">
          <button 
            onClick={() => alert('Assign Repertoire coming soon!')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white w-full py-6 rounded-[2rem] font-black text-2xl uppercase tracking-widest shadow-[0_8px_0_#4338ca] active:translate-y-2 active:shadow-none transition-all border-4 border-indigo-400 relative flex justify-center items-center"
          >
            Assign Repertoire
          </button>
        </div>

        {/* Bottom Center: Start A Lesson */}
        <div className="flex flex-col items-center gap-4 w-72 md:w-80">
          <button 
            onClick={() => onNavigateToGame('teacher-lesson-view')}
            className="bg-emerald-500 hover:bg-emerald-400 text-white w-full py-6 rounded-[2rem] font-black text-2xl uppercase tracking-widest shadow-[0_8px_0_#047857] active:translate-y-2 active:shadow-none transition-all border-4 border-emerald-300 flex justify-center items-center relative"
          >
            Start A Lesson
          </button>
        </div>

        {/* Bottom Right: Student Practice Log */}
        <div className="flex flex-col items-center gap-4 w-72 md:w-80">
          <button 
            onClick={() => setActiveModal('log')}
            className="bg-amber-400 hover:bg-amber-300 text-slate-900 w-full py-6 rounded-[2rem] font-black text-2xl uppercase tracking-widest shadow-[0_8px_0_#b45309] active:translate-y-2 active:shadow-none transition-all border-4 border-amber-200 flex justify-center items-center relative"
          >
            Practice Log
          </button>
        </div>

      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'log' && (
          <PracticeLog onBack={() => setActiveModal('none')} />
        )}
      </AnimatePresence>
    </div>
  );
}
