import React, { useRef, useEffect, useState } from 'react';
import { User, Bell, X, Compass, Music, BookOpen, Star, Sparkles, Map, Trophy, Settings, HelpCircle, Gamepad2, ArrowRight, Shield, Zap, MapPin, AlertTriangle, ShoppingCart } from 'lucide-react';
import { Screen } from '../types';
import { supabase } from '../lib/supabaseClient';
import StudentQuestLog from './StudentQuestLog';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { getXP, getQuavits } from '../utils/economy';

interface WorldMapProps {
  onNavigate: (screen: Screen) => void;
  onOpenAiden: () => void;
  currentStep: number;
}

export default function WorldMap({ onNavigate }: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sessionInfo, setSessionInfo] = useState<{ id: string, name: string } | null>(null);
  const [showQuestLog, setShowQuestLog] = useState(false);
  const [minScale, setMinScale] = useState(0.5);
  const [showAdventureAlerts, setShowAdventureAlerts] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);

  // Dynamically calculate the minimum scale so it never zooms out further than the screen
  // preventing the "dark blue" background from showing.
  useEffect(() => {
    const updateMinScale = () => {
      if (containerRef.current) {
        // Natural dimensions of the image wrapper
        const mapWidth = 2400; 
        const mapHeight = 1350; 
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        const scaleX = windowWidth / mapWidth;
        const scaleY = windowHeight / mapHeight;
        
        // The minimum scale is whichever scale is LARGER, so the map always covers the whole screen
        setMinScale(Math.max(scaleX, scaleY, 0.2));
      }
    };
    
    updateMinScale();
    window.addEventListener('resize', updateMinScale);
    return () => window.removeEventListener('resize', updateMinScale);
  }, []);

  return (
    <div className="w-full h-screen bg-sky-200 relative overflow-hidden" ref={containerRef}>
      
      {/* ZOOM PAN PINCH MAP LAYER */}
      <TransformWrapper 
        initialScale={Math.max(1, minScale)}
        minScale={minScale}
        maxScale={4}
        centerOnInit={true}
        limitToBounds={true}
        panning={{ wheelPanning: true }}
        wheel={{ wheelDisabled: false, step: 0.1, activationKeys: ["Control"] }}
        doubleClick={{ disabled: true }}
      >
        {() => (
          <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
            {/* 
              By using an actual img tag for the background, it naturally takes the exact aspect ratio 
              of the image, meaning no borders get cut off unexpectedly.
            */}
            <div 
              className="relative shadow-2xl inline-block"
              style={{ width: '2400px' }} // We fix the width to 2400px, the height will naturally adapt based on the image's aspect ratio
            >
              <img 
                src={isNightMode ? "/000-BackgroundNightnewamended.png" : "/000-Backgroundnewamended.png"}
                alt={isNightMode ? "Night Campus" : "Musictopia Campus"} 
                className="w-full h-auto block pointer-events-none" 
              />
              
              {/* Interactive Hitboxes (Invisible Buttons) */}
              {/* MUSICTOPIA CASTLE (Center - Available on both) */}
              <button
                onClick={() => onNavigate('musictopia-castle')}
                className="absolute group"
                style={{ left: '35%', top: '25%', width: '30%', height: '45%' }}
                title="Musictopia Castle"
              >
                <div className="w-full h-full rounded-[4rem] transition-all duration-300 group-hover:bg-white/20 group-hover:shadow-[0_0_50px_rgba(255,215,0,0.5)] group-active:scale-95 cursor-pointer" />
              </button>

              {/* DAY CAMPUS ONLY */}
              {!isNightMode && (
                <>
                  <button onClick={() => onNavigate('rocket-reading')} className="absolute group" style={{ left: '13%', top: '7%', width: '18%', height: '28%' }} title="Rocket Reading">
                    <div className="w-full h-full rounded-3xl transition-all duration-300 group-hover:bg-white/20 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] group-active:scale-95 cursor-pointer" />
                  </button>

                  <button onClick={() => onNavigate('rhythm-rapids')} className="absolute group" style={{ left: '57%', top: '13%', width: '20%', height: '24%' }} title="Rhythm Rapids">
                    <div className="w-full h-full rounded-3xl transition-all duration-300 group-hover:bg-white/20 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] group-active:scale-95 cursor-pointer" />
                  </button>

                  <button onClick={() => onNavigate('pizzeria')} className="absolute group" style={{ left: '1%', top: '56%', width: '24%', height: '34%' }} title="Pizzeria">
                    <div className="w-full h-full rounded-3xl transition-all duration-300 group-hover:bg-white/20 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] group-active:scale-95 cursor-pointer" />
                  </button>

                  <button onClick={() => onNavigate('finger-fishing')} className="absolute group" style={{ left: '52%', top: '70%', width: '24%', height: '28%' }} title="Finger Fishing">
                    <div className="w-full h-full rounded-3xl transition-all duration-300 group-hover:bg-white/20 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] group-active:scale-95 cursor-pointer" />
                  </button>

                  {/* Sign to Night Campus */}
                  <button
                    onClick={() => setIsNightMode(true)}
                    className="absolute flex flex-col items-center group cursor-pointer z-10"
                    style={{ left: '82%', top: '15%' }}
                  >
                    <div className="bg-amber-800 text-amber-100 font-black border-4 border-amber-950 rounded-xl px-4 py-2 shadow-2xl group-hover:scale-105 transition-transform whitespace-nowrap">
                      To Night Campus 🌙
                    </div>
                    <div className="w-4 h-12 bg-amber-950 rounded-b-md shadow-2xl" />
                  </button>
                </>
              )}

              {/* NIGHT CAMPUS ONLY */}
              {isNightMode && (
                <>
                  <button onClick={() => onNavigate('scale-sand-dunes')} className="absolute group" style={{ left: '15%', top: '20%', width: '20%', height: '25%' }} title="Scale Sand Dunes">
                    <div className="w-full h-full rounded-3xl transition-all duration-300 group-hover:bg-white/20 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] group-active:scale-95 cursor-pointer" />
                  </button>

                  <button onClick={() => onNavigate('listening-lagoon')} className="absolute group" style={{ left: '50%', top: '60%', width: '25%', height: '30%' }} title="Listening Lagoon">
                    <div className="w-full h-full rounded-3xl transition-all duration-300 group-hover:bg-white/20 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] group-active:scale-95 cursor-pointer" />
                  </button>

                  <button onClick={() => onNavigate('clef-cliffs')} className="absolute group" style={{ left: '70%', top: '15%', width: '15%', height: '30%' }} title="Clef Cliffs">
                    <div className="w-full h-full rounded-3xl transition-all duration-300 group-hover:bg-white/20 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] group-active:scale-95 cursor-pointer" />
                  </button>

                  <button onClick={() => onNavigate('expression-ninja')} className="absolute group" style={{ left: '76%', top: '44%', width: '20%', height: '28%' }} title="Expression Ninja">
                    <div className="w-full h-full rounded-3xl transition-all duration-300 group-hover:bg-white/20 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] group-active:scale-95 cursor-pointer" />
                  </button>

                  <button onClick={() => onNavigate('sound-sleuth')} className="absolute group" style={{ left: '20%', top: '65%', width: '20%', height: '25%' }} title="Sound Sleuth">
                    <div className="w-full h-full rounded-3xl transition-all duration-300 group-hover:bg-white/20 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] group-active:scale-95 cursor-pointer" />
                  </button>

                  {/* Sign to Day Campus */}
                  <button
                    onClick={() => setIsNightMode(false)}
                    className="absolute flex flex-col items-center group cursor-pointer z-10"
                    style={{ left: '82%', top: '15%' }}
                  >
                    <div className="bg-indigo-900 text-indigo-100 font-black border-4 border-indigo-950 rounded-xl px-4 py-2 shadow-2xl group-hover:scale-105 transition-transform whitespace-nowrap">
                      Back to Campus ☀️
                    </div>
                    <div className="w-4 h-12 bg-indigo-950 rounded-b-md shadow-2xl" />
                  </button>
                </>
              )}
            </div>
          </TransformComponent>
        )}
            </TransformWrapper>

      {/* HUD: Top Left - Economy */}
      <div className="absolute top-6 left-6 flex flex-col gap-3 z-50">
        {/* XP Badge */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-full px-6 py-2 border-2 border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.3)] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-fuchsia-500 flex items-center justify-center text-white font-black">
            XP
          </div>
          <span className="text-white font-black text-xl tracking-wider">{getXP()}</span>
        </div>

        {/* Quavits Badge */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-full px-6 py-2 border-2 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xl shadow-inner">
            Q
          </div>
          <span className="text-white font-black text-xl tracking-wider">{getQuavits()}</span>
        </div>

        {/* Shop Button */}
        <button 
          onClick={() => onNavigate('shop-page')}
          className="mt-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-900 rounded-full px-6 py-2 border-2 border-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.4)] flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 font-black uppercase tracking-widest justify-center"
        >
          <ShoppingCart className="w-5 h-5" /> Visit Shop
        </button>
      </div>

      {/* HUD: Top Center - SMART Goals */}
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

      {/* HUD: Top Right - Account & Rankings */}
      <div className="absolute top-6 right-6 flex flex-col gap-4 z-50 items-end">
        <button 
          onClick={() => setShowQuestLog(true)}
          className="w-16 h-16 bg-slate-800 rounded-full border-4 border-slate-700 flex items-center justify-center text-white relative hover:scale-105 transition-transform"
        >
          <AlertTriangle className="w-8 h-8 text-rose-500" />
          {/* Notification Badge */}
          <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-900">
            3
          </div>
        </button>

        <button
          onClick={() => onNavigate('account')}
          className="bg-slate-800/80 hover:bg-slate-700 text-sky-400 px-6 py-3 rounded-full shadow-lg backdrop-blur-md transition-all group flex items-center gap-3 cursor-pointer border-2 border-sky-500/50 hover:scale-105 active:scale-95"
        >
          <div className="w-10 h-10 bg-sky-500/20 rounded-full flex items-center justify-center overflow-hidden border-2 border-sky-400 shadow-inner">
            <Settings className="w-5 h-5 text-sky-400" />
          </div>
          <span className="font-bold text-lg hidden sm:block tracking-wide text-white">My Account</span>
        </button>

        <button
          onClick={() => onNavigate('leaderboard')}
          className="bg-slate-800/80 hover:bg-slate-700 text-yellow-400 px-6 py-3 rounded-full shadow-lg backdrop-blur-md transition-all group flex items-center gap-3 cursor-pointer border-2 border-yellow-500/50 hover:scale-105 active:scale-95"
        >
          <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center overflow-hidden border-2 border-yellow-400 shadow-inner">
            <span className="text-xl">🏆</span>
          </div>
          <span className="font-bold text-lg hidden sm:block tracking-wide text-white">Rankings</span>
        </button>
      </div>

      {/* HUD: Bottom Right - Concert Hall */}
      <button
        onClick={() => onNavigate('practice-hub')}
        className="absolute bottom-10 right-10 bg-gradient-to-b from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-4 py-8 rounded-[2rem] shadow-[0_15px_30px_rgba(217,119,6,0.5)] transition-all hover:scale-105 hover:-translate-y-2 active:scale-95 group z-50 flex flex-col items-center justify-center gap-1 cursor-pointer border-4 border-amber-300 w-64"
      >
        <span className="font-black text-xl uppercase tracking-widest drop-shadow-md text-center leading-none">GO TO</span>
        <span className="font-black text-4xl uppercase tracking-widest drop-shadow-md text-center leading-tight">CONCERT HALL</span>
      </button>

      {/* HUD: Bottom Left - Adventure Alerts */}
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
      {/* In-Game HUD UI Ends */}

      {showQuestLog && (
        <StudentQuestLog onClose={() => setShowQuestLog(false)} />
      )}
    </div>
  );
}
