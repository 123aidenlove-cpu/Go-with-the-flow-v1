-- Phase 1, Step 1 (Part 2): Securing remaining tables (FIXED)

-- 1. ENABLE ROW LEVEL SECURITY
ALTER TABLE practice_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventure_alerts ENABLE ROW LEVEL SECURITY;

-- 2. POLICIES FOR 'practice_logs'
-- Teachers/Parents need to see logs
CREATE POLICY "Anyone can view practice_logs" 
ON practice_logs FOR SELECT USING (auth.role() = 'authenticated');

-- Users can manage their own logs (using profile_id since logs are tied to specific children)
CREATE POLICY "Users can manage their own practice_logs" 
ON practice_logs FOR ALL USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- 3. POLICIES FOR 'game_progress'
-- Leaderboards and Teachers need to see progress
CREATE POLICY "Anyone can view game_progress" 
ON game_progress FOR SELECT USING (auth.role() = 'authenticated');

-- Users can only manage their own progress (using profile_id to match specific children)
CREATE POLICY "Users can manage their own game_progress" 
ON game_progress FOR ALL USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- 4. POLICIES FOR 'smart_goals'
CREATE POLICY "Anyone can view smart_goals" 
ON smart_goals FOR SELECT USING (auth.role() = 'authenticated');

-- Allow students to manage their goals, and teachers to assign them
CREATE POLICY "Students and Teachers can manage smart_goals" 
ON smart_goals FOR ALL USING (
  student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) 
  OR 
  auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'teacher')
);

-- 5. POLICIES FOR 'adventure_alerts'
CREATE POLICY "Anyone can view adventure_alerts" 
ON adventure_alerts FOR SELECT USING (auth.role() = 'authenticated');

-- Allow teachers who created the alert, or students receiving it, to update the status
CREATE POLICY "Teachers and assigned students can manage adventure_alerts" 
ON adventure_alerts FOR ALL USING (
  teacher_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) 
  OR 
  student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
