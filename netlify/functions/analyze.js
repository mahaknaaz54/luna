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
                summary: "Luna AI is not configured yet. Missing GEMINI_API_KEY server environment variable.",
                patterns: ['Please set GEMINI_API_KEY in your Netlify Dashboard Settings.'],
                recommendations: ['Check your project environment configuration.']
            })
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { profile = { full_name: 'User' }, cycleEntries = [] } = body;

        console.log(`Analyzing data for user, entries count: ${cycleEntries.length}`);

        // Return early if not enough data
        if (cycleEntries.length < 2) {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    summary: "You haven't logged enough data yet for AI analysis. Keep tracking your cycle regularly!",
                    patterns: ['Log at least 2-3 cycle entries to unlock personalized AI insights.'],
                    recommendations: ['Try logging your period start date, symptoms, and mood daily for the most accurate insights.']
                })
            };
        }

        // Initialize GoogleGenerativeAI client
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

        // Build the analysis prompt
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

        // Send to Gemini 1.5 Flash (stable, widely available)
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        console.log('Gemini raw response length:', responseText.length);

        // Clean and parse the JSON response
        const cleaned = responseText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        try {
            const analysis = JSON.parse(cleaned);
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(analysis)
            };
        } catch (parseErr) {
            console.error('JSON Parse Error:', parseErr.message, '| Raw:', responseText.substring(0, 300));
            // Fallback: extract JSON block from response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const retryAnalysis = JSON.parse(jsonMatch[0]);
                return {
                    statusCode: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(retryAnalysis)
                };
            }
            throw new Error('AI returned an invalid response format.');
        }

    } catch (err) {
        console.error('Analyze function error:', err.message || String(err));
        const msg = err.message || String(err);

        // Friendly message for rate limits
        if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    summary: "I'm processing a lot of data right now! Please wait a minute and refresh for your insights. 🌙",
                    patterns: ['AI is currently busy.'],
                    recommendations: ['Try refreshing in a moment.']
                })
            };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                summary: 'Unable to generate analysis at this time. Please try again later.',
                patterns: ['Not enough data to identify patterns yet.'],
                recommendations: ['Continue logging your daily symptoms and moods for better insights.'],
                debug: msg
            })
        };
    }
}
