const fs = require('fs');
let content = fs.readFileSync('src/components/WorldMap.tsx', 'utf8');

// 1. Add SMART Goal HUD after the Rankings button
const smartGoalUI = `
      {/* SMART Goal HUD (Top Center) */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-800/80 backdrop-blur-md px-8 py-4 rounded-3xl shadow-xl z-50 border-2 border-emerald-500/30 flex flex-col items-center gap-2">
        <h3 className="text-white font-black uppercase tracking-widest text-sm">
          SMART Goal <span className="text-emerald-400">Weekly Sessions</span>
        </h3>
        <div className="w-64 h-4 bg-slate-700 rounded-full overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-sky-400 w-3/4 rounded-full"></div>
        </div>
        <div className="flex justify-between w-full text-xs font-bold">
          <span className="text-slate-300">3/4 Sessions</span>
          <span className="text-yellow-400">Upcoming: +150 XP</span>
        </div>
      </div>
`;
content = content.replace(/<span className="font-bold text-lg hidden sm:block tracking-wide text-white">Rankings<\/span>\n\s*<\/button>/, match => match + "\n" + smartGoalUI);

// 2. Replace Adventure Alerts grid
const newAlerts = `<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Teacher Task 1 */}
                <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-3xl flex flex-col gap-4">
                  <div className="bg-orange-500 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full self-start shadow-sm">
                    Teacher Set
                  </div>
                  <h3 className="text-xl font-black text-orange-900 leading-tight">Master Rocket Reading</h3>
                  <p className="text-slate-600 font-medium text-sm">Hit 3000m to prove your note recognition!</p>
                  <div className="bg-white p-4 rounded-2xl border border-orange-100 mt-auto flex justify-between items-center shadow-sm">
                    <span className="font-bold text-slate-800">2000m / 3000m</span>
                    <span className="text-orange-600 font-black">+50 Quavits</span>
                  </div>
                </div>

                {/* Teacher Task 2 */}
                <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-3xl flex flex-col gap-4">
                  <div className="bg-orange-500 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full self-start shadow-sm">
                    Teacher Set
                  </div>
                  <h3 className="text-xl font-black text-orange-900 leading-tight">Finger Fishing Challenge</h3>
                  <p className="text-slate-600 font-medium text-sm">Catch 20 fish using correct fingering.</p>
                  <div className="bg-white p-4 rounded-2xl border border-orange-100 mt-auto flex justify-between items-center shadow-sm">
                    <span className="font-bold text-slate-800">5 / 20 Fish</span>
                    <span className="text-orange-600 font-black">+30 Quavits</span>
                  </div>
                </div>

                {/* App Task 1 */}
                <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-3xl flex flex-col gap-4">
                  <div className="bg-blue-500 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full self-start shadow-sm">
                    App Generated
                  </div>
                  <h3 className="text-xl font-black text-blue-900 leading-tight">Daily Flow Practice</h3>
                  <p className="text-slate-600 font-medium text-sm">Complete a 15-minute practice flow session.</p>
                  <div className="bg-white p-4 rounded-2xl border border-blue-100 mt-auto flex justify-between items-center shadow-sm">
                    <span className="font-bold text-slate-800">0 / 1 Session</span>
                    <span className="text-blue-600 font-black">+20 XP</span>
                  </div>
                </div>

                {/* App Task 2 */}
                <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-3xl flex flex-col gap-4">
                  <div className="bg-blue-500 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full self-start shadow-sm">
                    App Generated
                  </div>
                  <h3 className="text-xl font-black text-blue-900 leading-tight">Scale Sand Dunes</h3>
                  <p className="text-slate-600 font-medium text-sm">Unlock level 3 of Scale Sand Dunes.</p>
                  <div className="bg-white p-4 rounded-2xl border border-blue-100 mt-auto flex justify-between items-center shadow-sm">
                    <span className="font-bold text-slate-800">Level 2 / 3</span>
                    <span className="text-blue-600 font-black">+40 XP</span>
                  </div>
                </div>
              </div>`;

const oldGridRegex = /<div className="grid grid-cols-1 md:grid-cols-2 gap-6">[\s\S]*?<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>/;
content = content.replace(oldGridRegex, newAlerts + "\n            </div>\n          </div>\n        </div>");

fs.writeFileSync('src/components/WorldMap.tsx', content);
console.log('Fixed WorldMap');
