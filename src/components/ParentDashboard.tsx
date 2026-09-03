import React from 'react';
import { 
  CreditCard, 
  Settings, 
  Bell, 
  Heart, 
  Clock, 
  Award,
  AlertCircle,
  BookOpen,
  Volume2,
  Globe
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const weeklyProgressData = [
  { name: 'Mon', score: 65, time: 20 },
  { name: 'Tue', score: 70, time: 25 },
  { name: 'Wed', score: 85, time: 40 },
  { name: 'Thu', score: 80, time: 35 },
  { name: 'Fri', score: 95, time: 50 },
  { name: 'Sat', score: 90, time: 45 },
  { name: 'Sun', score: 100, time: 60 },
];

const favoriteGamesData = [
  { name: 'Rhythm Runner', value: 85 },
  { name: 'Note Ninja', value: 60 },
  { name: 'Pitch Perfect', value: 45 },
];

export default function ParentDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Parent Dashboard</h1>
            <p className="text-slate-700">Track your child's musical journey.</p>
          </div>
          <div className="flex gap-4">
            <button className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow relative">
              <Bell className="w-6 h-6 text-slate-600" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
              <Settings className="w-6 h-6 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Metrics Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Clock className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-700 font-medium">Time Played</p>
                  <p className="text-2xl font-bold text-slate-900">4.5 hrs</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <Award className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-700 font-medium">Achievements</p>
                  <p className="text-2xl font-bold text-slate-900">12 Earned</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-rose-50 rounded-xl">
                  <Heart className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-700 font-medium">Favorite Game</p>
                  <p className="text-lg font-bold text-slate-900 truncate">Rhythm Runner</p>
                </div>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                Weekly Progress (Score vs Time)
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyProgressData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                    <Tooltip cursor={{stroke: '#f1f5f9', strokeWidth: 2}} />
                    <Line yAxisId="left" type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                    <Line yAxisId="right" type="monotone" dataKey="time" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Favorite Games Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Most Played Games (Minutes)
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={favoriteGamesData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} />
                    <Bar dataKey="value" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Teacher Adventure Alerts */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-sm text-white">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-100" />
                Teacher Alerts
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                  <h3 className="font-medium text-white">Rhythm Practice Due</h3>
                  <p className="text-sm text-indigo-100 mt-1">Please ensure they complete 15 minutes of Rhythm Runner this weekend.</p>
                  <p className="text-xs text-indigo-200 mt-2 font-medium">- Mr. Davis</p>
                </div>
              </div>
            </div>

            {/* Parent Resources */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                Tips & Resources
              </h2>
              <div className="space-y-3">
                {[
                  'How to encourage daily practice', 
                  'Understanding music theory basics', 
                  'Proper posture for playing'
                ].map((resource) => (
                  <button key={resource} className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-200 flex flex-col group">
                    <span className="text-slate-700 font-medium text-sm">{resource}</span>
                    <span className="text-emerald-500 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Read Article →</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Account & Settings */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold mb-4">Account & Settings</h2>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-700">
                  <CreditCard className="w-5 h-5 text-slate-700" />
                  Billing & Subscriptions
                </button>
                <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-700">
                  <Volume2 className="w-5 h-5 text-slate-700" />
                  App Sound Settings
                </button>
                <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-700">
                  <Globe className="w-5 h-5 text-slate-700" />
                  Language Preferences
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
