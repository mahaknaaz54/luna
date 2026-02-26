// api/analyze.js
// Vercel Serverless Function: POST /api/analyze
// Authenticates the user, fetches their cycle data, sends it to Gemini for structured analysis.

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Validate required environment variables ---
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const missingVars = [];
if (!SUPABASE_URL) missingVars.push('SUPABASE_URL');
if (!SUPABASE_SERVICE_ROLE_KEY) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
if (!GEMINI_API_KEY) missingVars.push('GEMINI_API_KEY');

// --- Initialize clients (only if env vars are present) ---
const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // --- Check for missing env vars early ---
    if (missingVars.length > 0) {
        console.error('Missing environment variables:', missingVars.join(', '));
        return res.status(200).json({
            summary: "Luna AI is not configured yet. Missing server environment variables: " + missingVars.join(', '),
            patterns: ['Please set them in Vercel Dashboard → Settings → Environment Variables.'],
            recommendations: ['Add GEMINI_API_KEY and SUPABASE_SERVICE_ROLE_KEY to your environment.']
        });
    }

    try {
        // Step 1: Authenticate the user
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing authorization token.' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid or expired token.' });
        }

        // Step 2: Fetch user data from Supabase
        const [profileRes, cycleRes] = await Promise.all([
            supabaseAdmin.from('users_profile').select('full_name, email').eq('id', user.id).single(),
            supabaseAdmin.from('cycle_entries').select('*').eq('user_id', user.id)
                .order('period_start_date', { ascending: false }).limit(50)
        ]);

        const profile = profileRes.data || { full_name: 'User' };
        const cycleEntries = cycleRes.data || [];

        // Step 3: Build the analysis prompt
        const prompt = `
You are a women's health assistant AI built into a period tracking app called Luna.
Analyze the following user cycle data and provide helpful, empathetic insights.

User Profile:
${JSON.stringify(profile, null, 2)}

Cycle History (${cycleEntries.length} entries):
${JSON.stringify(cycleEntries, null, 2)}

Respond in this exact JSON format (no markdown, no code fences, just raw JSON):
{
  "summary": "A 2-3 sentence overview of the user's cycle health and patterns.",
  "patterns": [
    "Pattern 1 observed in the data",
    "Pattern 2 observed in the data",
    "Pattern 3 observed in the data"
  ],
  "recommendations": [
    "Recommendation 1 based on the patterns",
    "Recommendation 2 based on the patterns",
    "Recommendation 3 based on the patterns"
  ]
}

Rules:
- Be warm, supportive, and non-medical (you are not a doctor).
- If there is not enough data, say so honestly and encourage continued logging.
- Keep each pattern and recommendation to 1 sentence.
- Always return valid JSON.
`;

        // Step 4: Send to Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Step 5: Clean and parse the JSON response
        const cleaned = responseText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        try {
            const analysis = JSON.parse(cleaned);
            return res.status(200).json(analysis);
        } catch (parseErr) {
            console.error('JSON Parse Error:', parseErr, 'Raw Text:', responseText);
            // Fallback: If AI fails to return JSON, try to extract it more aggressively
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const retryAnalysis = JSON.parse(jsonMatch[0]);
                return res.status(200).json(retryAnalysis);
            }
            throw new Error('AI returned an invalid response format.');
        }

    } catch (err) {
        console.error('Analyze error:', err);
        const msg = err.message || String(err);

        // Friendly message for rate limits
        if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
            return res.status(200).json({
                summary: "I'm processing a lot of data right now! Please wait a minute and refresh for your insights. 🌙",
                patterns: ['AI is currently busy.'],
                recommendations: ['Try refreshing in a moment.']
            });
        }

        return res.status(200).json({
            summary: 'Unable to generate analysis at this time. Please try again later.',
            patterns: ['Not enough data to identify patterns yet.'],
            recommendations: ['Continue logging your daily symptoms and moods for better insights.'],
            debug: msg // Add debug info for the developer
        });
    }
}
