import { BackButton } from './ui/BackButton';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Settings, Mic, Link2, Layout, Shield, RefreshCw, LogOut, CheckCircle2, Volume2, User, Trash2 } from 'lucide-react';
import { useInstrument } from '../contexts/InstrumentContext';

interface SettingsHubProps {
  onBack: () => void;
  onLogout?: () => void;
}

type Tab = 'account' | 'audio' | 'linking' | 'gameplay' | 'data';

export default function SettingsHub({ onBack, onLogout }: SettingsHubProps) {
  const [activeTab, setActiveTab] = useState<Tab>('account');
  
  const { instrument, setInstrument } = useInstrument();
  
  // Audio state
  const [micSensitivity, setMicSensitivity] = useState(50);
  const [noiseGate, setNoiseGate] = useState(20);
  const [musicVolume, setMusicVolume] = useState(80);
  
  // Linking state
  const [inviteCode, setInviteCode] = useState('');
  const [linkStatus, setLinkStatus] = useState<'unlinked' | 'linking' | 'linked'>('unlinked');

  // Gameplay state
  const [notationSystem, setNotationSystem] = useState<'alphabetical' | 'solfege'>('alphabetical');
  const [highContrast, setHighContrast] = useState(false);
  const [leftHanded, setLeftHanded] = useState(false);

  const handleLinkCode = () => {
    if (inviteCode.length === 6) {
      setLinkStatus('linking');
      setTimeout(() => setLinkStatus('linked'), 1500);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col font-sans overflow-y-auto" id="settings-hub-arena">
      <BackButton onClick={onBack} />
      {/* Header */}
      <div className="bg-slate-800 p-4 flex justify-between items-center shadow-lg z-20 border-b border-slate-700">
        
        <h1 className="text-xl font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-400" /> Master Settings
        </h1>
        <div className="w-24" />
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-900">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-80 bg-slate-800 border-r border-slate-700 flex flex-col p-4 md:p-6 gap-2 shrink-0">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Configuration</h2>
          
          <button onClick={() => setActiveTab('account')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${activeTab === 'account' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}>
            <User className="w-6 h-6" />
            <span className="font-bold text-lg">Account</span>
          </button>

          <button onClick={() => setActiveTab('audio')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${activeTab === 'audio' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}>
            <Mic className="w-6 h-6" />
            <span className="font-bold text-lg">Audio & Mic</span>
          </button>
          
          <button onClick={() => setActiveTab('linking')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${activeTab === 'linking' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}>
            <Link2 className="w-6 h-6" />
            <span className="font-bold text-lg">Profile Linking</span>
          </button>
          
          <button onClick={() => setActiveTab('gameplay')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${activeTab === 'gameplay' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}>
            <Layout className="w-6 h-6" />
            <span className="font-bold text-lg">Gameplay & UI</span>
          </button>
          
          <button onClick={() => setActiveTab('data')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${activeTab === 'data' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}>
            <Shield className="w-6 h-6" />
            <span className="font-bold text-lg">Data & Privacy</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 relative">
          <AnimatePresence mode="wait">
            
            {/* 0. ACCOUNT */}
            {activeTab === 'account' && (
              <motion.div key="account" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl">
                <div className="mb-10">
                  <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-widest">Account & Profile</h2>
                  <p className="text-slate-400 font-bold">Manage your Musictopia account, switch profiles, or log out.</p>
                </div>

                <div className="space-y-6">
                  {/* Logout Button */}
                  <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="text-2xl font-black text-white mb-2">Sign Out</h3>
                      <p className="text-slate-400 text-sm">Log out of your current session on this device.</p>
                    </div>
                    <button 
                      onClick={onLogout}
                      className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_0_#475569] active:translate-y-1 active:shadow-none w-full md:w-auto flex items-center justify-center gap-3"
                    >
                      <LogOut className="w-6 h-6" /> Log Out
                    </button>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-rose-900/20 rounded-3xl p-8 border border-rose-900/50 mt-8">
                    <h3 className="text-2xl font-black text-rose-500 mb-2 flex items-center gap-2">
                      <Trash2 className="w-6 h-6" /> Danger Zone
                    </h3>
                    <p className="text-rose-200/70 text-sm mb-6">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button 
                      onClick={() => {
                        if(window.confirm('Are you absolutely sure you want to delete your account? All progress will be lost forever.')) {
                          alert('Account deletion request sent to support. Your data will be removed within 30 days.');
                          if(onLogout) onLogout();
                        }
                      }}
                      className="px-6 py-3 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-400 font-bold rounded-xl transition-colors w-full md:w-auto"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 1. AUDIO & MIC */}
            {activeTab === 'audio' && (
              <motion.div key="audio" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl">
                <div className="mb-10">
                  <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-widest">Audio Calibration</h2>
                  <p className="text-slate-400 font-bold">Tune the Web Audio API engine for your specific instrument and room environment.</p>
                </div>

                <div className="space-y-8">
                  <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl">
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <h3 className="text-2xl font-black text-white mb-1">Microphone Sensitivity</h3>
                        <p className="text-slate-400 text-sm">Adjust how loudly you need to play to register a note.</p>
                      </div>
                      <span className="text-3xl font-black text-blue-400">{micSensitivity}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={micSensitivity} onChange={(e) => setMicSensitivity(Number(e.target.value))} className="w-full accent-blue-500 h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                    
                    {/* Live VU Meter Simulation */}
                    <div className="mt-8 bg-slate-900 rounded-xl p-4 border border-slate-700">
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Live VU Meter</p>
                      <div className="flex gap-1 h-8">
                        {Array.from({length: 20}).map((_, i) => (
                          <div key={i} className={`flex-1 rounded-sm ${i < (micSensitivity / 5) ? (i > 15 ? 'bg-rose-500' : i > 10 ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-slate-800'}`} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl">
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <h3 className="text-2xl font-black text-white mb-1">Noise Gate (Threshold)</h3>
                        <p className="text-slate-400 text-sm">Filters out background room noise so it doesn't trigger gameplay.</p>
                      </div>
                      <span className="text-3xl font-black text-blue-400">{noiseGate}dB</span>
                    </div>
                    <input type="range" min="0" max="100" value={noiseGate} onChange={(e) => setNoiseGate(Number(e.target.value))} className="w-full accent-blue-500 h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                  </div>

                  <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                      <Volume2 className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-white mb-1">Music & Backing Tracks</h3>
                      <input type="range" min="0" max="100" value={musicVolume} onChange={(e) => setMusicVolume(Number(e.target.value))} className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. PROFILE LINKING */}
            {activeTab === 'linking' && (
              <motion.div key="linking" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl">
                <div className="mb-10">
                  <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-widest">Studio Linking</h2>
                  <p className="text-slate-400 font-bold">Connect your app to a parent or teacher's dashboard to share practice logs and diagnostic results.</p>
                </div>

                <div className="bg-slate-800 rounded-3xl p-8 md:p-12 border border-slate-700 shadow-xl text-center">
                  <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-purple-500/30">
                    {linkStatus === 'linked' ? <CheckCircle2 className="w-12 h-12 text-purple-400" /> : <Link2 className="w-12 h-12 text-purple-400" />}
                  </div>

                  {linkStatus === 'unlinked' ? (
                    <>
                      <h3 className="text-2xl font-black text-white mb-4">Enter 6-Digit Studio Invite Code</h3>
                      <div className="max-w-xs mx-auto">
                        <input 
                          type="text" 
                          maxLength={6}
                          placeholder="000000"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                          className="w-full bg-slate-900 border-4 border-slate-700 rounded-2xl px-6 py-4 text-center text-4xl font-black text-white tracking-[0.5em] mb-6 focus:border-purple-500 focus:outline-none transition-colors" 
                        />
                        <button 
                          onClick={handleLinkCode}
                          disabled={inviteCode.length !== 6}
                          className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_0_#7e22ce] disabled:shadow-none active:translate-y-1 active:shadow-none"
                        >
                          Link Account
                        </button>
                      </div>
                    </>
                  ) : linkStatus === 'linking' ? (
                    <div className="py-12">
                      <RefreshCw className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                      <h3 className="text-xl font-black text-white animate-pulse">Verifying Studio Code...</h3>
                    </div>
                  ) : (
                    <div className="py-8">
                      <h3 className="text-3xl font-black text-emerald-400 mb-2 uppercase tracking-widest">Successfully Linked!</h3>
                      <p className="text-slate-300 font-bold mb-8">Your account is now connected to <strong>Mr. Aiden's Master Studio</strong>.</p>
                      <button 
                        onClick={() => { setLinkStatus('unlinked'); setInviteCode(''); }}
                        className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors inline-flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Unlink Account
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 3. GAMEPLAY & ACCESSIBILITY */}
            {activeTab === 'gameplay' && (
              <motion.div key="gameplay" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl">
                <div className="mb-10">
                  <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-widest">Gameplay & UI</h2>
                  <p className="text-slate-400 font-bold">Customize how the game looks and displays musical information.</p>
                </div>

                <div className="space-y-6">
                  {/* Instrument Selection */}
                  <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl">
                    <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest border-b border-slate-700 pb-4">Instrument Selection</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {['Clarinet', 'Trumpet', 'Flute', 'Alto Saxophone', 'Tenor Saxophone', 'Baritone/Euphonium', 'Violin', 'Cello', 'Piano', 'Soprano Voice', 'Alto Voice', 'Tenor Voice', 'Bass Voice'].map(inst => (
                        <button
                          key={inst}
                          onClick={() => setInstrument(inst as any)}
                          className={`p-4 rounded-xl font-bold transition-all ${instrument === inst ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                        >
                          {inst}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notation System */}
                  <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl">
                    <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest border-b border-slate-700 pb-4">Notation Display System</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button 
                        onClick={() => setNotationSystem('alphabetical')}
                        className={`p-6 rounded-2xl border-4 text-left transition-all ${notationSystem === 'alphabetical' ? 'bg-emerald-500/20 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                      >
                        <span className="text-3xl font-black mb-2 block">C - D - E</span>
                        <span className="font-bold uppercase text-sm block mb-1">Alphabetical</span>
                        <span className="text-xs opacity-80">Standard US/UK/Aus system.</span>
                      </button>
                      <button 
                        onClick={() => setNotationSystem('solfege')}
                        className={`p-6 rounded-2xl border-4 text-left transition-all ${notationSystem === 'solfege' ? 'bg-emerald-500/20 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                      >
                        <span className="text-3xl font-black mb-2 block">Do - Re - Mi</span>
                        <span className="font-bold uppercase text-sm block mb-1">Fixed Solfège</span>
                        <span className="text-xs opacity-80">Standard EU/Latin American system.</span>
                      </button>
                    </div>
                  </div>

                  {/* Accessibility Toggles */}
                  <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl">
                    <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest border-b border-slate-700 pb-4">Accessibility</h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-white">High Contrast Visual Mode</h4>
                          <p className="text-slate-400 text-sm">Increases border thickness and font weight for better legibility.</p>
                        </div>
                        <button 
                          onClick={() => setHighContrast(!highContrast)}
                          className={`w-16 h-8 rounded-full p-1 transition-colors ${highContrast ? 'bg-emerald-500' : 'bg-slate-600'}`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full transition-transform ${highContrast ? 'translate-x-8' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="h-px bg-slate-700" />

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-white">Left-Handed UI Layout</h4>
                          <p className="text-slate-400 text-sm">Flips HUD elements and thumb controls for left-handed players.</p>
                        </div>
                        <button 
                          onClick={() => setLeftHanded(!leftHanded)}
                          className={`w-16 h-8 rounded-full p-1 transition-colors ${leftHanded ? 'bg-emerald-500' : 'bg-slate-600'}`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full transition-transform ${leftHanded ? 'translate-x-8' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. DATA & PRIVACY */}
            {activeTab === 'data' && (
              <motion.div key="data" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl">
                <div className="mb-10">
                  <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-widest">Data & Privacy</h2>
                  <p className="text-slate-400 font-bold">Manage your save files and diagnostic assessments.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-black text-white mb-2">Cloud Save Backup</h3>
                      <p className="text-slate-400 text-sm">Last synced: 2 minutes ago</p>
                    </div>
                    <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors flex items-center gap-2 w-full md:w-auto justify-center">
                      <RefreshCw className="w-5 h-5" /> Force Sync Now
                    </button>
                  </div>

                  <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl">
                    <h3 className="text-xl font-black text-white mb-4">Retake Placement Test</h3>
                    <p className="text-slate-400 text-sm mb-6">
                      If you feel your current unlocked levels are too hard or too easy, you can retake the "Match It" diagnostic test to recalibrate your starting position.
                    </p>
                    <button className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_0_#9f1239] active:translate-y-1 active:shadow-none w-full md:w-auto">
                      Retake "Match It" Diagnostic
                    </button>
                  </div>


                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
