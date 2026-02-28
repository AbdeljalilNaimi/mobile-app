import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hozjbchgaucbfqumrhhs.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvempiY2hnYXVjYmZxdW1yaGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNjM4OTAsImV4cCI6MjA4NzgzOTg5MH0.Sf-TEIxtDfz_liFlPfiP1robvSGpJTK24mcqAGHypwI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export { SUPABASE_URL };
