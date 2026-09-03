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
      localStorage.setItem('activeProfileId', profile.id);
      setInstrument(profile.instrument as any);
      
      // Enforce Placement Test on very first play
      if (profile.level === 1 && !profile.inventory?.includes('placement_done')) {
        onNavigateToGame('placement-quiz');
      } else {
        onNavigateToGame('map'); // Proceed to Campus
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
    return <div className="h-screen bg-slate-900 flex items-center justify-center font-bold text-white">Entering the Concert Hall...</div>;
  }

  // Force Add Musician empty state if they have no students
  const needsMusician = !isTeacher && householdProfiles.length === 0;

  return (
    <div 
      className="fixed inset-0 bg-slate-900 flex flex-col font-sans overflow-hidden"
      style={{
        backgroundImage: "url('/Concerthallbackground.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <BackButton onClick={onBack} />
      {showAddModal && <AddMusicianModal onClose={() => setShowAddModal(false)} onSuccess={handleMusicianAdded} />}
      {/* Top HUD */}
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
        {!isTeacher && (
           <button onClick={() => onNavigateToGame('parent-dashboard')} className="bg-slate-800/90 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-slate-700 backdrop-blur-md">
            Parent Dashboard
          </button>
        )}
        <button onClick={() => alert('Settings')} className="w-12 h-12 bg-slate-800/80 rounded-full flex items-center justify-center text-white hover:bg-slate-700">
          <Settings className="w-6 h-6" />
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
                      {s.avatar_url ? <img src={`/avatars/${s.avatar_url}`} alt="avatar" className="w-full h-full object-cover rounded-full" /> : (s.avatar_data?.emoji || '😎')}
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
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pt-32">
           <div className="flex flex-wrap justify-center gap-12 w-full max-w-5xl">
             {householdProfiles.map(p => (
               <button 
                 key={p.id}
                 onClick={() => handleStudentClick(p)}
                 className="flex flex-col items-center gap-4 group hover:-translate-y-4 transition-transform"
               >
                 {/* Fixed avatar on stage, not draggable */}
                 <div className="w-40 h-40 bg-white/10 backdrop-blur-md border-4 border-white/40 rounded-full flex items-center justify-center text-7xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:border-emerald-400 group-hover:bg-white/20 transition-all">
                   {p.avatar_url ? <img src={`/avatars/${p.avatar_url}`} alt="avatar" className="w-full h-full object-cover rounded-full" /> : (p.avatar_data?.emoji || '😎')}
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
             
             <button 
               onClick={() => setShowAddModal(true)}
               className={`flex flex-col items-center justify-center gap-4 group hover:-translate-y-2 transition-transform w-40 h-40 ${needsMusician ? 'opacity-100 scale-125' : 'opacity-70 hover:opacity-100'}`}
             >
                <div className="w-24 h-24 bg-black/40 border-4 border-dashed border-white/50 rounded-full flex items-center justify-center text-white group-hover:border-white transition-all">
                  <Plus className="w-10 h-10" />
                </div>
                <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-full">Add Musician</span>
             </button>
           </div>
        </div>
      )}

      {/* Teacher Collaboration Modal */}
            {selectedStudentForLesson && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-8">
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

