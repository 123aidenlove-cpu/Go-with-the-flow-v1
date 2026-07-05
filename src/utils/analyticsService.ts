export class AnalyticsService {
  public trackEvent(eventName: string, payloadData: Record<string, any> = {}) {
    const timestamp = new Date().toISOString();
    console.log(
      `%c[ANALYTICS] - ${eventName} - ${timestamp}`,
      'background: #1e293b; color: #38bdf8; font-weight: bold; padding: 2px 4px; rounded: 4px;',
      payloadData
    );
  }

  public trackGameStart(gameId: string, difficulty: number = 1) {
    this.trackEvent('game_started', { gameId, difficulty });
  }

  public trackGameComplete(gameId: string, score: number, accuracy: number) {
    this.trackEvent('game_completed', { gameId, score, accuracy });
  }

  public trackDailyStreak(streakLength: number) {
    this.trackEvent('daily_streak_updated', { streakLength });
  }

  public trackHelpMenuOpened(noteRequested: string) {
    this.trackEvent('help_menu_opened', { noteRequested });
  }
}

export const Analytics = new AnalyticsService();
