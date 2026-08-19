// src/components/ChatBox.jsx
// The chat modal UI: displays messages, handles input, calls the /api/chat serverless function.

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const ChatBox = ({ onClose }) => {
    // Chat message history: [{ role: 'user' | 'ai', text: '...' }]
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hi! I\'m Luna AI. Ask me anything about your cycle, symptoms, or health. I\'ll use your logged data to give you personalized insights. 🌙' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { session } = useAuth();

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Send message to the /api/chat serverless function
    const handleSend = async () => {
        const question = input.trim();
        if (!question || loading) return;

        // Add user message to chat
        setMessages(prev => [...prev, { role: 'user', text: question }]);
        setInput('');
        setLoading(true);

        try {
            // Get the auth token
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession) {
                setMessages(prev => [...prev, { role: 'ai', text: 'You need to be logged in to use the AI assistant.' }]);
                setLoading(false);
                return;
            }

            // Fetch profile and cycle data for the AI context
            const { data: profileData } = await supabase.from('users_profile').select('*').eq('id', currentSession.user.id).single();
            const { data: cycleData } = await supabase.from('cycle_entries').select('*').eq('user_id', currentSession.user.id).order('period_start_date', { ascending: false }).limit(20);

            // Build conversation history for context (last 10 messages)
            const history = messages.slice(-10).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                text: m.text
            }));

            // Call the serverless function
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentSession.access_token}`
                },
                body: JSON.stringify({ 
                    question, 
                    history, 
                    profile: profileData || { full_name: 'there' }, 
                    cycleEntries: cycleData || [] 
                })
            });

            if (!response.ok) {
                // If 404, it likely means the /api/chat route isn't being served (wrong dev command)
                if (response.status === 404) {
                    setMessages(prev => [...prev, {
                        role: 'ai',
                        text: 'Luna AI is having trouble connecting to the backend. If you are developing locally, make sure to run using "vercel dev" instead of "npm run dev".'
                    }]);
                    setLoading(false);
                    return;
                }

                const errData = await response.json().catch(() => ({}));
                // For rate limits, show the friendly message from the server
                if (response.status === 429 && errData.reply) {
                    setMessages(prev => [...prev, { role: 'ai', text: errData.reply }]);
                    setLoading(false);
                    return;
                }
                const debugInfo = [errData.debug, errData.hint].filter(Boolean).join(' | ');
                throw new Error(debugInfo || errData.error || 'Failed to get response');
            }

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
        } catch (err) {
            console.error('Chat error:', err);
            const errorMsg = err.message === 'Failed to fetch'
                ? 'Could not connect to the AI server. Please check your internet or run "vercel dev".'
                : `Error: ${err.message}`;
            setMessages(prev => [...prev, { role: 'ai', text: errorMsg }]);
        } finally {
            setLoading(false);
        }
    };

    // Handle Enter key to send
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <motion.div
            className="chat-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="chat-box"
                initial={{ y: 40, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 40, opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="chat-header">
                    <div className="chat-header-info">
                        <div className="chat-header-avatar">🌙</div>
                        <div>
                            <h4>Luna AI</h4>
                            <p>Your health companion</p>
                        </div>
                    </div>
                    <button className="chat-close-btn" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                {/* Messages */}
                <div className="chat-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`chat-msg ${msg.role}`}>
                            {msg.text}
                        </div>
                    ))}
                    {loading && (
                        <div className="chat-typing">Luna is thinking...</div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="chat-input-area">
                    <input
                        className="chat-input"
                        type="text"
                        placeholder="Ask Luna anything..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                    />
                    <button
                        className="chat-send-btn"
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ChatBox;
