import { createClient } from '@supabase/supabase-js';

// Server-only client. Uses the service role key, which bypasses Row Level
// Security. Never import this file from a client component.
export function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
          throw new Error('Supabase environment variables are not configured');
    }
    return createClient(url, key, { auth: { persistSession: false } });
}
