import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Timer, Mic, Award, RotateCcw, Volume2 } from 'lucide-react';

interface AcousticChallengesProps {
  onBack: () => void;
  warmupMode?: boolean;
  forcedType?: ChallengeType;
  onWarmupComplete?: (score: number) => void;
}

type ChallengeState = 'hub' | 'countdown' | 'listening' | 'results';
type ChallengeType = 'long-note' | 'tonguing';

// Leaderboard entry format
interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  date: string;
}

export default function AcousticChallenges({ onBack, warmupMode, forcedType, onWarmupComplete }: AcousticChallengesProps) {
  const [subModal, setSubModal] = useState<ChallengeState>(warmupMode ? 'countdown' : 'hub');
  const [challengeType, setChallengeType] = useState<ChallengeType>(forcedType || 'long-note');
  
  const [countdown, setCountdown] = useState<number | string>(3);
  const [timer, setTimer] = useState<number>(0);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [tonguingCount, setTonguingCount] = useState<number>(0);
  
  // Leaderboards
  const [personalBest, setPersonalBest] = useState<LeaderboardEntry[]>([]);
  const [globalBest, setGlobalBest] = useState<LeaderboardEntry[]>([]);
  const [tonguingPB, setTonguingPB] = useState<LeaderboardEntry[]>([]);
  const [tonguingGlobal, setTonguingGlobal] = useState<LeaderboardEntry[]>([]);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasStartedPlayingRef = useRef<boolean>(false);
  const inPeakRef = useRef<boolean>(false);
  const tonguingCountRef = useRef<number>(0);
  const localMaxRef = useRef<number>(0);
  const localMinRef = useRef<number>(255);
  
  // Load leaderboards on mount
  useEffect(() => {
    if (warmupMode && forcedType) {
      startChallenge(forcedType);
    }
    
    const savedPB = localStorage.getItem('long_note_pb');
    if (savedPB) setPersonalBest(JSON.parse(savedPB));
    else setPersonalBest([]);
    
    const savedTPB = localStorage.getItem('tonguing_pb');
    if (savedTPB) setTonguingPB(JSON.parse(savedTPB));
    else setTonguingPB([]);
    
    setGlobalBest([]);
    setTonguingGlobal([]);
  }, []);

  const saveScore = (score: number, type: ChallengeType) => {
    const newEntry: LeaderboardEntry = {
      id: Math.random().toString(),
      name: 'You',
      score,
      date: new Date().toISOString()
    };
    
    if (type === 'long-note') {
      const updatedPB = [...personalBest, newEntry].sort((a, b) => b.score - a.score).slice(0, 5);
      setPersonalBest(updatedPB);
      localStorage.setItem('long_note_pb', JSON.stringify(updatedPB));
      
      const updatedGlobal = [...globalBest, newEntry].sort((a, b) => b.score - a.score).slice(0, 5);
      setGlobalBest(updatedGlobal);
    } else {
      const updatedPB = [...tonguingPB, newEntry].sort((a, b) => b.score - a.score).slice(0, 5);
      setTonguingPB(updatedPB);
      localStorage.setItem('tonguing_pb', JSON.stringify(updatedPB));
      
      const updatedGlobal = [...tonguingGlobal, newEntry].sort((a, b) => b.score - a.score).slice(0, 5);
      setTonguingGlobal(updatedGlobal);
    }
  };

  const startChallenge = (type: ChallengeType) => {
    setChallengeType(type);
    setSubModal('countdown');
    setCountdown(3);
    
    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        startListening(type);
      }
    }, 1000);
  };

  const stopAudio = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const startListening = async (type: ChallengeType) => {
    setSubModal('listening');
    if (type === 'long-note') setTimer(0);
    else setTimer(10.0);
    setTonguingCount(0);
    tonguingCountRef.current = 0;
    
    hasStartedPlayingRef.current = false;
    startTimeRef.current = null;
    silenceStartRef.current = null;
    inPeakRef.current = false;
    localMaxRef.current = 0;
    localMinRef.current = 255;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048; // Higher resolution for pitch detection
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const timeDomainArray = new Float32Array(analyser.fftSize);
      
      const checkAudio = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setVolumeLevel(average);
        
        const BASE_THRESHOLD = 4; // Minimum volume floor (just above quiet room noise)
        const SILENCE_TOLERANCE_MS = 500; // 500ms of silence allowed
        const currentTime = performance.now();
        
        // Dynamic peak tracking (used for tonguing)
        localMaxRef.current = Math.max(BASE_THRESHOLD, localMaxRef.current * 0.995);
        if (average > localMaxRef.current) {
          localMaxRef.current = average;
        }
        
        const currentThreshold = BASE_THRESHOLD; // Fixed low threshold just above a quiet room
        
        if (!hasStartedPlayingRef.current) {
          // Require a slightly harder attack to initially trigger
          if (average >= BASE_THRESHOLD * 2) {
            hasStartedPlayingRef.current = true;
            startTimeRef.current = currentTime;
          }
        }
        
        let elapsed = 0;
        if (hasStartedPlayingRef.current && startTimeRef.current) {
          elapsed = (currentTime - startTimeRef.current) / 1000;
          
          if (type === 'long-note') {
            setTimer(elapsed);
          } else {
            const remaining = Math.max(0, 10.0 - elapsed);
            setTimer(remaining);
          }
        }
        
        if (hasStartedPlayingRef.current) {
          if (type === 'long-note') {
            if (average < currentThreshold) {
              if (!silenceStartRef.current) {
                silenceStartRef.current = currentTime;
              } else if (currentTime - silenceStartRef.current > SILENCE_TOLERANCE_MS) {
                finishChallenge(elapsed);
                return;
              }
            } else {
              silenceStartRef.current = null;
            }
          } else {
            // TONGUING MODE logic
            if (elapsed >= 10.0) {
              finishChallenge(tonguingCountRef.current);
              return;
            }
            
            // Dynamic peak tracking
            if (average > localMaxRef.current) localMaxRef.current = average;
            if (average < localMinRef.current) localMinRef.current = average;
            
            const ATTACK_DELTA = 4; // Volume must jump by this amount from recent valley
            const DECAY_DELTA = 4;  // Volume must drop by this amount from recent peak
            
            if (!inPeakRef.current && (average - localMinRef.current >= ATTACK_DELTA) && average >= currentThreshold) {
              inPeakRef.current = true;
              tonguingCountRef.current += 1;
              setTonguingCount(tonguingCountRef.current);
              localMaxRef.current = average; // Reset peak tracking
            } else if (inPeakRef.current && (localMaxRef.current - average >= DECAY_DELTA)) {
              inPeakRef.current = false;
              localMinRef.current = average; // Reset valley tracking
            }
          }
        }
        
        requestRef.current = requestAnimationFrame(checkAudio);
      };
      
      checkAudio();
      
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      alert("Please allow microphone access to play Acoustic Challenges.");
      setSubModal('hub');
    }
  };

  const finishChallenge = (finalScore: number) => {
    stopAudio();
    if (warmupMode && onWarmupComplete) {
      onWarmupComplete(finalScore);
      return;
    }
    saveScore(finalScore, challengeType);
    if (challengeType === 'long-note') setTimer(finalScore);
    else setTonguingCount(finalScore);
    setSubModal('results');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-5xl max-h-[90vh] bg-white border-4 border-rose-500 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-rose-500 p-4 flex justify-between items-center text-white shrink-0">
          <h2 className="text-2xl font-black uppercase tracking-widest pl-4">Acoustic Challenges</h2>
          <button onClick={onBack} className="p-2 hover:bg-rose-600 rounded-full bg-white/20 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

      <div className="flex-1 min-h-[60vh] flex bg-slate-50">
        
        {/* HUB STATE */}
        {subModal === 'hub' && (
          <div className="flex flex-col w-full p-8 gap-8">
            <h3 className="text-center font-black text-2xl text-slate-800 uppercase tracking-widest">Select a Challenge</h3>
            <div className="flex flex-col sm:flex-row flex-1 justify-center gap-8">
              <button 
                onClick={() => startChallenge('long-note')} 
                className="flex-1 max-w-sm bg-white border-4 border-sky-200 hover:border-sky-500 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 group transition-all shadow-xl hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="bg-sky-100 p-6 rounded-full group-hover:scale-110 transition-transform">
                  <Timer className="w-16 h-16 text-sky-500" />
                </div>
                <h3 className="text-3xl font-black text-sky-950 uppercase">Long Note</h3>
                <p className="text-center font-bold text-sky-700">Test your lung capacity! Hold a single note for as long as possible.</p>
              </button>

              <button 
                onClick={() => startChallenge('tonguing')}
                className="flex-1 max-w-sm bg-white border-4 border-emerald-200 hover:border-emerald-500 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 group transition-all shadow-xl hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="bg-emerald-100 p-6 rounded-full group-hover:scale-110 transition-transform">
                  <Mic className="w-16 h-16 text-emerald-500" />
                </div>
                <h3 className="text-3xl font-black text-emerald-950 uppercase">Tonguing</h3>
                <p className="text-center font-bold text-emerald-700">Articulate TA-TA-TA as fast and clean as you can in 10 seconds.</p>
              </button>
            </div>
          </div>
        )}

        {/* COUNTDOWN STATE */}
        {subModal === 'countdown' && (
          <div className="w-full flex flex-col items-center justify-center bg-slate-900">
            <motion.div 
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-white font-black text-9xl uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]"
            >
              {countdown}
            </motion.div>
            <p className="text-slate-400 font-bold text-xl mt-8">Take a deep breath...</p>
          </div>
        )}

        {/* LISTENING STATE */}
        {subModal === 'listening' && (
          <div className="w-full flex">
            {/* Left: Leaderboard during play */}
            <div className="w-1/3 bg-slate-100 border-r-2 border-slate-200 p-6 flex flex-col shadow-inner">
              <h4 className="font-black text-slate-800 uppercase tracking-widest text-center mb-6">Personal Bests</h4>
              <div className="flex flex-col gap-3">
                {(challengeType === 'long-note' ? personalBest : tonguingPB).length === 0 ? (
                  <p className="text-center text-slate-400 font-bold mt-4">No scores yet. Set the first record!</p>
                ) : (
                  (challengeType === 'long-note' ? personalBest : tonguingPB).map((entry, i) => (
                    <div key={entry.id} className={`p-4 rounded-xl flex justify-between items-center shadow-sm ${i === 0 ? 'bg-amber-100 border-2 border-amber-300' : 'bg-white border-2 border-transparent'}`}>
                      <span className="font-black text-slate-500">{i + 1}</span>
                      <span className="font-mono font-bold text-lg text-slate-800">{entry.score.toFixed(1)}{challengeType === 'long-note' ? 's' : ' hits'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Play Zone */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white relative">
              <div className="flex flex-col items-center gap-6 mb-12 relative w-full">
                {challengeType === 'long-note' ? (
                  <div className="text-8xl font-mono font-black text-slate-800 bg-slate-50 py-6 px-16 rounded-[3rem] border-4 border-slate-200 shadow-inner">
                    {timer.toFixed(1)}<span className="text-4xl text-slate-400">s</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center w-full">
                    <div className="text-8xl font-mono font-black text-emerald-800 bg-emerald-50 py-6 px-16 rounded-[3rem] border-4 border-emerald-200 shadow-inner">
                      {tonguingCount}<span className="text-4xl text-emerald-400 ml-2">hits</span>
                    </div>
                    <div className="mt-4 text-2xl font-bold text-slate-400">
                      Time Remaining: <span className="text-slate-600 font-black">{timer.toFixed(1)}s</span>
                    </div>
                  </div>
                )}
                {timer === (challengeType === 'long-note' ? 0 : 10.0) ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.8 }}
                    className="absolute -right-48 top-4 text-rose-500 font-black text-5xl italic pointer-events-none drop-shadow-md z-20 whitespace-nowrap"
                  >
                    Play a Note!
                  </motion.div>
                ) : (
                  ((challengeType === 'long-note' && timer < 1.5) || (challengeType === 'tonguing' && timer > 8.5)) && (
                    <motion.div 
                      initial={{ opacity: 1, x: -20, scale: 0.5 }} 
                      animate={{ opacity: 0, x: 40, scale: 1.5 }} 
                      transition={{ duration: 1.5 }}
                      className="absolute -right-32 top-0 text-rose-500 font-black text-7xl italic pointer-events-none drop-shadow-md z-20 whitespace-nowrap"
                    >
                      GO!
                    </motion.div>
                  )
                )}
              </div>
              
              <div className="relative">
                {/* Visualizer Ring */}
                <motion.div 
                  className="absolute inset-0 bg-rose-500 rounded-full opacity-20"
                  animate={{ scale: 1 + (volumeLevel / 100) }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
                />
                <div className="w-48 h-48 rounded-full border-8 shadow-2xl flex flex-col items-center justify-center bg-rose-500 border-rose-300 relative z-10">
                  <Volume2 className="w-20 h-20 text-white animate-pulse" />
                  <span className="text-white font-bold mt-2">Listening...</span>
                </div>
              </div>
              
              <div className="w-64 h-4 bg-slate-100 rounded-full mt-12 relative overflow-hidden border border-slate-200">
                <div 
                  className="h-full bg-rose-500 transition-all duration-75 relative z-0"
                  style={{ width: `${Math.min(100, (volumeLevel / 50) * 100)}%` }}
                />
              </div>
              <p className="mt-4 font-bold text-slate-400 uppercase tracking-widest text-sm">Volume Input</p>
              
              <button 
                onClick={() => finishChallenge(challengeType === 'long-note' ? timer : tonguingCountRef.current)}
                className="mt-8 px-8 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Stop Early
              </button>
            </div>
          </div>
        )}

        {/* RESULTS STATE */}
        {subModal === 'results' && (
          <div className="w-full flex">
            {/* Leaderboards */}
            <div className="w-1/2 bg-slate-100 border-r-2 border-slate-200 p-8 flex flex-col gap-8 shadow-inner overflow-y-auto">
              <div>
                <h4 className="font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Award className="text-amber-500" /> Personal Top 5
                </h4>
                <div className="flex flex-col gap-2">
                  {(challengeType === 'long-note' ? personalBest : tonguingPB).length === 0 ? (
                    <p className="text-center text-slate-400 font-bold p-4 bg-white rounded-lg border-2 border-dashed border-slate-300">No records yet.</p>
                  ) : (
                    (challengeType === 'long-note' ? personalBest : tonguingPB).map((entry, i) => (
                      <div key={entry.id} className={`p-3 rounded-lg flex justify-between items-center ${entry.score === (challengeType === 'long-note' ? timer : tonguingCount) ? 'bg-rose-100 border-2 border-rose-400 shadow-md transform scale-105 my-2 z-10' : 'bg-white'}`}>
                        <span className="font-bold text-slate-500 w-8">{i + 1}.</span>
                        <span className="font-bold text-slate-700 flex-1">{entry.name}</span>
                        <span className="font-mono font-black text-slate-800">{challengeType === 'long-note' ? entry.score.toFixed(1) + 's' : Math.floor(entry.score) + ' hits'}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Award className="text-sky-500" /> Global All-Time (All Instruments)
                </h4>
                <div className="flex flex-col gap-2">
                  {(challengeType === 'long-note' ? globalBest : tonguingGlobal).length === 0 ? (
                    <p className="text-center text-slate-400 font-bold p-4 bg-white rounded-lg border-2 border-dashed border-slate-300">Awaiting cloud connection...</p>
                  ) : (
                    (challengeType === 'long-note' ? globalBest : tonguingGlobal).map((entry, i) => (
                      <div key={entry.id} className={`p-3 rounded-lg flex justify-between items-center ${entry.score === (challengeType === 'long-note' ? timer : tonguingCount) ? 'bg-rose-100 border-2 border-rose-400 shadow-md transform scale-105 my-2 z-10' : 'bg-white'}`}>
                        <span className="font-bold text-slate-500 w-8">{i + 1}.</span>
                        <span className="font-bold text-slate-700 flex-1">{entry.name}</span>
                        <span className="font-mono font-black text-slate-800">{challengeType === 'long-note' ? entry.score.toFixed(1) + 's' : Math.floor(entry.score) + ' hits'}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Score Display */}
            <div className="w-1/2 flex flex-col items-center justify-center p-8 bg-slate-900 relative">
               <Award className="w-32 h-32 text-amber-400 mb-6 drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]" />
               <h3 className="text-4xl font-black text-white uppercase tracking-widest mb-4 text-center">
                 {challengeType === 'long-note' ? (
                   <>Breath<br/>Taking!</>
                 ) : (
                   <>Rapid<br/>Fire!</>
                 )}
               </h3>
               <div className="bg-slate-800 border-4 border-slate-700 rounded-3xl p-8 mb-12 flex flex-col items-center w-full max-w-xs">
                 <p className="text-slate-400 font-bold uppercase tracking-widest mb-2">
                   {challengeType === 'long-note' ? 'Final Time' : 'Total Hits'}
                 </p>
                 <span className="text-rose-400 font-mono font-black text-6xl drop-shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                   {challengeType === 'long-note' ? `${timer.toFixed(1)}s` : tonguingCount}
                 </span>
               </div>
               
               <div className="flex flex-col w-full max-w-sm gap-4">
                 <button onClick={() => startChallenge(challengeType)} className="w-full py-4 bg-rose-500 hover:bg-rose-400 text-white font-black uppercase rounded-2xl flex items-center justify-center gap-2 text-xl transition-colors shadow-lg">
                   <RotateCcw /> Try Again
                 </button>
                 <button onClick={() => setSubModal('hub')} className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-black uppercase rounded-2xl transition-colors">
                   Back to Hub
                 </button>
               </div>
            </div>
          </div>
        )}
      </div>
      </motion.div>
    </div>
  );
}
