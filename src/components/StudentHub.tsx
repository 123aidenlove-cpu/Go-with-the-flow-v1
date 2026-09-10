import React, { useEffect, useState } from 'react';
import { ArrowLeft, User, ShoppingCart, Target, Play, Bell, ClipboardList, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useInstrument } from '../contexts/InstrumentContext';
import { APP_ASSETS } from '../config/assets';
import SetGoalModal from './SetGoalModal';
import AcousticChallenges from './AcousticChallenges';
import PracticeGuide from './PracticeGuide';
import PracticeLog from './PracticeLog';
import AdventureAlertsModal from './AdventureAlertsModal';
import { AnimatePresence } from 'motion/react';

interface StudentHubProps {
  onBack: () => void;
  onNavigateToGame: (screen: string) => void;
}

export default function StudentHub({ onBack, onNavigateToGame }: StudentHubProps) {
  const [profile, setProfile] = useState<any>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'challenges' | 'challenges-leaderboard' | 'practice' | 'log'>('none');
  const { instrument } = useInstrument();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const activeId = localStorage.getItem('activeProfileId');
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

      {/* Top Center: Shop Button */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={() => onNavigateToGame('shop-page')}
          className="bg-amber-500 hover:bg-amber-400 text-white font-black uppercase tracking-widest px-8 py-3 rounded-full shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 border-2 border-amber-200"
        >
          <ShoppingCart className="w-5 h-5" /> Shop: Upgrade your Avatar!
        </button>
      </div>

      {/* Top Right: Account & Quavits */}
      <div className="absolute top-6 right-6 z-50 flex flex-col items-end gap-2">
        <button 
          onClick={() => onNavigateToGame('settings')}
          className="bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-lg border-2 border-slate-600 flex items-center gap-3 transition-colors"
        >
          <User className="w-5 h-5" /> Accounts
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
        <button 
          onClick={() => onNavigate('instrument-selection')}
          className="w-64 h-64 md:w-80 md:h-80 relative group mb-8 cursor-pointer hover:scale-105 transition-transform"
          title="Change Instrument"
        >
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-400/30 transition-all duration-700"></div>
          <div className="w-full h-full bg-slate-800 border-8 border-slate-700 rounded-full flex items-center justify-center text-9xl shadow-2xl relative z-10 overflow-hidden">
            {profile.avatar_data?.url ? (
              <img src={`/avatars/${profile.avatar_data.url}`} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              profile.avatar_data?.emoji || '👤'
            )}
          </div>
          <div className="absolute -bottom-4 bg-slate-800 text-white font-bold px-6 py-2 rounded-full border-2 border-slate-600 shadow-xl z-20 left-1/2 -translate-x-1/2 whitespace-nowrap group-hover:bg-slate-700 transition-colors">
            Switch Instrument
          </div>
        </button>
        <h1 className="text-4xl font-black text-white uppercase tracking-widest drop-shadow-md">{profile.name || 'Student'}</h1>
        <p className="text-emerald-400 font-bold uppercase tracking-widest mt-2">{instrument}</p>
      </div>

      {/* Middle Left: Set a Goal */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-start gap-4">
        <button 
          onClick={() => setShowGoalModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-3xl font-black uppercase tracking-widest shadow-[0_4px_0_#4338ca] active:translate-y-1 active:shadow-none transition-all flex items-center gap-3 border-2 border-indigo-400"
        >
          <Target className="w-6 h-6" /> Set a Goal
        </button>
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
        
        {/* Bottom Left: Challenges & Leaderboard */}
        <div className="flex flex-col items-center gap-4 w-72 md:w-80">
          <button 
            onClick={() => setActiveModal('challenges')}
            className="bg-rose-600 hover:bg-rose-500 text-white w-full py-6 rounded-[2rem] font-black text-2xl uppercase tracking-widest shadow-[0_8px_0_#be123c] active:translate-y-2 active:shadow-none transition-all border-4 border-rose-400 relative flex justify-center items-center"
          >
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-amber-400 rounded-full border-2 border-slate-900 flex items-center justify-center text-sm font-bold text-slate-900 shadow-lg animate-bounce">!</div>
            CHALLENGES
          </button>
          <button 
            onClick={() => setActiveModal('challenges-leaderboard')}
            className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-slate-600 transition-colors shadow-md w-full"
          >
            <Trophy className="w-5 h-5 text-amber-400" /> Leaderboard
          </button>
        </div>

        {/* Bottom Center: FLOW Practice & Practice Log */}
        <div className="flex flex-col items-center gap-4 w-72 md:w-80">
          <button 
            onClick={() => setActiveModal('practice')}
            className="bg-emerald-500 hover:bg-emerald-400 text-white w-full py-6 rounded-[2rem] font-black text-2xl uppercase tracking-widest shadow-[0_8px_0_#047857] active:translate-y-2 active:shadow-none transition-all border-4 border-emerald-300 flex justify-center items-center relative"
          >
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-rose-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-sm font-bold shadow-lg animate-bounce">1</div>
            FLOW PRACTICE
          </button>
          <button 
            onClick={() => setActiveModal('log')}
            className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-slate-600 transition-colors shadow-md w-full"
          >
            <ClipboardList className="w-5 h-5 text-sky-400" /> Practice Log
          </button>
        </div>

        {/* Bottom Right: Adventure & Alerts */}
        <div className="flex flex-col items-center gap-4 w-72 md:w-80">
          <button 
            onClick={() => onNavigateToGame('map')}
            className="bg-amber-400 hover:bg-amber-300 text-slate-900 w-full py-6 rounded-[2rem] font-black text-2xl uppercase tracking-widest shadow-[0_8px_0_#b45309] active:translate-y-2 active:shadow-none transition-all border-4 border-amber-200 flex justify-center items-center relative"
          >
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-rose-500 text-white rounded-full border-2 border-slate-900 flex items-center justify-center text-sm font-bold shadow-lg animate-bounce">1</div>
            ADVENTURE!
          </button>
          <button 
            onClick={() => setShowAlertsModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-slate-600 transition-colors shadow-md w-full relative"
          >
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold shadow-lg">2</div>
            <Bell className="w-5 h-5 text-rose-400" /> Alerts
          </button>
        </div>

      </div>

      {showGoalModal && (
        <SetGoalModal 
          onClose={() => setShowGoalModal(false)}
          onSave={(goal) => {
            console.log('Goal saved', goal);
            setShowGoalModal(false);
          }}
        />
      )}

      {showAlertsModal && (
        <AdventureAlertsModal onClose={() => setShowAlertsModal(false)} />
      )}

      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'practice' && (
          <PracticeGuide onBack={() => setActiveModal('none')} />
        )}
        {activeModal === 'log' && (
          <PracticeLog onBack={() => setActiveModal('none')} />
        )}
        {(activeModal === 'challenges' || activeModal === 'challenges-leaderboard') && (
          <AcousticChallenges 
            onBack={() => setActiveModal('none')} 
            profileId={profile.id}
            instrument={profile.instrument || instrument}
            initialState={activeModal === 'challenges-leaderboard' ? 'results' : 'hub'}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
