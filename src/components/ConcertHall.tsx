import { BackButton } from './ui/BackButton';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Settings, LogOut, Plus, Music, Shield, Play, X, User } from 'lucide-react';
import { useInstrument } from '../contexts/InstrumentContext';
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
      setSelectedStudentForLesson(profile);
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
        {isTeacher && (
          <>
            <button onClick={() => onNavigateToGame('teacher-syllabus')} className="bg-emerald-600/90 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-emerald-500 backdrop-blur-md">
              Syllabus Library
            </button>
            <button onClick={() => onNavigateToGame('teacher-dashboard')} className="bg-sky-600/90 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-sky-500 backdrop-blur-md">
              Teacher Dashboard
            </button>
          </>
        )}
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
        <div className="absolute bottom-10 w-full h-[60%] flex flex-col items-center justify-end z-20 pb-10">
          <div className="bg-black/40 backdrop-blur-sm p-8 rounded-[3rem] border border-white/10 w-11/12 max-w-6xl shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-white">Your Studio ({teacherProfile?.studio_code})</h2>
              <button onClick={() => alert(`Give this Studio Code to students to join your auditorium: ${teacherProfile?.studio_code}`)} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-xl font-bold">
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
                    <div className="w-20 h-20 bg-slate-800/80 border-2 border-white/20 rounded-full flex items-center justify-center text-4xl shadow-xl group-hover:border-sky-400 group-hover:bg-slate-700 transition-colors">
                      {s.avatar_data?.url ? <img src={`/avatars/${s.avatar_data.url}`} alt="avatar" className="w-full h-full object-cover rounded-full" /> : (s.avatar_data?.emoji || '😎')}
                    </div>
                    <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full">
                      {s.name || `St. ${s.id.substring(0,4)}`}
                    </span>
                  </button>
                ) : (
                  <div key={`empty-${i}`} className="flex flex-col items-center gap-2 opacity-30">
                    <div className="w-20 h-20 border-4 border-dashed border-white/20 rounded-full flex items-center justify-center text-2xl">
                      🪑
                    </div>
                    <span className="text-white/50 font-bold text-xs bg-black/30 px-2 py-1 rounded-full">Empty Seat</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* STUDENT/PARENT VIEW: Avatars on the Stage */
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pt-16 pb-48 overflow-y-auto">
           <h2 className="text-2xl font-bold text-white/80 uppercase tracking-widest mb-8 animate-pulse drop-shadow-md">
             Tap on a musician to play
           </h2>
           <div className="flex flex-wrap justify-center gap-12 w-full max-w-5xl">
             {householdProfiles.map(p => (
               <button 
                 key={p.id}
                 onClick={() => handleStudentClick(p)}
                 className="flex flex-col items-center gap-4 group hover:-translate-y-4 transition-transform"
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

      {/* Teacher Collaboration Modal */}
            {selectedStudentForLesson && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-8 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-lg flex flex-col overflow-hidden shadow-2xl relative border-4 border-slate-200 p-8 text-center">
            <button 
              onClick={() => setSelectedStudentForLesson(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-24 h-24 bg-slate-100 border-4 border-slate-200 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 shadow-inner">
              {selectedStudentForLesson.avatar_data?.type === 'conductor' ? '🤵' : '🦉'}
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-1">{selectedStudentForLesson.name || 'Student'}</h2>
            <p className="text-sky-500 font-bold uppercase tracking-widest text-sm mb-8">{selectedStudentForLesson.instrument}</p>

            <div className="flex flex-col gap-4">
              <button 
                onClick={() => {
                  localStorage.setItem('teacherViewStudentName', selectedStudentForLesson.name || 'Student');
                  onNavigateToGame('teacher-lesson-view');
                }}
                className="w-full bg-emerald-500 text-white font-black py-4 px-6 rounded-2xl shadow-[0_8px_16px_rgba(16,185,129,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-3 text-lg"
              >
                <Play className="w-6 h-6 fill-current" />
                START A LESSON
              </button>
              
              <button 
                onClick={() => {
                  localStorage.setItem('teacherViewStudentId', selectedStudentForLesson.id);
                  onNavigateToGame('teacher-student-profile');
                }}
                className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 font-black py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 text-lg border-2 border-slate-200"
              >
                <User className="w-6 h-6" />
                GO TO PROFILE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

