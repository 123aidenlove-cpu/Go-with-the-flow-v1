import React, { useState, useEffect } from 'react';
import { X, Target, Lock, Award, ChevronDown, Check, Zap, Flame, Clock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface SetGoalProps {
  onClose: () => void;
  studentId?: string;
}

type MetricType = 'minutes' | 'sessions';
type DurationType = 'week' | 'month';

export default function SetGoal({ onClose, studentId }: SetGoalProps) {
  // Mock Account State (Normally fetched from DB)
  const [activeGoals, setActiveGoals] = useState(1); // Limit 2
  const [hasWeeklyGoal, setHasWeeklyGoal] = useState(false); // Controls monthly unlock
  
  const [metric, setMetric] = useState<MetricType>('minutes');
  const [duration, setDuration] = useState<DurationType>('week');
  const [target, setTarget] = useState<number | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [repertoire, setRepertoire] = useState<string>('any');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveGoal = async () => {
    if (!target) return;
    setIsSaving(true);
    
    try {
      // Determine student ID (either passed in for teacher, or active profile for student)
      let targetStudentId = studentId;
      if (!targetStudentId) {
        targetStudentId = localStorage.getItem('activeProfileId') || '';
      }
      
      if (!targetStudentId) {
         console.warn('No student ID found');
         setIsSaving(false);
         return;
      }

      const { error } = await supabase.from('smart_goals').insert({
        student_id: targetStudentId,
        metric,
        duration,
        target_value: target,
        repertoire_id: repertoire !== 'any' ? repertoire : null,
        reward_quavits: rewards,
        status: 'active'
      });

      if (error) {
        console.error('Error saving goal:', error);
        alert('Failed to save goal.');
      } else {
        onClose();
      }
    } catch (err) {
      console.error('Exception saving goal:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Smart suggestions based on metric
  const chips = metric === 'minutes' ? [15, 30, 60] : [2, 3, 5];

  // Calculate Rewards
  const calculateRewards = () => {
    if (!target) return 0;
    let base = metric === 'minutes' ? (target * 2) : (target * 20);
    let multiplier = duration === 'week' ? 1 : 4.5;
    return Math.floor(base * multiplier);
  };

  const rewards = calculateRewards();

  if (activeGoals >= 2) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Goal Limit Reached</h2>
          <p className="text-slate-500 font-medium mb-8">
            You already have 2 active goals. Focus on completing them before setting new ones!
          </p>
          <button onClick={onClose} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-4 rounded-xl transition-colors">
            Got it
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4 font-sans overflow-y-auto">
      <div className="bg-indigo-50 rounded-[2rem] w-full max-w-2xl shadow-[0_30px_60px_rgba(79,70,229,0.2)] flex flex-col overflow-hidden my-8 border border-indigo-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-white/20 p-3 rounded-2xl shadow-inner">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-widest drop-shadow-md">Set a Goal</h1>
              <p className="text-indigo-100 font-bold tracking-wider">Build habits and earn massive rewards.</p>
            </div>
          </div>
        </div>

        <div className="p-8 flex flex-col gap-8">
          
          {/* 1. The Metric (Measurable) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-indigo-100">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2"><Flame className="w-5 h-5 text-indigo-500"/> 1. What are we tracking?</h2>
            <div className="flex gap-4">
              <button 
                onClick={() => { setMetric('minutes'); setTarget(null); setShowCustom(false); }}
                className={`flex-1 py-4 px-6 rounded-2xl font-black transition-all flex flex-col items-center gap-2 ${metric === 'minutes' ? 'bg-indigo-100 border-2 border-indigo-500 text-indigo-700 shadow-md' : 'bg-slate-50 border-2 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
              >
                <Clock className="w-6 h-6" /> Minutes Practiced
              </button>
              <button 
                onClick={() => { setMetric('sessions'); setTarget(null); setShowCustom(false); }}
                className={`flex-1 py-4 px-6 rounded-2xl font-black transition-all flex flex-col items-center gap-2 ${metric === 'sessions' ? 'bg-indigo-100 border-2 border-indigo-500 text-indigo-700 shadow-md' : 'bg-slate-50 border-2 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
              >
                <Zap className="w-6 h-6" /> Sessions Completed
              </button>
            </div>
          </div>

          {/* 2. The Duration (Time-Bound) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-indigo-100">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-indigo-500"/> 2. What is the timeline?</h2>
            <div className="flex gap-4">
              <button 
                onClick={() => setDuration('week')}
                className={`flex-1 py-4 px-6 rounded-2xl font-black transition-all ${duration === 'week' ? 'bg-indigo-100 border-2 border-indigo-500 text-indigo-700 shadow-md' : 'bg-slate-50 border-2 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
              >
                This Week
              </button>
              <div className="flex-1 relative">
                {!hasWeeklyGoal && (
                  <div className="absolute -top-3 -right-3 z-10 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked
                  </div>
                )}
                <button 
                  disabled={!hasWeeklyGoal}
                  onClick={() => setDuration('month')}
                  className={`w-full py-4 px-6 rounded-2xl font-black transition-all ${duration === 'month' ? 'bg-indigo-100 border-2 border-indigo-500 text-indigo-700 shadow-md' : 'bg-slate-50 border-2 border-slate-200 text-slate-500 hover:bg-slate-100'} ${!hasWeeklyGoal ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  This Month
                </button>
                {!hasWeeklyGoal && (
                  <p className="text-xs font-bold text-slate-400 mt-2 text-center">
                    Complete a weekly goal first!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 3. The Target (Achievable) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-indigo-100">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2"><Check className="w-5 h-5 text-indigo-500"/> 3. Set your target</h2>
            <div className="flex gap-3 mb-4">
              {chips.map(chip => (
                <button
                  key={chip}
                  onClick={() => { setTarget(chip); setShowCustom(false); }}
                  className={`flex-1 py-4 rounded-2xl font-black text-lg transition-all border-2 ${target === chip && !showCustom ? 'bg-emerald-100 border-emerald-500 text-emerald-700 shadow-md scale-105' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  {chip} {metric === 'minutes' ? 'mins' : 'sessions'}
                </button>
              ))}
              <button
                onClick={() => setShowCustom(true)}
                className={`flex-1 py-4 rounded-2xl font-black text-lg transition-all border-2 ${showCustom ? 'bg-emerald-100 border-emerald-500 text-emerald-700 shadow-md scale-105' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                Custom
              </button>
            </div>
            
            {showCustom && (
              <div className="animate-in fade-in slide-in-from-top-4 mt-4 bg-slate-50 p-6 rounded-2xl border-2 border-emerald-200 flex items-center gap-4">
                <input 
                  type="number"
                  value={target || ''}
                  onChange={e => setTarget(parseInt(e.target.value) || null)}
                  placeholder="0"
                  className="w-24 bg-white border-2 border-emerald-300 p-4 rounded-xl font-black text-2xl text-center text-slate-800 outline-none focus:border-emerald-500"
                />
                <span className="text-xl font-black text-slate-600">{metric}</span>
              </div>
            )}
          </div>

          {/* 4. Repertoire (Specific) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-indigo-100">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2"><Target className="w-5 h-5 text-indigo-500"/> 4. Focus Piece (Optional)</h2>
            <p className="text-sm font-bold text-slate-400 mb-4">Pieces assigned here will be highlighted as a Priority in your Flow Practice.</p>
            <select 
              value={repertoire}
              onChange={e => setRepertoire(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-xl font-black text-slate-700 outline-none focus:border-indigo-400"
            >
              <option value="any">Any Practice (General)</option>
              <option value="minuet">Minuet in G</option>
              <option value="ode">Ode to Joy</option>
            </select>
          </div>

          {/* Gamified Reward Box */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 shadow-xl relative overflow-hidden text-center text-white border-4 border-indigo-300">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
             <h3 className="text-sm font-black uppercase tracking-widest text-indigo-100 mb-2 relative z-10">Estimated Goal Reward</h3>
             <div className="flex items-center justify-center gap-3 relative z-10">
               <div className="text-4xl">💎</div>
               <span className="text-6xl font-black drop-shadow-md tabular-nums">{rewards > 0 ? rewards : '---'}</span>
             </div>
          </div>

        </div>

        {/* Action Footer */}
        <div className="bg-white border-t border-indigo-100 p-6 flex justify-end gap-4 shrink-0">
          <button onClick={onClose} className="px-8 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-widest">
            Cancel
          </button>
          <button 
            disabled={!target || isSaving}
            onClick={handleSaveGoal} 
            className="px-10 py-4 rounded-2xl font-black text-white bg-emerald-500 hover:bg-emerald-400 shadow-[0_8px_16px_rgba(16,185,129,0.3)] transition-transform hover:-translate-y-1 uppercase tracking-widest flex items-center gap-3 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isSaving ? 'Saving...' : 'Set Goal!'}
          </button>
        </div>

      </div>
    </div>
  );
}
