import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, HelpCircle, GraduationCap } from 'lucide-react';

interface AidenOnboardingProps {
  onClose: (isBeginner: boolean) => void;
}

export default function AidenOnboarding({ onClose }: AidenOnboardingProps) {
  const [step, setStep] = useState<'welcome' | 'test' | 'completed'>('welcome');
  const [selectedNote, setSelectedNote] = useState<string | null>(null);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" id="aiden-modal-overlay">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white border-4 border-amber-400 rounded-3xl shadow-2xl"
          id="aiden-modal-card"
        >
          {/* Fun header decoration */}
          <div className="h-4 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400" />

          <div className="p-8">
            {/* Aiden Avatar Container */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Glowing ring */}
                <span className="absolute inset-0 rounded-full animate-ping bg-amber-200 opacity-75 overflow-y-auto" />
                <div className="relative flex items-center justify-center w-24 h-24 border-4 border-amber-400 rounded-full bg-amber-50">
                  <span className="text-5xl" role="img" aria-label="Aiden the Owl">🦉</span>
                </div>
                <div className="absolute bottom-0 right-0 p-1 border-2 border-white rounded-full bg-emerald-500 text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Aiden Speech Bubble */}
            <div className="relative p-5 mb-8 border-2 border-amber-200 rounded-2xl bg-amber-50/50">
              <div className="absolute top-0 left-1/2 -mt-3 h-6 w-6 rotate-45 border-t-2 border-l-2 border-amber-200 bg-white transform -translate-x-1/2" style={{ backgroundColor: '#fff9e6' }} />
              
              <h3 className="mb-2 font-sans text-xl font-bold text-center text-amber-900">
                Aiden here, your Musical Guide!
              </h3>

              {step === 'welcome' && (
                <p className="font-sans text-center text-amber-800">
                  Welcome to <span className="font-bold text-orange-600">Go with the Flow</span>! 🎶 Are you brand new to reading music, or have you played an instrument before?
                </p>
              )}

              {step === 'test' && (
                <div className="space-y-4 text-center">
                  <p className="font-sans text-amber-800">
                    Let's test your skills! 🕵️‍♂️ Can you identify which note is shown on this musical stave?
                  </p>
                  
                  {/* Miniature treble staff with G note */}
                  <div className="flex flex-col items-center justify-center p-4 bg-white border-2 border-amber-200 rounded-xl">
                    <div className="relative w-48 h-20">
                      {/* 5 Staff lines */}
                      <div className="absolute inset-x-0 top-2 h-[1px] bg-neutral-400" />
                      <div className="absolute inset-x-0 top-6 h-[1px] bg-neutral-400" />
                      <div className="absolute inset-x-0 top-10 h-[1px] bg-neutral-400" />
                      <div className="absolute inset-x-0 top-14 h-[1px] bg-neutral-400" />
                      <div className="absolute inset-x-0 top-18 h-[1px] bg-neutral-400" />
                      
                      {/* Treble Clef */}
                      <span className="absolute left-4 top-1 text-4xl font-semibold select-none text-neutral-800">🎼</span>
                      
                      {/* Note G (sitting on the second line from the bottom, i.e., line at top-10) */}
                      <div 
                        className={`absolute left-24 top-[32px] w-5 h-4 bg-neutral-900 rounded-full rotate-[-15deg] transition-all duration-300 ${
                          selectedNote ? 'ring-4 ring-emerald-400' : ''
                        }`}
                      >
                        {/* Stem */}
                        <div className="absolute left-[18px] bottom-1 w-[2px] h-10 bg-neutral-900" />
                      </div>
                    </div>
                    <span className="mt-1 text-xs font-mono text-neutral-500">Treble Clef Note</span>
                  </div>

                  {selectedNote && (
                    <motion.p 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className={`text-sm font-bold ${selectedNote === 'G' ? 'text-emerald-600' : 'text-rose-500'}`}
                    >
                      {selectedNote === 'G' 
                        ? 'Spot on! That is Middle G! 🎉 You know your stuff!' 
                        : 'Almost! That note is on the second line, which is G! Let us practice together! ✨'}
                    </motion.p>
                  )}
                </div>
              )}

              {step === 'completed' && (
                <p className="font-sans text-center text-emerald-800">
                  Awesome! You are all set to explore the musical world. Let's make some amazing music together! 🚀
                </p>
              )}
            </div>

            {/* Interactive buttons */}
            <div className="flex flex-col gap-3">
              {step === 'welcome' && (
                <>
                  <button
                    id="onboarding-btn-beginner"
                    onClick={() => {
                      setStep('completed');
                      setTimeout(() => onClose(true), 1200);
                    }}
                    className="flex items-center justify-between w-full px-6 py-4 font-sans font-bold text-white transition-all duration-300 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200 hover:scale-[1.02] active:scale-95"
                  >
                    <span className="flex items-center gap-3 text-lg">
                      <GraduationCap className="w-6 h-6" />
                      I am brand new!
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    id="onboarding-btn-test"
                    onClick={() => setStep('test')}
                    className="flex items-center justify-between w-full px-6 py-4 font-sans font-bold text-amber-900 transition-all duration-300 border-2 border-amber-300 rounded-2xl bg-amber-100/50 hover:bg-amber-100 hover:scale-[1.02] active:scale-95"
                  >
                    <span className="flex items-center gap-3 text-lg">
                      <HelpCircle className="w-6 h-6" />
                      I know some music!
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {step === 'test' && (
                <>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {['E', 'G', 'B'].map((note) => (
                      <button
                        key={note}
                        id={`onboarding-note-${note}`}
                        onClick={() => setSelectedNote(note)}
                        className={`py-3 rounded-xl font-bold font-mono transition-all duration-200 border-2 ${
                          selectedNote === note
                            ? 'bg-amber-400 text-white border-amber-500 scale-95 shadow-inner'
                            : 'bg-white text-neutral-800 border-neutral-200 hover:border-amber-300'
                        }`}
                      >
                        {note}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {selectedNote ? (
                      <button
                        id="onboarding-btn-next"
                        onClick={() => {
                          setStep('completed');
                          setTimeout(() => onClose(selectedNote !== 'G'), 1200);
                        }}
                        className="flex-1 py-3 font-sans font-bold text-white rounded-xl bg-amber-500 shadow-md hover:bg-amber-600 active:scale-95 transition-all"
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        id="onboarding-btn-skip"
                        onClick={() => {
                          setStep('completed');
                          setTimeout(() => onClose(false), 1200);
                        }}
                        className="flex-1 py-3 font-sans font-semibold text-neutral-500 rounded-xl hover:text-neutral-700 active:scale-95 transition-all text-center"
                      >
                        Skip Test
                      </button>
                    )}
                  </div>
                </>
              )}

              {step === 'completed' && (
                <div className="flex justify-center py-4">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
