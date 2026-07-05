import { Profile } from '../context/ProfileContext';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji or URL
  xpReward: number;
}

export const ACHIEVEMENT_CATALOG: Achievement[] = [
  {
    id: 'welcome_band',
    title: 'Welcome to the Band',
    description: 'Play your very first music training mini-game!',
    icon: '🎺',
    xpReward: 100,
  },
  {
    id: 'perfect_pitch',
    title: 'Perfect Pitch',
    description: 'Complete a musical gameplay level with 100% accuracy!',
    icon: '🎯',
    xpReward: 250,
  },
  {
    id: 'marathon',
    title: 'Marathon',
    description: 'Keep a daily practice streak of 7 days or more!',
    icon: '🔥',
    xpReward: 500,
  },
  {
    id: 'aviation_ace',
    title: 'Aviation Ace',
    description: 'Fly high and score over 500 points in Rocket Reading!',
    icon: '🚀',
    xpReward: 300,
  },
  {
    id: 'theory_nerd',
    title: 'Theory Nerd',
    description: 'Consult the Source of Truth (Note Reference Library) 5 times!',
    icon: '📚',
    xpReward: 150,
  },
];

export interface GameStats {
  gameId: string;
  score: number;
  accuracy: number; // e.g. 100 for perfect pitch
}

/**
 * Checks if any new achievements have been unlocked.
 * Returns an array of newly unlocked achievements.
 */
export function checkAchievements(
  profileState: Profile,
  gameStats?: GameStats
): Achievement[] {
  const newlyUnlocked: Achievement[] = [];
  const unlockedIds = profileState.unlockedAchievements;

  // 1. Welcome to the Band (triggers if they played any game or highestScores isn't empty)
  if (!unlockedIds.includes('welcome_band')) {
    const hasPlayedGame = gameStats !== undefined || Object.keys(profileState.highestScores).length > 0;
    if (hasPlayedGame) {
      const achievement = ACHIEVEMENT_CATALOG.find(a => a.id === 'welcome_band');
      if (achievement) newlyUnlocked.push(achievement);
    }
  }

  // 2. Perfect Pitch (gameStats.accuracy === 100)
  if (!unlockedIds.includes('perfect_pitch') && gameStats) {
    if (gameStats.accuracy === 100) {
      const achievement = ACHIEVEMENT_CATALOG.find(a => a.id === 'perfect_pitch');
      if (achievement) newlyUnlocked.push(achievement);
    }
  }

  // 3. Marathon (streakDays >= 7)
  if (!unlockedIds.includes('marathon')) {
    if (profileState.streakDays >= 7) {
      const achievement = ACHIEVEMENT_CATALOG.find(a => a.id === 'marathon');
      if (achievement) newlyUnlocked.push(achievement);
    }
  }

  // 4. Aviation Ace (score > 500 in Rocket Reading)
  if (!unlockedIds.includes('aviation_ace')) {
    const rocketBest = profileState.highestScores['Rocket Reading'] || 0;
    const currentScore = gameStats?.gameId === 'Rocket Reading' ? gameStats.score : 0;
    if (rocketBest > 500 || currentScore > 500) {
      const achievement = ACHIEVEMENT_CATALOG.find(a => a.id === 'aviation_ace');
      if (achievement) newlyUnlocked.push(achievement);
    }
  }

  // 5. Theory Nerd (unlocked if sourceOfTruthOpens in localStorage >= 5)
  if (!unlockedIds.includes('theory_nerd')) {
    const opensStr = localStorage.getItem('sourceOfTruthOpens') || '0';
    const opens = parseInt(opensStr, 10);
    if (opens >= 5) {
      const achievement = ACHIEVEMENT_CATALOG.find(a => a.id === 'theory_nerd');
      if (achievement) newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}
