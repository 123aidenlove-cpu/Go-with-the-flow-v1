export class DifficultyEngineService {
  /**
   * Calculates the next adaptive difficulty level from 1 to 10 based on accuracy and streak.
   */
  public calculateNextLevel(
    currentDifficulty: number,
    recentAccuracy: number, // as percentage, e.g. 95 or 0.95 (let's handle both)
    streak: number
  ): number {
    // Normalize accuracy if passed as decimal
    const accuracyPct = recentAccuracy <= 1 ? recentAccuracy * 100 : recentAccuracy;

    if (accuracyPct > 90 && streak > 3) {
      return Math.min(10, currentDifficulty + 1);
    }
    if (accuracyPct < 60 && currentDifficulty > 1) {
      return Math.max(1, currentDifficulty - 1);
    }
    return currentDifficulty;
  }

  /**
   * Translates difficulty level (1-10) to falling/scrolling speed (pixels/second or relative speed scale).
   */
  public getFallSpeed(difficulty: number): number {
    // Return a multiplier or pixels-per-frame value
    // Level 1: 1.5 (very slow), Level 10: 6.0 (extremely fast)
    return 1.5 + (difficulty - 1) * 0.5;
  }

  /**
   * Translates difficulty level (1-10) to note spawn density (interval in ms between notes).
   * Higher difficulty = shorter interval (notes spawn more often).
   */
  public getNoteDensity(difficulty: number): number {
    // Return interval in milliseconds
    // Level 1: 4000ms, Level 10: 1200ms
    return Math.max(1200, 4000 - (difficulty - 1) * 300);
  }
}

export const DifficultyEngine = new DifficultyEngineService();
