import React from 'react';
import { ArrowLeft, Flame, Clock, BadgeCheck, Trophy, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useProfile } from '../context/ProfileContext';
import { ACHIEVEMENT_CATALOG } from '../utils/achievementManager';

interface ParentDashboardProps {
  onBack: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onBack }) => {
  const { profile } = useProfile();

  // Get full objects for the last 3 unlocked achievements
  const recentAchievements = [...profile.unlockedAchievements]
    .reverse()
    .slice(0, 3)
    .map((id) => ACHIEVEMENT_CATALOG.find((a) => a.id === id))
    .filter((a): a is typeof ACHIEVEMENT_CATALOG[0] => !!a);

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 p-6 flex flex-col items-center select-none" id="parent-dashboard-container">
      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          aria-label="Back to Map"
          className="bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Map
        </Button>

        <div className="flex items-center gap-2">
          <TrendingUp className="text-slate-600 w-5 h-5" />
          <h1 className="text-sm font-display font-black text-slate-500 uppercase tracking-widest">
            Parent & Teacher Dashboard
          </h1>
        </div>
      </div>

      <div className="w-full max-w-5xl text-center md:text-left mb-8 border-b border-slate-200/60 pb-6">
        <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight">
          How is {profile.name} doing?
        </h2>
        <p className="text-slate-500 mt-1.5 text-sm font-medium">
          Real-time insights and competence metrics synced directly from their device.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Card 1: Practice Streak */}
        <Card className="flex items-center gap-5 bg-white border border-slate-200 shadow-sm p-6">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-3xl animate-pulse">
            🔥
          </div>
          <div>
            <h3 className="text-slate-400 text-xs font-black uppercase tracking-wider font-display">
              Practice Streak
            </h3>
            <div className="text-3xl font-display font-black text-slate-900 mt-0.5">
              {profile.streakDays} {profile.streakDays === 1 ? 'Day' : 'Days'}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              Keep playing daily to earn bonus XP and high-retention medals!
            </p>
          </div>
        </Card>

        {/* Card 2: Total Practice Time */}
        <Card className="flex items-center gap-5 bg-white border border-slate-200 shadow-sm p-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl">
            ⏱️
          </div>
          <div>
            <h3 className="text-slate-400 text-xs font-black uppercase tracking-wider font-display">
              Total Practice Time
            </h3>
            <div className="text-3xl font-display font-black text-slate-900 mt-0.5">
              45 mins <span className="text-slate-400 text-lg font-bold">this week</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              Consistent 5-minute daily challenges are perfect for habit building!
            </p>
          </div>
        </Card>

        {/* Card 3: Mastered Notes */}
        <Card className="bg-white border border-slate-200 shadow-sm p-6 md:col-span-1">
          <h3 className="text-slate-400 text-xs font-black uppercase tracking-wider font-display flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
            <BadgeCheck className="text-emerald-500 w-4 h-4" />
            Mastered Notes & Skills
          </h3>
          
          {profile.unlockedNodes.length === 0 ? (
            <p className="text-xs text-slate-400">No notes completed yet. Keep trying!</p>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {profile.unlockedNodes.map((node) => (
                <div
                  key={node}
                  className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold font-display rounded-full flex items-center gap-1.5 shadow-sm"
                >
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  {node} Mastery
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-500 mt-5 leading-relaxed">
            These represent musical pitches your student can successfully identify, map fingerings for, and play in sync.
          </p>
        </Card>

        {/* Card 4: Recent Achievements */}
        <Card className="bg-white border border-slate-200 shadow-sm p-6 md:col-span-1">
          <h3 className="text-slate-400 text-xs font-black uppercase tracking-wider font-display flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
            <Trophy className="text-amber-500 w-4 h-4" />
            Recent Badges Earned
          </h3>

          {recentAchievements.length === 0 ? (
            <div className="text-center py-6 flex flex-col items-center justify-center">
              <span className="text-3xl opacity-20">🏆</span>
              <p className="text-xs text-slate-400 font-medium mt-1">
                No achievements unlocked yet. Keep playing to earn trophies!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAchievements.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl"
                >
                  <div className="text-2xl">{badge.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-display font-black text-slate-800 truncate">
                      {badge.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {badge.description}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded">
                    +{badge.xpReward} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>

      {/* Progress Footer */}
      <footer className="w-full max-w-5xl bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🦉</div>
          <div>
            <h4 className="font-display font-extrabold text-sm text-yellow-400">AidenOnboarding recommendation:</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed max-w-md">
              {profile.unlockedNodes.includes('Middle C')
                ? 'Excellent work! Your student is pacing ahead of average clarinet curriculums. Introduce them to basic melodies.'
                : 'Pacing nicely! Encourage them to practice 5 minutes daily on Middle E and Middle D.'}
            </p>
          </div>
        </div>
        <div className="text-center sm:text-right bg-slate-800 px-4 py-2 rounded-xl border border-slate-700/60 font-mono">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Total Stars Collected</span>
          <div className="text-2xl font-black text-yellow-400">{profile.totalStars} ⭐</div>
        </div>
      </footer>
    </div>
  );
};
