// netlify/functions/chat.js
// Netlify Serverless Function: POST /api/chat -> /.netlify/functions/chat
// Authenticates user, fetches profile & cycle history, and streams/returns chat conversation from Gemini.

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

    // Check for missing environment variables early
    if (missingVars.length > 0) {
        console.error('Missing environment variables:', missingVars.join(', '));
        return jsonResponse({
            reply: "Luna AI is not configured yet. Missing server environment variables: " + missingVars.join(', ') + ". Please set them in Netlify Site Configuration → Environment Variables."
        }, 200);
    }

    try {
        // Step 1: Extract and decode the user's JWT token
        const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return jsonResponse({ error: 'Missing authorization token.' }, 401);
        }

        const token = authHeader.split(' ')[1];
        let userId;
        try {
            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            userId = payload.sub;
            if (!userId) throw new Error('No user ID in token');
        } catch {
            return jsonResponse({ error: 'Invalid token format.' }, 401);
        }

        // Step 2: Extract question and conversation history from request body
        const body = await req.json().catch(() => ({}));
        const { question, history } = body;
        if (!question || typeof question !== 'string') {
            return jsonResponse({ error: 'Missing or invalid question.' }, 400);
        }

        // Step 3: Fetch user's profile and cycle data from Supabase (in parallel)
        const [profileRes, cycleRes] = await Promise.all([
            supabaseAdmin.from('users_profile').select('full_name, email').eq('id', userId).single(),
            supabaseAdmin.from('cycle_entries').select('*').eq('user_id', userId)
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
            model: 'gemini-1.5-flash',
            systemInstruction: systemPrompt
        });

        const result = await model.generateContent({ contents });
        const reply = result.response.text();

        // Step 7: Return the reply
        return jsonResponse({ reply }, 200);

    } catch (err) {
        console.error('Chat error:', err);

        const msg = err.message || String(err);
        if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
            return jsonResponse({
                reply: "I'm getting a lot of questions right now! Please wait a minute and try again. 🌙"
            }, 429);
        }

        return jsonResponse({
            reply: "I'm having trouble right now. Please try again in a moment.",
            debug: msg
        }, 500);
    }
};
