ALTER TABLE repertoire ADD COLUMN teacher_id uuid REFERENCES profiles(id);
