// server/server.js
// Main Express server for Luna AI analysis backend.
// Exposes a single POST /analyze endpoint that:
//   1. Validates the user's Supabase auth token
//   2. Fetches their cycle data from Supabase
//   3. Sends it to Google Gemini for analysis
//   4. Returns the structured AI response

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { supabaseAdmin } from './supabaseAdmin.js';
import { analyzeCycleData, chatWithGemini } from './gemini.js';

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---

// Parse JSON request bodies
app.use(express.json());

// Allow requests from the frontend (localhost for dev, Vercel URL for production)
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['POST', 'GET'],
    credentials: true
}));

// --- Helper: verify auth token and get user ---
async function authenticateUser(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: 'Missing or invalid authorization token.' };
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return { error: 'Invalid or expired token.' };
    return { user };
}

// --- Helper: fetch user data from Supabase ---
async function fetchUserData(userId) {
    const [profileRes, cycleRes] = await Promise.all([
        supabaseAdmin.from('users_profile').select('full_name, email').eq('id', userId).single(),
        supabaseAdmin.from('cycle_entries').select('*').eq('user_id', userId)
            .order('period_start_date', { ascending: false }).limit(50)
    ]);
    return {
        profile: profileRes.data || { full_name: 'User' },
        cycleEntries: cycleRes.data || []
    };
}

// --- Routes ---

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'Luna AI server is running' });
});

/**
 * POST /analyze
 * Returns structured analysis: { summary, patterns, recommendations }
 */
app.post('/analyze', async (req, res) => {
    try {
        const auth = await authenticateUser(req);
        if (auth.error) return res.status(401).json({ error: auth.error });

        const { profile, cycleEntries } = await fetchUserData(auth.user.id);
        const analysis = await analyzeCycleData(cycleEntries, profile);
        return res.json(analysis);
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

/**
 * POST /chat
 * Expects: { question: string, history: [{ role, text }] }
 * Returns: { reply: string }
 */
app.post('/chat', async (req, res) => {
    try {
        // Step 1: Authenticate the user
        const auth = await authenticateUser(req);
        if (auth.error) return res.status(401).json({ error: auth.error });

        // Step 2: Extract the question and conversation history from the request
        const { question, history } = req.body;
        if (!question || typeof question !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid question.' });
        }

        // Step 3: Fetch the user's data from Supabase
        const { profile, cycleEntries } = await fetchUserData(auth.user.id);

        // Step 4: Send everything to Gemini and get a reply
        const reply = await chatWithGemini(question, cycleEntries, profile, history || []);

        // Step 5: Return the reply
        return res.json({ reply });
    } catch (err) {
        console.error('Chat error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// --- Start the server ---
app.listen(PORT, () => {
    console.log(`Luna AI server running on http://localhost:${PORT}`);
});

