import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Trophy, Clock, Target, Mic } from 'lucide-react';
import { loadAudio } from '../utils/audioStorage';

interface PracticeLogProps {
  onBack: () => void;
}

export default function PracticeLog({ onBack }: PracticeLogProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchLogsAndAudio = async () => {
      const saved = localStorage.getItem('practice_logs');
      if (saved) {
        try {
          const parsedLogs = JSON.parse(saved);
          setLogs(parsedLogs);
          
          const newAudioUrls: Record<string, string> = {};
          for (const log of parsedLogs) {
            if (log.audioId) {
              try {
                const blob = await loadAudio(log.audioId);
                if (blob) {
                  newAudioUrls[log.audioId] = URL.createObjectURL(blob);
                }
              } catch (e) {
                console.error("Failed to load audio for", log.audioId);
              }
            }
          }
          setAudioUrls(newAudioUrls);
        } catch (e) {
          console.error("Failed to parse logs or load audio", e);
        }
      }
    };
    fetchLogsAndAudio();
  }, []);

  return (
    <div className="absolute inset-0 z-50 bg-slate-50 overflow-y-auto flex flex-col font-sans">
      <div className="bg-sky-600 p-4 flex justify-between items-center text-white shadow-md sticky top-0 z-10">
        <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-2">
          <Calendar className="w-8 h-8" />
          Practice Log
        </h2>
        <button onClick={onBack} className="p-2 hover:bg-sky-700 rounded-full bg-white/20 transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        {logs.length === 0 ? (
          <div className="text-center mt-20">
            <h3 className="text-2xl font-bold text-slate-400">No practices logged yet!</h3>
            <p className="text-slate-500 mt-2">Go complete a Flow Practice session to earn your first entry.</p>
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border-4 border-slate-200 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-center border-b-2 border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-sky-100 text-sky-600 p-3 rounded-2xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg uppercase">{new Date(log.date).toLocaleDateString()}</h4>
                    <p className="text-sm font-bold text-slate-500">{new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
                <div className="bg-amber-100 text-amber-700 font-black px-4 py-2 rounded-xl flex items-center gap-2 text-lg">
                  <Trophy className="w-5 h-5" /> {log.points || 0} PTS
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Duration</span>
                  <span className="font-black text-slate-700 flex items-center gap-2"><Clock className="w-4 h-4"/> {log.actualDuration || `${log.durationMins} Mins`}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Goal</span>
                  <span className="font-black text-slate-700 flex items-center gap-2 capitalize"><Target className="w-4 h-4"/> {log.goal}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Rating</span>
                  <span className="font-black text-slate-700 flex items-center gap-2">{log.rating}</span>
                </div>
              </div>

              {log.reflectionAnswer && (
                <div className="bg-sky-50 border-2 border-sky-200 p-4 rounded-2xl mt-2">
                  <span className="text-xs font-bold text-sky-600 uppercase tracking-widest block mb-1">Reflection: What went well?</span>
                  <p className="text-sky-900 font-medium italic">"{log.reflectionAnswer}"</p>
                </div>
              )}

              {log.audioId && audioUrls[log.audioId] && (
                <div className="bg-slate-100 p-4 rounded-2xl mt-2 flex flex-col gap-2 border-2 border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Mic className="w-4 h-4" /> Final Recording</span>
                  <audio src={audioUrls[log.audioId]} controls className="w-full h-10" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
