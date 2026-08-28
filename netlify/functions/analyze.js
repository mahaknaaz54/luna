// netlify/functions/analyze.js
// Netlify Serverless Function: POST /api/analyze -> /.netlify/functions/analyze
// Authenticates the user via Supabase, fetches their cycle data, and generates structured AI analysis with Gemini.

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const missingVars = [];
if (!SUPABASE_URL) missingVars.push('SUPABASE_URL');
if (!SUPABASE_SERVICE_ROLE_KEY) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
if (!GEMINI_API_KEY) missingVars.push('GEMINI_API_KEY');

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

const genAI = GEMINI_API_KEY
    ? new GoogleGenerativeAI(GEMINI_API_KEY)
    : null;

const jsonResponse = (data, status = 200) => {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
        }
    });
};

export default async (req) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    // Check for missing environment variables
    if (missingVars.length > 0) {
        console.error('Missing environment variables:', missingVars.join(', '));
        return jsonResponse({
            summary: "Luna AI is not configured yet. Missing server environment variables: " + missingVars.join(', '),
            patterns: ['Please set them in Netlify Site Configuration → Environment Variables.'],
            recommendations: ['Add GEMINI_API_KEY and SUPABASE_SERVICE_ROLE_KEY to your environment.']
        }, 200);
    }

    try {
        // Step 1: Authenticate the user
        const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return jsonResponse({ error: 'Missing authorization token.' }, 401);
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            console.error('Auth error:', authError?.message);
            return jsonResponse({ error: 'Invalid or expired token.' }, 401);
        }

        // Step 2: Fetch user data from Supabase
        const [profileRes, cycleRes] = await Promise.all([
            supabaseAdmin.from('users_profile').select('full_name, email').eq('id', user.id).single(),
            supabaseAdmin.from('cycle_entries').select('*').eq('user_id', user.id)
                .order('period_start_date', { ascending: false }).limit(50)
        ]);

        if (profileRes.error) console.warn('Profile fetch warning:', profileRes.error.message);
        if (cycleRes.error) console.warn('Cycle entries fetch warning:', cycleRes.error.message);

        const profile = profileRes.data || { full_name: 'User' };
        const cycleEntries = cycleRes.data || [];

        // Return early if not enough data
        if (cycleEntries.length < 2) {
            return jsonResponse({
                summary: "You haven't logged enough data yet for AI analysis. Keep tracking your cycle regularly!",
                patterns: ['Log at least 2-3 cycle entries to unlock personalized AI insights.'],
                recommendations: ['Try logging your period start date, symptoms, and mood daily for the most accurate insights.']
            }, 200);
        }

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

        // Step 4: Send to Gemini 1.5 Flash (stable, fast)
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Step 5: Clean and parse the JSON response
        const cleaned = responseText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        try {
            const analysis = JSON.parse(cleaned);
            return jsonResponse(analysis, 200);
        } catch (parseErr) {
            console.error('JSON Parse Error:', parseErr.message, '| Raw:', responseText.substring(0, 300));
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const retryAnalysis = JSON.parse(jsonMatch[0]);
                return jsonResponse(retryAnalysis, 200);
            }
            throw new Error('AI returned an invalid response format.');
        }

    } catch (err) {
        console.error('Analyze error:', err.message || String(err));
        const msg = err.message || String(err);

        if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
            return jsonResponse({
                summary: "I'm processing a lot of data right now! Please wait a minute and refresh for your insights. 🌙",
                patterns: ['AI is currently busy.'],
                recommendations: ['Try refreshing in a moment.']
            }, 200);
        }

        return jsonResponse({
            summary: 'Unable to generate analysis at this time. Please try again later.',
            patterns: ['Not enough data to identify patterns yet.'],
            recommendations: ['Continue logging your daily symptoms and moods for better insights.'],
            debug: msg
        }, 200);
    }
};
