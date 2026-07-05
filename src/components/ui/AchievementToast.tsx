import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AudioManager } from '../../utils/audioManager';
import { Achievement } from '../../utils/achievementManager';

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      // Play achievement success audio
      AudioManager.playSuccess();

      // Auto close after 4 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Wait for exit animation to complete before calling onClose
        setTimeout(onClose, 500);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  return (
    <AnimatePresence>
      {isVisible && achievement && (
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.9 }}
          animate={{ y: 24, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 15, stiffness: 120 }}
          className="fixed top-0 left-1/2 transform -translate-x-1/2 z-[100] w-full max-w-md p-0.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.5)] border border-yellow-200"
        >
          <div className="bg-slate-900 rounded-[14px] p-4 flex items-center gap-4 text-white">
            {/* Achievement Icon */}
            <div className="text-4xl bg-slate-800 p-2.5 rounded-xl border border-slate-700 animate-bounce">
              {achievement.icon}
            </div>

            {/* Title & Description */}
            <div className="flex-1 min-w-0">
              <span className="text-xs uppercase font-display font-black text-amber-400 tracking-wider">
                Achievement Unlocked!
              </span>
              <h4 className="text-lg font-display font-extrabold truncate text-white leading-tight">
                {achievement.title}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">
                {achievement.description}
              </p>
            </div>

            {/* XP Reward */}
            <div className="text-center bg-emerald-950/50 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <div className="text-xs font-bold text-emerald-400">XP REWARD</div>
              <div className="text-lg font-black text-emerald-400 font-mono">
                +{achievement.xpReward}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
