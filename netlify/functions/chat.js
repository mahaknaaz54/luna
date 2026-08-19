import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Validate required environment variables ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function handler(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    if (!GEMINI_API_KEY) {
        console.error('Missing GEMINI_API_KEY environment variable.');
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reply: "Luna AI is not configured yet. Missing GEMINI_API_KEY server environment variable. Please set it in Netlify Dashboard → Site configuration → Environment variables."
            })
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { question, history, profile = { full_name: 'there' }, cycleEntries = [] } = body;

        if (!question || typeof question !== 'string') {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing or invalid question.' })
            };
        }

        // Initialize GoogleGenerativeAI client
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

        // Build the system prompt
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

        // Build conversation history for multi-turn chat
        const contents = [];
        for (const msg of (history || [])) {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            });
        }
        contents.push({ role: 'user', parts: [{ text: question }] });

        // Send to Gemini with system instruction
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction: systemPrompt
        });

        const result = await model.generateContent({ contents });
        const reply = result.response.text();

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reply })
        };

    } catch (err) {
        console.error('Chat function error:', err);

        const msg = err.message || String(err);
        if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
            return {
                statusCode: 429,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reply: "I'm getting a lot of questions right now! Please wait a minute and try again. 🌙"
                })
            };
        }

        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reply: "I'm having trouble right now. Please try again in a moment.",
                debug: msg
            })
        };
    }
}
