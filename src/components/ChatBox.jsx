// src/components/ChatBox.jsx
// The chat modal UI: displays messages, handles input, and calls the Netlify serverless function.

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ChatBox = ({ onClose }) => {
    const [messages, setMessages] = useState([
        { role: 'ai', text: "Hi! I'm Luna AI. Ask me anything about your cycle, symptoms, or health. I'll use your logged data to give you personalized insights. 🌙" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Send message to the /api/chat serverless function
    const handleSend = async () => {
        const question = input.trim();
        if (!question || loading) return;

        setMessages(prev => [...prev, { role: 'user', text: question }]);
        setInput('');
        setLoading(true);

        try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession) {
                setMessages(prev => [...prev, { role: 'ai', text: 'You need to be logged in to use the AI assistant.' }]);
                setLoading(false);
                return;
            }

            // Build conversation history for context (last 10 messages)
            const history = messages.slice(-10).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                text: m.text
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentSession.access_token}`
                },
                body: JSON.stringify({ question, history })
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setMessages(prev => [...prev, {
                        role: 'ai',
                        text: 'Luna AI is having trouble connecting to the backend. Please check your network connection or server status.'
                    }]);
                    setLoading(false);
                    return;
                }

                const errData = await response.json().catch(() => ({}));
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
                ? 'Could not connect to the AI server. Please check your internet connection.'
                : `Error: ${err.message}`;
            setMessages(prev => [...prev, { role: 'ai', text: errorMsg }]);
        } finally {
            setLoading(false);
        }
    };

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
                    <button className="chat-close-btn" onClick={onClose} aria-label="Close chat">
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
                        aria-label="Send message"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ChatBox;
