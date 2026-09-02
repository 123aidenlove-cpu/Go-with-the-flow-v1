import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Play, Info } from 'lucide-react';
import instrumentsConfig from '../data/instruments.json';

type FlowStep = 'set_practice' | 'warmup' | 'play_through' | 'practice_powers' | 'finale' | 'reflection';

interface FlowPracticeEngineProps {
  onComplete: (xpEarned: number, quavitsEarned: number) => void;
  onCancel: () => void;
}

import { useInstrument } from '../contexts/InstrumentContext';
export default function FlowPracticeEngine({ onComplete, onCancel }: FlowPracticeEngineProps) {
  const { instrument } = useInstrument();
  const [currentStep, setCurrentStep] = useState<FlowStep>('set_practice');
  const [practiceDuration, setPracticeDuration] = useState<number>(15);
  const [selectedPiece, setSelectedPiece] = useState<string>('');
  
  // Read from our new JSON config!
  const instrumentData = (instrumentsConfig as any)[instrument.toLowerCase()] || {
    name: instrument,
    posture_rhyme: "Sit up straight and be ready to play!",
    audio_link: "",
    allowed_challenges: []
  };

  const handleNextStep = () => {
    switch (currentStep) {
      case 'set_practice': setCurrentStep('warmup'); break;
      case 'warmup': setCurrentStep('play_through'); break;
      case 'play_through': setCurrentStep('practice_powers'); break;
      case 'practice_powers': setCurrentStep('finale'); break;
      case 'finale': setCurrentStep('reflection'); break;
      case 'reflection': 
        onComplete(100, 50); // Hardcoded rewards for MVP
        break;
    }
  };

  const handlePrevStep = () => {
    switch (currentStep) {
      case 'warmup': setCurrentStep('set_practice'); break;
      case 'play_through': setCurrentStep('warmup'); break;
      case 'practice_powers': setCurrentStep('play_through'); break;
      case 'finale': setCurrentStep('practice_powers'); break;
      case 'reflection': setCurrentStep('finale'); break;
    }
  };

  // Audio is triggered by a user click, bypassing browser auto-play bans
  const playMaestroAudio = (url: string) => {
    if (!url) return;
    const audio = new Audio(url);
    audio.play().catch(e => console.log("Audio play blocked", e));
  };

  const renderSetPractice = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800">Set Practice</h2>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold mb-4">How long will you practice?</h3>
        <div className="flex gap-4">
          {[10, 15, 20].map(mins => (
            <button 
              key={mins}
              onClick={() => setPracticeDuration(mins)}
              className={`flex-1 py-4 rounded-xl text-lg font-bold transition-all ${practiceDuration === mins ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {mins} mins
            </button>
          ))}
        </div>
        
        <h3 className="text-xl font-semibold mt-8 mb-4">What piece are you focusing on?</h3>
        <select 
          className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 text-lg"
          value={selectedPiece}
          onChange={(e) => setSelectedPiece(e.target.value)}
        >
          <option value="">Free Choice</option>
          <option value="twinkle">Twinkle Twinkle</option>
          <option value="ode">Ode to Joy</option>
        </select>
      </div>
    </div>
  );

  const renderWarmup = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800">Warmup Wizard</h2>
      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner">
          🦉
        </div>
        <h3 className="text-xl font-bold text-blue-900 mb-2">Mini Maestro Says:</h3>
        <p className="text-lg text-blue-800 italic font-medium mb-6">"{instrumentData.posture_rhyme}"</p>
        
        <button 
          onClick={() => playMaestroAudio(instrumentData.audio_link)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-md font-bold"
        >
          <Play size={20} /> Play Audio Guide
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-2">1. Long Notes</h3>
          <p className="text-gray-600">Choose your favorite note and play it for 10 seconds. Focus on a beautiful sound!</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-2">2. Scale Sand Dunes</h3>
          <p className="text-gray-600">Play through your current scale in crotchets up and down.</p>
        </div>
      </div>
    </div>
  );

  const renderPlayThrough = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800">Play Through</h2>
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <h3 className="text-2xl font-bold text-indigo-900 mb-4">Play it from the top!</h3>
        <p className="text-lg text-gray-600 mb-8">Play through {selectedPiece || 'your piece'} as much as you can. Pay attention to the parts that are tricky.</p>
        
        <div className="inline-block bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-800 font-medium flex items-center gap-3 text-left">
          <span className="text-2xl">🦉</span>
          <span>"Make sure to use lots of air/bow and make a big beautiful sound!"</span>
        </div>
      </div>
    </div>
  );

  const renderPracticePowers = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800">Practice Powers</h2>
      <p className="text-lg text-gray-600 mb-6">Let's break the piece down with our practice powers!</p>
      
      <div className="grid grid-cols-2 gap-4">
        {['Vocalise', 'Isolate', 'Surgery', 'Loop', 'Super Loop', 'Mental Practice', 'Rewind'].map((power) => (
          <div key={power} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
              <Info size={24} />
            </div>
            <h4 className="font-bold text-lg">{power}</h4>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFinale = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800">Finale</h2>
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-2xl shadow-lg text-white text-center">
        <h3 className="text-3xl font-bold mb-4">One Last Time!</h3>
        <p className="text-xl opacity-90">Put all those practice powers together and perform the piece.</p>
      </div>
    </div>
  );

  const renderReflection = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800">Reflection</h2>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold mb-4">How did that go?</h3>
        <textarea 
          className="w-full h-32 p-4 rounded-xl border border-gray-200 bg-gray-50 resize-none text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Write a quick note for your teacher or practice log..."
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'set_practice': return renderSetPractice();
      case 'warmup': return renderWarmup();
      case 'play_through': return renderPlayThrough();
      case 'practice_powers': return renderPracticePowers();
      case 'finale': return renderFinale();
      case 'reflection': return renderReflection();
    }
  };

  const getStepProgress = () => {
    const steps: FlowStep[] = ['set_practice', 'warmup', 'play_through', 'practice_powers', 'finale', 'reflection'];
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-[80vh] bg-gray-50 flex flex-col rounded-3xl shadow-2xl">
      {/* Header & Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-800 font-medium"
          >
            Exit Practice
          </button>
          <div className="text-sm font-bold text-indigo-600 tracking-widest uppercase">
            {currentStep.replace('_', ' ')}
          </div>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${getStepProgress()}%` }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {renderCurrentStep()}
      </div>

      {/* Footer Navigation */}
      <div className="mt-12 flex justify-between items-center border-t border-gray-200 pt-6">
        <button
          onClick={handlePrevStep}
          disabled={currentStep === 'set_practice'}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-colors ${
            currentStep === 'set_practice' 
              ? 'opacity-0 pointer-events-none' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm'
          }`}
        >
          <ArrowLeft size={20} /> Back
        </button>
        
        <button
          onClick={handleNextStep}
          className="flex items-center gap-2 px-8 py-3 rounded-full font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-105"
        >
          {currentStep === 'reflection' ? 'Finish & Save' : 'Next Step'} <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
