-- 1. Create the Profiles table (Student Stats & Currencies)
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  instrument text DEFAULT 'Clarinet',
  xp integer DEFAULT 0,
  quavits_common integer DEFAULT 0,
  quavits_rare integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the Repertoire table (Teacher Library)
CREATE TABLE repertoire (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  piece_name text NOT NULL,
  composer text,
  tips text,
  tricky_bars text,
  tricky_notes text[],
  audio_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create the Challenges table (Adventure Alerts)
CREATE TABLE challenges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  game text NOT NULL,
  goal_text text NOT NULL,
  reward_pts integer DEFAULT 20,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn off Row Level Security (RLS) temporarily for our MVP build phase.
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE repertoire DISABLE ROW LEVEL SECURITY;
ALTER TABLE challenges DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ADD COLUMN inventory text[] DEFAULT '{}'; 
ALTER TABLE profiles ADD COLUMN role text DEFAULT 'student'; echo ALTER TABLE profiles ADD COLUMN studio_code text; echo ALTER TABLE profiles ADD COLUMN teacher_id uuid REFERENCES profiles(id); 
