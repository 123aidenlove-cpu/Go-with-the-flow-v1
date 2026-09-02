import React from 'react';
import { motion } from 'motion/react';
import { X, Target, Star, Award, Zap, Bell, CheckCircle2, Clock } from 'lucide-react';

interface StudentQuestLogProps {
  onClose: () => void;
}

export default function StudentQuestLog({ onClose }: StudentQuestLogProps) {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[150] flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden">
      <div className="bg-slate-900 rounded-[2.5rem] w-full max-w-6xl h-full max-h-[90vh] shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-slate-700">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white relative border-b border-slate-700 shrink-0">
          <button onClick={onClose} className="absolute top-8 right-8 bg-slate-700 hover:bg-slate-600 p-3 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-amber-500/20 p-4 rounded-3xl shadow-inner border border-amber-500/30">
              <Target className="w-10 h-10 text-amber-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest drop-shadow-md text-amber-400">
                Quest Log
              </h1>
              <p className="text-slate-700 font-bold tracking-wider text-lg">Track your active adventures and daily goals.</p>
            </div>
          </div>
        </div>

        {/* Scrolling Content Area */}
        <div className="p-8 flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Main Adventure Alerts (4 Slots) & Minigames */}
          <div className="lg:col-span-2 space-y-8">
            
            <section>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                <Bell className="w-6 h-6 text-orange-500" /> 
                Active Adventure Alerts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Slot 1: Teacher Alert (Orange) */}
                <div className="bg-slate-800 border-2 border-orange-500 rounded-3xl p-6 relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">Teacher Quest</div>
                  <h3 className="text-xl font-black text-white mb-2 mt-4">Minuet Mastery</h3>
                  <p className="text-slate-700 font-bold mb-6 text-sm">Practice Minuet in G for 15 minutes.</p>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between text-xs font-black text-orange-400 mb-2">
                      <span>Progress</span>
                      <span>10 / 15 mins</span>
                    </div>
                    <div className="h-3 bg-slate-900 rounded-full overflow-hidden mb-4">
                      <motion.div initial={{ width: 0 }} animate={{ width: '66%' }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full bg-orange-500 rounded-full" />
                    </div>
                    <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-700">
                      <div className="flex items-center gap-1 font-black text-white"><span className="text-xl">💎</span> 200</div>
                      <div className="flex items-center gap-1 font-black text-white"><Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> 500</div>
                    </div>
                  </div>
                </div>

                {/* Slot 2: Empty Teacher Slot */}
                <div className="bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-3xl p-6 flex flex-col items-center justify-center text-center opacity-70">
                  <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-slate-700" />
                  </div>
                  <h3 className="text-slate-700 font-black uppercase tracking-widest">Empty Slot</h3>
                  <p className="text-slate-700 font-bold text-sm">Waiting for your teacher to assign a new quest...</p>
                </div>

                {/* Slot 3: App Alert (Blue) */}
                <div className="bg-slate-800 border-2 border-sky-500 rounded-3xl p-6 relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 right-0 bg-sky-500 text-white text-xs font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">App Quest</div>
                  <h3 className="text-xl font-black text-white mb-2 mt-4">Long Note Legend</h3>
                  <p className="text-slate-700 font-bold mb-6 text-sm">Hold long notes for a combined 60 seconds.</p>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between text-xs font-black text-sky-400 mb-2">
                      <span>Progress</span>
                      <span>45 / 60 sec</span>
                    </div>
                    <div className="h-3 bg-slate-900 rounded-full overflow-hidden mb-4">
                      <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }} className="h-full bg-sky-500 rounded-full" />
                    </div>
                    <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-700">
                      <div className="flex items-center gap-1 font-black text-white"><span className="text-xl">💎</span> 150</div>
                      <div className="flex items-center gap-1 font-black text-white"><Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> 300</div>
                    </div>
                  </div>
                </div>

                {/* Slot 4: Empty App Slot */}
                <div className="bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-3xl p-6 flex flex-col items-center justify-center text-center opacity-70">
                   <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-slate-700" />
                  </div>
                  <h3 className="text-slate-700 font-black uppercase tracking-widest">Cooldown</h3>
                  <p className="text-slate-700 font-bold text-sm">New app quest arriving in 2 days.</p>
                </div>

              </div>
            </section>

            <section>
              <h2 className="text-xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                <Zap className="w-6 h-6 text-yellow-400" /> 
                Endless Minigame Adventures
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex items-center justify-between hover:bg-slate-750 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="bg-rose-500 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">🚀</div>
                    <div>
                      <h4 className="font-black text-white">Rocket Reading</h4>
                      <p className="text-xs font-bold text-slate-700">Blast 500 metres</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-white text-sm">💎 50</div>
                    <div className="font-black text-yellow-400 text-sm">⭐ 100</div>
                  </div>
                </div>
                
                <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex items-center justify-between hover:bg-slate-750 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="bg-cyan-500 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">🛶</div>
                    <div>
                      <h4 className="font-black text-white">Rhythm Rapids</h4>
                      <p className="text-xs font-bold text-slate-700">Paddle past 20 rocks</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-white text-sm">💎 50</div>
                    <div className="font-black text-yellow-400 text-sm">⭐ 100</div>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: SMART Goals */}
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 flex flex-col h-full">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" /> 
              My SMART Goals
            </h2>

            <div className="space-y-6 flex-1">
              
              {/* Weekly Goal */}
              <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-2 border-indigo-500/50 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">This Week</div>
                <h3 className="text-lg font-black text-white mb-1">Consistent Practice</h3>
                <p className="text-indigo-200 font-bold text-sm mb-6">Target: 60 Minutes</p>
                
                <div className="flex justify-between text-xs font-black text-indigo-300 mb-2">
                  <span>Progress</span>
                  <span>20 / 60 mins</span>
                </div>
                <div className="h-4 bg-slate-900 rounded-full overflow-hidden mb-4 shadow-inner">
                  <motion.div initial={{ width: 0 }} animate={{ width: '33%' }} transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }} className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                </div>

                <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl">
                  <div className="flex items-center gap-1 font-black text-white text-sm"><span className="text-lg">💎</span> 120</div>
                </div>
              </div>

              {/* Monthly Goal */}
              <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border-2 border-emerald-500/50 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">This Month</div>
                <h3 className="text-lg font-black text-white mb-1">Session Master</h3>
                <p className="text-emerald-200 font-bold text-sm mb-6">Target: 15 Sessions</p>
                
                <div className="flex justify-between text-xs font-black text-emerald-300 mb-2">
                  <span>Progress</span>
                  <span>12 / 15 sessions</span>
                </div>
                <div className="h-4 bg-slate-900 rounded-full overflow-hidden mb-4 shadow-inner">
                  <motion.div initial={{ width: 0 }} animate={{ width: '80%' }} transition={{ duration: 1.5, ease: 'easeOut', delay: 0.6 }} className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
                </div>

                <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl">
                  <div className="flex items-center gap-1 font-black text-white text-sm"><span className="text-lg">💎</span> 600</div>
                </div>
              </div>

            </div>

            <button 
              onClick={() => alert('Opening Goal Builder...')}
              className="w-full mt-6 bg-slate-700 hover:bg-slate-600 text-white font-black py-4 rounded-xl border border-slate-600 transition-colors uppercase tracking-widest text-sm">
              Manage Goals
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
