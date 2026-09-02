import React, { useState, useEffect } from 'react';
import { X, Bell, User, Plus, Trash2, Calendar, Check, Send, Award, Users, ChevronDown, Target } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface CreateAdventureAlertProps {
  onClose: () => void;
  prefillStudentId?: string | null;
  prefillStudentName?: string | null;
}

type TaskCategory = 'minigame' | 'piece' | 'challenge' | null;
type MinigameType = 'rocket' | 'fishing' | 'rapids' | 'pizza';
type ChallengeType = 'tonguing' | 'longnotes';

interface TaskBlock {
  id: string;
  category: TaskCategory;
  minigameType?: MinigameType;
  challengeType?: ChallengeType;
  numericValue: number;
  pieceId?: string;
}

export default function CreateAdventureAlert({ onClose, prefillStudentId, prefillStudentName }: CreateAdventureAlertProps) {
  const [tasks, setTasks] = useState<TaskBlock[]>([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(prefillStudentId ? false : true);
  const [selectedStudents, setSelectedStudents] = useState<string[]>(prefillStudentId ? [prefillStudentId] : []);
  const [daysToExpire, setDaysToExpire] = useState(14);
  const [isSaving, setIsSaving] = useState(false);

  const handleSendAlerts = async () => {
    setIsSaving(true);
    try {
      const teacherId = localStorage.getItem('activeProfileId');
      if (!teacherId) throw new Error('No active teacher profile found');

      const rowsToInsert: any[] = [];
      
      selectedStudents.forEach(studentId => {
        tasks.forEach(task => {
           rowsToInsert.push({
             teacher_id: teacherId,
             student_id: studentId,
             title: `Complete ${task.category === 'minigame' ? task.minigame : task.category === 'piece' ? 'Piece' : 'Challenge'}`,
             task_type: task.category,
             game_id: task.category === 'minigame' ? task.minigame : task.pieceId,
             metric: 'custom',
             target_value: task.numericValue,
             reward_quavits: Math.floor(totalQuavits / tasks.length), // Split total evenly
             status: 'active',
             expires_at: new Date(Date.now() + daysToExpire * 24 * 60 * 60 * 1000).toISOString(),
           });
        });
      });

      const { error } = await supabase.from('adventure_alerts').insert(rowsToInsert);
      if (error) {
        console.error('Error saving alerts:', error);
        alert('Failed to send alerts.');
      } else {
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  
  const addTask = () => {
    if (tasks.length < 3) {
      setTasks([...tasks, { id: Math.random().toString(), category: null, numericValue: 10 }]);
    }
  };

  const updateTask = (index: number, updates: Partial<TaskBlock>) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], ...updates };
    setTasks(newTasks);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  // Auto-calculate rewards based on fake multipliers for complexity
  const calculateQuavits = () => {
    if (tasks.length === 0) return 0;
    let total = 0;
    tasks.forEach(t => {
      if (t.category === 'minigame') total += (t.numericValue * 2);
      else if (t.category === 'piece') total += (t.numericValue * 5);
      else if (t.category === 'challenge') total += (t.numericValue * 1);
    });
    return Math.max(50, total); // Base 50 minimum for an alert
  };

  const totalQuavits = calculateQuavits();

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[120] flex items-center justify-center p-4 font-sans overflow-y-auto">
      <div className="bg-orange-50 rounded-[2rem] w-full max-w-4xl shadow-[0_30px_60px_rgba(234,88,12,0.2)] flex flex-col overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-white/20 p-3 rounded-2xl shadow-inner">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-widest drop-shadow-md">Set a New Adventure Alert</h1>
              <p className="text-orange-100 font-bold tracking-wider">Assign quests and bounties to your students.</p>
            </div>
          </div>
        </div>

        <div className="p-8 flex flex-col gap-8">
          
          {/* 1. Student Selection */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-orange-500"/> 1. Assign to Student(s)</h2>
            {!showStudentDropdown && prefillStudentName ? (
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 border border-orange-200 text-orange-800 px-6 py-3 rounded-full font-black flex items-center gap-3">
                  <User className="w-5 h-5" /> {prefillStudentName}
                </div>
                <button onClick={() => setShowStudentDropdown(true)} className="text-orange-600 font-bold hover:text-orange-500 underline decoration-2 underline-offset-4">
                  Add more students
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input type="checkbox" className="w-5 h-5 accent-orange-500" onChange={(e) => setSelectedStudents(e.target.checked ? ['all'] : [])} /> 
                    Select All Students
                  </label>
                </div>
                <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 max-h-40 overflow-y-auto grid grid-cols-2 gap-2">
                  {['Alex M.', 'Sarah K.', 'Leo D.', 'Mia P.'].map((student, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-orange-300 transition-colors shadow-sm">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 accent-orange-500" 
                        checked={selectedStudents.includes(student)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedStudents([...selectedStudents, student]);
                          else setSelectedStudents(selectedStudents.filter(s => s !== student));
                        }}
                      />
                      <span className="font-bold text-slate-700">{student}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Quest Builder */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500"/> 2. Quest Objectives
              </h2>
              <span className="font-bold text-slate-400">{tasks.length} / 3 Tasks</span>
            </div>

            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div key={task.id} className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 relative group transition-all">
                  <button 
                    onClick={() => removeTask(index)} 
                    className="absolute top-4 right-4 text-orange-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  
                  {!task.category ? (
                    <div>
                      <p className="font-bold text-slate-500 mb-3 uppercase text-sm">Select Task Type:</p>
                      <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => updateTask(index, { category: 'minigame', minigameType: 'rocket' })} className="bg-white border-2 border-orange-100 font-black text-slate-700 py-3 rounded-xl hover:border-orange-400 hover:text-orange-600 transition-colors">Minigame</button>
                        <button onClick={() => updateTask(index, { category: 'piece' })} className="bg-white border-2 border-orange-100 font-black text-slate-700 py-3 rounded-xl hover:border-orange-400 hover:text-orange-600 transition-colors">Piece / Repertoire</button>
                        <button onClick={() => updateTask(index, { category: 'challenge', challengeType: 'tonguing' })} className="bg-white border-2 border-orange-100 font-black text-slate-700 py-3 rounded-xl hover:border-orange-400 hover:text-orange-600 transition-colors">Challenge</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-orange-200 text-orange-800 font-black px-3 py-1 rounded-lg text-sm uppercase">{task.category}</span>
                        <button onClick={() => updateTask(index, { category: null })} className="text-sm font-bold text-orange-500 underline">Change Type</button>
                      </div>

                      {/* Category specific inputs */}
                      {task.category === 'minigame' && (
                        <div className="flex gap-4 items-center">
                          <select 
                            className="bg-white border-2 border-orange-200 p-3 rounded-xl font-black text-slate-700 outline-none flex-1"
                            value={task.minigameType}
                            onChange={(e) => updateTask(index, { minigameType: e.target.value as MinigameType })}
                          >
                            <option value="rocket">Rocket Reading</option>
                            <option value="fishing">Finger Fishing</option>
                            <option value="rapids">Rhythm Rapids</option>
                            <option value="pizza">Music Pizza</option>
                          </select>
                          <span className="font-black text-slate-500">
                            {task.minigameType === 'rocket' ? 'Blast' : task.minigameType === 'fishing' ? 'Catch' : task.minigameType === 'rapids' ? 'Paddle past' : 'Bake'}
                          </span>
                          <input 
                            type="number" 
                            value={task.numericValue}
                            onChange={(e) => updateTask(index, { numericValue: parseInt(e.target.value) || 0 })}
                            className="w-24 bg-white border-2 border-orange-300 p-3 rounded-xl font-black text-center text-slate-800 outline-none focus:border-orange-500"
                          />
                          <span className="font-black text-slate-500">
                            {task.minigameType === 'rocket' ? 'metres' : task.minigameType === 'fishing' ? 'fish' : task.minigameType === 'rapids' ? 'obstacles' : 'pizzas'}
                          </span>
                        </div>
                      )}

                      {task.category === 'piece' && (
                        <div className="flex gap-4 items-center flex-wrap">
                          <span className="font-black text-slate-500">Duration of Practice:</span>
                          <input 
                            type="number" 
                            value={task.numericValue}
                            onChange={(e) => updateTask(index, { numericValue: parseInt(e.target.value) || 0 })}
                            className="w-24 bg-white border-2 border-orange-300 p-3 rounded-xl font-black text-center text-slate-800 outline-none focus:border-orange-500"
                          />
                          <span className="font-black text-slate-500">minutes on</span>
                          <select className="bg-white border-2 border-orange-200 p-3 rounded-xl font-black text-slate-700 outline-none flex-1 min-w-[200px]">
                            <option value="any">No specific piece (General Practice)</option>
                            <option value="minuet">Minuet in G</option>
                            <option value="ode">Ode to Joy</option>
                          </select>
                        </div>
                      )}

                      {task.category === 'challenge' && (
                        <div className="flex gap-4 items-center">
                          <select 
                            className="bg-white border-2 border-orange-200 p-3 rounded-xl font-black text-slate-700 outline-none flex-1"
                            value={task.challengeType}
                            onChange={(e) => updateTask(index, { challengeType: e.target.value as ChallengeType })}
                          >
                            <option value="tonguing">Tonguing Tornado</option>
                            <option value="longnotes">Long Note Legend</option>
                          </select>
                          <span className="font-black text-slate-500">
                            {task.challengeType === 'tonguing' ? 'Tongue' : 'Hold long notes for combined'}
                          </span>
                          <input 
                            type="number" 
                            value={task.numericValue}
                            onChange={(e) => updateTask(index, { numericValue: parseInt(e.target.value) || 0 })}
                            className="w-24 bg-white border-2 border-orange-300 p-3 rounded-xl font-black text-center text-slate-800 outline-none focus:border-orange-500"
                          />
                          <span className="font-black text-slate-500">
                            {task.challengeType === 'tonguing' ? 'times in TC' : 'seconds'}
                          </span>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              ))}

              {tasks.length < 3 && (
                <button onClick={addTask} className="w-full border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-600 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors">
                  <Plus className="w-6 h-6" /> ADD TASK BLOCK (MAX 3)
                </button>
              )}
            </div>
          </div>

          {/* Bottom Grid: Rewards & Expiry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 3. Rewards */}
            <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-3xl p-6 shadow-[0_10px_30px_rgba(251,191,36,0.4)] border-4 border-yellow-200 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider mb-2 relative z-10 drop-shadow-md flex items-center gap-2">
                <Award className="w-5 h-5"/> Bounty Reward
              </h2>
              <div className="bg-white/20 px-8 py-4 rounded-3xl relative z-10 backdrop-blur-sm border border-white/40 shadow-inner flex items-center gap-4">
                <div className="text-4xl">💎</div>
                <span className="text-6xl font-black text-white drop-shadow-lg tabular-nums">
                  {totalQuavits}
                </span>
              </div>
              <p className="text-amber-100 font-bold text-sm mt-3 relative z-10">Auto-calculated based on task difficulty</p>
            </div>

            {/* 4. Expiry */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100 flex flex-col justify-center">
               <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500"/> 4. Schedule
              </h2>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
                  <span className="font-black text-slate-600">Days to Complete:</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setDaysToExpire(Math.max(1, daysToExpire - 1))} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 font-black flex items-center justify-center">-</button>
                    <span className="font-black text-2xl text-slate-800 w-8 text-center">{daysToExpire}</span>
                    <button onClick={() => setDaysToExpire(daysToExpire + 1)} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 font-black flex items-center justify-center">+</button>
                  </div>
                </div>
                <div className="text-center bg-orange-100 text-orange-800 p-4 rounded-2xl font-black">
                  Expires in {daysToExpire} days and 0 hours.
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Action Footer */}
        <div className="bg-white border-t border-orange-100 p-6 flex justify-end gap-4 shrink-0">
          <button onClick={onClose} className="px-8 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-widest">
            Cancel
          </button>
          <button 
            onClick={handleSendAlerts} 
            disabled={tasks.length === 0 || selectedStudents.length === 0 || isSaving}
            className="px-10 py-4 rounded-2xl font-black text-white bg-orange-500 hover:bg-orange-400 shadow-[0_8px_16px_rgba(249,115,22,0.3)] transition-transform hover:-translate-y-1 uppercase tracking-widest flex items-center gap-3 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <Send className="w-6 h-6" /> {isSaving ? 'Sending...' : 'Send Adventure Alert!'}
          </button>
        </div>

      </div>
    </div>
  );
}
