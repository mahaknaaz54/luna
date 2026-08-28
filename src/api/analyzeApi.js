// src/api/analyzeApi.js
// Frontend helper to call the Netlify serverless function at /api/analyze.

import { supabase } from '../supabaseClient';

/**
 * fetchAIAnalysis
 * Calls /api/analyze with the user's auth token.
 * Returns { summary, patterns, recommendations }
 */
export async function fetchAIAnalysis() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        throw new Error('You must be logged in to get AI analysis.');
    }

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
