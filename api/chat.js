// api/chat.js
// Vercel Serverless Function: POST /api/chat
// Authenticates the user, fetches their cycle data, sends it + their question to Gemini.

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Initialize Supabase Admin Client (service role key bypasses RLS) ---
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
        // Step 1: Authenticate the user via their Supabase token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing authorization token.' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid or expired token.' });
        }

        // Step 2: Extract question and conversation history from request body
        const { question, history } = req.body;
        if (!question || typeof question !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid question.' });
        }

        // Step 3: Fetch user's profile and cycle data from Supabase (in parallel)
        const [profileRes, cycleRes] = await Promise.all([
            supabaseAdmin.from('users_profile').select('full_name, email').eq('id', user.id).single(),
            supabaseAdmin.from('cycle_entries').select('*').eq('user_id', user.id)
                .order('period_start_date', { ascending: false }).limit(50)
        ]);

        const profile = profileRes.data || { full_name: 'there' };
        const cycleEntries = cycleRes.data || [];

        // Step 4: Build the system prompt that defines Luna AI's personality
        const systemPrompt = `You are Luna AI, a calm, analytical, and supportive health companion built into a period tracking app.

Your personality:
- Calm, warm, and evidence-based
- Data-aware: you have access to the user's cycle history and use it to personalize responses
- Personal but professional — never overly emotional
- Safe for health discussions — you are NOT a doctor

Rules you MUST follow:
- NEVER diagnose medical conditions
- NEVER prescribe medications or treatments
- Always add a brief disclaimer when discussing health symptoms: "This is informational only — please consult a healthcare professional for medical advice."
- Use the user's data to provide personalized, relevant insights
- If the user asks about something unrelated to health/wellness, politely redirect
- Keep responses concise (2-4 paragraphs max)
- Use simple, clear language
- Be encouraging about continued logging and tracking

User's name: ${profile.full_name || 'there'}

User's cycle data (${cycleEntries.length} entries):
${cycleEntries.length > 0 ? JSON.stringify(cycleEntries.slice(0, 20), null, 2) : 'No entries logged yet.'}
`;

        // Step 5: Build conversation history for multi-turn chat
        const contents = [];
        for (const msg of (history || [])) {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            });
        }
        contents.push({ role: 'user', parts: [{ text: question }] });

        // Step 6: Send to Gemini with system instruction
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction: systemPrompt
        });

        const result = await model.generateContent({ contents });
        const reply = result.response.text();

        // Step 7: Return the reply
        return res.status(200).json({ reply });

    } catch (err) {
        console.error('Chat error:', err);
        return res.status(500).json({ reply: "I'm having trouble right now. Please try again in a moment." });
    }
}
