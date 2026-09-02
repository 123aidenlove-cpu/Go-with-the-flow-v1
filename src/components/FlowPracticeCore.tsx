import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Zap, Scissors, RefreshCw, FastForward, Brain, Rewind, CheckCircle, Trophy, Volume2 } from 'lucide-react';

type Stage = 'play-through' | 'practice-powers' | 'finale';

const powers = [
  { id: 'vocalise', name: 'Vocalise', icon: <Volume2 className="w-8 h-8" />, color: 'bg-pink-500' },
  { id: 'isolate', name: 'Isolate', icon: <Scissors className="w-8 h-8" />, color: 'bg-red-500' },
  { id: 'surgery', name: 'Surgery', icon: <Zap className="w-8 h-8" />, color: 'bg-orange-500' },
  { id: 'loop', name: 'Loop', icon: <RefreshCw className="w-8 h-8" />, color: 'bg-blue-500' },
  { id: 'super-loop', name: 'Super Loop', icon: <FastForward className="w-8 h-8" />, color: 'bg-purple-500' },
  { id: 'mental', name: 'Mental Practice', icon: <Brain className="w-8 h-8" />, color: 'bg-indigo-500' },
  { id: 'rewind', name: 'Rewind', icon: <Rewind className="w-8 h-8" />, color: 'bg-teal-500' }
];

export const FlowPracticeCore: React.FC = () => {
  const [stage, setStage] = useState<Stage>('play-through');
  const [selectedPower, setSelectedPower] = useState<string | null>(null);

  const handleFinish = () => {
    // In a real app, save to Supabase here
    alert("Session saved to practice_logs!");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-8 font-sans">
      <header className="w-full max-w-4xl flex justify-between items-center mb-12">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Flow Practice Engine
        </h1>
        <div className="flex space-x-2">
          {['play-through', 'practice-powers', 'finale'].map((s, i) => (
            <div key={s} className={`h-3 w-16 rounded-full ${stage === s ? 'bg-blue-500' : 'bg-slate-700'}`} />
          ))}
        </div>
      </header>

      <main className="w-full max-w-4xl bg-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <AnimatePresence mode="wait">
          {stage === 'play-through' && (
            <motion.div key="play" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center">
              <h2 className="text-3xl font-bold mb-6 text-center">Play Through</h2>
              <p className="text-xl text-slate-300 mb-8 text-center max-w-2xl">
                Play the full piece from start to finish. Identify any tricky parts along the way!
              </p>
              
              <div className="w-48 h-48 bg-slate-700 rounded-full flex items-center justify-center mb-8 hover:bg-slate-600 cursor-pointer transition shadow-xl border-4 border-slate-600 hover:border-blue-500 group">
                <Play className="w-24 h-24 text-blue-500 group-hover:text-blue-400 ml-4" />
              </div>

              {/* Mini Maestro */}
              <div className="bg-blue-900/50 border border-blue-500/30 p-4 rounded-xl flex items-center space-x-4 mb-8">
                <div className="text-3xl">🧙‍♂️</div>
                <p className="text-blue-200 font-medium italic">"Use lots of air! Keep that steady stream going!"</p>
              </div>

              <button onClick={() => setStage('practice-powers')} className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl font-bold text-lg hover:from-blue-400 hover:to-indigo-500 transition shadow-lg w-full max-w-xs">
                To Practice Powers
              </button>
            </motion.div>
          )}

          {stage === 'practice-powers' && (
            <motion.div key="powers" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h2 className="text-3xl font-bold mb-6 text-center">Deploy Practice Powers</h2>
              <p className="text-lg text-slate-300 mb-8 text-center">Select a power to tackle those tricky spots.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {powers.map((power) => (
                  <motion.button
                    key={power.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedPower(power.id)}
                    className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all ${
                      selectedPower === power.id ? 'border-white ring-4 ring-white/20' : 'border-transparent'
                    } ${power.color} shadow-lg`}
                  >
                    {power.icon}
                    <span className="mt-3 font-bold">{power.name}</span>
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-center">
                <button onClick={() => setStage('finale')} className="px-8 py-4 bg-green-500 rounded-xl font-bold text-lg hover:bg-green-400 transition shadow-lg w-full max-w-xs">
                  Finish Practice
                </button>
              </div>
            </motion.div>
          )}

          {stage === 'finale' && (
            <motion.div key="finale" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center">
              <Trophy className="w-32 h-32 text-yellow-400 mb-6" />
              <h2 className="text-4xl font-black mb-4 text-center text-yellow-400">Great Job!</h2>
              <p className="text-xl text-slate-300 mb-8 text-center max-w-xl">
                You've tackled some tough spots and improved your skills. Time to log your progress!
              </p>

              <div className="w-full max-w-md bg-slate-700/50 p-6 rounded-2xl mb-8 border border-slate-600">
                <h3 className="font-bold text-lg mb-4 flex items-center"><CheckCircle className="mr-2 text-green-400" /> Session Summary</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex justify-between"><span>Time Practiced:</span> <span className="font-bold text-white">15 minutes</span></li>
                  <li className="flex justify-between"><span>Powers Used:</span> <span className="font-bold text-white">3</span></li>
                  <li className="flex justify-between"><span>Goals Achieved:</span> <span className="font-bold text-white">Toned up high notes</span></li>
                </ul>
              </div>

              <button onClick={handleFinish} className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-bold text-xl hover:from-yellow-400 hover:to-orange-400 transition shadow-lg w-full max-w-sm text-slate-900">
                Log Practice Session
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
