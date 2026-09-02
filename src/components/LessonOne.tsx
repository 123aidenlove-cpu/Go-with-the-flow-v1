import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Pizza, Plane, Music, CheckCircle2, Lock, Play } from 'lucide-react';

interface LessonOneProps {
  currentStep: number;
  onSetStep: (step: number) => void;
  onNavigate: (screen: 'map' | 'pizzeria' | 'sight-read-soaring' | 'concert-hall') => void;
  onBack: () => void;
}

export default function LessonOne({ currentStep, onSetStep, onNavigate, onBack }: LessonOneProps) {
  const steps = [
    {
      id: 1,
      title: 'Theory Time',
      description: 'Meet the note E and learn its trumpet fingering.',
      icon: <BookOpen className="w-6 h-6" />,
      actionLabel: 'Learn Now',
      color: 'amber',
      action: () => {
        // Complete step 1 and advance to 2
        onSetStep(2);
      }
    },
    {
      id: 2,
      title: 'Pizzeria Practice',
      description: 'Bake a 2-beat E Minim in our note pizzeria!',
      icon: <Pizza className="w-6 h-6" />,
      actionLabel: 'Play Pizzeria',
      color: 'orange',
      action: () => {
        onNavigate('pizzeria');
      }
    },
    {
      id: 3,
      title: 'Sight Read Soaring',
      description: 'Memorize and spell notes in the sky with a red biplane.',
      icon: <Plane className="w-6 h-6" />,
      actionLabel: 'Fly High',
      color: 'sky',
      action: () => {
        onNavigate('sight-read-soaring');
      }
    },
    {
      id: 4,
      title: 'The Concert Hall',
      description: 'Play your very first real song: Hot Cross Buns!',
      icon: <Music className="w-6 h-6" />,
      actionLabel: 'Enter Hall',
      color: 'indigo',
      action: () => {
        onNavigate('concert-hall');
      }
    }
  ];

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-amber-50 to-orange-100" id="lesson-one-container">
      {/* Top Header Row */}
      <div className="flex items-center justify-between max-w-2xl mx-auto mb-8">
        <button
          id="lesson-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 font-sans font-semibold text-amber-800 transition-all rounded-xl bg-white/80 backdrop-blur border border-amber-200 hover:bg-white active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Map
        </button>
        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Level 1 Lesson</span>
          <h2 className="text-lg font-extrabold text-amber-900">Trumpet Core Curriculum</h2>
        </div>
      </div>

      <div className="max-w-xl mx-auto text-center mb-10">
        <span className="text-4xl" role="img" aria-label="Quest Book">📖</span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-amber-950 sm:text-4xl">
          Lesson 1: Mastering Middle E
        </h1>
        <p className="mt-2 text-amber-800">
          Complete the tasks below in order to master your first note and play your first song in the Concert Hall!
        </p>
      </div>

      {/* Vertical Pathway */}
      <div className="relative max-w-md mx-auto space-y-6" id="pathway-steps-list">
        {/* Connection Line */}
        <div className="absolute left-[34px] top-4 bottom-4 w-1 bg-amber-200 rounded-full z-0" />

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isLocked = step.id > currentStep;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: step.id * 0.1 }}
              className={`relative z-10 flex gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                isCompleted 
                  ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                  : isActive 
                    ? 'bg-white border-amber-400 shadow-xl ring-2 ring-amber-400 ring-offset-2' 
                    : 'bg-neutral-50/50 border-neutral-200 opacity-60'
              }`}
              id={`lesson-step-card-${step.id}`}
            >
              {/* Step indicator/badge */}
              <div className="flex-shrink-0">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-600 text-white'
                    : isActive
                      ? 'bg-amber-400 border-amber-500 text-amber-950 animate-pulse'
                      : 'bg-neutral-100 border-neutral-300 text-neutral-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : isLocked ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <span className="text-lg font-black font-mono">{step.id}</span>
                  )}
                </div>
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`p-1 rounded-md ${
                    isCompleted 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : isActive 
                        ? 'bg-amber-100 text-amber-900' 
                        : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {step.icon}
                  </span>
                  <h3 className={`font-bold text-lg ${
                    isCompleted 
                      ? 'text-emerald-900' 
                      : isActive 
                        ? 'text-amber-950' 
                        : 'text-neutral-500'
                  }`}>
                    {step.title}
                  </h3>
                </div>
                <p className={`text-sm ${
                  isCompleted 
                    ? 'text-emerald-700' 
                    : isActive 
                      ? 'text-amber-800' 
                      : 'text-neutral-400'
                }`}>
                  {step.description}
                </p>

                {/* Interactive button depending on state */}
                {isActive && (
                  <motion.button
                    id={`lesson-step-btn-${step.id}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={step.action}
                    className="flex items-center gap-2 px-4 py-2 mt-3 font-sans text-xs font-extrabold tracking-wide uppercase text-white transition-all bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-200"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {step.actionLabel}
                  </motion.button>
                )}

                {isCompleted && (
                  <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </div>
                )}

                {isLocked && (
                  <div className="flex items-center gap-1 mt-2 text-xs font-medium text-neutral-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Visual representation of E fingering in active state */}
      {currentStep === 1 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm p-5 mx-auto mt-8 bg-white border border-amber-200 rounded-2xl shadow-md text-center"
          id="interactive-e-guide"
        >
          <span className="text-3xl" role="img" aria-label="Trumpet">🎷</span>
          <h4 className="mt-1 font-bold text-amber-900">How to Play Middle E</h4>
          <p className="mt-1 text-xs text-amber-700">
            For E on the trumpet, cover the <span className="font-bold underline">Back Thumb hole</span> and the <span className="font-bold underline">Top Left Hand pointer finger hole</span>.
          </p>
          <div className="flex justify-center gap-4 mt-3">
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 border-2 border-amber-500 bg-amber-500 rounded-full" />
              <span className="mt-0.5 text-[9px] text-neutral-500 uppercase font-mono font-bold">Thumb</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 border-2 border-amber-500 bg-amber-500 rounded-full" />
              <span className="mt-0.5 text-[9px] text-neutral-500 uppercase font-mono font-bold">L1</span>
            </div>
            <div className="flex flex-col items-center opacity-40">
              <div className="w-5 h-5 border-2 border-neutral-400 rounded-full" />
              <span className="mt-0.5 text-[9px] text-neutral-500 uppercase font-mono font-bold">L2</span>
            </div>
            <div className="flex flex-col items-center opacity-40">
              <div className="w-5 h-5 border-2 border-neutral-400 rounded-full" />
              <span className="mt-0.5 text-[9px] text-neutral-500 uppercase font-mono font-bold">L3</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
