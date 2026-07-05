import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Profile {
  name: string;
  avatar: string;
  totalStars: number;
  currentXP: number;
  streakDays: number;
  unlockedNodes: string[];
  highestScores: Record<string, number>;
  unlockedAchievements: string[]; // List of unlocked achievement IDs
  lastPlayedDate: string | null; // e.g., "2026-07-05" for streak/daily tracking
}

interface ProfileContextType {
  profile: Profile;
  addStars: (amount: number) => void;
  addXP: (amount: number) => void;
  unlockNode: (nodeName: string) => void;
  updateHighScore: (game: string, score: number) => void;
  unlockAchievement: (badgeId: string) => boolean; // Returns true if newly unlocked
  completeDailyChallenge: () => void;
  resetProfile: () => void;
}

const DEFAULT_PROFILE: Profile = {
  name: 'Explorer',
  avatar: 'owl',
  totalStars: 0,
  currentXP: 0,
  streakDays: 0,
  unlockedNodes: ['Middle E'],
  highestScores: {},
  unlockedAchievements: [],
  lastPlayedDate: null,
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('musicalExplorerProfile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Merge with default to ensure no missing fields
          return { ...DEFAULT_PROFILE, ...parsed };
        } catch (e) {
          console.warn("Failed to parse profile, resetting to default.", e);
        }
      }
    }
    return DEFAULT_PROFILE;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('musicalExplorerProfile', JSON.stringify(profile));
  }, [profile]);

  const addStars = (amount: number) => {
    setProfile((prev) => ({
      ...prev,
      totalStars: prev.totalStars + amount,
    }));
  };

  const addXP = (amount: number) => {
    setProfile((prev) => ({
      ...prev,
      currentXP: prev.currentXP + amount,
    }));
  };

  const unlockNode = (nodeName: string) => {
    setProfile((prev) => {
      if (prev.unlockedNodes.includes(nodeName)) return prev;
      return {
        ...prev,
        unlockedNodes: [...prev.unlockedNodes, nodeName],
      };
    });
  };

  const updateHighScore = (game: string, score: number) => {
    setProfile((prev) => {
      const currentBest = prev.highestScores[game] || 0;
      if (score <= currentBest) return prev;
      return {
        ...prev,
        highestScores: {
          ...prev.highestScores,
          [game]: score,
        },
      };
    });
  };

  const unlockAchievement = (badgeId: string): boolean => {
    let newlyUnlocked = false;
    setProfile((prev) => {
      if (prev.unlockedAchievements.includes(badgeId)) {
        return prev;
      }
      newlyUnlocked = true;
      return {
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, badgeId],
      };
    });
    return newlyUnlocked;
  };

  const completeDailyChallenge = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setProfile((prev) => {
      const alreadyPlayedToday = prev.lastPlayedDate === todayStr;
      const newStreak = alreadyPlayedToday ? prev.streakDays : prev.streakDays + 1;
      return {
        ...prev,
        lastPlayedDate: todayStr,
        streakDays: newStreak,
        totalStars: prev.totalStars + 10, // Daily challenge reward
        currentXP: prev.currentXP + 100,  // Daily challenge reward
      };
    });
  };

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem('musicalExplorerProfile');
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        addStars,
        addXP,
        unlockNode,
        updateHighScore,
        unlockAchievement,
        completeDailyChallenge,
        resetProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
