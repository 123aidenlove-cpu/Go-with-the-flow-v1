ALTER TABLE profiles ADD COLUMN role text DEFAULT 'student'; 
ALTER TABLE profiles ADD COLUMN studio_code text; 
ALTER TABLE profiles ADD COLUMN teacher_id uuid REFERENCES profiles(id);
ALTER TABLE repertoire ADD COLUMN teacher_id uuid REFERENCES profiles(id); 
