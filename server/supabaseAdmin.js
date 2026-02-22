// server/supabaseAdmin.js
// Server-side Supabase client using the SERVICE ROLE key.
// This key bypasses Row Level Security (RLS) so the server can read any user's data.
// NEVER expose this key to the frontend.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate that the keys are present before creating the client
if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.');
    process.exit(1);
}

// Create a Supabase client with the service role key (server-side only)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
