import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mic, Play, Pause, Square, MessageCircle, Clock, Save, Send, ShieldCheck, Trophy, RotateCcw, AlertTriangle, Sparkles, Target, Star, Frown, CheckCircle, Crosshair, Scissors, Turtle, Repeat, Rewind, ZoomOut } from 'lucide-react';
import { APP_ASSETS } from '../config/assets';
import { SmartImage } from './ui/SmartImage';
import { VolumeVisualizer } from './ui/VolumeVisualizer';
import { AudioTrigger } from './ui/AudioTrigger';
import { NoteHelpOverlay } from './ui/NoteHelpOverlay';
import { NoteHelpButton } from './ui/NoteHelpButton';
import { addQuavits, addXP, addRareQuavits } from '../utils/economy';
import warmupsData from '../data/warmups.json';
import { saveAudio } from '../utils/audioStorage';
import AcousticChallenges from './AcousticChallenges';
import { supabase } from '../lib/supabaseClient';
interface PracticeGuideProps {
  onBack: () => void;
}

type Familiarity = 'new' | 'familiar' | 'mastered' | null;
type SessionStage = 'crossroads' | 'grounding' | 'execution' | 'tricky' | 'finale' | 'reflection' | 'complete';
type GoalType = 'fun' | 'tricky' | 'custom' | 'teacher_alert' | null;

const REFLECTION_TAGS: Record<string, string[]> = {
  "Flute": ["Tone Quality", "Air Support", "Rhythm", "Notes were great", "Got it all the way through", "Articulations"],
  "Clarinet": ["Tone Quality", "Air Support", "Rhythm", "Notes were great", "Got it all the way through", "Tonguing"],
  "Trumpet": ["Tone Quality", "Air Support", "Rhythm", "Notes were great", "Got it all the way through", "Tonguing"],
  "Violin": ["Tone Quality", "Intonation", "Rhythm", "Notes were great", "Got it all the way through", "Bowing"],
  "Piano": ["Dynamics", "Hand Posture", "Rhythm", "Notes were great", "Got it all the way through", "Pedaling"],
  "Default": ["Made a nice sound", "Rhythm", "Notes were great", "Got it all the way through", "Focused well"]
};

