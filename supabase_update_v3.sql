-- Update 3: Support for SMART Goals, Adventure Alerts, and new Profile/Repertoire features

-- 1. Ensure profiles have necessary display columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_data jsonb;

-- 2. Add support for the new 3x3 gamified practice powers grid on repertoire pieces
ALTER TABLE repertoire ADD COLUMN IF NOT EXISTS practice_powers jsonb;

-- 3. Create the SMART Goals table
CREATE TABLE IF NOT EXISTS smart_goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES profiles(id),
  metric text NOT NULL, -- 'minutes' or 'sessions'
  duration text NOT NULL, -- 'week' or 'month'
  target_value integer NOT NULL,
  current_value integer DEFAULT 0,
  repertoire_id text,
  reward_quavits integer DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at timestamp with time zone
);

ALTER TABLE smart_goals DISABLE ROW LEVEL SECURITY;

-- 4. Create the Adventure Alerts (Quests) table
-- We replace the basic 'challenges' table with this robust structure
CREATE TABLE IF NOT EXISTS adventure_alerts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id uuid REFERENCES profiles(id),
  student_id uuid REFERENCES profiles(id),
  title text NOT NULL,
  task_type text, -- 'minigame', 'piece', 'challenge'
  game_id text, -- e.g., 'rocket_reading', 'minuet'
  metric text, -- e.g., 'metres', 'minutes', 'pizzas'
  target_value integer,
  current_value integer DEFAULT 0,
  reward_quavits integer DEFAULT 0,
  reward_xp integer DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at timestamp with time zone
);

ALTER TABLE adventure_alerts DISABLE ROW LEVEL SECURITY;
