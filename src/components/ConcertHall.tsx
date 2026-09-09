import { BackButton } from './ui/BackButton';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Settings, LogOut, Plus, Music, Shield, Play, X, User } from 'lucide-react';
import { useInstrument } from '../contexts/InstrumentContext';
import { setQuavits, setRareQuavits, setXP, setInventory } from '../utils/economy';
import { AddMusicianModal } from './AddMusicianModal';

interface ConcertHallProps {
  onBack: () => void;
  onNavigateToGame: (screen: string) => void;
}

const getEquippedClasses = (inventory: any) => {
  let borderClass = "border-white/40";
  let bgClass = "bg-white/10";
  let shadowClass = "shadow-[0_20px_50px_rgba(0,0,0,0.5)]";

  if (inventory && typeof inventory === 'object' && inventory.equipped) {
    const { border, background } = inventory.equipped;
    
    if (border === 'border_gold') { borderClass = "border-amber-400"; shadowClass = "shadow-[0_0_30px_rgba(251,191,36,0.8)]"; }
    else if (border === 'border_neon') { borderClass = "border-sky-400"; shadowClass = "shadow-[0_0_30px_rgba(56,189,248,0.8)]"; }
    else if (border === 'border_fire') { borderClass = "border-rose-500 animate-pulse"; shadowClass = "shadow-[0_0_40px_rgba(244,63,94,0.9)]"; }
    else if (border === 'border_diamond') { borderClass = "border-cyan-300"; shadowClass = "shadow-[0_0_50px_rgba(103,232,249,1)]"; }

    if (background === 'bg_stars') bgClass = "bg-slate-900 bg-[url('/images/stars.png')] bg-cover";
    else if (background === 'bg_concert') bgClass = "bg-fuchsia-900";
    else if (background === 'bg_galaxy') bgClass = "bg-purple-900 animate-pulse";
  }
  
  return { borderClass, bgClass, shadowClass };
};

