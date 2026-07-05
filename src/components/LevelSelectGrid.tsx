import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Lock, CheckCircle2, Star, HelpCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { CURRICULUM_PIPELINE, LearningNode } from '../config/curriculum';
import { useProfile } from '../context/ProfileContext';
import { Analytics } from '../utils/analyticsService';

interface LevelSelectGridProps {
  gameTitle: string;
  themeColor?: string;
  onLevelSelect: (nodeId: string, stageId: string, gameId: string) => void;
  onBack: () => void;
}

export const LevelSelectGrid: React.FC<LevelSelectGridProps> = ({
  gameTitle,
  themeColor = 'bg-blue-500',
  onLevelSelect,
  onBack,
}) => {
  const { profile, addStars, addXP, unlockNode } = useProfile();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [completedStages, setCompletedStages] = useState<string[]>(() => {
    const saved = localStorage.getItem('completedStages');
    return saved ? JSON.parse(saved) : ['Middle E-Theory']; // Default first stage complete
  });
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const currentNode: LearningNode = CURRICULUM_PIPELINE[currentPageIndex];

  // Sync completed stages to localStorage
  const markStageComplete = (nodeId: string, stageId: string) => {
    const key = `${nodeId}-${stageId}`;
    if (!completedStages.includes(key)) {
      const nextCompleted = [...completedStages, key];
      setCompletedStages(nextCompleted);
      localStorage.setItem('completedStages', JSON.stringify(nextCompleted));

      // Award 10 stars and 100 XP for completion
      addStars(10);
      addXP(100);

      // If it's MasteryTest, unlock the NEXT learning node
      if (stageId === 'MasteryTest') {
        const nextNodeIndex = currentPageIndex + 1;
        if (nextNodeIndex < CURRICULUM_PIPELINE.length) {
          const nextNode = CURRICULUM_PIPELINE[nextNodeIndex];
          unlockNode(nextNode.id);
        }
      }
    }
  };

  const totalStars = profile.totalStars;

  const handleNextPage = () => {
    const nextIndex = currentPageIndex + 1;
    if (nextIndex >= CURRICULUM_PIPELINE.length) return;

    const nextNode = CURRICULUM_PIPELINE[nextIndex];
    
    // Star gates: Page 2 (index 1) needs 20 stars. Page 3 (index 2) needs 40 stars.
    const requiredStars = nextIndex === 1 ? 20 : 40;

    if (totalStars < requiredStars) {
      const diff = requiredStars - totalStars;
      setAlertMessage(`You need ${diff} more stars to unlock ${nextNode.id} Mastery!`);
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }

    setCurrentPageIndex(nextIndex);
  };

  const handlePrevPage = () => {
    if (currentPageIndex === 0) return;
    setCurrentPageIndex(currentPageIndex - 1);
  };

  const handleStageClick = (stageId: string, gameId: string, isUnlocked: boolean) => {
    if (!isUnlocked) {
      setAlertMessage("You must complete the previous stages first!");
      setTimeout(() => setAlertMessage(null), 2500);
      return;
    }

    // Launch the specific game
    onLevelSelect(currentNode.id, stageId, gameId);
  };

  return (
    <div className={`min-h-screen text-white p-6 flex flex-col justify-between ${themeColor} relative transition-all duration-300`} id="level-select-grid-container">
      {/* Header */}
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          aria-label="Back"
          className="bg-black/20 text-white border-white/10 hover:bg-black/30"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>

        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-wider uppercase drop-shadow-md">
            {currentNode.title}
          </h1>
          <p className="text-xs text-white/80 font-medium">
            {currentNode.description}
          </p>
        </div>

        {/* Global Stars Indicator */}
        <div className="flex items-center gap-1 bg-yellow-500/20 px-4 py-2 rounded-full border border-yellow-400/30 shadow-md">
          <Star className="text-yellow-300 fill-yellow-300 w-5 h-5 animate-spin-slow" />
          <span className="font-display font-extrabold text-yellow-300">{totalStars} Stars</span>
        </div>
      </header>

      {/* Main Path Area */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-5xl w-full mx-auto my-6 z-10">
        
        {/* Alert Toast Notification */}
        {alertMessage && (
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-red-600 border border-red-400 px-6 py-3 rounded-2xl shadow-2xl text-white font-display font-bold animate-bounce z-50">
            {alertMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 w-full items-stretch">
          {currentNode.stages.map((stage, idx) => {
            const stageKey = `${currentNode.id}-${stage.id}`;
            const isCompleted = completedStages.includes(stageKey);
            
            // Linear Gating Logic: Stage 0 is always unlocked. Stage N is unlocked if stage N-1 is completed.
            let isUnlocked = true;
            if (idx > 0) {
              const prevStageKey = `${currentNode.id}-${currentNode.stages[idx - 1].id}`;
              isUnlocked = completedStages.includes(prevStageKey);
            }

            // Accessibility Labels
            const ariaLabel = isUnlocked
              ? `Stage ${idx + 1}: ${stage.title}. ${isCompleted ? 'Completed' : 'Unlocked'}`
              : `Stage ${idx + 1}: ${stage.title}. Locked.`;

            return (
              <Card
                key={stage.id}
                id={`stage-card-${stage.id}`}
                className={`relative overflow-hidden flex flex-col justify-between p-5 min-h-[180px] border-2 transition-all duration-200 text-slate-800 ${
                  isUnlocked
                    ? 'bg-white border-white shadow-xl hover:shadow-2xl cursor-pointer hover:-translate-y-1'
                    : 'bg-white/10 border-white/5 opacity-50 shadow-none pointer-events-none'
                }`}
                onClick={() => handleStageClick(stage.id, stage.gameId, isUnlocked)}
              >
                {/* Stage number */}
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-black font-display uppercase tracking-widest ${isUnlocked ? 'text-blue-500' : 'text-white/40'}`}>
                    Stage {idx + 1}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="text-emerald-500 w-6 h-6 animate-pulse" />
                  ) : !isUnlocked ? (
                    <Lock className="text-white/40 w-5 h-5" />
                  ) : (
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
                  )}
                </div>

                {/* Title */}
                <div className="my-4">
                  <h4 className={`text-lg font-display font-black leading-tight ${isUnlocked ? 'text-slate-800' : 'text-white/50'}`}>
                    {stage.title}
                  </h4>
                  <p className={`text-xs mt-1 leading-relaxed ${isUnlocked ? 'text-slate-500 font-medium' : 'text-white/30'}`}>
                    {stage.description}
                  </p>
                </div>

                {/* Completion Reward */}
                <div className="flex items-center gap-1.5 border-t border-slate-100/10 pt-2 text-slate-400">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className={`text-[10px] font-bold font-mono ${isUnlocked ? 'text-slate-400' : 'text-white/20'}`}>
                    +10 Stars
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Footer / Page Controls */}
      <footer className="w-full flex justify-between items-center max-w-5xl mx-auto z-10 pt-4">
        <Button
          variant="ghost"
          disabled={currentPageIndex === 0}
          onClick={handlePrevPage}
          aria-label="Previous Page"
          className="bg-black/20 text-white border-white/10 hover:bg-black/30 disabled:opacity-30"
        >
          <ArrowLeft size={18} className="mr-2" />
          Previous Note
        </Button>

        <div className="flex gap-2">
          {CURRICULUM_PIPELINE.map((_, idx) => (
            <div
              key={idx}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentPageIndex ? 'w-8 bg-yellow-400' : 'w-2.5 bg-white/30'
              }`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          disabled={currentPageIndex === CURRICULUM_PIPELINE.length - 1}
          onClick={handleNextPage}
          aria-label="Next Page"
          className="bg-black/20 text-white border-white/10 hover:bg-black/30 disabled:opacity-30"
        >
          Next Note
          <ArrowRight size={18} className="ml-2" />
        </Button>
      </footer>
    </div>
  );
};
