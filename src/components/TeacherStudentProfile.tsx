import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Award, Star, AlertTriangle, Target, BookOpen, Bell, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import CreateAdventureAlert from './CreateAdventureAlert';
import SetGoal from './SetGoal';

interface TeacherStudentProfileProps {
  onBack: () => void;
}

type TabState = 'games' | 'challenges' | 'log';

export default function TeacherStudentProfile({ onBack }: TeacherStudentProfileProps) {
  const [student, setStudent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabState>('games');
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      const id = localStorage.getItem('teacherViewStudentId');
      if (id) {
        const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
        setStudent(data);
      }
    };
    fetchStudent();
  }, []);

  if (!student) {
    return <div className="h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-700">Loading Profile...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Header / Profile Hero */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-200 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="w-16 h-16 bg-sky-100 border-4 border-sky-200 rounded-full flex items-center justify-center text-3xl shadow-inner cursor-pointer hover:scale-105 transition-transform">
            {student.avatar_data?.type === 'conductor' ? '🤵' : '🦉'}
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800">{student.name}'s Data</h1>
            <p className="text-sky-600 font-bold uppercase tracking-widest text-sm">{student.instrument || 'Instrument'}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-[1920px] mx-auto w-full">
        {/* Left/Main Column: KPIs + Tabs */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          
          {/* Top KPI Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-2">
              <div className="text-slate-700 font-bold uppercase text-xs flex items-center gap-2"><Clock className="w-4 h-4"/> Total Time</div>
              <div className="text-3xl font-black text-slate-800">14h 20m</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-2">
              <div className="text-slate-700 font-bold uppercase text-xs flex items-center gap-2"><Award className="w-4 h-4"/> Current Level</div>
              <div className="text-3xl font-black text-slate-800">{student.league_status || 'Level 4'}</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-2">
              <div className="text-slate-700 font-bold uppercase text-xs flex items-center gap-2"><Star className="w-4 h-4"/> Quavits</div>
              <div className="text-3xl font-black text-emerald-500">{student.quavits_common || 0}</div>
            </div>
            <div className="bg-rose-50 p-6 rounded-3xl border border-rose-200 shadow-sm flex flex-col gap-2">
              <div className="text-rose-600 font-bold uppercase text-xs flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Current Struggles</div>
              <div className="text-lg font-black text-rose-700 leading-tight">Rhythm (Ties)</div>
            </div>
          </div>

          {/* Main Content Tabs */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="flex border-b border-slate-200">
              <button onClick={() => setActiveTab('games')} className={`flex-1 py-4 font-black uppercase tracking-wider text-sm ${activeTab === 'games' ? 'text-sky-600 border-b-4 border-sky-500 bg-sky-50' : 'text-slate-700 hover:bg-slate-50'}`}>Games Unlocked</button>
              <button onClick={() => setActiveTab('challenges')} className={`flex-1 py-4 font-black uppercase tracking-wider text-sm ${activeTab === 'challenges' ? 'text-fuchsia-600 border-b-4 border-fuchsia-500 bg-fuchsia-50' : 'text-slate-700 hover:bg-slate-50'}`}>Challenges & High Scores</button>
              <button onClick={() => setActiveTab('log')} className={`flex-1 py-4 font-black uppercase tracking-wider text-sm ${activeTab === 'log' ? 'text-emerald-600 border-b-4 border-emerald-500 bg-emerald-50' : 'text-slate-700 hover:bg-slate-50'}`}>Practice Log</button>
            </div>

            <div className="p-8 flex-1 overflow-y-auto bg-slate-50/50">
              {/* Games Tab */}
              {activeTab === 'games' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[ 
                    { title: 'Rocket Reading', lvl: 'Level 12', color: 'bg-orange-50', text: 'text-orange-900', border: 'border-orange-200', icon: '🚀' },
                    { title: 'Finger Fishing', lvl: 'Level 8', color: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-200', icon: '🎣' },
                    { title: 'Rhythm Rapids', lvl: 'Level 5', color: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-200', icon: '🌊' },
                  ].map(game => (
                    <div key={game.title} className={`${game.color} ${game.border} border-2 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:-translate-y-1 transition-transform cursor-pointer shadow-sm`}>
                      <div className="text-4xl mb-2">{game.icon}</div>
                      <h3 className={`font-black ${game.text} text-xl leading-tight`}>{game.title}</h3>
                      <div className="bg-white/60 px-4 py-1 rounded-full text-sm font-bold shadow-sm">Highest: {game.lvl}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Challenges Tab */}
              {activeTab === 'challenges' && (
                <div className="flex flex-col gap-4">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center hover:border-fuchsia-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-fuchsia-100 rounded-full flex items-center justify-center text-2xl">🎯</div>
                      <div>
                        <h3 className="font-black text-slate-800">Long Note Legend</h3>
                        <p className="text-sm text-slate-700 font-medium">Played 2 days ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-2xl text-fuchsia-600">45s</div>
                      <div className="text-xs font-bold text-slate-700 uppercase">High Score</div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center hover:border-fuchsia-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">👅</div>
                      <div>
                        <h3 className="font-black text-slate-800">Tonguing Tornado</h3>
                        <p className="text-sm text-slate-700 font-medium">Played 5 days ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-2xl text-orange-600">120 BPM</div>
                      <div className="text-xs font-bold text-slate-700 uppercase">High Score</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Practice Log Tab */}
              {activeTab === 'log' && (
                <div className="relative border-l-4 border-slate-200 ml-6 space-y-8 pb-8">
                  <div className="relative">
                    <div className="absolute -left-[30px] top-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-50"></div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm ml-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-black text-slate-800 text-lg">Flow Practice Completed</h3>
                        <span className="text-slate-700 font-bold text-sm">Today, 4:30 PM</span>
                      </div>
                      <p className="text-slate-600">Practiced C Major Scale and Minuet in G.</p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[30px] top-1 w-6 h-6 bg-sky-500 rounded-full border-4 border-slate-50"></div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm ml-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-black text-slate-800 text-lg">Sight-Read Soaring</h3>
                        <span className="text-slate-700 font-bold text-sm">Yesterday, 5:15 PM</span>
                      </div>
                      <p className="text-slate-600">Completed Level 4. Accuracy: 92%.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Teacher Action Panel */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-slate-800 rounded-[2rem] p-6 shadow-xl flex flex-col gap-6 sticky top-32">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white">Teacher Actions</h2>
              <p className="text-slate-700 text-sm font-medium mt-1">Assign tasks and guide {(student.name || 'Student').split(' ')[0]}'s journey.</p>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={() => setShowAlertForm(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-6 rounded-2xl transition-all flex items-center gap-4 text-left group shadow-md"
              >
                <div className="bg-indigo-500/50 p-3 rounded-full group-hover:scale-110 transition-transform"><Bell className="w-6 h-6" /></div>
                <div>
                  <div className="text-lg uppercase tracking-wider">Set an Adventure Alert</div>
                  <div className="text-indigo-200 text-sm font-bold">Assign a custom quest</div>
                </div>
              </button>

              <button 
                onClick={() => setShowGoalForm(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-6 rounded-2xl transition-all flex items-center gap-4 text-left group shadow-md"
              >
                <div className="bg-emerald-500/50 p-3 rounded-full group-hover:scale-110 transition-transform"><Target className="w-6 h-6" /></div>
                <div>
                  <div className="text-lg uppercase tracking-wider">Set a SMART Goal</div>
                  <div className="text-emerald-200 text-sm font-bold">Build weekly/monthly habits</div>
                </div>
              </button>

              <button 
                onClick={() => alert('To assign or edit repertoire, please use your Master Syllabus Library from the main Teacher view!')}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-4 px-6 rounded-2xl transition-all flex items-center gap-4 text-left group shadow-md"
              >
                <div className="bg-rose-500/50 p-3 rounded-full group-hover:scale-110 transition-transform"><BookOpen className="w-6 h-6" /></div>
                <span className="leading-tight">Add New<br/>Repertoire</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {showAlertForm && (
        <CreateAdventureAlert 
          onClose={() => setShowAlertForm(false)}
          prefillStudentId={student.id}
          prefillStudentName={student.name}
        />
      )}

      {showGoalForm && (
        <SetGoal onClose={() => setShowGoalForm(false)} />
      )}
    </div>
  );
}
