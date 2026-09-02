import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Trophy, Medal, ArrowLeft, Star, Crown, Activity } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  game_name: string;
  level_reached: number;
  high_score: number;
  stars_earned: number;
  instrument?: string;
}

export default function GlobalLeaderboard({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [selectedGame, setSelectedGame] = useState('Rocket Reading');

  const games = [
    'Rocket Reading',
    'Finger Fishing',
    'Rhythm Rapids',
    'Music Pizzeria',
    'Sight Read Soaring'
  ];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // Fetch top 10 scores for the selected game
        const { data: rawScores, error: scoreError } = await supabase
          .from('game_progress')
          .select('*')
          .eq('game_name', selectedGame)
          .order('high_score', { ascending: false })
          .limit(10);

        if (scoreError) throw scoreError;

        if (rawScores && rawScores.length > 0) {
          const userIds = rawScores.map(s => s.user_id);
          // Fetch profiles to get instrument
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('user_id, instrument')
            .in('user_id', userIds);
            
          if (profileError) throw profileError;

          const profileMap = new Map();
          profiles?.forEach(p => profileMap.set(p.user_id, p.instrument));

          const combined = rawScores.map(s => ({
            ...s,
            instrument: profileMap.get(s.user_id) || 'Musician'
          }));

          setScores(combined);
        } else {
          setScores([]);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedGame]);

  return (
    <div className="min-h-screen bg-slate-900 p-8 relative flex flex-col items-center">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 px-6 py-3 font-black text-white uppercase tracking-widest bg-slate-800 rounded-full hover:bg-slate-700 transition-colors shadow-lg z-10"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="w-full max-w-4xl mt-16">
        <div className="flex items-center justify-center gap-4 mb-8">
          <Trophy className="w-12 h-12 text-yellow-400" />
          <h1 className="text-5xl font-black text-white uppercase tracking-widest drop-shadow-md">
            Global Leaderboard
          </h1>
          <Trophy className="w-12 h-12 text-yellow-400" />
        </div>

        {/* Game Selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {games.map(game => (
            <button
              key={game}
              onClick={() => setSelectedGame(game)}
              className={`px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${
                selectedGame === game 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white scale-105'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {game}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400">
              <Activity className="w-12 h-12 animate-pulse mb-4" />
              <p className="font-bold text-xl">Fetching scores from satellite...</p>
            </div>
          ) : scores.length === 0 ? (
            <div className="p-20 text-center text-slate-400">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-2xl font-bold mb-2">No scores yet!</h3>
              <p>Be the first to set a high score in {selectedGame}.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 p-6 bg-slate-900/50 border-b border-white/5 font-black text-slate-400 uppercase tracking-widest text-sm">
                <div className="col-span-2 text-center">Rank</div>
                <div className="col-span-4">Musician</div>
                <div className="col-span-3 text-center">Highest Level</div>
                <div className="col-span-3 text-right">High Score</div>
              </div>
              
              {/* Rows */}
              {scores.map((score, index) => (
                <div 
                  key={score.id} 
                  className={`grid grid-cols-12 gap-4 p-6 items-center border-b border-white/5 transition-colors hover:bg-white/5 ${
                    index === 0 ? 'bg-yellow-500/10' : 
                    index === 1 ? 'bg-slate-300/10' : 
                    index === 2 ? 'bg-amber-700/10' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-2 flex justify-center">
                    {index === 0 ? <Crown className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" /> :
                     index === 1 ? <Medal className="w-8 h-8 text-slate-300" /> :
                     index === 2 ? <Medal className="w-8 h-8 text-amber-700" /> :
                     <span className="font-black text-2xl text-slate-500">#{index + 1}</span>
                    }
                  </div>

                  {/* Player Info */}
                  <div className="col-span-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/50">
                      <span className="font-black text-indigo-300">{score.instrument?.charAt(0) || 'M'}</span>
                    </div>
                    <div>
                      <div className="font-black text-white text-lg leading-tight">
                        Student {score.user_id.substring(0, 4)}
                      </div>
                      <div className="text-indigo-400 text-sm font-bold">
                        {score.instrument}
                      </div>
                    </div>
                  </div>

                  {/* Level */}
                  <div className="col-span-3 flex justify-center items-center gap-2">
                    <span className="px-3 py-1 bg-sky-500/20 text-sky-400 rounded-lg font-black font-mono border border-sky-500/30">
                      Level {score.level_reached}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="col-span-3 flex justify-end items-center gap-2">
                    <span className="text-3xl font-black font-mono text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                      {score.high_score.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
