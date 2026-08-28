import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CycleOrb from '../components/CycleOrb';
import { getGreeting } from '../utils/dateUtils';

const BURST_EMOJIS = ['🌸', '✨', '💧', '☁️', '🌙'];

const Home = ({ data, phase, currentDay, cycleLength, isCareMode }) => {
    const [emojis, setEmojis] = useState([]);
    const greeting = useMemo(() => getGreeting(), []);

    const handleLogClick = () => {
        const newEmoji = {
            id: Date.now() + Math.random(),
            char: BURST_EMOJIS[Math.floor(Math.random() * BURST_EMOJIS.length)],
            x: Math.random() * 100 - 50,
        };
        setEmojis(prev => [...prev, newEmoji]);
        setTimeout(() => {
            setEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
        }, 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="page-wrapper"
            style={{ position: 'relative' }}
        >
            <header style={{ marginBottom: '32px' }}>
                <motion.h2
                    initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                    animate={{ opacity: 0.6, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '4px', textShadow: '0 0 20px rgba(255,255,255,0.5)' }}
                >
                    Luna 🌙
                </motion.h2>
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.03em' }}
                >
                    {greeting}, <span className="gradient-text" style={{ background: 'var(--grad-period)', WebkitBackgroundClip: 'text' }}>Beautiful.</span>
                </motion.h1>
            </header>

            <AnimatePresence>
                {isCareMode && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass"
                        style={{
                            padding: '16px 24px',
                            borderRadius: '24px',
                            marginBottom: '24px',
                            border: '1px solid var(--color-pms)',
                            background: 'var(--glass-bg)',
                            textAlign: 'center'
                        }}
                    >
                        <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)', opacity: 0.8 }}>
                            You deserve a moment of calm today. We've slowed things down for you. ✨
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(15px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                >
                    <CycleOrb
                        currentDay={currentDay}
                        totalDays={cycleLength}
                        phase={phase}
                        isCareMode={isCareMode}
                    />
                </motion.div>

                <motion.div
                    className="glass"
                    whileHover={{ scale: 1.02 }}
                    style={{ padding: '24px', borderRadius: '32px', width: '100%', textAlign: 'center' }}
                >
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', opacity: 0.8 }}>Today's Reflection</h3>
                    <p style={{ fontSize: '0.95rem', fontStyle: 'italic', lineHeight: 1.6, opacity: 0.7 }}>
                        "{data?.msg}"
                    </p>
                </motion.div>

                <div className="responsive-grid" style={{ position: 'relative' }}>
                    <div className="glass" style={{ padding: '24px', borderRadius: '32px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.4, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Phase info</span>
                        <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{data?.extra}</p>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogClick}
                            className="glass"
                            style={{
                                width: '100%',
                                height: '100%',
                                padding: '24px',
                                borderRadius: '32px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                background: 'rgba(255, 126, 185, 0.1)',
                                border: '1px solid rgba(255, 126, 185, 0.2)'
                            }}
                        >
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-period)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', opacity: 0.8 }}>Quick Log</span>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-period)' }}>Burst ✨</p>
                        </motion.button>

                        <AnimatePresence>
                            {emojis.map(emoji => (
                                <motion.span
                                    key={emoji.id}
                                    initial={{ opacity: 0, y: 0, x: emoji.x, scale: 0.5 }}
                                    animate={{ opacity: 1, y: -100, x: emoji.x * 1.5, scale: 1.2 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    style={{
                                        position: 'absolute',
                                        top: '0',
                                        left: '50%',
                                        fontSize: '1.5rem',
                                        pointerEvents: 'none',
                                        zIndex: 10
                                    }}
                                >
                                    {emoji.char}
                                </motion.span>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </section>
        </motion.div>
    );
};

export default Home;
