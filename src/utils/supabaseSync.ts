import { supabase } from '../lib/supabaseClient';

/**
 * Saves a player's high score and level progression for a specific game.
 * Will only update if the new score/level is higher than the existing one.
 */
export const saveGameScore = async (gameName: string, levelReached: number, highScore: number, starsEarned: number = 0) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const profileId = localStorage.getItem('activeProfileId');
    if (!user || !profileId) return;

    const { data: existing } = await supabase
      .from('game_progress')
      .select('high_score, stars_earned')
      .eq('profile_id', profileId)
      .eq('game_name', gameName)
      .eq('level_reached', levelReached)
      .maybeSingle();

    const finalScore = existing && existing.high_score > highScore ? existing.high_score : highScore;
    const finalStars = existing ? existing.stars_earned + starsEarned : starsEarned;

    await supabase.from('game_progress').upsert({
      user_id: user.id,
      profile_id: profileId,
      game_name: gameName,
      level_reached: levelReached,
      high_score: finalScore,
      stars_earned: finalStars,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, game_name, level_reached' });
  } catch (error) {
    console.error("Error saving game score:", error);
  }
};

/**
 * Logs a practice session to power the Parent/Teacher Dashboard calendars.
 */
export const logPracticeSession = async (durationMinutes: number, goalsAchieved: string[] = [], quavitsEarned: number = 0, xpEarned: number = 0) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const profileId = localStorage.getItem('activeProfileId');
    if (!user || !profileId) return;

    await supabase.from('practice_logs').insert([{
      user_id: user.id,
      profile_id: profileId,
      duration_minutes: durationMinutes,
      goals_achieved: goalsAchieved,
      quavits_earned: quavitsEarned,
      xp_earned: xpEarned
    }]);
  } catch (error) {
    console.error("Error logging practice session:", error);
  }
};
