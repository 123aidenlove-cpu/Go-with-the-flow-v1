import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Music, ArrowUpCircle, MessageCircle } from 'lucide-react';
import { DynamicScore } from './ui/DynamicScore';
import { CheckCircle, ArrowRight, Activity } from 'lucide-react';

const steps = [
  { id: 'posture', label: 'Posture Check', icon: <CheckCircle /> },
  { id: 'long-notes', label: 'Long Notes', icon: <Clock /> },
  { id: 'note-recognition', label: 'Note Recognition', icon: <Music /> },
  { id: 'scale', label: 'Scale Sand Dunes', icon: <ArrowUpCircle /> }
];

const instrumentRules = {
  violin: ["Up like a rocket", "Down like the rain", "Back and forth like a choo-choo train!"],
  trumpet: ["Stand up straight", "Deep breaths", "Firm corners"],
  default: ["Sit up straight", "Relax your shoulders", "Take a deep breath"]
};

export const WarmupWizard: React.FC<{ instrument?: 'violin' | 'trumpet' | 'default' }> = ({ instrument = 'default' }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timer, setTimer] = useState(10);
  const [timerActive, setTimerActive] = useState(false);

  const currentStep = steps[currentStepIndex];
  const rules = instrumentRules[instrument] || instrumentRules.default;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const startTimer = () => {
    setTimer(10);
    setTimerActive(true);
  };

  return (
    <div className="min-h-screen bg-indigo-900 text-white flex flex-col items-center p-8 font-sans">
      <h1 className="text-4xl font-extrabold mb-8 text-yellow-400 drop-shadow-md">Warmup Wizard</h1>
      
      {/* Progress Bar */}
      <div className="flex space-x-4 mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center space-x-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index <= currentStepIndex ? 'bg-green-500' : 'bg-gray-700'}`}>
              {step.icon}
            </div>
            {index < steps.length - 1 && <div className="w-8 h-1 bg-gray-700" />}
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-indigo-800 p-8 rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden">
        <AnimatePresence mode="wait">
          {currentStep.id === 'posture' && (
            <motion.div key="posture" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="text-center">
              <h2 className="text-3xl font-bold mb-4">Posture Check</h2>
              <ul className="space-y-4">
                {rules.map((rule, i) => (
                  <li key={i} className="text-xl bg-indigo-700 p-4 rounded-lg">{rule}</li>
                ))}
              </ul>
            </motion.div>
          )}

          {currentStep.id === 'long-notes' && (
            <motion.div key="long-notes" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="text-center">
              <h2 className="text-3xl font-bold mb-4">Long Notes</h2>
              <p className="text-lg mb-6">Focus on your tone. Hold a steady note for 10 seconds!</p>
              <div className="text-6xl font-black mb-8 text-yellow-400">00:{timer.toString().padStart(2, '0')}</div>
              <button onClick={startTimer} className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-full font-bold text-lg transition">Start Timer</button>
            </motion.div>
          )}

          {currentStep.id === 'note-recognition' && (
            <motion.div key="note-recognition" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="text-center">
              <h2 className="text-3xl font-bold mb-4">Note Recognition</h2>
              <p className="text-lg mb-6">Rocket Reading Integration - Identify the 15 tagged notes!</p>
              <div className="grid grid-cols-5 gap-4">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="bg-indigo-600 h-16 rounded-xl flex items-center justify-center text-2xl font-bold border-2 border-indigo-400 hover:bg-indigo-500 cursor-pointer">
                    ?
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep.id === 'scale' && (
            <motion.div key="scale" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="text-center flex flex-col items-center">
              <h2 className="text-3xl font-bold mb-4">Scale Sand Dunes</h2>
              <p className="text-lg mb-6">Play your scale up and down in crotchets.</p>
              <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-indigo-200">
                <DynamicScore clef="treble" keySignature="C" notes={[
                  { keys: ['c/4'], duration: 'q' },
                  { keys: ['d/4'], duration: 'q' },
                  { keys: ['e/4'], duration: 'q' },
                  { keys: ['f/4'], duration: 'q' },
                  { keys: ['g/4'], duration: 'q' }
                ]} width={300} height={150} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="mt-8 flex justify-end">
          <button onClick={handleNext} disabled={currentStepIndex === steps.length - 1} className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-8 py-3 rounded-full font-bold text-lg transition">
            {currentStepIndex === steps.length - 1 ? "Finish Warmup" : "Next Step"}
          </button>
        </div>
      </div>

      {/* Mini Maestro Mascot */}
      <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="fixed bottom-8 right-8 flex items-end">
        <div className="bg-white text-indigo-900 p-4 rounded-t-2xl rounded-l-2xl shadow-xl mr-4 max-w-xs relative">
          <p className="font-bold">Mini Maestro says:</p>
          <p className="text-sm">Don't forget to keep those shoulders relaxed and embouchure firm!</p>
          <div className="absolute bottom-4 -right-2 transform translate-x-full text-white">
            <MessageCircle className="w-6 h-6 rotate-90" />
          </div>
        </div>
        <div className="w-20 h-20 bg-yellow-400 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-4xl">
          🧙‍♂️
        </div>
      </motion.div>
    </div>
  );
};
