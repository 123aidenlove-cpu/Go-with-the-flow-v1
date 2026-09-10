import React, { useRef, useEffect, useState } from 'react';
import { User, Bell, X, Compass, Music, BookOpen, Star, Sparkles, Map, Trophy, Settings, HelpCircle, Gamepad2, ArrowRight, Shield, Zap, MapPin, AlertTriangle, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Screen } from '../types';
import { supabase } from '../lib/supabaseClient';
import StudentQuestLog from './StudentQuestLog';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { getXP, getQuavits, getRareQuavits } from '../utils/economy';
import { APP_ASSETS } from '../config/assets';

interface WorldMapProps {
  onNavigate: (screen: Screen) => void;
  onOpenAiden: () => void;
  currentStep: number;
}

export default function WorldMap({ onNavigate }: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sessionInfo, setSessionInfo] = useState<{ id: string, name: string } | null>(null);
  const [avatarData, setAvatarData] = useState<any>(null);
  const [inventory, setInventory] = useState<any>(null);
  const [showQuestLog, setShowQuestLog] = useState(false);
  // Calculate initial scale synchronously if window is defined (prevents jumping)
  const getInitialScale = () => {
    if (typeof window === 'undefined') return 0.5;
    const mapWidth = 2400; 
    const mapHeight = 1350; 
    const scaleX = (window.innerWidth - 100) / mapWidth;
    const scaleY = (window.innerHeight - 100) / mapHeight;
    return Math.max(Math.min(scaleX, scaleY), 0.1);
  };

  const [minScale, setMinScale] = useState(getInitialScale());
  const [showAdventureAlerts, setShowAdventureAlerts] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);

  // Dynamically calculate the minimum scale to fit with 50px padding
  useEffect(() => {
    const updateMinScale = () => {
      if (containerRef.current) {
        setMinScale(getInitialScale());
      }
    };
    
    window.addEventListener('resize', updateMinScale);
    return () => window.removeEventListener('resize', updateMinScale);
  }, []);

  return (
    <div className="w-full h-screen bg-sky-200 relative overflow-hidden" ref={containerRef}>
      
      {/* ZOOM PAN PINCH MAP LAYER */}
      <TransformWrapper 
        initialScale={minScale}
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

              {/* Map Avatar */}
              {avatarData && (
                <button
                  onClick={(e) => { e.stopPropagation(); onNavigate('shop'); }}
                  className="absolute z-50 hover:scale-110 transition-transform cursor-pointer drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                  style={{ left: '48%', top: '55%', width: '5%', height: '5%' }}
                  title="Open Wardrobe"
                >
                  <div className="w-full h-full rounded-full border-4 border-amber-400 bg-slate-800 flex items-center justify-center overflow-hidden shadow-2xl relative">
                    {avatarData.url ? <img src={`/avatars/${avatarData.url}`} alt="Avatar" className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal" /> : <span className="text-3xl">{avatarData.emoji || '👤'}</span>}
                  </div>
                </button>
              )}

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

      {/* Top Left HUD - Back Arrow */}
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={() => onNavigate('student-hub')}
          className="flex items-center justify-center w-12 h-12 bg-slate-800/80 rounded-full text-white hover:bg-slate-700 transition-colors shadow-lg border-2 border-slate-600"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Top Right HUD - Account & Quavits */}
      <div className="absolute top-6 right-6 z-50 flex flex-col items-end gap-2">
        <button 
          onClick={() => onNavigate('settings')}
          className="bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-lg border-2 border-slate-600 flex items-center gap-3 transition-colors"
        >
          <User className="w-5 h-5" /> Accounts
        </button>
        
        <div className="bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-2xl flex flex-col items-end gap-1 border border-slate-700 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 font-black text-xl">
             <span>{getQuavits()}</span> 
             <img src={APP_ASSETS.ui.quavits} alt="Quavits" className="w-8 h-8 object-contain drop-shadow-md" />
          </div>
          <div className="flex items-center gap-2 text-cyan-400 font-black text-xl">
             <span>{getRareQuavits()}</span> 
             <img src={APP_ASSETS.ui.rareQuavits} alt="Rare Quavits" className="w-8 h-8 object-contain drop-shadow-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
