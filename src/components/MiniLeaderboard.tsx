import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Trophy, Medal, Star, Crown, Activity, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MiniLeaderboardProps {
  gameName: string;
  instrument: string;
  currentScore: number | null;
  onShowFullLeaderboard?: () => void;
  className?: string;
}

interface ScoreEntry {
  id: string;
  name: string;
  score: number;
  isCurrentUser: boolean;
}

export default function MiniLeaderboard({ gameName, instrument, currentScore, onShowFullLeaderboard, className }: MiniLeaderboardProps) {
  const [topGlobal, setTopGlobal] = useState<ScoreEntry | null>(null);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFull, setShowFull] = useState(false);
  const [allScores, setAllScores] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const activeProfileId = localStorage.getItem('activeProfileId');
        if (!activeProfileId || !instrument) return;

        // 1. Get all profiles for this instrument
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('instrument', instrument);

        if (!profiles || profiles.length === 0) {
          setLoading(false);
          return;
        }

        const profileIds = profiles.map(p => p.id);
        const profileMap = new Map(profiles.map(p => [p.id, p.name || 'Anonymous']));

        // 2. Get top 10 scores for this game & instrument
        const { data: scores } = await supabase
          .from('game_progress')
          .select('profile_id, high_score')
          .eq('game_name', gameName)
          .in('profile_id', profileIds)
          .order('high_score', { ascending: false })
          .limit(10);

        if (scores && scores.length > 0) {
          const mapped = scores.map(s => ({
            id: s.profile_id,
            name: profileMap.get(s.profile_id) || 'Unknown',
            score: s.high_score,
            isCurrentUser: s.profile_id === activeProfileId
          }));
          setAllScores(mapped);
          setTopGlobal(mapped[0]);

          const userRankIndex = scores.findIndex(s => s.profile_id === activeProfileId);
          if (userRankIndex !== -1) {
            setRank(userRankIndex + 1);
            if (currentScore && currentScore >= scores[userRankIndex].high_score) {
              setShowCongrats(true);
            }
          }
        }

        const { data: myScore } = await supabase
          .from('game_progress')
          .select('high_score')
          .eq('game_name', gameName)
          .eq('profile_id', activeProfileId)
          .maybeSingle();

        if (myScore) {
          setPersonalBest(myScore.high_score);
        }

      } catch (err) {
        console.error('Error fetching mini leaderboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [gameName, instrument, currentScore]);

  if (loading) return <div className="animate-pulse h-20 bg-slate-100 rounded-2xl w-full"></div>;

  return (
    <>
      <div className={`w-full bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden ${className || ''}`}>
        <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3">
          <h4 className="font-black text-slate-400 uppercase tracking-widest text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" /> {instrument} Leaderboard
          </h4>
          {allScores.length > 0 && (
            <button 
              onClick={() => setShowFull(true)}
              className="text-sky-500 font-bold text-sm flex items-center hover:text-sky-400 transition-colors"
            >
              See Top 10 <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl flex flex-col justify-center border-2">
            <span className="text-xs font-black uppercase text-amber-500 mb-1 flex items-center gap-1">
              <Crown className="w-4 h-4" /> World #1
            </span>
            {topGlobal ? (
              <>
                <span className="text-xl font-black text-slate-800">{topGlobal.name}</span>
                <span className="text-2xl font-mono font-black text-amber-600">{topGlobal.score}</span>
              </>
            ) : (
              <span className="text-slate-400 font-bold">No scores yet</span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-100 flex flex-col justify-center">
            <span className="text-xs font-black uppercase text-sky-500 mb-1 flex items-center gap-1">
              <Star className="w-4 h-4" /> Your Best
            </span>
            <span className="text-xl font-black text-slate-800">
              {rank ? `Rank #${rank}` : 'Unranked'}
            </span>
            <span className="text-2xl font-mono font-black text-sky-600">
              {personalBest !== null ? personalBest : '---'}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCongrats && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4"
          >
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-8 rounded-[3rem] shadow-2xl flex flex-col items-center max-w-sm pointer-events-auto border-8 border-white text-center relative">
              <button 
                onClick={() => setShowCongrats(false)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <Trophy className="w-24 h-24 text-white mb-4 drop-shadow-md" />
              <h2 className="text-4xl font-black text-white uppercase tracking-widest mb-2 drop-shadow-md">New Highscore!</h2>
              <p className="text-amber-100 font-bold text-xl mb-4">
                You reached Rank #{rank} for {instrument}!
              </p>
              <div className="bg-white/20 px-6 py-3 rounded-full font-mono font-black text-3xl text-white">
                {currentScore}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showFull && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm pointer-events-auto text-left"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md max-h-[80vh] flex flex-col relative overflow-hidden">
              <button 
                onClick={() => setShowFull(false)}
                className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors text-slate-600 z-10"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-widest flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" /> Top 10 {instrument}
              </h3>
              
              <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2">
                {allScores.map((entry, i) => (
                  <div key={entry.id} className={`p-4 rounded-xl flex items-center gap-4 ${entry.isCurrentUser ? 'bg-amber-100 border-2 border-amber-300' : 'bg-slate-50 border-2 border-transparent'}`}>
                    <span className={`font-black w-6 text-center ${i === 0 ? 'text-amber-500 text-xl' : 'text-slate-400'}`}>
                      {i + 1}
                    </span>
                    <span className="font-bold text-slate-700 flex-1 truncate">{entry.name}</span>
                    <span className={`font-mono font-black ${i === 0 ? 'text-amber-600' : 'text-slate-600'}`}>{entry.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
