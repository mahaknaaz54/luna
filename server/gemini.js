// server/gemini.js
// Handles communication with the Google Gemini API.
// Takes structured user cycle data and returns an AI-generated analysis.

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

// Validate API key is present
if (!apiKey) {
    console.error('Missing GEMINI_API_KEY in environment variables.');
    process.exit(1);
}

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(apiKey);

// Use a fast, capable model for structured analysis
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

/**
 * analyzeCycleData
 * Sends user cycle history to Gemini and returns a structured analysis.
 *
 * @param {Array} cycleEntries - Array of cycle_entries rows from Supabase
 * @param {Object} profile - The user's profile data (name, etc.)
 * @returns {Object} - { summary, patterns, recommendations }
 */
export async function analyzeCycleData(cycleEntries, profile) {
    // Build a clear prompt with the user's data as JSON
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

    try {
        // Send the prompt to Gemini
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean response: strip markdown code fences if Gemini wraps it
        const cleaned = responseText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        // Parse the JSON response from Gemini
        const analysis = JSON.parse(cleaned);
        return analysis;
    } catch (err) {
        console.error('Gemini API error:', err.message);

        // Return a safe fallback if Gemini fails
        return {
            summary: 'Unable to generate analysis at this time. Please try again later.',
            patterns: ['Not enough data to identify patterns yet.'],
            recommendations: ['Continue logging your daily symptoms and moods for better insights.']
        };
    }
}

/**
 * chatWithGemini
 * Conversational chat: sends user question + their data + history to Gemini.
 * Returns a natural language text reply.
 *
 * @param {string} question - The user's current question
 * @param {Array} cycleEntries - User's cycle data from Supabase
 * @param {Object} profile - User's profile data
 * @param {Array} history - Previous conversation turns [{ role, text }]
 * @returns {string} - AI reply text
 */
export async function chatWithGemini(question, cycleEntries, profile, history) {
    // System instruction: defines Luna AI's personality and behavior
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

    // Build the conversation history for multi-turn chat
    const contents = [];

    // Add previous conversation turns
    for (const msg of history) {
        contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        });
    }

    // Add the current question
    contents.push({
        role: 'user',
        parts: [{ text: question }]
    });

    try {
        // Create a model instance with the system instruction baked in
        const chatModel = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction: systemPrompt
        });

        // Send the full conversation to Gemini
        const result = await chatModel.generateContent({ contents });
        const reply = result.response.text();

        return reply;
    } catch (err) {
        console.error('Gemini chat error:', err.message);
        return "I'm having trouble processing your request right now. Please try again in a moment.";
    }
}

