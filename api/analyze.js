// api/analyze.js
// Vercel Serverless Function: POST /api/analyze
// Authenticates the user, fetches their cycle data, sends it to Gemini for structured analysis.

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Initialize Supabase Admin Client ---
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- Initialize Gemini ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
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
        const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const analysis = JSON.parse(cleaned);

        return res.status(200).json(analysis);

    } catch (err) {
        console.error('Analyze error:', err);
        return res.status(200).json({
            summary: 'Unable to generate analysis at this time. Please try again later.',
            patterns: ['Not enough data to identify patterns yet.'],
            recommendations: ['Continue logging your daily symptoms and moods for better insights.']
        });
    }
}
