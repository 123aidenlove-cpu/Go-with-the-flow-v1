const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'construction prompts');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

const prompts = {
  '1_goal_setting.txt': "Develop the 'Goal Setting' interface in React where students select their practice intent ('for fun', 'fix a tricky section', 'learn something new') before starting, and create a Supabase migration to add a 'practice_goals' table that can pre-fill options using active Teacher Adventure Alerts from the 'challenges' table.",
  '2_warmup_wizard.txt': "Build the 'Warmup Wizard' React component with instrument-specific posture checks, a 10-second Long Note visualizer, a 15-note Rocket Reading round, and Scale Sand Dunes integration; ensure all progress securely syncs to the Supabase 'game_progress' table and triggers the Mini Maestro audio overlays.",
  '3_play_through.txt': "Implement the 'Play Through' screen in React where students play their piece with an integrated 'Mini Maestro' interjection component that pauses to deliver pre-recorded audio tips about air/bow usage; add a column in the Supabase 'practice_logs' table to track play-through completion.",
  '4_practice_powers.txt': "Create the 'Practice Powers' interactive toolbar in the app featuring buttons for 'Vocalise', 'Isolate', 'Surgery', 'Loop', 'Super Loop', 'Mental Practice', and 'Rewind', and write a Supabase migration to store practice power usage statistics as a JSONB object inside the 'practice_logs' table.",
  '5_reflection_and_practice_log.txt': "Build the 'Practice Log' dashboard featuring a scrollable calendar that queries the Supabase 'practice_logs' table to highlight practice days in blue and lesson days in green, alongside Recharts pie charts displaying total minutes played, goals achieved, and Quavits earned during the Finale/Reflection phase.",
  '6_acoustic_challenges.txt': "Develop the 'Acoustic Challenges' module in React, using a lookup matrix to assign instrument-specific tasks (e.g., Long Bow for strings, Tonguing for wind), and create a Supabase table named 'acoustic_challenges_progress' to securely save users' scores and challenge completion timestamps.",
  '7_games_rhythm_and_listening.txt': "Upgrade the 'Rhythm Rapids' React component to fix double-swap bugs and disable answer selection until audio completes, and build 'Listening Lagoon' with Repertoire and Instrument recognition modes; ensure both games use our existing upsert utility to sync high scores to the Supabase 'game_progress' table.",
  '8_games_clef_and_scales.txt': "Develop the 'Clef Cliffs' minigame using a trampoline/water animation for selecting notes across different clefs, and implement 'Scale Sand Dunes' with hardcoded sequences (C Major, A Minor); sync the highest level reached for both games directly to the Supabase 'game_progress' table.",
  '9_games_sleuth_and_ninja.txt': "Implement the 'Sound Sleuth' game in React to play two identical rhythms with different melodies and a 4-option 'Super High Level', alongside the 'Expression Ninja' module; securely log all player high scores and stars earned to the Supabase 'game_progress' table.",
  '10_mini_maestro_and_audio.txt': "Create a global AudioManager in React to handle non-diegetic theme music for each game menu and Concert Hall tuning sounds, and build the 'Mini Maestro' global context to deliver instrument-specific posture and note introductions, tracking 'has_seen_tutorial' flags in the Supabase 'profiles' table.",
  '11_placement_quiz_and_leagues.txt': "Build a 'Placement Quiz' for new accounts that incrementally increases Rocket Reading difficulty until the user gets 3 questions wrong to set their baseline level, and create a Supabase migration to add a 'league_status' (Bronze, Silver, Gold, Diamond) column to the 'profiles' table that updates based on total XP."
};

for (const [filename, content] of Object.entries(prompts)) {
  const cleanContent = content.replace(/\n/g, ' ').replace(/\r/g, '');
  fs.writeFileSync(path.join(dir, filename), cleanContent, 'utf8');
}
console.log('Prompts created successfully.');
