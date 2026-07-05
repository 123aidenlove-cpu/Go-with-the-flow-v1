import React, { useState, useEffect } from 'react';
import { Screen } from './types';
import WorldMap from './components/WorldMap';
import ConcertHall from './components/ConcertHall';
import Pizzeria from './components/Pizzeria';
import RocketReading from './components/RocketReading';
import RhythmRapids from './components/RhythmRapids';
import FingerFishing from './components/FingerFishing';
import SightReadSoaring from './components/SightReadSoaring';
import LessonOne from './components/LessonOne';
import AidenOnboarding from './components/AidenOnboarding';
import { ReferenceLibrary } from './components/ReferenceLibrary';
import { AskAiden } from './components/AskAiden';
import { DailyChallenge } from './components/DailyChallenge';
import { ParentDashboard } from './components/ParentDashboard';

export default function App() {
  const [screen, setScreen] = useState<Screen>('map');
  const [lessonStep, setLessonStep] = useState<number>(1);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Check localStorage for onboarding state on mount
  useEffect(() => {
    const seen = localStorage.getItem('seen_onboarding_flow');
    if (!seen) {
      setShowOnboarding(true);
    }
    
    const savedStep = localStorage.getItem('lesson_one_current_step');
    if (savedStep) {
      setLessonStep(Number(savedStep));
    }
  }, []);

  const handleOnboardingComplete = (isBeginner: boolean) => {
    setShowOnboarding(false);
    localStorage.setItem('seen_onboarding_flow', 'true');
    if (isBeginner) {
      setScreen('lesson-one');
      setLessonStep(1);
      localStorage.setItem('lesson_one_current_step', '1');
    }
  };

  const handleSetLessonStep = (step: number) => {
    setLessonStep(step);
    localStorage.setItem('lesson_one_current_step', String(step));
  };

  const handleGameCompletion = (game: string) => {
    // When a game is completed, we can automatically advance the syllabus lesson step if they are on it!
    if (game === 'pizzeria' && lessonStep === 2) {
      handleSetLessonStep(3);
    } else if (game === 'sight-read-soaring' && lessonStep === 3) {
      handleSetLessonStep(4);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans" id="go-with-the-flow-app">
      {/* Onboarding Overlay */}
      {showOnboarding && (
        <AidenOnboarding onClose={handleOnboardingComplete} />
      )}

      {/* Screen Router */}
      {screen === 'map' && (
        <WorldMap
          onNavigate={(scr) => setScreen(scr)}
          onOpenAiden={() => setShowOnboarding(true)}
          currentStep={lessonStep}
        />
      )}

      {screen === 'lesson-one' && (
        <LessonOne
          currentStep={lessonStep}
          onSetStep={handleSetLessonStep}
          onNavigate={(scr) => setScreen(scr)}
          onBack={() => setScreen('map')}
        />
      )}

      {screen === 'concert-hall' && (
        <ConcertHall
          onBack={() => setScreen('map')}
          onNavigateToGame={(game) => setScreen(game)}
        />
      )}

      {screen === 'pizzeria' && (
        <Pizzeria
          onBack={() => setScreen('map')}
          onComplete={() => {
            handleGameCompletion('pizzeria');
          }}
        />
      )}

      {screen === 'rocket-reading' && (
        <RocketReading
          onBack={() => setScreen('map')}
          onComplete={() => {
            handleGameCompletion('rocket-reading');
          }}
        />
      )}

      {screen === 'rhythm-rapids' && (
        <RhythmRapids
          onBack={() => setScreen('map')}
          onComplete={() => {
            handleGameCompletion('rhythm-rapids');
          }}
        />
      )}

      {screen === 'finger-fishing' && (
        <FingerFishing
          onBack={() => setScreen('map')}
          onComplete={() => {
            handleGameCompletion('finger-fishing');
          }}
        />
      )}

      {screen === 'sight-read-soaring' && (
        <SightReadSoaring
          onBack={() => setScreen('map')}
          onComplete={() => {
            handleGameCompletion('sight-read-soaring');
          }}
        />
      )}

      {screen === 'reference-library' && (
        <ReferenceLibrary
          onBack={() => setScreen('map')}
        />
      )}

      {screen === 'ask-aiden' && (
        <AskAiden
          onBack={() => setScreen('map')}
        />
      )}

      {screen === 'daily-challenge' && (
        <DailyChallenge
          onBack={() => setScreen('map')}
        />
      )}

      {screen === 'parent-dashboard' && (
        <ParentDashboard
          onBack={() => setScreen('map')}
        />
      )}
    </div>
  );
}
