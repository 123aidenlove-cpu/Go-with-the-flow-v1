import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, User, Music, Save, Plus, Settings2, ShieldCheck } from 'lucide-react';

interface InstrumentLockerProps {
  onBack: () => void;
}

const PROFILES = [
  { id: '1', name: 'Aiden', avatar: '🦉', instrument: 'Trumpet', color: 'bg-blue-500' },
  { id: '2', name: 'Sarah', avatar: '🦊', instrument: 'Flute', color: 'bg-emerald-500' },
  { id: '3', name: 'Guest', avatar: '👤', instrument: 'Trumpet', color: 'bg-slate-500' },
];

const INSTRUMENTS = [
  { id: 'trumpet', name: 'Trumpet', family: 'Woodwind', transposition: '-2 Semitones (Bb)', icon: '🥢' },
  { id: 'flute', name: 'Flute', family: 'Woodwind', transposition: 'Concert Pitch (C)', icon: '🎵' },
  { id: 'alto-sax', name: 'Alto Saxophone', family: 'Woodwind', transposition: '+3 Semitones (Eb)', icon: '🎷' },
  { id: 'trumpet', name: 'Trumpet', family: 'Brass', transposition: '-2 Semitones (Bb)', icon: '🎺' },
  { id: 'violin', name: 'Violin', family: 'Strings', transposition: 'Concert Pitch (C)', icon: '🎻' },
];

export default function InstrumentLocker({ onBack }: InstrumentLockerProps) {
  const [activeProfileId, setActiveProfileId] = useState('1');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState('trumpet');

  const activeProfile = PROFILES.find(p => p.id === activeProfileId);

  const handleSave = () => {
    setIsEditing(false);
    // In production, this saves the profile to the DB/Context
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col font-sans" id="instrument-locker-arena">
      {/* Header */}
      <div className="bg-slate-800 p-4 flex justify-between items-center shadow-lg z-20 border-b border-slate-700">
        <button 
          onClick={onBack} 
          className="p-2 hover:bg-white/10 rounded-xl text-slate-300 transition-all flex items-center gap-2 font-bold"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <h1 className="text-xl font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
          Profile & Instrument Locker
        </h1>
        <div className="w-24" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-slate-900">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* COLUMN 1: Profile Selection */}
          <div className="col-span-1 space-y-6">
            <h2 className="text-xl font-black text-slate-400 uppercase tracking-widest border-b border-slate-700 pb-2">
              Studio Profiles
            </h2>
            
            <div className="space-y-4">
              {PROFILES.map(profile => (
                <button
                  key={profile.id}
                  onClick={() => {
                    setActiveProfileId(profile.id);
                    setIsEditing(false);
                    setSelectedInstrument(INSTRUMENTS.find(i => i.name === profile.instrument)?.id || 'trumpet');
                  }}
                  className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all border-4 ${
                    activeProfileId === profile.id 
                      ? 'bg-slate-800 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                      : 'bg-slate-800/50 border-transparent hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner ${profile.color}`}>
                    {profile.avatar}
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-slate-200">{profile.name}</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">{profile.instrument}</p>
                  </div>
                  {activeProfileId === profile.id && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </button>
              ))}

              <button className="w-full p-4 rounded-2xl flex items-center justify-center gap-2 transition-all border-2 border-dashed border-slate-600 text-slate-500 hover:text-slate-300 hover:border-slate-500 hover:bg-slate-800/50">
                <Plus className="w-5 h-5" />
                <span className="font-bold uppercase text-sm">Add Student</span>
              </button>
            </div>
          </div>

          {/* COLUMN 2 & 3: Active Profile Locker */}
          <div className="col-span-1 md:col-span-2">
            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.div 
                  key="view" 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-slate-800 rounded-[2.5rem] border border-slate-700 p-8 shadow-2xl relative overflow-hidden"
                >
                  {/* Decorative Background */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-xl ${activeProfile?.color}`}>
                        {activeProfile?.avatar}
                      </div>
                      <div>
                        <h2 className="text-4xl font-black text-white mb-1">{activeProfile?.name}'s Locker</h2>
                        <p className="text-slate-400 font-bold flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Save Data Synced
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-200 transition-colors"
                    >
                      <Settings2 className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="bg-slate-900/50 rounded-3xl p-6 border border-slate-700 relative z-10">
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Active Instrument Engine</h3>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-32 h-32 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl border-4 border-slate-600 flex items-center justify-center text-6xl shadow-inner">
                        {INSTRUMENTS.find(i => i.name === activeProfile?.instrument)?.icon || '🎵'}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-3xl font-black text-white mb-2">{activeProfile?.instrument}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center bg-slate-800 px-4 py-2 rounded-lg">
                            <span className="text-slate-400 font-bold text-sm">Family</span>
                            <span className="text-slate-200 font-bold">{INSTRUMENTS.find(i => i.name === activeProfile?.instrument)?.family}</span>
                          </div>
                          <div className="flex justify-between items-center bg-slate-800 px-4 py-2 rounded-lg">
                            <span className="text-slate-400 font-bold text-sm">Transposition Offset</span>
                            <span className="text-amber-400 font-bold text-sm bg-amber-400/10 px-2 py-0.5 rounded">
                              {INSTRUMENTS.find(i => i.name === activeProfile?.instrument)?.transposition}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <p className="text-sm text-blue-200 leading-relaxed font-medium">
                        <strong>Transposition Engine Active:</strong> All visual staff notation and microphone pitch detection are automatically calibrated for {activeProfile?.instrument}. The Musical Glossary is now showing {activeProfile?.instrument} fingering charts.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="edit" 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-slate-800 rounded-[2.5rem] border border-blue-500/50 p-8 shadow-2xl relative"
                >
                  <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                    <Settings2 className="w-6 h-6 text-blue-400" /> Edit Locker Configuration
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Select Primary Instrument</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {INSTRUMENTS.map(inst => (
                          <button
                            key={inst.id}
                            onClick={() => setSelectedInstrument(inst.id)}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all ${
                              selectedInstrument === inst.id 
                                ? 'bg-blue-500/20 border-blue-500 text-blue-100' 
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                            }`}
                          >
                            <span className="text-3xl mb-2">{inst.icon}</span>
                            <span className="text-xs font-bold uppercase">{inst.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
                      <h4 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                        ⚠️ Changing Instruments
                      </h4>
                      <p className="text-slate-400 text-sm">
                        Switching your instrument will trigger the Multi-Instrument Transposition Engine. Your Concert Hall repertoire progress is saved separately per instrument, but mini-game currency/XP is shared!
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-4 border-t border-slate-700 pt-6">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      className="px-8 py-3 bg-blue-500 hover:bg-blue-400 text-white font-black uppercase rounded-xl shadow-[0_4px_0_#2563eb] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                    >
                      <Save className="w-5 h-5" /> Save Changes
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
