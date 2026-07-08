import { createClient } from '@supabase/supabase-js';

// Server-side client with service role key (bypasses RLS).
// Variables are read inside the function so they are resolved at request time,
// not at module load time (avoids "supabaseUrl is required" on cold starts).
export function getSupabase() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  if (!url) throw new Error('SUPABASE_URL is not set in environment variables');
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

// Public client for client-side use
export function getSupabasePublic() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, key);
}