export default function ConcertHall({ onBack, onNavigateToGame }: ConcertHallProps) {
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  const [householdProfiles, setHouseholdProfiles] = useState<any[]>([]);
  const [teacherStudents, setTeacherStudents] = useState<any[]>([]);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [selectedStudentForLesson, setSelectedStudentForLesson] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const { setInstrument } = useInstrument();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userProfiles } = await supabase.from('profiles').select('*').eq('user_id', user.id);
    
    if (userProfiles && userProfiles.length > 0) {
      const teacher = userProfiles.find(p => p.role === 'teacher');
      if (teacher) {
        setIsTeacher(true);
        setTeacherProfile(teacher);
        if (teacher.studio_code) {
          const { data: students } = await supabase.from('profiles').select('*').eq('studio_code', teacher.studio_code).eq('role', 'student');
          setTeacherStudents(students || []);
        }
      } else {
        setIsTeacher(false);
        // Only show students on the stage, exclude the parent wrapper account
        setHouseholdProfiles(userProfiles.filter(p => p.role === 'student'));
      }
    }
    setLoading(false);
  };

  const handleStudentClick = (profile: any) => {
    if (isTeacher) {
      localStorage.setItem('teacherViewStudentId', profile.id);
      localStorage.setItem('teacherViewStudentName', profile.name || 'Student');
      
      // Load student data into global economy state so teacher minigames reflect it
      localStorage.setItem('activeProfileId', profile.id);
      setInstrument(profile.instrument || 'Clarinet');
      setQuavits(profile.quavits_common || 0);
      setRareQuavits(profile.quavits_rare || 0);
      setXP(profile.xp || 0);
      setInventory(profile.inventory || []);

      onNavigateToGame('teacher-student-hub');
    } else {
      // Household member clicking their avatar on the stage
      if (profile.role === 'student') {
        setInstrument(profile.instrument || 'Clarinet'); // Default fallback
        localStorage.setItem('activeProfileId', profile.id);
        
        // Temporarily bypassing placement test for now (will redesign later)
        /*
        const isPlacementDone = Array.isArray(profile.inventory) 
          ? profile.inventory.includes('placement_done') 
          : profile.inventory?.items?.includes('placement_done');
          
        if (!isPlacementDone) {
          onNavigateToGame('placement-quiz');
        } else {
          onNavigateToGame('student-hub');
        }
        */
        
        onNavigateToGame('student-hub'); // Proceed directly to Student Avatar Landing
      }
    }
  };

  const handleMusicianAdded = (newProfile: any) => {
    setShowAddModal(false);
    if (isTeacher) {
      setTeacherStudents([...teacherStudents, newProfile]);
    } else {
      setHouseholdProfiles([...householdProfiles, newProfile]);
    }
  };

  if (loading) {
    return <div className="h-screen bg-slate-900 flex items-center justify-center font-bold text-white overflow-y-auto">Entering the Concert Hall...</div>;
  }

  return (
    <div 
      className="fixed inset-0 bg-slate-900 flex flex-col font-sans overflow-y-auto"
      style={{
        backgroundImage: "url('/Concerthallbackground.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Top Left HUD */}
      <div className="absolute top-6 left-6 z-50">
        {!isTeacher && (
          <button 
             onClick={() => setShowAddModal(true)}
             className="bg-emerald-600/90 hover:bg-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-lg backdrop-blur-md flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Plus className="w-5 h-5" /> Add Musician
          </button>
        )}
      </div>

      {showAddModal && <AddMusicianModal onClose={() => setShowAddModal(false)} onSuccess={handleMusicianAdded} />}
      
      {/* Top Right HUD */}
      <div className="absolute top-6 right-6 flex gap-4 z-50">
        <button 
          onClick={() => onNavigateToGame('settings')} 
          className="bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-lg border-2 border-slate-600 flex items-center gap-3 transition-colors backdrop-blur-md"
        >
          <User className="w-5 h-5" /> Accounts
        </button>
      </div>


      <div className="absolute top-10 left-0 w-full text-center z-10 pointer-events-none">
        <h1 className="text-5xl font-black text-white uppercase tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          Welcome to Musictopia
        </h1>
      </div>

      {isTeacher ? (
        /* TEACHER VIEW: Students in Auditorium Seats */
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pt-24 pb-48">
          <h2 className="text-2xl font-bold text-white/80 uppercase tracking-widest mb-4 animate-pulse drop-shadow-md shrink-0">
            Click on a student to view their progress
          </h2>
          <div className="bg-black/40 backdrop-blur-sm p-8 rounded-[3rem] border border-white/10 w-11/12 max-w-6xl shadow-2xl mb-8">
            <div className="flex justify-between items-center mb-8 px-4">
              <h2 className="text-3xl font-black text-white uppercase tracking-widest">Your Studio ({teacherProfile?.studio_code})</h2>
              <button 
                onClick={() => alert(`Enter parent's email or phone number to send a "Join My Studio" link!`)}
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-full font-black uppercase tracking-widest shadow-[0_4px_0_#047857] active:translate-y-1 active:shadow-none border-2 border-emerald-400 flex items-center gap-2 transition-all"
              >
                <Plus className="w-5 h-5" /> Add Student
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-8 justify-items-center">
              {Array.from({ length: 16 }).map((_, i) => {
                const s = teacherStudents[i];
                return s ? (
                  <button 
                    key={s.id}
                    onClick={() => handleStudentClick(s)}
                    className="flex flex-col items-center gap-2 group hover:-translate-y-2 transition-transform"
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-800/80 border-2 border-white/20 rounded-full flex items-center justify-center text-4xl shadow-xl group-hover:border-sky-400 group-hover:bg-slate-700 transition-colors">
                      {s.avatar_data?.url ? <img src={`/avatars/${s.avatar_data.url}`} alt="avatar" className="w-full h-full object-cover rounded-full" /> : (s.avatar_data?.emoji || '😎')}
                    </div>
                    <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full whitespace-nowrap">
                      {s.name || `St. ${s.id.substring(0,4)}`}
                    </span>
                  </button>
                ) : (
                  <div key={`empty-${i}`} className="flex flex-col items-center gap-2 opacity-30">
                    <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-dashed border-white/20 rounded-full flex items-center justify-center text-2xl">
                      🪑
                    </div>
                    <span className="text-white/50 font-bold text-xs bg-black/30 px-2 py-1 rounded-full whitespace-nowrap">Empty Seat</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Teacher Bottom Layout (4 in a row) */}
          <div className="absolute bottom-10 left-0 w-full px-10 flex justify-between items-end z-50 max-w-7xl mx-auto right-0 gap-4">
            
            {/* 1. Add Repertoire */}
            <div className="flex flex-col items-center flex-1">
              <button 
                onClick={() => onNavigateToGame('teacher-syllabus')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white w-full py-6 rounded-[2rem] font-black md:text-xl lg:text-2xl uppercase tracking-widest shadow-[0_8px_0_#4338ca] active:translate-y-2 active:shadow-none transition-all border-4 border-indigo-400 flex justify-center items-center"
              >
                Add Repertoire
              </button>
            </div>

            {/* 2. Set a Task */}
            <div className="flex flex-col items-center flex-1">
              <button 
                onClick={() => alert('Set a Task modal coming soon!')}
                className="bg-emerald-500 hover:bg-emerald-400 text-white w-full py-6 rounded-[2rem] font-black md:text-xl lg:text-2xl uppercase tracking-widest shadow-[0_8px_0_#047857] active:translate-y-2 active:shadow-none transition-all border-4 border-emerald-300 flex justify-center items-center relative"
              >
                Set a Task
              </button>
            </div>

            {/* 3. Set a Goal */}
            <div className="flex flex-col items-center flex-1">
              <button 
                onClick={() => alert('Set a Goal modal coming soon!')}
                className="bg-amber-400 hover:bg-amber-300 text-slate-900 w-full py-6 rounded-[2rem] font-black md:text-xl lg:text-2xl uppercase tracking-widest shadow-[0_8px_0_#b45309] active:translate-y-2 active:shadow-none transition-all border-4 border-amber-200 flex justify-center items-center relative"
              >
                Set a Goal
              </button>
            </div>

            {/* 4. Teacher Dashboard */}
            <div className="flex flex-col items-center flex-1">
              <button 
                onClick={() => onNavigateToGame('teacher-dashboard')}
                className="bg-sky-500 hover:bg-sky-400 text-white w-full py-6 rounded-[2rem] font-black md:text-xl lg:text-2xl uppercase tracking-widest shadow-[0_8px_0_#0284c7] active:translate-y-2 active:shadow-none transition-all border-4 border-sky-300 flex justify-center items-center relative"
              >
                Dashboard
              </button>
            </div>

          </div>
        </div>
      ) : (
        /* STUDENT/PARENT VIEW: Avatars on the Stage */
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pt-16 pb-48">
           <h2 className="text-2xl font-bold text-white/80 uppercase tracking-widest mb-4 animate-pulse drop-shadow-md shrink-0">
             Tap on a musician to play
           </h2>
           <div className={`flex flex-nowrap overflow-x-auto overflow-y-visible w-full max-w-7xl px-8 py-8 gap-12 snap-x snap-mandatory custom-scrollbar ${householdProfiles.length <= 4 ? 'justify-center' : 'justify-start'}`}>
             {householdProfiles.map(p => (
               <button 
                 key={p.id}
                 onClick={() => handleStudentClick(p)}
                 className="flex flex-col items-center gap-4 group hover:-translate-y-4 transition-transform shrink-0 snap-center"
               >
                 <div className={`w-40 h-40 backdrop-blur-md border-4 rounded-full flex items-center justify-center text-7xl transition-all relative ${getEquippedClasses(p.inventory).bgClass} ${getEquippedClasses(p.inventory).borderClass} ${getEquippedClasses(p.inventory).shadowClass} group-hover:scale-105`}>
                   {p.inventory?.equipped?.badge && (
                     <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-white z-20">⭐</div>
                   )}
                   {p.avatar_data?.url ? <img src={`/avatars/${p.avatar_data.url}`} alt="avatar" className="w-full h-full object-cover rounded-full mix-blend-luminosity hover:mix-blend-normal transition-all" /> : (p.avatar_data?.emoji || '??')}
                 </div>
                 <div className="flex flex-col items-center bg-black/60 px-6 py-3 rounded-2xl border border-white/10">
                   <span className="text-white font-black text-2xl">
                     {p.name || 'Musician'}
                   </span>
                   <span className="text-emerald-400 font-bold uppercase tracking-widest text-sm">
                     {p.instrument}
                   </span>
                 </div>
                 <div className="opacity-0 group-hover:opacity-100 bg-sky-500 text-white font-bold px-4 py-2 rounded-full flex items-center gap-2 transition-opacity">
                   <Play className="w-4 h-4 fill-current" /> Start Adventure
                 </div>
               </button>
             ))}
           </div>

           {/* Bottom Navigation for Students */}
           <div className="absolute bottom-10 w-full px-8 flex justify-center gap-8 max-w-5xl mx-auto pointer-events-auto">
             <button onClick={() => alert('Student Progress metrics coming soon!')} className="flex-1 bg-sky-900/90 hover:bg-sky-800 border-2 border-sky-400 text-white rounded-[2rem] p-6 shadow-2xl backdrop-blur-md transition-transform hover:-translate-y-2 flex flex-col items-center justify-center cursor-pointer">
               <span className="text-2xl font-black uppercase tracking-widest mb-1 text-center">Student Progress</span>
               <span className="text-sky-300 font-bold text-sm text-center">View real-time usage metrics & compare profile tiers</span>
             </button>
             <button onClick={() => onNavigateToGame('parent-dashboard')} className="flex-1 bg-purple-900/90 hover:bg-purple-800 border-2 border-purple-400 text-white rounded-[2rem] p-6 shadow-2xl backdrop-blur-md transition-transform hover:-translate-y-2 flex flex-col items-center justify-center relative cursor-pointer">
               <div className="absolute -top-3 -right-3 bg-rose-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black border-2 border-slate-900 shadow-lg animate-bounce">1</div>
               <span className="text-2xl font-black uppercase tracking-widest mb-1 text-center">Parent Dashboard</span>
               <span className="text-purple-300 font-bold text-sm text-center">Guide your child & check tutor notifications</span>
             </button>
           </div>
        </div>
      )}


    </div>
  );
}

