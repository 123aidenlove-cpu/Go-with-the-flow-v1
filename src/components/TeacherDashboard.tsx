import { BackButton } from './ui/BackButton';
import React from 'react';
import { 
  CreditCard, 
  Settings, 
  Bell, 
  BookOpen, 
  Clock, 
  Users,
  AlertCircle,
  Volume2,
  Globe
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const timePlayedData = [
  { name: 'Mon', minutes: 45 },
  { name: 'Tue', minutes: 30 },
  { name: 'Wed', minutes: 60 },
  { name: 'Thu', minutes: 45 },
  { name: 'Fri', minutes: 90 },
  { name: 'Sat', minutes: 120 },
  { name: 'Sun', minutes: 80 },
];

const gamesData = [
  { name: 'Rhythm Runner', value: 400 },
  { name: 'Pitch Perfect', value: 300 },
  { name: 'Note Ninja', value: 300 },
  { name: 'Chord Crash', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <BackButton onClick={onBack} />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Teacher Dashboard</h1>
            <p className="text-slate-700">Welcome back! Here's how your students are doing.</p>
          </div>
          <div className="flex gap-4">
            <button className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
              <Bell className="w-6 h-6 text-slate-600" />
            </button>
            <button className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
              <Settings className="w-6 h-6 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Metrics Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Time Played Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                Class Time Played This Week (Minutes)
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timePlayedData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} />
                    <Bar dataKey="minutes" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Favorite Games Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                Favorite Games
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gamesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {gamesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {gamesData.map((game, i) => (
                  <div key={game.name} className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    {game.name}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Adventure Alerts */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Active Adventure Alerts
              </h2>
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <h3 className="font-medium text-amber-900">Rhythm Practice Due</h3>
                  <p className="text-sm text-amber-700">Level 3 students need to complete Rhythm Runner</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <h3 className="font-medium text-blue-900">New Song Unlocked</h3>
                  <p className="text-sm text-blue-700">"Ode to Joy" available for beginners</p>
                </div>
              </div>
              <button className="w-full mt-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
                Create Alert
              </button>
            </div>

            {/* Resources */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-500" />
                Lesson Resources
              </h2>
              <div className="space-y-3">
                {['Beginner Piano Plan', 'Music Theory Basics', 'Rhythm Exercises'].map((resource) => (
                  <button key={resource} className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-200 flex justify-between items-center group">
                    <span className="text-slate-700 font-medium">{resource}</span>
                    <span className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">View</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Account & Settings Quick Access */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold mb-4">Account & Settings</h2>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-700">
                  <CreditCard className="w-5 h-5 text-slate-700" />
                  Payments & Subscriptions
                </button>
                <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-700">
                  <Volume2 className="w-5 h-5 text-slate-700" />
                  Sound Preferences
                </button>
                <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-700">
                  <Globe className="w-5 h-5 text-slate-700" />
                  Language Options
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
