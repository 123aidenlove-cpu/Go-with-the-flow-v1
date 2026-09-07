import React, { useState } from 'react';
import { Target, X, Check, Clock, Calendar } from 'lucide-react';

interface SetGoalModalProps {
  onClose: () => void;
  onSave: (goal: any) => void;
}

export default function SetGoalModal({ onClose, onSave }: SetGoalModalProps) {
  const [goalType, setGoalType] = useState<'weekly' | 'monthly'>('weekly');
  const [measureType, setMeasureType] = useState<'minutes' | 'sessions'>('sessions');
  const [targetAmount, setTargetAmount] = useState<number>(2);
  const [repertoire, setRepertoire] = useState('');

  const handleSave = () => {
    onSave({
      type: goalType,
      measure: measureType,
      target: targetAmount,
      repertoire,
      reward: targetAmount * (measureType === 'sessions' ? 50 : 2)
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative border-4 border-indigo-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-black text-indigo-900 mb-2 flex items-center gap-3">
          <Target className="w-8 h-8 text-indigo-500" />
          Set a Goal
        </h2>
        <p className="text-slate-600 font-medium mb-8">Achieve this goal exclusively through Flow Practice.</p>

        <div className="flex flex-col gap-6">
          {/* Goal Type */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Timeframe</label>
            <div className="flex gap-4">
              <button 
                onClick={() => setGoalType('weekly')}
                className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all flex justify-center items-center gap-2 ${goalType === 'weekly' ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
              >
                <Clock className="w-5 h-5" /> Weekly
              </button>
              <button 
                onClick={() => setGoalType('monthly')}
                disabled={true}
                className="flex-1 py-3 rounded-xl font-bold border-2 bg-slate-50 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed flex justify-center items-center gap-2"
                title="Unlock by completing a weekly goal first"
              >
                <Calendar className="w-5 h-5" /> Monthly
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">*Monthly goals unlock after completing a weekly goal.</p>
          </div>

          {/* Measure By */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Measure Progress By</label>
            <div className="flex gap-4">
              <button 
                onClick={() => { setMeasureType('sessions'); setTargetAmount(2); }}
                className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${measureType === 'sessions' ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
              >
                Sessions
              </button>
              <button 
                onClick={() => { setMeasureType('minutes'); setTargetAmount(30); }}
                className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${measureType === 'minutes' ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
              >
                Minutes
              </button>
            </div>
          </div>

          {/* Target Amount */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Target Amount</label>
            <select 
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-4 font-bold text-slate-700 focus:outline-indigo-500"
            >
              {measureType === 'sessions' ? (
                <>
                  <option value={1}>1 Session (Suggested)</option>
                  <option value={2}>2 Sessions</option>
                  <option value={3}>3 Sessions</option>
                  <option value={4}>4 Sessions</option>
                  <option value={5}>5 Sessions</option>
                </>
              ) : (
                <>
                  <option value={10}>10 Minutes</option>
                  <option value={20}>20 Minutes</option>
                  <option value={30}>30 Minutes (Suggested)</option>
                  <option value={60}>60 Minutes</option>
                  <option value={120}>120 Minutes</option>
                </>
              )}
            </select>
          </div>

          {/* Optional Repertoire */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Specific Piece (Optional)</label>
            <input 
              type="text"
              value={repertoire}
              onChange={(e) => setRepertoire(e.target.value)}
              placeholder="e.g. Ode to Joy"
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-4 font-bold text-slate-700 focus:outline-indigo-500"
            />
            <p className="text-xs text-slate-500 mt-2">This will highlight the piece as a priority during Flow Practice.</p>
          </div>
        </div>

        {/* Reward & Submit */}
        <div className="mt-8 pt-6 border-t-2 border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reward</p>
            <p className="text-amber-500 font-black text-2xl flex items-center gap-2">
              +{targetAmount * (measureType === 'sessions' ? 50 : 2)} <span className="text-sm">Quavits</span>
            </p>
          </div>
          <button 
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-[0_4px_0_#4338ca] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
          >
            <Check className="w-5 h-5" /> Save Goal
          </button>
        </div>
      </div>
    </div>
  );
}
