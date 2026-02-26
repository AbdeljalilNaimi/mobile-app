import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yjqzkjajfqnnfzaqevtt.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqcXpramFqZnFubmZ6YXFldnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjI0NzIsImV4cCI6MjA4NzY5ODQ3Mn0.tSoExcU7r5SHiJEkm2-EuKyTLw24Ud2U14Ph25LvIiI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
export { SUPABASE_URL };
