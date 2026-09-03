import React, { useState, useEffect } from 'react';
import { Screen } from './types';
import WorldMap from './components/WorldMap';
import ConcertHall from './components/ConcertHall';
import PracticeHub from './components/PracticeHub';
import TeacherStudentProfile from './components/TeacherStudentProfile';
import TeacherLessonView from './components/TeacherLessonView';
import Pizzeria from './components/Pizzeria';
import RocketReading from './components/RocketReading';
import RhythmRapids from './components/RhythmRapids';
import FingerFishing from './components/FingerFishing';
import SightReadSoaring from './components/SightReadSoaring';
import SoundSleuth from './components/SoundSleuth';
import ScaleSandDunes from './components/ScaleSandDunes';
import ListeningLagoon from './components/ListeningLagoon';
import ClefCliffs from './components/ClefCliffs';
import LessonOne from './components/LessonOne';
import AidenOnboarding from './components/AidenOnboarding';
import { ReferenceLibrary } from './components/ReferenceLibrary';
import { AskAiden } from './components/AskAiden';
import ExpressionNinja from './components/ExpressionNinja';
import MatchIt from './components/MatchIt';
import ParentDashboard from './components/ParentDashboard';
import FingeringChartMockups from './components/FingeringChartMockups';
import AccountPage from './components/AccountPage';
import MusictopiaCastle from './components/MusictopiaCastle';
import SettingsHub from './components/SettingsHub';
import LevelPage from './components/LevelPage';
import ShopPage from './components/ShopPage';
import TeacherDashboard from './components/TeacherDashboard';
import TeacherSyllabus from './components/TeacherSyllabus';
import { LoginScreen } from './components/LoginScreen';
import GlobalLeaderboard from './components/GlobalLeaderboard';
import { PlacementQuiz } from './components/PlacementQuiz';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const handleLoginSuccess = (role: 'student' | 'teacher', profileId: string) => {
    setUserId(profileId);
    // Unified Hub: Everyone goes to the Concert Hall first to see the Stage or Auditorium
    setScreen('concert-hall');
  };
  const [lessonStep, setLessonStep] = useState<number>(1);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Check localStorage for onboarding state and existing Auth session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch profile
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id);
            
          if (profiles && profiles.length > 0) {
            const isTeacher = profiles.some(p => p.role === 'teacher');
            if (isTeacher) {
              handleLoginSuccess('teacher', profiles.find(p => p.role === 'teacher').id);
            } else {
              handleLoginSuccess('student', profiles[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Auth init error", err);
      } finally {
        setIsInitializing(false);
      }
    };

    checkSession();

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

  if (isInitializing) {
    return (
      <div 
        className="w-full h-screen flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: "url('/loading-screen.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>
        <div className="z-10 bg-white/90 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border-4 border-white/50 w-full max-w-md flex flex-col items-center animate-pulse">
           <h1 className="text-2xl font-black text-slate-800 uppercase tracking-widest text-center">Loading Musictopia...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      
      {screen === 'login' && (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
      {screen === 'profile-selector' && (
        <ProfileSelector onSelectProfile={() => setScreen('concert-hall')} />
      )}

      {/* Onboarding Overlay */}
      {showOnboarding && screen !== 'login' && (
        <AidenOnboarding onClose={handleOnboardingComplete} />
      )}

      {screen === 'placement-quiz' && (
        <PlacementQuiz
          onBack={() => setScreen('concert-hall')}
          onComplete={(league, notes) => {
            console.log("Placement Complete:", league, notes);
            setScreen('map');
          }}
        />
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

      {screen === 'practice-hub' && (
        <PracticeHub
          onBack={() => setScreen('map')}
          onNavigateToGame={(game) => setScreen(game)}
        />
      )}

      {screen === 'teacher-student-profile' && (
        <TeacherStudentProfile
          onBack={() => setScreen('concert-hall')}
        />
      )}

      {screen === 'teacher-lesson-view' && (
        <TeacherLessonView
          onExit={() => setScreen('concert-hall')}
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

      {screen === 'leaderboard' && (
        <GlobalLeaderboard 
          onBack={() => setScreen('map')} 
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

      {screen === 'sound-sleuth' && (
        <SoundSleuth
          onBack={() => setScreen('map')}
          onComplete={() => {
            handleGameCompletion('sound-sleuth');
          }}
        />
      )}

      {screen === 'scale-sand-dunes' && (
        <ScaleSandDunes
          onBack={() => setScreen('map')}
          onComplete={() => {
            handleGameCompletion('scale-sand-dunes');
          }}
        />
      )}

      {screen === 'listening-lagoon' && (
        <ListeningLagoon
          onBack={() => setScreen('map')}
          onComplete={() => {
            handleGameCompletion('listening-lagoon');
          }}
        />
      )}

      {screen === 'clef-cliffs' && (
        <ClefCliffs
          onBack={() => setScreen('map')}
          onComplete={() => {
            handleGameCompletion('clef-cliffs');
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

      {screen === 'expression-ninja' && (
        <ExpressionNinja
          onBack={() => setScreen('map')}
        />
      )}

      {screen === 'match-it' && (
        <MatchIt
          onBack={() => setScreen('map')}
          onComplete={(score) => {
            console.log('MatchIt diagnostic complete', score);
            setScreen('map');
          }}
        />
      )}

      {screen === 'parent-dashboard' && (
        <ParentDashboard
          onBack={() => setScreen('map')}
          studentId={userId || '00000000-0000-0000-0000-000000000000'}
        />
      )}

      {screen === 'mockups' && (
        <FingeringChartMockups />
      )}

      {screen === 'account' && (
        <AccountPage 
          onBack={() => setScreen('map')} 
          onNavigateToParentDashboard={() => setScreen('parent-dashboard')}
          onNavigateToTeacherDashboard={() => setScreen('teacher-dashboard')}
          onNavigateToSettings={() => setScreen('settings')}
          onNavigateToConcertHall={() => setScreen('concert-hall')}
          onLogout={async () => {
             await supabase.auth.signOut();
             localStorage.removeItem('activeProfileId');
             setScreen('login');
          }}
        />
      )}

      {screen === 'musictopia-castle' && (
        <MusictopiaCastle
          onBack={() => setScreen('map')}
        />
      )}

      {screen === 'settings' && (
        <SettingsHub
          onBack={() => setScreen('map')}
        />
      )}

      {screen === 'level-page' && (
        <LevelPage
          onBack={() => setScreen('map')}
        />
      )}

      {screen === 'shop-page' && (
        <ShopPage
          onBack={() => setScreen('map')}
        />
      )}

      {screen === 'teacher-dashboard' && (
        <TeacherDashboard
          onBack={() => setScreen('account')}
        />
      )}

      {screen === 'teacher-syllabus' && (
        <TeacherSyllabus
          onBack={() => setScreen('concert-hall')}
        />
      )}
    </div>
  );
}
