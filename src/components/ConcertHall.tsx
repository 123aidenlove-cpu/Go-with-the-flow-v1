import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Settings, HelpCircle, Mic, Play, Library, Compass, X, Volume2, Award, Check } from 'lucide-react';

interface ConcertHallProps {
  onBack: () => void;
  onNavigateToGame: (game: 'pizzeria' | 'rocket-reading' | 'rhythm-rapids' | 'finger-fishing' | 'sight-read-soaring') => void;
}

export default function ConcertHall({ onBack, onNavigateToGame }: ConcertHallProps) {
  // Modal states
  const [activeModal, setActiveModal] = useState<'none' | 'quiz' | 'settings' | 'recording' | 'repertoire' | 'explore' | 'practice'>('none');
  
  // Quiz states
  const [quizScore, setQuizScore] = useState(0);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(null);

  // Settings states
  const [audioVolume, setAudioVolume] = useState(80);
  const [sfxOn, setSfxOn] = useState(true);
  const [instrument, setInstrument] = useState<'clarinet' | 'recorder' | 'flute'>('clarinet');

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSuccessfully, setRecordedSuccessfully] = useState(false);

  // Practice screen states
  const [activePracticeNote, setActivePracticeNote] = useState<string | null>(null);

  const quizQuestions = [
    {
      staveImage: 'E', // bottom line
      question: 'Which note rests on the very bottom line of the Treble Stave?',
      options: ['D', 'E', 'F', 'G'],
      correct: 'E'
    },
    {
      staveImage: 'G', // second line
      question: 'Which note sits on the second line from the bottom?',
      options: ['E', 'F', 'G', 'A'],
      correct: 'G'
    },
    {
      staveImage: 'D', // hanging below
      question: 'Which note hangs perfectly just below the bottom line of the stave?',
      options: ['C', 'D', 'E', 'F'],
      correct: 'D'
    }
  ];

  const songs = [
    { title: 'Hot Cross Buns', difficulty: 'Easy', stars: 3, unlocked: true },
    { title: 'Ode to Joy', difficulty: 'Easy', stars: 2, unlocked: true },
    { title: 'Minuet in G', difficulty: 'Medium', stars: 1, unlocked: true },
    { title: 'Clarinet Duet', difficulty: 'Medium', stars: 0, unlocked: false },
    { title: 'Sonatina in F', difficulty: 'Hard', stars: 0, unlocked: false }
  ];

  const handleQuizAnswer = (option: string) => {
    setSelectedQuizAnswer(option);
    const isCorrect = option === quizQuestions[quizQuestionIndex].correct;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
    
    setTimeout(() => {
      if (quizQuestionIndex + 1 < quizQuestions.length) {
        setQuizQuestionIndex(prev => prev + 1);
        setSelectedQuizAnswer(null);
      } else {
        setQuizFinished(true);
      }
    }, 1000);
  };

  const handleStartRecord = () => {
    setIsRecording(true);
    setRecordedSuccessfully(false);
    setTimeout(() => {
      setIsRecording(false);
      setRecordedSuccessfully(true);
    }, 3000); // 3 seconds mock recording
  };

  const playSynthNote = (note: string) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      const freqs: Record<string, number> = {
        'C': 261.63, 'D': 293.66, 'E': 329.63, 'F': 349.23, 'G': 392.00, 'A': 440.00, 'B': 493.88
      };
      
      osc.type = 'sine';
      osc.frequency.value = freqs[note] || 440;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn("Audio Context error", e);
    }
  };

  return (
    <div className="min-h-screen bg-amber-950 p-6 flex flex-col justify-between overflow-hidden relative" id="concert-hall-arena">
      {/* Opulent theater curtains frame design background */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-between">
        {/* Left red curtain */}
        <div className="w-20 sm:w-32 h-full bg-gradient-to-r from-red-900 to-red-600 border-r-4 border-amber-500 shadow-2xl relative">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.15)_50%,transparent_50%)] bg-[size:10px_100%]" />
        </div>
        {/* Right red curtain */}
        <div className="w-20 sm:w-32 h-full bg-gradient-to-l from-red-900 to-red-600 border-l-4 border-amber-500 shadow-2xl relative">
          <div className="absolute inset-0 bg-[linear-gradient(-90deg,rgba(0,0,0,0.15)_50%,transparent_50%)] bg-[size:10px_100%]" />
        </div>
        {/* Top curtain valence */}
        <div className="absolute top-0 inset-x-0 h-16 sm:h-24 bg-gradient-to-b from-red-900 to-red-600 border-b-4 border-amber-500 shadow-xl">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_50%,transparent_50%)] bg-[size:100%_8px]" />
          <div className="absolute bottom-2 inset-x-0 text-center font-sans font-black text-white tracking-widest text-lg sm:text-2xl uppercase text-amber-300 drop-shadow-md">
            ✨ Concert Hall Directory ✨
          </div>
        </div>
      </div>

      {/* Top HUD Back button */}
      <div className="relative z-10 flex items-center justify-between mt-16 sm:mt-24 px-4">
        <button
          id="hall-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 font-sans font-semibold text-amber-950 transition-all rounded-xl bg-white/95 hover:bg-white active:scale-95 shadow-md border-2 border-amber-400"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Map
        </button>
        <div className="w-10" />
      </div>

      {/* Center 6 Floating white pill-shaped Buttons */}
      <div className="relative z-10 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 w-full p-4 my-auto" id="directory-grid">
        
        {/* 1. What Note is This? */}
        <motion.button
          id="btn-what-note"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            setQuizQuestionIndex(0);
            setQuizScore(0);
            setQuizFinished(false);
            setSelectedQuizAnswer(null);
            setActiveModal('quiz');
          }}
          className="bg-white border-4 border-neutral-200 rounded-3xl p-5 flex items-center justify-between text-left shadow-xl hover:border-amber-400 transition-all hover:shadow-2xl"
        >
          <div className="space-y-1">
            <h3 className="font-sans font-black text-amber-950 text-xl">What Note is This?</h3>
            <p className="text-xs text-neutral-500 max-w-xs font-medium">Quick theory quizzes & flashcards to keep note-reading super sharp.</p>
          </div>
          <div className="w-16 h-16 border-2 border-neutral-100 bg-amber-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
            ❓🎼
          </div>
        </motion.button>

        {/* 2. Settings */}
        <motion.button
          id="btn-settings"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveModal('settings')}
          className="bg-white border-4 border-neutral-200 rounded-3xl p-5 flex items-center justify-between text-left shadow-xl hover:border-amber-400 transition-all hover:shadow-2xl"
        >
          <div className="space-y-1">
            <h3 className="font-sans font-black text-amber-950 text-xl">Settings</h3>
            <p className="text-xs text-neutral-500 max-w-xs font-medium">Configure sound volume, instrument options, and helpful game assists.</p>
          </div>
          <div className="w-16 h-16 border-2 border-neutral-100 bg-amber-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
            ⚙️🔑
          </div>
        </motion.button>

        {/* 3. Submit a Recording */}
        <motion.button
          id="btn-recording"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveModal('recording')}
          className="bg-white border-4 border-neutral-200 rounded-3xl p-5 flex items-center justify-between text-left shadow-xl hover:border-amber-400 transition-all hover:shadow-2xl"
        >
          <div className="space-y-1">
            <h3 className="font-sans font-black text-amber-950 text-xl">Submit a Recording</h3>
            <p className="text-xs text-neutral-500 max-w-xs font-medium">Record yourself playing real melodies and submit for a performance review!</p>
          </div>
          <div className="w-16 h-16 border-2 border-neutral-100 bg-amber-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
            🎙️📜
          </div>
        </motion.button>

        {/* 4. Go with the Flow Practice */}
        <motion.button
          id="btn-practice"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveModal('practice')}
          className="bg-white border-4 border-neutral-200 rounded-3xl p-5 flex items-center justify-between text-left shadow-xl hover:border-amber-400 transition-all hover:shadow-2xl"
        >
          <div className="space-y-1">
            <h3 className="font-sans font-black text-amber-950 text-xl">Go with the Flow Practice</h3>
            <p className="text-xs text-neutral-500 max-w-xs font-medium">Seamless continuous note practice without levels or interruptions.</p>
          </div>
          <div className="w-16 h-16 border-2 border-neutral-100 bg-amber-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
            🌊🎼
          </div>
        </motion.button>

        {/* 5. Repertoire List */}
        <motion.button
          id="btn-repertoire"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveModal('repertoire')}
          className="bg-white border-4 border-neutral-200 rounded-3xl p-5 flex items-center justify-between text-left shadow-xl hover:border-amber-400 transition-all hover:shadow-2xl"
        >
          <div className="space-y-1">
            <h3 className="font-sans font-black text-amber-950 text-xl">Repertoire List</h3>
            <p className="text-xs text-neutral-500 max-w-xs font-medium">Open the library of songs you've completed and view stars achieved.</p>
          </div>
          <div className="w-16 h-16 border-2 border-neutral-100 bg-amber-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
            📚🎼
          </div>
        </motion.button>

        {/* 6. Explore Repertoire */}
        <motion.button
          id="btn-explore"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveModal('explore')}
          className="bg-white border-4 border-neutral-200 rounded-3xl p-5 flex items-center justify-between text-left shadow-xl hover:border-amber-400 transition-all hover:shadow-2xl"
        >
          <div className="space-y-1">
            <h3 className="font-sans font-black text-amber-950 text-xl">Explore Repertoire</h3>
            <p className="text-xs text-neutral-500 max-w-xs font-medium">Discovery zone to find new tracks sorted by genre or instrument difficulty.</p>
          </div>
          <div className="w-16 h-16 border-2 border-neutral-100 bg-amber-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
            🧭🎶
          </div>
        </motion.button>

      </div>

      <div className="h-6" /> {/* Spacer bottom */}

      {/* Custom Dialog / Overlays Container */}
      <AnimatePresence>
        {activeModal !== 'none' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" id="concert-modal-wrapper">
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white border-4 border-amber-400 rounded-3xl shadow-2xl overflow-hidden p-6"
              id="concert-modal"
            >
              {/* Close Button */}
              <button
                id="modal-close-btn"
                onClick={() => setActiveModal('none')}
                className="absolute right-4 top-4 p-1.5 hover:bg-neutral-100 rounded-full transition-all text-neutral-500 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>

              {/* 1. QUIZ MODAL CONTENT */}
              {activeModal === 'quiz' && (
                <div id="quiz-modal-content">
                  <div className="text-center mb-4">
                    <span className="text-3xl">❓</span>
                    <h3 className="text-xl font-black text-amber-950 mt-1">Theory Flashcard Quiz</h3>
                    <p className="text-xs text-neutral-500">Test your stave knowledge!</p>
                  </div>

                  {!quizFinished ? (
                    <div>
                      {/* Miniature stave displaying the note */}
                      <div className="flex flex-col items-center justify-center p-4 bg-amber-50/50 border border-amber-200 rounded-2xl mb-4">
                        <div className="relative w-48 h-20">
                          {/* 5 Staff lines */}
                          <div className="absolute inset-x-0 top-2 h-[1px] bg-neutral-400" />
                          <div className="absolute inset-x-0 top-6 h-[1px] bg-neutral-400" />
                          <div className="absolute inset-x-0 top-10 h-[1px] bg-neutral-400" />
                          <div className="absolute inset-x-0 top-14 h-[1px] bg-neutral-400" />
                          <div className="absolute inset-x-0 top-18 h-[1px] bg-neutral-400" />
                          <span className="absolute left-2 top-0.5 text-4xl">🎼</span>
                          
                          {/* Note head */}
                          <div 
                            className="absolute left-24 w-5 h-4 bg-neutral-900 rounded-full rotate-[-15deg]"
                            style={{
                              top: quizQuestions[quizQuestionIndex].staveImage === 'E' 
                                ? '16px' 
                                : quizQuestions[quizQuestionIndex].staveImage === 'G'
                                  ? '8px'
                                  : '20px'
                            }}
                          >
                            <div className="absolute left-[18px] bottom-1 w-[1px] h-10 bg-neutral-900" />
                          </div>
                        </div>
                      </div>

                      <p className="font-bold text-neutral-800 text-center mb-4 text-sm">
                        {quizQuestions[quizQuestionIndex].question}
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        {quizQuestions[quizQuestionIndex].options.map((opt) => {
                          const isCorrect = opt === quizQuestions[quizQuestionIndex].correct;
                          const isSelected = selectedQuizAnswer === opt;
                          
                          return (
                            <button
                              key={opt}
                              id={`quiz-opt-${opt}`}
                              disabled={selectedQuizAnswer !== null}
                              onClick={() => handleQuizAnswer(opt)}
                              className={`py-3 rounded-xl border-2 font-bold transition-all ${
                                isSelected
                                  ? isCorrect
                                    ? 'bg-emerald-500 border-emerald-600 text-white'
                                    : 'bg-rose-500 border-rose-600 text-white'
                                  : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                              }`}
                            >
                              Note {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Award className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                      <h4 className="text-lg font-black text-neutral-800">Quiz Completed!</h4>
                      <p className="text-sm text-neutral-600 mt-1">
                        You scored: <span className="font-bold text-amber-600">{quizScore} / {quizQuestions.length}</span> correct answers!
                      </p>
                      <button
                        id="quiz-retry-btn"
                        onClick={() => {
                          setQuizQuestionIndex(0);
                          setQuizScore(0);
                          setQuizFinished(false);
                          setSelectedQuizAnswer(null);
                        }}
                        className="mt-4 px-6 py-2 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 active:scale-95 transition-all"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 2. SETTINGS MODAL CONTENT */}
              {activeModal === 'settings' && (
                <div id="settings-modal-content" className="space-y-4">
                  <div className="text-center mb-2">
                    <span className="text-3xl">⚙️</span>
                    <h3 className="text-xl font-black text-amber-950 mt-1">System Configurations</h3>
                  </div>

                  {/* Volume Slider */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-neutral-400 uppercase">Master Volume</label>
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-neutral-500" />
                      <input
                        id="volume-slider"
                        type="range"
                        min="0"
                        max="100"
                        value={audioVolume}
                        onChange={(e) => setAudioVolume(Number(e.target.value))}
                        className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <span className="text-sm font-bold font-mono text-neutral-700 w-8 text-right">{audioVolume}%</span>
                    </div>
                  </div>

                  {/* SFX Toggle */}
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-800">Sound Effects</h4>
                      <p className="text-xs text-neutral-400">Play responsive gameplay feedback audios.</p>
                    </div>
                    <button
                      id="sfx-toggle"
                      onClick={() => setSfxOn(!sfxOn)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                        sfxOn ? 'bg-emerald-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        sfxOn ? 'translate-x-6' : ''
                      }`} />
                    </button>
                  </div>

                  {/* Instrument Selector */}
                  <div className="space-y-1 pt-2">
                    <label className="text-xs font-black text-neutral-400 uppercase">Target Instrument</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['clarinet', 'recorder', 'flute'].map((inst) => (
                        <button
                          key={inst}
                          id={`inst-select-${inst}`}
                          onClick={() => setInstrument(inst as any)}
                          className={`py-2 text-xs font-bold border-2 rounded-xl transition-all capitalize ${
                            instrument === inst
                              ? 'bg-amber-400 border-amber-500 text-white scale-[0.98]'
                              : 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:bg-neutral-100'
                          }`}
                        >
                          {inst}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. SUBMIT RECORDING MODAL CONTENT */}
              {activeModal === 'recording' && (
                <div id="recording-modal-content" className="text-center py-2">
                  <span className="text-4xl">🎙️</span>
                  <h3 className="text-xl font-black text-amber-950 mt-2">Submit a Performance</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                    Play a melody on your {instrument} and record it for an evaluation report card!
                  </p>

                  <div className="my-8 flex justify-center">
                    <button
                      id="recording-trigger-btn"
                      onClick={handleStartRecord}
                      disabled={isRecording}
                      className={`w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all ${
                        isRecording
                          ? 'border-red-500 bg-red-100 animate-pulse scale-95'
                          : 'border-amber-400 hover:border-amber-500 bg-amber-50 shadow-lg'
                      }`}
                    >
                      {isRecording ? (
                        <div className="w-6 h-6 bg-red-500 rounded-sm" />
                      ) : (
                        <Mic className="w-10 h-10 text-amber-600" />
                      )}
                    </button>
                  </div>

                  {isRecording && (
                    <p className="text-sm font-bold text-red-500 animate-pulse">
                      Recording active... play E - D - C now!
                    </p>
                  )}

                  {recordedSuccessfully && (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl"
                    >
                      <h4 className="font-bold text-emerald-800 text-sm">Recording Successful!</h4>
                      <p className="text-xs text-emerald-600 mt-0.5">
                        Performance rated: ⭐⭐⭐! Certificate awarded!
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* 4. GO WITH THE FLOW PRACTICE CONTENT */}
              {activeModal === 'practice' && (
                <div id="practice-modal-content" className="text-center py-2">
                  <span className="text-4xl">🌊</span>
                  <h3 className="text-xl font-black text-amber-950 mt-2">Seamless Practice Lounge</h3>
                  <p className="text-xs text-neutral-500 mb-4">
                    Click notes below to practice tone articulation freely.
                  </p>

                  <div className="flex gap-2 justify-center py-4 border-y border-neutral-100 my-4">
                    {['C', 'D', 'E', 'F', 'G'].map((note) => (
                      <button
                        key={note}
                        id={`practice-note-${note}`}
                        onClick={() => {
                          setActivePracticeNote(note);
                          playSynthNote(note);
                        }}
                        className={`w-12 h-12 rounded-full border-2 font-bold transition-all shadow-md flex items-center justify-center ${
                          activePracticeNote === note
                            ? 'bg-amber-400 border-amber-500 text-white scale-90'
                            : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        {note}
                      </button>
                    ))}
                  </div>

                  {activePracticeNote && (
                    <p className="text-xs font-bold text-amber-800">
                      Currently playing tone: Middle {activePracticeNote}
                    </p>
                  )}
                </div>
              )}

              {/* 5. REPERTOIRE LIST MODAL CONTENT */}
              {activeModal === 'repertoire' && (
                <div id="repertoire-modal-content" className="space-y-4">
                  <div className="text-center mb-2">
                    <span className="text-3xl">📚</span>
                    <h3 className="text-xl font-black text-amber-950 mt-1">Repertoire List</h3>
                    <p className="text-xs text-neutral-500">View finished lessons and star records</p>
                  </div>

                  <div className="space-y-2">
                    {songs.map((song) => (
                      <div
                        key={song.title}
                        className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                          song.unlocked ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-100/50 border-neutral-100 opacity-60'
                        }`}
                      >
                        <div>
                          <h4 className="text-sm font-bold text-neutral-800">{song.title}</h4>
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{song.difficulty}</span>
                        </div>
                        
                        {song.unlocked ? (
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <span key={i} className="text-lg">
                                {i < song.stars ? '⭐' : '☆'}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-neutral-400 uppercase">🔒 Locked</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. EXPLORE REPERTOIRE MODAL CONTENT */}
              {activeModal === 'explore' && (
                <div id="explore-modal-content" className="space-y-4">
                  <div className="text-center mb-2">
                    <span className="text-3xl">🧭</span>
                    <h3 className="text-xl font-black text-amber-950 mt-1">Explore Repertoire</h3>
                    <p className="text-xs text-neutral-500">Discover new tracks for clarinet & woodwinds</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { genre: 'Classical', count: 12, emoji: '🎻' },
                      { genre: 'Jazz Woodwinds', count: 8, emoji: '🎷' },
                      { genre: 'Folklore Tunes', count: 15, emoji: '🪕' },
                      { genre: 'Pop Covers', count: 6, emoji: '🎸' }
                    ].map((item) => (
                      <div
                        key={item.genre}
                        className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl text-center space-y-1 hover:bg-amber-50 hover:scale-102 transition-all cursor-pointer"
                      >
                        <span className="text-2xl">{item.emoji}</span>
                        <h4 className="font-bold text-sm text-amber-950">{item.genre}</h4>
                        <span className="text-[10px] font-bold text-amber-700 block">{item.count} Songs</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
