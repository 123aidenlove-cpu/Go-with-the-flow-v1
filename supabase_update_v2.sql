-- Practice Logs (To track minutes practiced, goals, and calendar as per the Customer Journey)
CREATE TABLE practice_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  duration_minutes integer NOT NULL DEFAULT 0,
  goals_achieved text[],
  quavits_earned integer DEFAULT 0,
  xp_earned integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Game Progress (To save specific minigame high scores, levels, and stars)
CREATE TABLE game_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  game_name text NOT NULL,
  level_reached integer DEFAULT 0,
  high_score integer DEFAULT 0,
  stars_earned integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable RLS for MVP testing phase (just like the previous tables)
ALTER TABLE practice_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE game_progress DISABLE ROW LEVEL SECURITY;
