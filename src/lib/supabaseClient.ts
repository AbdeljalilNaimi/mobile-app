import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://gbfhpgfhvnwacpbczglh.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZmhwZ2Zodm53YWNwYmN6Z2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NjA1NDYsImV4cCI6MjA4NzUzNjU0Nn0.dqavLsUsr8QZUNXFr8bXf6yur_FOK0DsKTO_oJq7ZtM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
export { SUPABASE_URL };
