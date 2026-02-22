// src/api/analyzeApi.js
// Frontend helper to call the Vercel serverless function at /api/analyze.
// No external server URL needed — calls go to the same domain.

import { supabase } from '../supabaseClient';

/**
 * fetchAIAnalysis
 * Calls /api/analyze with the user's auth token.
 * Returns { summary, patterns, recommendations }
 */
export async function fetchAIAnalysis() {
    // Get the current session to extract the access token
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        throw new Error('You must be logged in to get AI analysis.');
    }

    // Call the serverless function (same domain, no CORS issues)
    const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get AI analysis.');
    }

    return response.json();
}
