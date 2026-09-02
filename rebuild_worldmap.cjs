const fs = require('fs');
let content = fs.readFileSync('src/components/WorldMap.tsx', 'utf8');

// Add missing imports
if (!content.includes('Bell')) {
  content = content.replace(/import \{ User \} from 'lucide-react';/, "import { User, Bell, X } from 'lucide-react';");
}

// Add state
if (!content.includes('showAdventureAlerts')) {
  content = content.replace(/const \[minScale, setMinScale\] = useState\(0\.5\);/, "const [minScale, setMinScale] = useState(0.5);\n  const [showAdventureAlerts, setShowAdventureAlerts] = useState(false);");
}

// Add HUD elements
const oldAccountButton = /<button\s+onClick=\{[\s\S]*?<span className=\"text-xl\">👤<\/span>\s*<\/div>\s*<span className=\"font-bold text-lg hidden sm:block tracking-wide text-white\">Account<\/span>\s*<\/button>/;

const fullHUD = `<button
          onClick={() => onNavigate('profile-selector')}
          className="absolute top-6 right-6 bg-slate-800/80 hover:bg-slate-700 text-sky-400 px-6 py-3 rounded-full shadow-lg backdrop-blur-md transition-all group z-50 flex items-center gap-3 cursor-pointer border-2 border-sky-500/50 hover:scale-105 active:scale-95"
        >
          <div className="w-10 h-10 bg-sky-500/20 rounded-full flex items-center justify-center overflow-hidden border-2 border-sky-400 shadow-inner">
            <span className="text-xl">👤</span>
          </div>
          <span className="font-bold text-lg hidden sm:block tracking-wide text-white">Account</span>
        </button>

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

        {/* Rankings Button (Top Right below Account) */}
        <button
          onClick={() => onNavigate('leaderboard')}
          className="absolute top-24 right-6 bg-slate-800/80 hover:bg-slate-700 text-yellow-400 px-6 py-3 rounded-full shadow-lg backdrop-blur-md transition-all group z-50 flex items-center gap-3 cursor-pointer border-2 border-yellow-500/50 hover:scale-105 active:scale-95"
        >
          <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center overflow-hidden border-2 border-yellow-400 shadow-inner">
            <span className="text-xl">🏆</span>
          </div>
          <span className="font-bold text-lg hidden sm:block tracking-wide text-white">Rankings</span>
        </button>

        {/* Concert Hall Button (Bottom Right) */}
        <button
          onClick={() => onNavigate('concert-hall')}
          className="absolute bottom-10 right-10 bg-gradient-to-b from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-4 py-8 rounded-[2rem] shadow-[0_15px_30px_rgba(217,119,6,0.5)] transition-all hover:scale-105 hover:-translate-y-2 active:scale-95 group z-50 flex flex-col items-center justify-center gap-1 cursor-pointer border-4 border-amber-300 w-64"
        >
          <span className="font-black text-xl uppercase tracking-widest drop-shadow-md text-center leading-none">GO TO</span>
          <span className="font-black text-4xl uppercase tracking-widest drop-shadow-md text-center leading-tight">CONCERT HALL</span>
        </button>

        {/* Adventure Alerts Button (Bottom Left) */}
        <button
          onClick={() => setShowAdventureAlerts(true)}
          className="absolute bottom-10 left-10 bg-gradient-to-b from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-8 py-6 rounded-[2rem] shadow-[0_15px_30px_rgba(79,70,229,0.5)] transition-all hover:scale-105 hover:-translate-y-2 active:scale-95 group z-50 flex items-center justify-center gap-4 cursor-pointer border-4 border-indigo-300"
        >
          <Bell className="w-10 h-10 animate-bounce" />
          <div className="flex flex-col items-start">
            <span className="font-black text-xl uppercase tracking-widest drop-shadow-md leading-none">Adventure</span>
            <span className="font-black text-3xl uppercase tracking-widest drop-shadow-md leading-tight text-indigo-100">Alerts</span>
          </div>
        </button>

        {/* Adventure Alerts Popup Modal */}
        {showAdventureAlerts && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full flex flex-col shadow-2xl relative border-4 border-indigo-200">
              <button 
                onClick={() => setShowAdventureAlerts(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 font-bold bg-slate-100 p-2 rounded-full"
              >
                Close
              </button>
              <h2 className="text-4xl font-black text-indigo-900 mb-6 flex items-center gap-3">
                <Bell className="w-8 h-8 text-indigo-500" />
                Adventure Alerts
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </div>
        )}
`;

if (content.match(oldAccountButton)) {
  content = content.replace(oldAccountButton, fullHUD);
} else {
  // If account button not found by regex, append it before the final closing divs of TransformWrapper
  const lastDivRegex = /<\/TransformComponent>\s*<\/React.Fragment>\s*<\/TransformWrapper>\s*\)}/;
  content = content.replace(lastDivRegex, (match) => match + "\n" + fullHUD);
}

fs.writeFileSync('src/components/WorldMap.tsx', content);
console.log('Rebuilt Map HUD successfully!');
