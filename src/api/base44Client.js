import { createClient } from '@supabase/supabase-js';

// Pull our secure credentials from the .env configuration file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create and export the active Supabase connection client
export const base44 = createClient(supabaseUrl, supabaseKey);