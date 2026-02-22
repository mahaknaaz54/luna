// src/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Warning: Supabase URL or Anon Key is missing! Ensure .env file exists in the root directory.');
}

// Provide valid-looking placeholders to prevent createClient from crashing the entire app on load
const safeUrl = supabaseUrl || 'https://placeholder.supabase.co';
const safeKey = supabaseAnonKey || 'placeholder-anon-key';

export const supabase = createClient(safeUrl, safeKey);

/**
 * testSupabaseConnection
 * Tests the connection to Supabase by fetching a single row from 'users_profile'.
 */
export const testSupabaseConnection = async () => {
    if (safeUrl === 'https://placeholder.supabase.co') {
        console.log('Skipping Supabase connection test because real keys are missing.');
        return;
    }

    console.log('Testing Supabase connection...');

    try {
        const { data, error } = await supabase
            .from('users_profile')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Error connecting to Supabase:', error);
            return;
        }

        console.log('Successfully connected to Supabase. Data:', data);
    } catch (err) {
        console.error('Unexpected error testing connection:', err);
    }
};
