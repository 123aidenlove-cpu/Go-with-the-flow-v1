import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Play, Award, Target, Clock, Star } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface PracticeLogProps {
  onClose: () => void;
}

export default function PracticeLogCalendar({ onClose }: PracticeLogProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Mock Data
  const practices = [1, 4, 5, 8, 12, 14, 15, 18, 22, 25]; // Blue highlights
  const lessons = [5, 12, 19, 26]; // Green highlights
  
  const pieData = [
    { name: 'Minuet in G', value: 45, color: '#0ea5e9' },
    { name: 'Scale Sand Dunes', value: 25, color: '#f59e0b' },
    { name: 'Rocket Reading', value: 30, color: '#10b981' }
  ];

  const generateCalendarDays = () => {
    const days = [];
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-4" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const isPractice = practices.includes(d);
      const isLesson = lessons.includes(d);
      
      let bgClass = "bg-slate-50 hover:bg-slate-100 text-slate-700";
      if (isPractice && isLesson) bgClass = "bg-gradient-to-br from-sky-400 to-emerald-400 text-white font-bold shadow-md";
      else if (isPractice) bgClass = "bg-sky-400 text-white font-bold shadow-md";
      else if (isLesson) bgClass = "bg-emerald-400 text-white font-bold shadow-md";

      days.push(
        <button key={d} className={`p-3 md:p-4 rounded-xl aspect-square flex items-center justify-center transition-transform hover:scale-105 ${bgClass}`}>
          {d}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8 overflow-hidden">
      <div className="bg-slate-50 w-full max-w-7xl h-full max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-white px-10 py-6 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-sky-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">Practice Log & Stats</h2>
              <p className="text-slate-500 font-medium">Track your musical journey</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2">
              <Play className="w-4 h-4" /> Start Practice
            </button>
            <button onClick={onClose} className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors">
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Column: Calendar & Stats */}
          <div className="flex-1 p-10 overflow-y-auto">
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                <Clock className="w-8 h-8 text-sky-500 mb-2" />
                <span className="text-3xl font-black text-slate-800">12h 45m</span>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Time</span>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                <Target className="w-8 h-8 text-emerald-500 mb-2" />
                <span className="text-3xl font-black text-slate-800">8</span>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Goals Met</span>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                <Award className="w-8 h-8 text-orange-500 mb-2" />
                <span className="text-3xl font-black text-slate-800">14</span>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Alerts Done</span>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                <Star className="w-8 h-8 text-purple-500 mb-2" />
                <span className="text-3xl font-black text-slate-800">2,450</span>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Quavits</span>
              </div>
            </div>

            {/* Calendar Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <button 
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 md:gap-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-bold text-slate-400 text-sm py-2 uppercase tracking-wider">
                    {day}
                  </div>
                ))}
                {generateCalendarDays()}
              </div>

              {/* Legend */}
              <div className="flex gap-6 mt-8 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-sky-400"></div>
                  <span className="text-sm font-bold text-slate-500">Practice Day</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-400"></div>
                  <span className="text-sm font-bold text-slate-500">Lesson Day</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Recent Sessions & Pie Chart */}
          <div className="w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col shrink-0">
            <div className="p-8 pb-0">
              <h3 className="text-lg font-black text-slate-800 mb-6">Practice Distribution</h3>
              <div className="h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-8 flex-1 overflow-y-auto">
              <h3 className="text-lg font-black text-slate-800 mb-6">Recent Sessions</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50 transition-colors group cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-slate-800">Aug {26 - i}, 2026</span>
                      <span className="text-sm font-black text-sky-500">45 mins</span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium line-clamp-2">
                      Focused on Minuet in G tricky measures (12-16). Used Isolate and Loop practice powers. Rocket Reading high score +200.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
