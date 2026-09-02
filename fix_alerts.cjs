const fs = require('fs');
let content = fs.readFileSync('src/components/WorldMap.tsx', 'utf8');

const newAlerts = `              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>
            </div>`;

const regex = /<div className="grid grid-cols-1 md:grid-cols-2 gap-6">[\s\S]*?<\/div>\n\s*<\/div>/;
content = content.replace(regex, newAlerts);
fs.writeFileSync('src/components/WorldMap.tsx', content);
console.log('Alerts updated!');
