-- Phase 1, Step 1: Production Security for Supabase MVP

-- 1. ENABLE ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE repertoire ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- 2. POLICIES FOR 'profiles' TABLE
-- Allow any logged-in user to see profiles (required for Leaderboards, Teacher-Student linking)
CREATE POLICY "Anyone can view profiles" 
ON profiles FOR SELECT 
USING (auth.role() = 'authenticated');

-- Allow users to insert their own profiles
CREATE POLICY "Users can create their own profiles" 
ON profiles FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Allow users to update ONLY their own profiles (stops students from hacking XP)
CREATE POLICY "Users can update their own profiles" 
ON profiles FOR UPDATE 
USING (user_id = auth.uid());

-- Allow users to delete their own profiles
CREATE POLICY "Users can delete their own profiles" 
ON profiles FOR DELETE 
USING (user_id = auth.uid());

-- 3. POLICIES FOR 'repertoire' TABLE
-- Allow any logged-in user to read repertoire (so students can see assigned pieces)
CREATE POLICY "Anyone can view repertoire" 
ON repertoire FOR SELECT 
USING (auth.role() = 'authenticated');

-- Allow teachers to manage (insert/update/delete) their own repertoire
CREATE POLICY "Teachers can manage their own repertoire" 
ON repertoire FOR ALL 
USING (
  teacher_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- 4. POLICIES FOR 'challenges' TABLE
-- Allow any logged-in user to read global challenges
CREATE POLICY "Anyone can view challenges" 
ON challenges FOR SELECT 
USING (auth.role() = 'authenticated');

-- Allow authenticated users to manage challenges (Since it's currently a global pool in the MVP)
CREATE POLICY "Authenticated users can manage challenges" 
ON challenges FOR ALL 
USING (auth.role() = 'authenticated');
