import React, { useState, useEffect } from 'react';
import { X, Mic, Square, Play, Trash2, Plus, Music, Shield, Repeat, Clock, FastForward, Tag, Save } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface CreateRepertoireProps {
  onClose: () => void;
}

type PowerType = 'loop' | 'metronome' | 'turtle' | 'focus';

interface PowerInstance {
  id: string;
  type: PowerType;
  bars: string;
  hasAudio: boolean;
}

export default function CreateRepertoire({ onClose }: CreateRepertoireProps) {
  const [name, setName] = useState('');
  const [composer, setComposer] = useState('');
  const [date, setDate] = useState('');
  
  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);

  // Grid State
  const [powers, setPowers] = useState<(PowerInstance | null)[]>(Array(9).fill(null));
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  
  // Power Config State
  const [selectedPowerType, setSelectedPowerType] = useState<PowerType | null>(null);
  const [powerBars, setPowerBars] = useState('');
  const [powerRecording, setPowerRecording] = useState(false);
  const [powerRecTime, setPowerRecTime] = useState(0);
  const [powerHasAudio, setPowerHasAudio] = useState(false);

  // Warmup State
  const [targetNotes, setTargetNotes] = useState<string[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [scale, setScale] = useState('c-major');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (addAnother = false) => {
    if (!name.trim()) {
      alert('Please enter a piece name.');
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase.from('repertoire').insert({
        piece_name: name,
        composer,
        practice_powers: powers,
        tricky_notes: targetNotes
      });

      if (error) {
        console.error('Error saving repertoire:', error);
        alert('Failed to save repertoire');
      } else {
        if (addAnother) {
           setName(''); setComposer(''); setDate(''); setPowers(Array(9).fill(null)); setTargetNotes([]);
        } else {
           onClose();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Main Recording Timer
  useEffect(() => {
    let interval: any;
    if (isRecording && recTime < 90) {
      interval = setInterval(() => setRecTime(t => t + 1), 1000);
    } else if (recTime >= 90) {
      setIsRecording(false);
      setHasRecording(true);
    }
    return () => clearInterval(interval);
  }, [isRecording, recTime]);

  // Mini Recording Timer
  useEffect(() => {
    let interval: any;
    if (powerRecording && powerRecTime < 20) {
      interval = setInterval(() => setPowerRecTime(t => t + 1), 1000);
    } else if (powerRecTime >= 20) {
      setPowerRecording(false);
      setPowerHasAudio(true);
    }
    return () => clearInterval(interval);
  }, [powerRecording, powerRecTime]);

  const handleMainRecordToggle = () => {
    if (!isRecording && !hasRecording) {
      setIsRecording(true);
      setRecTime(0);
    } else if (isRecording) {
      setIsRecording(false);
      setHasRecording(true);
    }
  };

  const handleMainDelete = () => {
    setIsRecording(false);
    setHasRecording(false);
    setRecTime(0);
  };

  const handleAddNote = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && noteInput.trim() !== '' && targetNotes.length < 3) {
      setTargetNotes([...targetNotes, noteInput.trim()]);
      setNoteInput('');
    }
  }

  const removeNote = (index: number) => {
    setTargetNotes(targetNotes.filter((_, i) => i !== index));
  };

  const savePower = () => {
    if (activeSlot !== null && selectedPowerType) {
      const newPowers = [...powers];
      newPowers[activeSlot] = {
        id: Math.random().toString(),
        type: selectedPowerType,
        bars: powerBars,
        hasAudio: powerHasAudio
      };
      setPowers(newPowers);
      closePowerConfig();
    }
  };

  const closePowerConfig = () => {
    setActiveSlot(null);
    setSelectedPowerType(null);
    setPowerBars('');
    setPowerHasAudio(false);
    setPowerRecTime(0);
  };

  const renderPowerIcon = (type: PowerType) => {
    switch(type) {
      case 'loop': return <Repeat className="w-10 h-10 text-fuchsia-500" />;
      case 'metronome': return <Clock className="w-10 h-10 text-sky-500" />;
      case 'turtle': return <Shield className="w-10 h-10 text-emerald-500" />;
      case 'focus': return <Tag className="w-10 h-10 text-orange-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-100 z-[100] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 flex justify-between items-center shadow-md z-10 shrink-0">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest flex items-center gap-3">
            <Music className="w-8 h-8 text-sky-400" /> Create New Repertoire
          </h1>
          <p className="text-slate-400 font-bold mt-1 text-sm">Assign custom interactive materials to the global Musictopia library.</p>
        </div>
        <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 p-3 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Scrolling Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-8 pb-32">
          
          {/* 1. Basic Info Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-wider">1. Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Piece Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-xl font-bold text-slate-800 focus:border-sky-400 outline-none" placeholder="e.g. Minuet in G" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Composer</label>
                <input type="text" value={composer} onChange={e => setComposer(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-xl font-bold text-slate-800 focus:border-sky-400 outline-none" placeholder="e.g. J.S. Bach" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Date / Era</label>
                <input type="text" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-xl font-bold text-slate-800 focus:border-sky-400 outline-none" placeholder="e.g. 1725 or Baroque Era" />
              </div>
            </div>
          </div>

          {/* 2. Audio Recording */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">2. Full Recording (Max 90s)</h2>
              <span className="text-slate-400 font-bold font-mono">{Math.floor(recTime/60)}:{(recTime%60).toString().padStart(2, '0')} / 1:30</span>
            </div>
            <div className="bg-slate-900 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden shadow-inner">
              {isRecording && (
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <div className="w-full h-32 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse bg-rose-500"></div>
                </div>
              )}
              
              {!hasRecording ? (
                <button 
                  onClick={handleMainRecordToggle}
                  className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-rose-500 animate-pulse scale-110' : 'bg-rose-500 hover:bg-rose-400 hover:scale-105'}`}
                >
                  {isRecording ? <Square className="w-10 h-10 text-white fill-current" /> : <Mic className="w-10 h-10 text-white" />}
                </button>
              ) : (
                <div className="relative z-10 flex gap-6">
                  <button className="w-16 h-16 bg-sky-500 hover:bg-sky-400 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                    <Play className="w-8 h-8 text-white fill-current ml-1" />
                  </button>
                  <button onClick={handleMainDelete} className="w-16 h-16 bg-slate-700 hover:bg-rose-500 rounded-full flex items-center justify-center shadow-lg transition-colors">
                    <Trash2 className="w-8 h-8 text-white" />
                  </button>
                </div>
              )}
              
              <p className="text-slate-400 font-bold mt-6 relative z-10">
                {isRecording ? 'Recording in progress...' : hasRecording ? 'Recording saved ready for review.' : 'Click to start recording student reference audio'}
              </p>
            </div>
          </div>

          {/* 3. Gamified Practice Powers (Grid) */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider flex items-center gap-2"><Shield className="w-6 h-6 text-fuchsia-500"/> 3. Equip Practice Powers</h2>
              <p className="text-slate-500 font-medium text-sm mt-1">Assign targeted practice tools to specific bars (e.g. Loop Bars 12-16).</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {powers.map((power, index) => (
                <div 
                  key={index}
                  onClick={() => setActiveSlot(index)}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${power ? 'bg-slate-50 border-2 border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1' : 'bg-slate-50 border-2 border-dashed border-slate-300 hover:border-sky-400 hover:bg-sky-50'}`}
                >
                  {power ? (
                    <>
                      {renderPowerIcon(power.type)}
                      <span className="font-bold text-xs text-slate-500 uppercase tracking-widest">Bars {power.bars}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-10 h-10 text-slate-300" />
                      <span className="font-bold text-xs text-slate-400 uppercase">Empty Slot</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. Warmup Prep */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-wider flex items-center gap-2">4. Warmup Prep</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Target Tricky Notes (Max 3)</label>
                <p className="text-xs text-slate-400 font-medium mb-3">These feed into Rocket Reading for untimed recognition.</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {targetNotes.map((note, i) => (
                    <div key={i} className="bg-orange-100 text-orange-700 border border-orange-200 px-4 py-2 rounded-full font-bold flex items-center gap-2">
                      {note}
                      <button onClick={() => removeNote(i)}><X className="w-4 h-4 hover:text-orange-900" /></button>
                    </div>
                  ))}
                </div>
                <input 
                  type="text" 
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  onKeyDown={handleAddNote}
                  disabled={targetNotes.length >= 3}
                  className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-xl font-bold text-slate-800 focus:border-sky-400 outline-none disabled:opacity-50"
                  placeholder={targetNotes.length >= 3 ? "Max 3 notes reached" : "Type a note (e.g. F#) & hit Enter"} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Core Scale</label>
                <p className="text-xs text-slate-400 font-medium mb-3">Select the foundational scale from Sand Dunes progression.</p>
                <select 
                  value={scale} 
                  onChange={e => setScale(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-xl font-bold text-slate-800 focus:border-sky-400 outline-none appearance-none"
                >
                  <option value="">-- Select Scale --</option>
                  <option value="c_major">C Major (Level 1)</option>
                  <option value="g_major">G Major (Level 2)</option>
                  <option value="f_major">F Major (Level 3)</option>
                  <option value="d_major">D Major (Level 4)</option>
                  <option value="bb_major">Bb Major (Level 5)</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Sticky Action Footer */}
      <div className="bg-white border-t border-slate-200 p-6 flex justify-end gap-4 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] relative z-20">
        <button onClick={onClose} className="px-8 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-widest">Cancel</button>
        <button 
          disabled={isSaving}
          onClick={() => handleSave(true)} 
          className="px-8 py-4 rounded-2xl font-black text-white bg-slate-800 hover:bg-slate-700 shadow-lg transition-transform hover:-translate-y-1 uppercase tracking-widest disabled:opacity-50"
        >
          Save & Add Another
        </button>
        <button 
          disabled={isSaving}
          onClick={() => handleSave(false)} 
          className="px-10 py-4 rounded-2xl font-black text-white bg-sky-500 hover:bg-sky-400 shadow-[0_8px_16px_rgba(14,165,233,0.3)] transition-transform hover:-translate-y-1 uppercase tracking-widest flex items-center gap-3 disabled:opacity-50"
        >
          <Save className="w-6 h-6" /> {isSaving ? 'Saving...' : 'Save Piece'}
        </button>
      </div>

      {/* Power Configuration Modal */}
      {activeSlot !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800">Equip Power</h3>
              <button onClick={closePowerConfig} className="bg-slate-200 hover:bg-slate-300 p-2 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8 flex-1 overflow-y-auto space-y-8">
              
              {!selectedPowerType ? (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setSelectedPowerType('loop')} className="bg-fuchsia-50 border-2 border-fuchsia-200 rounded-2xl p-6 flex flex-col items-center gap-3 hover:-translate-y-1 transition-transform group">
                    <div className="bg-white p-4 rounded-full shadow-sm group-hover:scale-110 transition-transform"><Repeat className="w-10 h-10 text-fuchsia-500" /></div>
                    <span className="font-black text-fuchsia-900 text-lg">Loop Section</span>
                  </button>
                  <button onClick={() => setSelectedPowerType('metronome')} className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-6 flex flex-col items-center gap-3 hover:-translate-y-1 transition-transform group">
                    <div className="bg-white p-4 rounded-full shadow-sm group-hover:scale-110 transition-transform"><Clock className="w-10 h-10 text-sky-500" /></div>
                    <span className="font-black text-sky-900 text-lg">Metronome</span>
                  </button>
                  <button onClick={() => setSelectedPowerType('turtle')} className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 flex flex-col items-center gap-3 hover:-translate-y-1 transition-transform group">
                    <div className="bg-white p-4 rounded-full shadow-sm group-hover:scale-110 transition-transform"><Shield className="w-10 h-10 text-emerald-500" /></div>
                    <span className="font-black text-emerald-900 text-lg">Turtle Mode (Slow)</span>
                  </button>
                  <button onClick={() => setSelectedPowerType('focus')} className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 flex flex-col items-center gap-3 hover:-translate-y-1 transition-transform group">
                    <div className="bg-white p-4 rounded-full shadow-sm group-hover:scale-110 transition-transform"><Tag className="w-10 h-10 text-orange-500" /></div>
                    <span className="font-black text-orange-900 text-lg">Focus Goal</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    {renderPowerIcon(selectedPowerType)}
                    <h3 className="text-3xl font-black text-slate-800 capitalize">{selectedPowerType} Power</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Apply to Bars</label>
                    <input type="text" value={powerBars} onChange={e => setPowerBars(e.target.value)} placeholder="e.g. 12-16" className="w-full bg-slate-100 border-2 border-transparent focus:border-sky-400 p-4 rounded-xl font-bold text-slate-800 outline-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Guide Audio (Max 20s)</label>
                    <div className="bg-slate-100 rounded-2xl p-6 flex items-center justify-between border-2 border-dashed border-slate-300">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => {
                            if(!powerRecording && !powerHasAudio) { setPowerRecording(true); setPowerRecTime(0); }
                            else if (powerRecording) { setPowerRecording(false); setPowerHasAudio(true); }
                          }}
                          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${powerRecording ? 'bg-rose-500 animate-pulse' : powerHasAudio ? 'bg-emerald-500' : 'bg-slate-300 hover:bg-rose-400'}`}
                        >
                          {powerRecording ? <Square className="w-6 h-6 text-white fill-current" /> : powerHasAudio ? <Play className="w-6 h-6 text-white fill-current ml-1" /> : <Mic className="w-6 h-6 text-slate-600" />}
                        </button>
                        <div>
                          <p className="font-bold text-slate-700">{powerRecording ? 'Recording...' : powerHasAudio ? 'Guide Saved' : 'Record Verbal Tip'}</p>
                          <p className="text-sm text-slate-400 font-bold font-mono">00:{(powerRecTime).toString().padStart(2, '0')} / 00:20</p>
                        </div>
                      </div>
                      {powerHasAudio && (
                        <button onClick={() => { setPowerHasAudio(false); setPowerRecTime(0); }} className="text-slate-400 hover:text-rose-500 font-bold text-sm uppercase">
                          Retake
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-6">
                    <button onClick={() => setSelectedPowerType(null)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200">Back to List</button>
                    <button onClick={savePower} disabled={!powerBars} className="flex-1 bg-sky-500 text-white font-bold py-4 rounded-xl hover:bg-sky-400 disabled:opacity-50">Equip to Piece</button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
