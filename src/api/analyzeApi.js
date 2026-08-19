// src/api/analyzeApi.js
// Frontend helper to call the Netlify serverless function at /api/analyze.
// No external server URL needed — calls go to the same domain.

import { supabase } from '../supabaseClient';

/**
 * fetchAIAnalysis
 * Calls /api/analyze with the user's auth token and data context.
 * Returns { summary, patterns, recommendations }
 */
export async function fetchAIAnalysis() {
    // Get the current session to extract the access token
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        throw new Error('You must be logged in to get AI analysis.');
    }

    // Fetch the user's profile and cycle data to pass to the AI function
    const { data: profile } = await supabase.from('users_profile').select('*').eq('id', session.user.id).single();
    const { data: cycleEntries } = await supabase.from('cycle_entries').select('*').eq('user_id', session.user.id).order('period_start_date', { ascending: false }).limit(20);

    // Call the serverless function (same domain, no CORS issues)
    const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
            profile: profile || { full_name: 'User' },
            cycleEntries: cycleEntries || []
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get AI analysis.');
    }

    return response.json();
}
