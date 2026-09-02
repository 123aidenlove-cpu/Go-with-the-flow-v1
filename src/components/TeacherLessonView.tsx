import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, X, Play, Target, Sparkles, BookOpen, Music, Search, Plus, CheckCircle, Bell, MessageSquare, Star, Mic, AlertTriangle } from 'lucide-react';
import CreateRepertoire from './CreateRepertoire';
import CreateAdventureAlert from './CreateAdventureAlert';

interface TeacherLessonViewProps {
  onExit: () => void;
}

type ViewState = 'grid' | 'play' | 'games' | 'warmups' | 'challenges';
type FinishStep = 'none' | 'confirm' | 'reward' | 'reflection';

export default function TeacherLessonView({ onExit }: TeacherLessonViewProps) {
  const [time, setTime] = useState(0);
  const [activeView, setActiveView] = useState<ViewState>('grid');
  const [showMaestro, setShowMaestro] = useState(true);
  const [finishStep, setFinishStep] = useState<FinishStep>('none');
  const [bubbles, setBubbles] = useState(['', '', '']);
  const [showCreateRep, setShowCreateRep] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  
  const studentName = localStorage.getItem('teacherViewStudentName') || 'Student'; // Can be populated if needed, defaulting for now

  // Timer
  useEffect(() => {
    if (finishStep === 'none') {
      const interval = setInterval(() => setTime(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [finishStep]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getMaestroMessage = () => {
    switch(activeView) {
      case 'games': 
        return "Help your student connect Notes to playing! Ask your student to play the Note on the screen using their instrument. When they play it correctly, tap the correct answer for them. This reinforces the pathway from Note Recognition to Playing.";
      case 'play':
        return "Building repertoire? Remember to add a quick 20-second audio guide later so they can hear the goal tempo!";
      case 'challenges':
        return "Challenges test pure technique. Watch their posture and breathing during these high-intensity sprints!";
      case 'warmups':
        return "Start slow! Ensure fingering is correct before speeding up the scales.";
      default: 
        return "Welcome to the lesson! Select an activity to begin tracking practice data.";
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-100 flex flex-col font-sans z-50 overflow-hidden">
      {/* Persistent Top Bar */}
      <div className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between shadow-xl z-20">
        <div className="flex items-center gap-6">
          <div className="bg-slate-800 border-2 border-slate-700 px-6 py-2 rounded-full font-black text-2xl font-mono tracking-wider flex items-center gap-3">
            <Timer className="w-6 h-6 text-sky-400" />
            {formatTime(time)}
          </div>
          <div className="font-bold text-slate-700">
            Active Lesson: <span className="text-white">{studentName}</span>
          </div>
        </div>
        <button 
          onClick={() => setFinishStep('confirm')}
          className="bg-rose-500 hover:bg-rose-400 text-white font-black px-8 py-3 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(244,63,94,0.5)] transition-all active:scale-95"
        >
          Finish Lesson
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {activeView === 'grid' && (
            <motion.div 
              key="grid" 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }} 
              className="grid grid-cols-2 gap-8 w-full max-w-4xl"
            >
              <button onClick={() => setActiveView('games')} className="aspect-square bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[3rem] p-8 flex flex-col items-center justify-center gap-6 shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:-translate-y-2 transition-all group">
                <div className="bg-white/20 p-8 rounded-full group-hover:scale-110 transition-transform"><Sparkles className="w-24 h-24 text-white" /></div>
                <h2 className="text-4xl font-black text-white tracking-widest uppercase">Games</h2>
              </button>
              <button onClick={() => setActiveView('warmups')} className="aspect-square bg-gradient-to-br from-orange-400 to-orange-600 rounded-[3rem] p-8 flex flex-col items-center justify-center gap-6 shadow-[0_20px_40px_rgba(249,115,22,0.3)] hover:-translate-y-2 transition-all group">
                <div className="bg-white/20 p-8 rounded-full group-hover:scale-110 transition-transform"><Target className="w-24 h-24 text-white" /></div>
                <h2 className="text-4xl font-black text-white tracking-widest uppercase">Warmups</h2>
              </button>
              <button onClick={() => setActiveView('challenges')} className="aspect-square bg-gradient-to-br from-fuchsia-400 to-fuchsia-600 rounded-[3rem] p-8 flex flex-col items-center justify-center gap-6 shadow-[0_20px_40px_rgba(217,70,239,0.3)] hover:-translate-y-2 transition-all group">
                <div className="bg-white/20 p-8 rounded-full group-hover:scale-110 transition-transform"><Star className="w-24 h-24 text-white" /></div>
                <h2 className="text-4xl font-black text-white tracking-widest uppercase">Challenges</h2>
              </button>
              <button onClick={() => setActiveView('play')} className="aspect-square bg-gradient-to-br from-sky-400 to-sky-600 rounded-[3rem] p-8 flex flex-col items-center justify-center gap-6 shadow-[0_20px_40px_rgba(14,165,233,0.3)] hover:-translate-y-2 transition-all group">
                <div className="bg-white/20 p-8 rounded-full group-hover:scale-110 transition-transform"><Music className="w-24 h-24 text-white" /></div>
                <h2 className="text-4xl font-black text-white tracking-widest uppercase">Play</h2>
              </button>
            </motion.div>
          )}

          {activeView === 'play' && (
            <motion.div 
              key="play" 
              initial={{ opacity: 0, x: 100 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -100 }} 
              className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl h-[80vh] flex flex-col overflow-hidden"
            >
              <div className="bg-sky-600 p-8 flex justify-between items-center text-white">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-widest">Repertoire Manager</h2>
                  <p className="text-sky-200 font-bold mt-1">Assign and manage lesson pieces.</p>
                </div>
                <button onClick={() => setActiveView('grid')} className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors">
                  <X className="w-8 h-8" />
                </button>
              </div>
              <div className="p-8 flex-1 flex flex-col gap-6">
                <div className="flex gap-4">
                  <div className="flex-1 bg-slate-100 rounded-2xl flex items-center px-6">
                    <Search className="w-6 h-6 text-slate-700" />
                    <input type="text" placeholder="Search built-in repertoire..." className="w-full bg-transparent p-4 outline-none font-bold text-slate-700 text-lg" />
                  </div>
                  <button 
                    onClick={() => setShowCreateRep(true)}
                    className="bg-sky-500 hover:bg-sky-400 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-3 transition-colors"
                  >
                    <Plus className="w-6 h-6" /> Add New
                  </button>
                </div>
                <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-700 font-bold text-xl">
                  Select or create a piece to begin.
                </div>
              </div>
            </motion.div>
          )}

          {(activeView === 'games' || activeView === 'warmups' || activeView === 'challenges') && (
            <motion.div 
              key="generic" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl h-[80vh] flex flex-col items-center justify-center"
            >
              <h2 className="text-4xl font-black text-slate-800 capitalize">{activeView} Mode Active</h2>
              <p className="text-slate-700 font-bold mt-4">Check MiniMaestro for tips!</p>
              <button onClick={() => setActiveView('grid')} className="mt-8 bg-slate-800 text-white px-8 py-4 rounded-full font-bold hover:bg-slate-700">Back to Core Grid</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MiniMaestro Assistant */}
      <AnimatePresence>
        {showMaestro && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: -50 }} 
            animate={{ opacity: 1, y: 0, x: 0 }} 
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            className="fixed bottom-8 left-8 max-w-md bg-white rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.15)] border-4 border-amber-300 flex overflow-hidden z-40"
          >
            <div className="bg-amber-100 p-6 flex items-center justify-center">
              <div className="text-6xl">🦉</div>
            </div>
            <div className="p-6 flex-1 relative">
              <button onClick={() => setShowMaestro(false)} className="absolute top-3 right-3 text-slate-700 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
              <h4 className="font-black text-amber-600 mb-2 uppercase tracking-widest text-xs">MiniMaestro Tip</h4>
              <p className="text-slate-700 font-bold leading-snug text-sm">{getMaestroMessage()}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Repertoire Modal */}
      {showCreateRep && (
        <CreateRepertoire onClose={() => setShowCreateRep(false)} />
      )}

      {/* FINISH LESSON SEQUENCE */}
      <AnimatePresence>
        {finishStep !== 'none' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            {finishStep === 'confirm' && (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[3rem] p-10 max-w-lg w-full text-center shadow-2xl">
                <AlertTriangle className="w-20 h-20 text-rose-500 mx-auto mb-6" />
                <h2 className="text-3xl font-black text-slate-800 mb-4">Save Lesson?</h2>
                <p className="text-slate-700 font-bold mb-8">Discarding will lose all tracked metrics for this session.</p>
                <div className="flex gap-4">
                  <button onClick={onExit} className="flex-1 bg-slate-100 text-rose-600 font-black py-4 rounded-2xl hover:bg-rose-50">Discard</button>
                  <button onClick={() => setFinishStep('reward')} className="flex-1 bg-emerald-500 text-white font-black py-4 rounded-2xl hover:bg-emerald-400">Yes, Save</button>
                </div>
              </motion.div>
            )}

            {finishStep === 'reward' && (
              <motion.div initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-[3rem] p-10 max-w-lg w-full text-center shadow-[0_0_50px_rgba(251,191,36,0.5)] border-8 border-yellow-200 relative overflow-hidden">
                {/* Fake confetti using CSS could go here, for now relying on motion */}
                <Star className="w-32 h-32 text-white mx-auto mb-6 drop-shadow-lg" fill="currentColor" />
                <h2 className="text-4xl font-black text-white mb-2 drop-shadow-md">Congratulations!</h2>
                <p className="text-amber-100 font-bold text-xl mb-8">Great Job in your lesson.</p>
                <div className="bg-white/20 rounded-full p-4 mb-8 inline-block">
                  <span className="font-black text-3xl text-white drop-shadow-md">+100 Quavits</span>
                </div>
                <button onClick={() => setFinishStep('reflection')} className="w-full bg-white text-amber-600 font-black py-4 rounded-2xl hover:bg-yellow-50 shadow-lg text-lg">Continue to Reflection</button>
              </motion.div>
            )}

            {finishStep === 'reflection' && (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-50 rounded-[3rem] w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden shadow-2xl border-4 border-slate-200">
                <div className="bg-slate-900 p-8 flex justify-between items-center text-white shrink-0">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-widest">Reflection & Homework</h2>
                    <p className="text-slate-700 font-bold mt-1">Wrap up the lesson with actionable goals.</p>
                  </div>
                </div>
                <div className="p-8 flex-1 overflow-y-auto flex flex-col gap-8">
                  <button onClick={() => setShowAlertForm(true)} className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border-2 border-indigo-300 font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-colors">
                    <Bell className="w-6 h-6" /> ADD AN ADVENTURE ALERT
                  </button>

                  <div>
                    <h3 className="font-black text-slate-800 text-xl mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" /> Key Focus Areas (The 3 Bubbles)
                    </h3>
                    <div className="flex flex-col gap-4">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-sky-200 transform rotate-45 rounded-sm"></div>
                          <input 
                            type="text" 
                            placeholder={`Focus Point ${i + 1}...`}
                            value={bubbles[i]}
                            onChange={(e) => {
                              const newB = [...bubbles];
                              newB[i] = e.target.value;
                              setBubbles(newB);
                            }}
                            className="w-full bg-sky-100 text-sky-900 placeholder-sky-400 p-4 pl-6 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-sky-400 shadow-sm relative z-10"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-8 bg-white border-t border-slate-200 shrink-0">
                  {/* Visual note for developers: The 'data-lesson-log="true"' attribute acts as the hook for rendering this in a distinct color in the student practice log */}
                  <button 
                    onClick={onExit} 
                    data-lesson-log="true"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-5 rounded-2xl shadow-lg transition-transform hover:-translate-y-1 text-xl flex items-center justify-center gap-3"
                  >
                    <CheckCircle className="w-6 h-6" />
                    SAVE TO PRACTICE LOG
                  </button>
                  <p className="text-center text-xs font-bold text-slate-700 mt-4">Data tagged with lesson-log=true for distinct colored rendering.</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showAlertForm && (
        <CreateAdventureAlert 
          onClose={() => setShowAlertForm(false)}
          prefillStudentId={localStorage.getItem('teacherViewStudentId')}
          prefillStudentName={studentName}
        />
      )}
    </div>
  );
}