export default function PracticeGuide({ onBack }: PracticeGuideProps) {
  const [stage, setStage] = useState<SessionStage>('crossroads');
  
  // Settings
  const [targetDuration, setTargetDuration] = useState<number>(15);
  const [familiarity, setFamiliarity] = useState<Familiarity>(null);
  const [goalType, setGoalType] = useState<GoalType>(null);
  const [customGoal, setCustomGoal] = useState('');
  
  // Timer state
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [quavits, setQuavits] = useState(0);
  const [showNoteHelp, setShowNoteHelp] = useState(false);

  // Ask Aiden Modal
  const [showAiden, setShowAiden] = useState(false);
  const [aidenMessages, setAidenMessages] = useState<{role:'user'|'aiden', text:string}[]>([{role: 'aiden', text: 'Hi! Need practice tips? Just ask!'}]);
  const [aidenInput, setAidenInput] = useState('');

  // Tricky Powers
  const [usedPowers, setUsedPowers] = useState<string[]>([]);
  const [activePower, setActivePower] = useState<any>(null);
  const [powerStep, setPowerStep] = useState(0);

  // Warmups
  const [activeWarmup, setActiveWarmup] = useState<any>(null);
  const [warmupDone, setWarmupDone] = useState(false);
  const [showAcousticWarmup, setShowAcousticWarmup] = useState(false);
  const [acousticAttempts, setAcousticAttempts] = useState(0);
  const [bestAcousticScore, setBestAcousticScore] = useState(0);
  const [acousticType, setAcousticType] = useState<'long-note'|'tonguing'>('long-note');
  const [showAcousticResults, setShowAcousticResults] = useState(false);
  
  // Recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioId, setAudioId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // Reflection
  const [rating, setRating] = useState('');
  const [reflectionAnswer, setReflectionAnswer] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const currentInstrument = localStorage.getItem('current_instrument') || 'Default';
  const warmups = (warmupsData as any)[currentInstrument] || (warmupsData as any)['Default'];
  const instrumentTags = REFLECTION_TAGS[currentInstrument] || REFLECTION_TAGS['Default'];

  const [teacherAlerts, setTeacherAlerts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAlerts() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
        if (profile) {
          const { data: alerts } = await supabase.from('adventure_alerts').select('*').eq('student_id', profile.id).eq('status', 'active');
          if (alerts) setTeacherAlerts(alerts);
        }
      }
    }
    fetchAlerts();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const handleStartSession = () => {
    if (!familiarity || !goalType || (goalType === 'custom' && !customGoal)) return;
    setSecondsRemaining(targetDuration * 60);
    setTimerActive(true);
    setStage('grounding');
  };

  const finishActivePower = () => {
    if (activePower) {
      setUsedPowers([...usedPowers, activePower.id]);
      setQuavits(q => q + activePower.pts);
      setActivePower(null);
      setPowerStep(0);
    }
  };

  const finishActiveWarmup = () => {
    if (activeWarmup) {
      if (activeWarmup.id === 'posture') {
        if (!usedPowers.includes('warmup-posture')) setUsedPowers([...usedPowers, 'warmup-posture']);
        setQuavits(q => q + 5);
      } else if (activeWarmup.id === 'acoustic') {
        if (!usedPowers.includes('warmup-acoustic')) setUsedPowers([...usedPowers, 'warmup-acoustic']);
        const pointsEarned = acousticType === 'long-note' ? Math.floor(bestAcousticScore / 4) : Math.floor(bestAcousticScore / 10);
        setQuavits(q => q + pointsEarned);
      } else {
        if (!usedPowers.includes(`warmup-${activeWarmup.index}`)) setUsedPowers([...usedPowers, `warmup-${activeWarmup.index}`]);
        setQuavits(q => q + 10);
      }
      setActiveWarmup(null);
      setWarmupDone(false);
      setShowAcousticResults(false);
    }
  };

  const handleAcousticComplete = (score: number) => {
    setBestAcousticScore(score);
    setShowAcousticWarmup(false);
    
    if (acousticAttempts === 0) {
      setAcousticType('tonguing');
      setActiveWarmup({id: 'acoustic-intermediate', title: 'Great Job! 1/3 Complete', desc: `You got ${score} hits! Ready for Tonguing Challenge 2?`, time: 0});
      setShowAcousticResults(true);
    } else if (acousticAttempts === 1) {
      setAcousticType('long-note');
      setActiveWarmup({id: 'acoustic-intermediate', title: 'Awesome! 2/3 Complete', desc: `You got ${score} hits! Ready for the Long Note Challenge?`, time: 0});
      setShowAcousticResults(true);
    } else {
      setActiveWarmup({id: 'acoustic', title: 'All Challenges Complete!', desc: `You held it for ${score.toFixed(1)}s! Excellent work!`, time: 0});
      setWarmupDone(true);
      setShowAcousticResults(true);
    }
    setAcousticAttempts(a => a + 1);
  };

  const getAcousticIntroDesc = (type: 'long-note' | 'tonguing') => {
    let typeDesc = "";
    if (type === 'long-note') {
      if (['Violin', 'Cello', 'Viola', 'Double Bass'].includes(currentInstrument)) typeDesc = "Play a single, steady, long bow.";
      else if (currentInstrument === 'Voice') typeDesc = "Sing a single long note as steadily as possible.";
      else typeDesc = "Hold a single note for as long as possible.";
    } else {
      if (['Violin', 'Cello', 'Viola', 'Double Bass'].includes(currentInstrument)) typeDesc = "Play as many short, fast bows as you can in 10 seconds.";
      else if (currentInstrument === 'Voice') typeDesc = "Say the alphabet as fast as you can in 10 seconds.";
      else typeDesc = "Tongue as many short notes as you can in 10 seconds.";
    }
    return `${typeDesc} You get 2 chances and you receive points based on your longest Long Note or highest Tonguing hits.`;
  };

  const getPostureInstruction = () => {
    if (currentInstrument === 'Voice') return "Say a tongue twister to get started!";
    if (['Violin', 'Cello', 'Viola', 'Double Bass'].includes(currentInstrument)) return "Play 4 long beautiful bows!";
    if (['Piano', 'Guitar', 'Drums'].includes(currentInstrument)) return "Play a long, sustained single note or chord!";
    return "Take a big breath and play a long, beautiful sustained note!"; // Wind/Brass/Default
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        const newAudioId = `audio_${Date.now()}`;
        setAudioId(newAudioId);
        await saveAudio(newAudioId, audioBlob);
      };
      
      recorder.start();
      setIsRecording(true);
      
      // Limit recording to 1 minute
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 60000);
    } catch (err) {
      console.error("Microphone error", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setQuavits(q => q + 50);
      setStage('reflection');
    }
  };

  const saveLog = async () => {
    let finalReflection = selectedTags.join(', ');
    if (reflectionAnswer) {
      finalReflection = finalReflection ? `${finalReflection} - ${reflectionAnswer}` : reflectionAnswer;
    }

    const actualSeconds = (targetDuration * 60) - secondsRemaining;
    const actualMins = Math.floor(actualSeconds / 60);
    const actualSecs = actualSeconds % 60;
    const earnedXP = Math.max(0, Math.floor(actualSeconds / 2));
    
    addQuavits(quavits);
    addXP(earnedXP);
    // Award 1 Rare Quavit for completing a practice session!
    addRareQuavits(1);

    const log = {
      date: new Date().toISOString(),
      durationMins: targetDuration,
      actualDuration: `${actualMins}m ${actualSecs}s`,
      familiarity,
      goal: goalType === 'custom' ? customGoal : goalType,
      quavits,
      xp: earnedXP,
      rating,
      reflectionAnswer: finalReflection,
      audioId
    };
    const existingLogs = JSON.parse(localStorage.getItem('practice_logs') || '[]');
    localStorage.setItem('practice_logs', JSON.stringify([log, ...existingLogs]));
    setStage('complete');

    // Save to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
        if (profile) {
          await supabase.from('practice_logs').insert([
            {
              profile_id: profile.id,
              date: log.date,
              duration_mins: log.durationMins,
              actual_duration: log.actualDuration,
              familiarity: log.familiarity,
              goal: log.goal,
              quavits_earned: log.quavits,
              xp_earned: log.xp,
              rating: log.rating,
              reflection: log.reflectionAnswer,
              audio_id: log.audioId
            }
          ]);
        }
      }
    } catch (e) {
      console.error("Failed to save log to Supabase", e);
    }
  };

  const isGracePeriod = secondsRemaining < 0 && secondsRemaining >= -180;
  const isCutoff = secondsRemaining < -180;

  const displayMins = Math.floor(Math.abs(secondsRemaining) / 60);
  const displaySecs = Math.abs(secondsRemaining) % 60;
  
  return (
    <div className="absolute inset-0 z-50 bg-slate-50 overflow-hidden flex flex-col font-sans">
      {/* Header & Global Timer */}
      <div className="bg-slate-900 p-4 flex justify-between items-center text-white shadow-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-full transition-all flex items-center justify-center">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <NoteHelpButton onClick={() => setShowNoteHelp(true)} className="bg-slate-800 hover:bg-slate-700 border-slate-700 w-12 h-12" />
        </div>
        <div className="flex flex-col items-center">
          <div className={`text-4xl font-mono font-black tracking-widest flex items-center gap-2 ${isCutoff ? 'text-rose-500 animate-pulse' : (isGracePeriod ? 'text-amber-400' : 'text-white')}`}>
            {isCutoff ? '-' : ''}{displayMins.toString().padStart(2, '0')}:{displaySecs.toString().padStart(2, '0')}
            {isGracePeriod && <span className="text-sm bg-amber-500 text-slate-900 px-2 py-1 rounded-md ml-2 font-bold uppercase tracking-normal">Overtime</span>}
            {isCutoff && <span className="text-sm bg-rose-500 text-white px-2 py-1 rounded-md ml-2 font-bold uppercase tracking-normal">Finish Up!</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/30">
          <img src={APP_ASSETS.ui.quavits} alt="Quavits" className="w-5 h-5" />
          <span className="font-bold text-lg">{quavits}</span>
        </div>
      </div>

      <NoteHelpOverlay isOpen={showNoteHelp} onClose={() => setShowNoteHelp(false)} defaultView="hub" />

      <div className="flex-1 overflow-y-auto relative p-4 md:p-8 flex flex-col">


        <AnimatePresence mode="wait">
          {stage === 'crossroads' && (
            <motion.div key="crossroads" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto w-full pt-8">
              
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-6">
                <h3 className="font-bold text-slate-600 uppercase tracking-widest mb-4">Practice duration</h3>
                <div className="flex gap-4">
                  {[10, 15, 20].map(mins => (
                    <button key={mins} onClick={() => setTargetDuration(mins)} className={`flex-1 py-4 rounded-xl border-2 font-black text-xl transition-all ${targetDuration === mins ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-200 text-slate-500 hover:border-sky-300'}`}>{mins} min</button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-6">
                <h3 className="font-bold text-slate-600 uppercase tracking-widest mb-4">Choose a piece</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button onClick={() => setFamiliarity('new')} className={`p-6 rounded-2xl border-2 text-left transition-all ${familiarity === 'new' ? 'bg-emerald-50 border-emerald-500' : 'border-slate-200 hover:border-emerald-200'}`}>
                    <h4 className={`font-black text-xl mb-1 ${familiarity === 'new' ? 'text-emerald-700' : 'text-slate-700'}`}>Brand New</h4>
                    <p className="text-sm text-slate-500 font-medium">I'm just mapping it out today.</p>
                  </button>
                  <button onClick={() => setFamiliarity('familiar')} className={`p-6 rounded-2xl border-2 text-left transition-all ${familiarity === 'familiar' ? 'bg-amber-50 border-amber-500' : 'border-slate-200 hover:border-amber-200'}`}>
                    <h4 className={`font-black text-xl mb-1 ${familiarity === 'familiar' ? 'text-amber-700' : 'text-slate-700'}`}>Familiar</h4>
                    <p className="text-sm text-slate-500 font-medium">I've played it, but there are wobbles.</p>
                  </button>
                  <button onClick={() => setFamiliarity('mastered')} className={`p-6 rounded-2xl border-2 text-left transition-all ${familiarity === 'mastered' ? 'bg-purple-50 border-purple-500' : 'border-slate-200 hover:border-purple-200'}`}>
                    <h4 className={`font-black text-xl mb-1 ${familiarity === 'mastered' ? 'text-purple-700' : 'text-slate-700'}`}>Mastered</h4>
                    <p className="text-sm text-slate-500 font-medium">I've got it down. Let's stress-test.</p>
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8">
                <h3 className="font-bold text-slate-600 uppercase tracking-widest mb-4">Goal</h3>
                <div className="flex flex-col gap-3">
                  <button onClick={() => setGoalType('fun')} className={`p-4 rounded-xl border-2 text-left font-bold ${goalType === 'fun' ? 'border-sky-500 bg-sky-50' : 'border-slate-200'}`}>For fun</button>
                  <button onClick={() => setGoalType('tricky')} className={`p-4 rounded-xl border-2 text-left font-bold ${goalType === 'tricky' ? 'border-sky-500 bg-sky-50' : 'border-slate-200'}`}>Fix something tricky</button>
                  
                  {teacherAlerts.length > 0 && (
                    <div className="mt-2 mb-2 p-4 rounded-xl border-2 border-orange-300 bg-orange-50 flex flex-col gap-2">
                      <span className="text-xs font-black text-orange-600 uppercase">From Your Teacher</span>
                      {teacherAlerts.map(alert => (
                        <button 
                          key={alert.id}
                          onClick={() => {
                            setGoalType('teacher_alert');
                            setCustomGoal(alert.description);
                          }} 
                          className={`p-3 rounded-lg border-2 text-left font-bold ${goalType === 'teacher_alert' && customGoal === alert.description ? 'border-orange-500 bg-orange-200 text-orange-900' : 'border-orange-200 bg-white text-orange-800'}`}
                        >
                          {alert.title}: {alert.description}
                        </button>
                      ))}
                    </div>
                  )}

                  <button onClick={() => setGoalType('custom')} className={`p-4 rounded-xl border-2 text-left font-bold flex flex-col ${goalType === 'custom' ? 'border-sky-500 bg-sky-50' : 'border-slate-200'}`}>
                    Custom goal...
                    {goalType === 'custom' && (
                      <input type="text" placeholder="e.g. Play bars 4-8 perfectly 3 times..." value={customGoal} onChange={e => setCustomGoal(e.target.value)} onClick={e => e.stopPropagation()} className="mt-2 p-3 w-full bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium" />
                    )}
                  </button>
                </div>
              </div>

              <button onClick={handleStartSession} className="w-full py-5 bg-sky-500 hover:bg-sky-400 text-white font-black text-xl uppercase rounded-2xl shadow-[0_6px_0_#0284c7] active:shadow-[0_0px_0_#0284c7] active:translate-y-1.5 transition-all mb-12">
                Start Flow Practice
              </button>
            </motion.div>
          )}

          {stage === 'grounding' && (
            <motion.div key="grounding" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="max-w-3xl mx-auto w-full">
              <h2 className="text-3xl font-black text-slate-800 uppercase mb-8">Grounding</h2>
              
              <div className="grid gap-6 mb-8">
                {/* 1. Posture & Breathing */}
                <button 
                  onClick={() => !usedPowers.includes('warmup-posture') && setActiveWarmup({ id: 'posture', title: 'Dusting Off The Cobwebs', desc: getPostureInstruction() })}
                  className={`p-6 rounded-3xl border-4 text-left transition-all flex items-center justify-between ${
                    usedPowers.includes('warmup-posture') ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md cursor-pointer'
                  }`}
                >
                  <div>
                    <h3 className="font-black text-xl text-slate-800 uppercase flex items-center gap-2">
                      {usedPowers.includes('warmup-posture') ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <Play className="w-6 h-6 text-sky-500" />}
                      Dusting Off The Cobwebs
                    </h3>
                    <p className="text-slate-500 font-medium">Sit up straight, take a big breath, and make a beautiful long sound!</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-100 px-3 py-1 rounded-full uppercase ml-4 whitespace-nowrap">+5 Quavits</span>
                </button>

                {/* 2. Acoustic Challenge */}
                <button 
                  onClick={() => {
                    if (!usedPowers.includes('warmup-acoustic')) {
                      setAcousticType('tonguing');
                      setAcousticAttempts(0);
                      setBestAcousticScore(0);
                      setActiveWarmup({ 
                        id: 'acoustic-intro', 
                        title: 'Acoustic Challenge 1/3: Tonguing', 
                        desc: getAcousticIntroDesc('tonguing'),
                        time: 0
                      });
                    }
                  }}
                  className={`p-6 rounded-3xl border-4 text-left transition-all flex items-center justify-between ${
                    usedPowers.includes('warmup-acoustic') ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md cursor-pointer'
                  }`}
                >
                  <div>
                    <h3 className="font-black text-xl text-slate-800 uppercase flex items-center gap-2">
                      {usedPowers.includes('warmup-acoustic') ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <Play className="w-6 h-6 text-sky-500" />}
                      Acoustic Challenge
                    </h3>
                    <p className="text-slate-500 font-medium">Complete a randomized Long Note or Tonguing Challenge for extra points.</p>
                  </div>
                  <span className="text-xs font-bold text-sky-500 bg-sky-100 px-3 py-1 rounded-full uppercase ml-4 whitespace-nowrap">Play</span>
                </button>

                {/* 3. Scale Sand Dunes (Coming Soon) */}
                <button 
                  disabled
                  className="p-6 rounded-3xl border-4 text-left transition-all flex items-center justify-between bg-slate-50 border-slate-200 opacity-60"
                >
                  <div>
                    <h3 className="font-black text-xl text-slate-400 uppercase flex items-center gap-2">
                      Scale Sand Dunes
                    </h3>
                    <p className="text-slate-400 font-medium">Coming soon: Master your scales in the desert.</p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-200 px-3 py-1 rounded-full uppercase ml-4 whitespace-nowrap">Locked</span>
                </button>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={() => setStage('execution')} 
                  disabled={!usedPowers.includes('warmup-posture') || !usedPowers.includes('warmup-acoustic')}
                  className="px-10 py-5 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-300 disabled:shadow-none text-white font-black text-xl uppercase rounded-2xl shadow-[0_6px_0_#0284c7] transition-all"
                >
                  Continue to Piece
                </button>
              </div>
            </motion.div>
          )}

          {stage === 'execution' && (
            <motion.div key="execution" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="max-w-3xl mx-auto w-full">
              <h2 className="text-3xl font-black text-slate-800 uppercase mb-4">Adventure Path: {familiarity}</h2>
              
              <div className="bg-white p-8 rounded-3xl border-4 border-sky-200 shadow-sm mb-8">
                {familiarity === 'new' && <p className="text-xl font-bold text-slate-700"><strong>Objective:</strong> Map the piece with a slow play-through to identify 2-3 uncertain spots without fixing them yet.</p>}
                {familiarity === 'familiar' && <p className="text-xl font-bold text-slate-700"><strong>Objective:</strong> Perform a full run-through at performance tempo to diagnose wobbles and mark known tricky sections.</p>}
                {familiarity === 'mastered' && <p className="text-xl font-bold text-slate-700"><strong>Objective:</strong> Execute a full performance run from start to finish with no stopping or mid-take fixing.</p>}
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-12 my-12">
                 <button className="px-8 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 border-4 border-slate-300 text-slate-700 font-black uppercase text-lg shadow-md transition-all flex flex-col items-center gap-2">
                   <Play className="w-8 h-8 text-sky-500" />
                   Listen to Teacher
                 </button>
                 
                 <button onClick={() => {
                     setQuavits(q => q + (familiarity === 'mastered' ? 30 : 20));
                     setStage(familiarity === 'mastered' ? 'finale' : 'tricky');
                 }} className="w-48 h-48 rounded-full bg-emerald-500 hover:bg-emerald-400 border-8 border-emerald-300 text-white flex flex-col items-center justify-center shadow-2xl active:scale-95 transition-all">
                    <CheckCircle className="w-16 h-16 mb-2" />
                    <span className="font-black uppercase text-xl text-center">Run<br/>Complete</span>
                 </button>
              </div>

              <div className="mb-8 flex justify-center">
                <VolumeVisualizer />
              </div>
            </motion.div>
          )}

          {stage === 'tricky' && (
            <motion.div key="tricky" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 max-w-5xl mx-auto w-full relative z-10">
            
            <div className="w-full flex justify-center items-end mb-8 border-b-4 border-amber-200 pb-4">
              <div className="text-center">
                <h2 className="text-4xl font-black text-slate-800 uppercase tracking-widest mb-2 flex items-center justify-center gap-3">
                  <AlertTriangle className="w-10 h-10 text-amber-500" /> Tricky Stage
                </h2>
                <p className="text-xl text-slate-500 font-bold max-w-xl">Use these powers to conquer the hardest parts of your piece. Earn Quavits for each power used!</p>
              </div>
            </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                {[
                  { id: 'vocalise', name: 'Vocalise', pts: 5, icon: MessageCircle },
                  { id: 'isolate', name: 'Isolate', pts: 5, icon: Crosshair },
                  { id: 'surgery', name: 'Surgery', pts: 5, icon: Scissors },
                  { id: 'super-loop', name: 'Super Loop x5', pts: 15, icon: Repeat },
                  { id: 'loop', name: 'Loop 3x', pts: 15, icon: Repeat },
                  { id: 'rewind', name: 'Rewind', pts: 20, icon: Rewind },
                  { id: 'mental-practice', name: 'Mental Practice', pts: 10, icon: Sparkles }
                ].map(power => {
                  const Icon = power.icon;
                  return (
                    <button 
                      key={power.id} 
                      onClick={() => !usedPowers.includes(power.id) && setActivePower(power)}
                      className={`relative p-6 rounded-3xl border-4 flex flex-col items-center justify-center transition-all ${
                        usedPowers.includes(power.id) ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-amber-200 hover:border-amber-400 shadow-lg hover:-translate-y-1'
                      }`}
                    >
                      <Icon className={`w-16 h-16 mb-4 ${usedPowers.includes(power.id) ? 'text-emerald-500' : 'text-amber-500'}`} />
                      <h3 className="font-black text-slate-800 text-xl uppercase mb-2">{power.name}</h3>
                      <span className="bg-amber-100 text-amber-700 font-black px-3 py-1 rounded-full text-sm">+{power.pts}</span>
                      {usedPowers.includes(power.id) && <CheckCircle className="absolute top-4 right-4 w-8 h-8 text-emerald-500" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <button onClick={() => setStage('finale')} className="px-10 py-5 bg-sky-500 hover:bg-sky-400 text-white font-black text-xl uppercase rounded-2xl shadow-[0_6px_0_#0284c7] transition-all">Go to Finale</button>
              </div>
            </motion.div>
          )}

          {stage === 'finale' && (
            <motion.div key="finale" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="max-w-3xl mx-auto w-full text-center">
              <h2 className="text-3xl font-black text-slate-800 uppercase mb-4">The Finale</h2>
              <p className="text-lg text-slate-600 font-bold mb-12">Time for the final run! Hit record and give it your best shot.</p>
              
              <div className="flex justify-center mb-12">
                <button onClick={isRecording ? stopRecording : startRecording} className={`w-48 h-48 rounded-full border-8 flex flex-col items-center justify-center shadow-2xl transition-all ${isRecording ? 'bg-red-500 border-red-300 animate-pulse' : 'bg-emerald-500 border-emerald-300 hover:bg-emerald-400'}`}>
                  {isRecording ? (
                    <>
                      <Square className="w-16 h-16 text-white mb-2" fill="currentColor" />
                      <span className="text-white font-black uppercase text-xl">Stop</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-16 h-16 text-white mb-2" />
                      <span className="text-white font-black uppercase text-xl">Record</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {stage === 'reflection' && (
            <motion.div key="reflection" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="max-w-3xl mx-auto w-full">
              <h2 className="text-3xl font-black text-slate-800 uppercase mb-8">Self Reflection</h2>
              
              {audioUrl && (
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8 w-full">
                  <h3 className="font-bold text-slate-600 uppercase tracking-widest mb-4">Your Final Take</h3>
                  <audio src={audioUrl} controls className="w-full" />
                </div>
              )}

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-6">
                <h3 className="font-bold text-slate-600 uppercase tracking-widest mb-4">Rate today's practice:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { val: '🌟 Great session', icon: '🌟' },
                    { val: '👍 Solid, steady progress', icon: '👍' },
                    { val: '😐 Okay, a bit off today', icon: '😐' },
                    { val: '🔄 Tough session, but I showed up', icon: '🔄' }
                  ].map(r => (
                    <button key={r.val} onClick={() => setRating(r.val)} className={`p-4 rounded-xl border-2 text-left font-bold ${rating === r.val ? 'border-sky-500 bg-sky-50' : 'border-slate-200'}`}>{r.val}</button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8">
                <h3 className="font-bold text-slate-600 uppercase tracking-widest mb-4">What did I do well?</h3>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {instrumentTags.map(tag => (
                    <button 
                      key={tag}
                      onClick={() => {
                        if (selectedTags.includes(tag)) setSelectedTags(selectedTags.filter(t => t !== tag));
                        else setSelectedTags([...selectedTags, tag]);
                      }}
                      className={`px-4 py-2 rounded-full border-2 font-bold transition-all ${
                        selectedTags.includes(tag) ? 'bg-sky-500 border-sky-500 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-sky-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <textarea 
                  value={reflectionAnswer} 
                  onChange={e => setReflectionAnswer(e.target.value)} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium min-h-[100px]"
                  placeholder="Type anything else here..."
                />
              </div>

              <div className="flex justify-end">
                <button onClick={saveLog} disabled={!rating || (selectedTags.length === 0 && !reflectionAnswer)} className="px-10 py-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-300 text-white font-black text-xl uppercase rounded-2xl shadow-[0_6px_0_#10b981] transition-all">Complete Session (+10 Pts)</button>
              </div>
            </motion.div>
          )}

          {stage === 'complete' && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto w-full text-center py-20">
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-9xl mb-6 flex justify-center"><CheckCircle className="w-32 h-32 text-emerald-500" /></motion.div>
              <h2 className="text-5xl font-black text-slate-800 uppercase tracking-widest mb-4">Session Logged!</h2>
              <p className="text-2xl text-slate-600 font-bold mb-12">You've successfully completed your Flow Practice and earned {quavits} Quavits.</p>
              <button onClick={onBack} className="px-10 py-5 bg-sky-500 hover:bg-sky-400 text-white font-black text-xl uppercase rounded-2xl shadow-[0_6px_0_#0284c7] transition-all">Back to Concert Hall</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ACTIVE WARMUP MODAL */}
      <AnimatePresence>
        {activeWarmup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-slate-900/80 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[3rem] p-8 max-w-xl w-full flex flex-col items-center text-center shadow-2xl">
               <ShieldCheck className="w-24 h-24 text-sky-500 mb-6" />
               <h2 className="text-4xl font-black text-slate-800 uppercase mb-4">{activeWarmup.title}</h2>
               <p className="text-xl text-slate-600 font-bold mb-8">{activeWarmup.desc}</p>
               
               {activeWarmup.id === 'acoustic' && showAcousticResults ? (
                 <div className="w-full flex justify-center mb-8">
                   <p className="text-2xl font-black text-emerald-500 mb-4 uppercase">
                     {acousticType === 'long-note' ? `Time: ${bestAcousticScore.toFixed(1)}s` : `Hits: ${bestAcousticScore}`}
                   </p>
                 </div>
               ) : null}

               <div className="w-full flex justify-center mb-8 gap-4">
                 {activeWarmup.id === 'acoustic-intro' || activeWarmup.id === 'acoustic-intermediate' ? (
                   <button 
                     onClick={() => {
                       setActiveWarmup(null);
                       setShowAcousticWarmup(true);
                     }}
                     className="px-8 py-4 rounded-2xl border-4 bg-emerald-500 border-emerald-400 text-white transition-all font-black uppercase tracking-widest hover:bg-emerald-400 shadow-[0_6px_0_#34d399] active:shadow-none active:translate-y-1.5"
                   >
                     {activeWarmup.id === 'acoustic-intro' ? 'Start Challenge' : 'Next Challenge'}
                   </button>
                 ) : (
                   <button 
                     onClick={() => setWarmupDone(true)}
                     className={`px-8 py-4 rounded-2xl border-4 transition-all ${warmupDone ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-100 border-slate-300 text-slate-400 hover:bg-slate-200'}`}
                   >
                     <span className="font-black uppercase tracking-widest">{warmupDone ? 'Task Complete!' : 'Tap to Complete'}</span>
                   </button>
                 )}
               </div>

               <div className="flex gap-4 w-full">
                 <button onClick={() => {setActiveWarmup(null); setWarmupDone(false); setShowAcousticResults(false);}} className="flex-1 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black uppercase rounded-2xl">Cancel</button>
                 
                 {activeWarmup.id !== 'acoustic-intro' && activeWarmup.id !== 'acoustic-intermediate' && (
                   <button 
                     onClick={finishActiveWarmup} 
                     disabled={!warmupDone} 
                     className={`flex-1 py-4 text-white font-black uppercase rounded-2xl transition-all duration-500 ${
                       warmupDone ? 'bg-sky-500 hover:bg-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.8)] animate-pulse' : 'bg-slate-300'
                     }`}
                   >
                     {activeWarmup.id === 'acoustic' ? 'Collect Quavits' : 'Collect +5 Quavits'}
                   </button>
                 )}
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACOUSTIC CHALLENGE WARMUP FULLSCREEN */}
      <AnimatePresence>
        {showAcousticWarmup && (
          <motion.div initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }} className="fixed inset-0 z-[70] bg-slate-100 flex items-center justify-center">
            <AcousticChallenges 
              onBack={() => setShowAcousticWarmup(false)}
              warmupMode={true}
              forcedType={acousticType}
              onWarmupComplete={handleAcousticComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTIVE POWER MODAL */}
      <AnimatePresence>
        {activePower && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-slate-900/80 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[3rem] p-8 max-w-xl w-full flex flex-col items-center text-center shadow-2xl">
               <activePower.icon className="w-24 h-24 text-amber-500 mb-6" />
               <h2 className="text-4xl font-black text-slate-800 uppercase mb-4">{activePower.name}</h2>
               
               {activePower.id === 'isolate' && <p className="text-xl text-slate-600 font-bold mb-8">Find the exact beat where the mistake happens. Don't play the whole phrase, just find the note!</p>}
               {activePower.id === 'shrink' && <p className="text-xl text-slate-600 font-bold mb-8">Practice only 2-4 notes around the specific problem.</p>}
               {activePower.id === 'slow' && <p className="text-xl text-slate-600 font-bold mb-8">Drop the tempo until it feels entirely easy.</p>}
               {activePower.id === 'loop' && <p className="text-xl text-slate-600 font-bold mb-8">Repeat the chunk 3 times in a row without stopping.</p>}
               {activePower.id === 'super-loop' && <p className="text-xl text-slate-600 font-bold mb-8">Play exactly 1 bar 5 times in a row without stopping.</p>}
               {activePower.id === 'rewind' && <p className="text-xl text-slate-600 font-bold mb-8">Play the difficult section backwards to test memory.</p>}
               {activePower.id === 'zoom' && <p className="text-xl text-slate-600 font-bold mb-8">Reconnect the chunk and gradually speed up.</p>}
               {activePower.id === 'vocalise' && <p className="text-xl text-slate-600 font-bold mb-8">Put your instrument down and sing the melody out loud with confidence.</p>}
               {activePower.id === 'surgery' && <p className="text-xl text-slate-600 font-bold mb-8">Find the two hardest adjacent notes (the interval) and play them back and forth until you master them.</p>}
               {activePower.id === 'mental-practice' && <p className="text-xl text-slate-600 font-bold mb-8">Close your eyes and perfectly visualize playing the passage in your head.</p>}

               {powerStep === 0 && (
                 <div className="mb-8 w-full">
                   <AudioTrigger onTrigger={() => setPowerStep(1)} label={`Listening for your playing to begin...`} />
                 </div>
               )}

               {activePower.id === 'loop' || activePower.id === 'super-loop' ? (
                 <div className="flex gap-4 mb-8">
                   {[1, 2, 3, ...(activePower.id === 'super-loop' ? [4, 5] : [])].map(step => (
                     <button key={step} disabled={powerStep < 1} onClick={() => setPowerStep(step)} className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${powerStep >= step ? 'bg-amber-400 border-amber-500 text-white shadow-[0_0_15px_rgba(251,191,36,0.6)]' : 'bg-slate-100 border-slate-200 text-slate-300'} ${powerStep >= 1 && powerStep < step ? 'cursor-pointer hover:bg-slate-200' : ''}`}>
                       <Star className="w-8 h-8" fill={powerStep >= step ? 'currentColor' : 'none'} />
                     </button>
                   ))}
                 </div>
               ) : (
                 <div className="w-full flex justify-center mb-8">
                   <button 
                     disabled={powerStep === 0}
                     onClick={() => {}}
                     className={`px-8 py-4 rounded-2xl border-4 transition-all ${powerStep >= 1 ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-100 border-slate-300 text-slate-400'}`}
                   >
                     <span className="font-black uppercase tracking-widest">{powerStep >= 1 ? 'Task Complete!' : 'Waiting for Audio...'}</span>
                   </button>
                 </div>
               )}

               <div className="flex gap-4 w-full">
                 <button onClick={() => {setActivePower(null); setPowerStep(0);}} className="flex-1 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black uppercase rounded-2xl">Cancel</button>
                 <button 
                   onClick={finishActivePower} 
                   disabled={activePower.id === 'loop' ? powerStep < 3 : (activePower.id === 'super-loop' ? powerStep < 5 : powerStep < 1)} 
                   className={`flex-1 py-4 text-white font-black uppercase rounded-2xl flex items-center justify-center gap-2 transition-all duration-500 ${
                     ((activePower.id === 'loop' ? powerStep >= 3 : (activePower.id === 'super-loop' ? powerStep >= 5 : powerStep >= 1))) ? 'bg-amber-500 hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.8)] animate-pulse' : 'bg-slate-300'
                   }`}
                 >
                   Collect +{activePower.pts} <img src={APP_ASSETS.ui.quavits} alt="Q" className="w-6 h-6 inline-block" />
                 </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stuck? Ask Aiden Floating Button */}
      {stage !== 'complete' && stage !== 'crossroads' && (
        <button 
          onClick={() => setShowAiden(true)}
          className="fixed bottom-8 right-8 bg-amber-500 hover:bg-amber-400 text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-all flex items-center gap-3 border-4 border-amber-300 z-50 group"
        >
          <SmartImage src={APP_ASSETS.sprites.alienUfo} alt="Aiden" className="w-12 h-12" />
          <div className="hidden group-hover:block pr-2">
            <span className="font-black uppercase tracking-wider block leading-tight">Stuck?</span>
            <span className="text-amber-100 text-sm font-bold">Ask Aiden</span>
          </div>
        </button>
      )}

      {/* Ask Aiden Modal */}
      <AnimatePresence>
        {showAiden && (
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="fixed bottom-24 right-8 w-96 bg-white rounded-3xl shadow-2xl border-4 border-amber-300 z-50 flex flex-col overflow-hidden max-h-[600px] h-[80vh]">
            <div className="bg-amber-500 p-4 flex justify-between items-center text-white">
              <h3 className="font-black uppercase tracking-widest flex items-center gap-2"><SmartImage src={APP_ASSETS.sprites.alienUfo} alt="Aiden" className="w-6 h-6" /> Chat with Aiden</h3>
              <button onClick={() => setShowAiden(false)} className="hover:bg-amber-600 p-1 rounded-lg"><ArrowLeft className="w-5 h-5 -rotate-90" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50">
              {aidenMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'aiden' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl font-medium ${msg.role === 'aiden' ? 'bg-white border-2 border-slate-200 text-slate-700 rounded-tl-none' : 'bg-sky-500 text-white rounded-tr-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t-2 border-slate-100 flex gap-2">
              <input 
                type="text" 
                value={aidenInput}
                onChange={e => setAidenInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && aidenInput) {
                    setAidenMessages([...aidenMessages, {role: 'user', text: aidenInput}, {role: 'aiden', text: "That's a great question! Make sure to isolate the section and practice it slowly."}]);
                    setAidenInput('');
                  }
                }}
                className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                placeholder="Ask me for a practice tip..."
              />
              <button 
                onClick={() => {
                  if (aidenInput) {
                    setAidenMessages([...aidenMessages, {role: 'user', text: aidenInput}, {role: 'aiden', text: "That's a great question! Make sure to isolate the section and practice it slowly."}]);
                    setAidenInput('');
                  }
                }}
                className="bg-amber-500 text-white p-2 rounded-xl hover:bg-amber-400"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
