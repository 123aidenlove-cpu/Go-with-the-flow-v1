import React, { useState, useEffect } from 'react';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { SmartImage } from './ui/SmartImage';
import { APP_ASSETS } from '../config/assets';
import { Analytics } from '../utils/analyticsService';

interface GameEntryScreenProps {
  gameTitle: string;
  backgroundImage?: string;
  onPlayClick: () => void;
  onBackClick: () => void;
}

export const GameEntryScreen: React.FC<GameEntryScreenProps> = ({
  gameTitle,
  backgroundImage,
  onPlayClick,
  onBackClick,
}) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [highScore, setHighScore] = useState<number | null>(null);

  useEffect(() => {
    if (gameTitle === 'Rocket Reading') {
      const stored = localStorage.getItem('rocketHighScore');
      if (stored) {
        setHighScore(parseInt(stored, 10));
      }
    } else {
      // General high score fetch
      const key = `${gameTitle.toLowerCase().replace(/\s+/g, '')}HighScore`;
      const stored = localStorage.getItem(key);
      if (stored) {
        setHighScore(parseInt(stored, 10));
      }
    }
  }, [gameTitle]);

  const handlePlay = () => {
    Analytics.trackGameStart(gameTitle);
    onPlayClick();
  };

  const handleTutorialClick = () => {
    Analytics.trackHelpMenuOpened(gameTitle);
    setShowTutorial(true);
  };

  // Get instructional content depending on gameTitle
  const getTutorialContent = () => {
    switch (gameTitle) {
      case 'Rocket Reading':
        return {
          demoImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
          heading: 'How to Play: Rocket Reading',
          description: 'Help your Clarinet Rocket fly through outer space by identifying notes correctly! When a note appears on the stave, press its corresponding letter key (A-G) or click on the keyboard. Correct answers fuel your rocket, while incorrect ones drain your oxygen! Fly as high as you can!',
        };
      case 'Finger Fishing':
        return {
          demoImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
          heading: 'How to Play: Finger Fishing',
          description: 'Hook the correct music notes to reel in rare tropical fish! Read the note name displayed on screen, and click on the bubble carrying the correct matching note on the stave. Fill up your aquarium with beautiful fish and avoid snagging seaweed!',
        };
      case 'Rhythm Rapids':
        return {
          demoImage: 'https://images.unsplash.com/photo-1418489098061-ce87b5dc3aee?auto=format&fit=crop&w=600&q=80',
          heading: 'How to Play: Rhythm Rapids',
          description: 'Navigate the wild river rapids by keeping perfect rhythm! A metronome beat will play. Tap your spacebar or click the Rhythm button precisely in sync with the falling notes to paddle your kayak safely around obstacles. Lock into the groove!',
        };
      case 'Sight Read Soaring':
        return {
          demoImage: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=600&q=80',
          heading: 'How to Play: Sight Read Soaring',
          description: 'Spread your wings and soar through a procedurally generated musical landscape! Your bird follows a continuous trail of sheet music notes. Play each consecutive note accurately to catch thermal drafts and climb above the clouds. Master sight-reading!',
        };
      case 'Pizzeria':
      case 'Music Pizzeria':
        return {
          demoImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
          heading: 'How to Play: Music Pizzeria',
          description: 'Bake mouth-watering pizzas for hungry customers by keying in the perfect clarinet fingering! Match the requested note by pressing the correct holes on your virtual clarinet fingering chart. Perfect fingerings earn you top tips and critical acclaim!',
        };
      default:
        return {
          demoImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
          heading: `How to Play: ${gameTitle}`,
          description: 'Explore musical concepts, practice note positions, and master your clarinet keys! Read the instructions on-screen, answer musical prompts, and rack up stars and XP to level up your Profile!',
        };
    }
  };

  const tutorial = getTutorialContent();

  const bgStyle = backgroundImage
    ? { backgroundImage: `url(${backgroundImage})` }
    : { backgroundColor: '#1e1b4b' }; // dark indigo fallback

  return (
    <div
      className="w-full h-screen relative bg-cover bg-center flex flex-col justify-between p-6 select-none overflow-hidden"
      style={bgStyle}
      id="game-entry-container"
    >
      {/* Dark semi-transparent overlay so UI pops */}
      <div className="absolute inset-0 bg-black/40 z-0"></div>

      {/* HEADER SECTION */}
      <header className="w-full flex items-center justify-between z-10 relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackClick}
          aria-label="Back to Map"
          className="bg-black/30 backdrop-blur-md text-white border-white/20 hover:bg-black/50"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Map
        </Button>

        <button
          onClick={handleTutorialClick}
          aria-label="Help Tutorial"
          className="p-3 bg-black/30 backdrop-blur-md text-white hover:text-yellow-300 rounded-full border border-white/15 hover:bg-black/50 transition-all cursor-pointer"
        >
          <HelpCircle size={24} />
        </button>
      </header>

      {/* CENTER GAME TITLE */}
      <main className="flex-1 flex flex-col items-center justify-center text-center z-10 relative px-4">
        <h1
          className="text-5xl md:text-7xl font-display font-black text-white tracking-wider animate-bounce"
          style={{ textShadow: '0 8px 0px #1e3a8a, 0 16px 20px rgba(0,0,0,0.6)' }}
        >
          {gameTitle}
        </h1>
        <p className="text-slate-200 mt-4 max-w-xl text-lg font-medium drop-shadow-md">
          {gameTitle === 'Rocket Reading' && 'Fuel your clarinet spacecraft with the power of sight reading!'}
          {gameTitle === 'Finger Fishing' && 'Hook the correct treble clef notes to reel in wonderful sea creatures!'}
          {gameTitle === 'Rhythm Rapids' && 'Keep the rhythm steady to navigate the rapids successfully!'}
          {gameTitle === 'Sight Read Soaring' && 'Glide smoothly through a sequence of musical melodies!'}
          {gameTitle === 'Pizzeria' && 'Assemble delicious toppings by matching the clarinet fingerings!'}
        </p>

        {/* High Score Badge for Rocket Reading & general games */}
        {highScore !== null && (
          <div className="mt-8 px-5 py-2 bg-gradient-to-r from-yellow-500/30 to-amber-500/30 backdrop-blur-md border border-yellow-400/40 rounded-full flex items-center gap-2 animate-pulse shadow-lg">
            <span className="text-yellow-300 font-bold">🏆 PERSONAL BEST:</span>
            <span className="text-white font-extrabold font-mono">
              {highScore}
              {gameTitle === 'Rocket Reading' ? ' m' : ' Points'}
            </span>
          </div>
        )}
      </main>

      {/* BOTTOM BUTTONS PANEL */}
      <footer className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 py-8 z-10 relative">
        <Button
          variant="secondary"
          size="lg"
          onClick={handleTutorialClick}
          aria-label="View Tutorial"
          className="w-full sm:w-64"
        >
          TUTORIAL
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handlePlay}
          aria-label="Start Game"
          className="w-full sm:w-64 animate-pulse"
        >
          PLAY
        </Button>
      </footer>

      {/* TUTORIAL MODAL OVERLAY */}
      <Modal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        title="Interactive Tutorial"
      >
        <div className="flex flex-col gap-5 text-slate-700">
          {/* Skeleton or dynamic image loader */}
          <SmartImage
            src={tutorial.demoImage}
            alt={tutorial.heading}
            className="w-full h-48 md:h-64 rounded-xl shadow-inner border border-slate-200"
          />

          <h3 className="text-2xl font-display font-black text-slate-800 leading-tight">
            {tutorial.heading}
          </h3>

          <p className="text-sm md:text-base text-slate-600 leading-relaxed">
            {tutorial.description}
          </p>

          <div className="flex justify-end mt-4">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setShowTutorial(false);
                handlePlay();
              }}
              aria-label="Got it! Let's play"
              className="w-full sm:w-auto"
            >
              Got it! Let's Play!
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
