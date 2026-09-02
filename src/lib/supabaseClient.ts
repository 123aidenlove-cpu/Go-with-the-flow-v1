/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rrnnwclatihbrmesjbks.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'REPLACE_WITH_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
