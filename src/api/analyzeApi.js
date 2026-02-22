// src/api/analyzeApi.js
// Frontend helper to call the Luna AI analysis backend.
// Sends the user's Supabase auth token to the server for secure verification.

import { supabase } from '../supabaseClient';

// Backend URL — update this to your deployed server URL in production
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * fetchAIAnalysis
 * Calls the backend /analyze endpoint with the user's auth token.
 * The server fetches user data from Supabase, sends it to Gemini,
 * and returns the structured AI analysis.
 *
 * @returns {Object} - { summary, patterns, recommendations }
 */
export async function fetchAIAnalysis() {
    // Get the current session to extract the access token
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        throw new Error('You must be logged in to get AI analysis.');
    }

    // Call the backend /analyze endpoint with the user's token
    const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
        }
    });

    // Handle non-OK responses
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get AI analysis.');
    }

    // Return the parsed analysis
    return response.json();
}
