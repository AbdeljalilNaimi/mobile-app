import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zcrwgcytfyecjoskxnno.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[CityHealth] Missing Supabase credentials in .env');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const APP_URL = import.meta.env.VITE_APP_URL || 'https://cityhealth-dz.lovable.app';
