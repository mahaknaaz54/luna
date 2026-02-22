import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Bell, Calendar, Clock, Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const THEMES = [
    {
        key: 'Auto',
        icon: '✨',
        label: 'Auto',
        sub: 'Time-based',
        // Purple-to-pink gradient for Auto
        activeGrad: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)',
        activeGlow: 'rgba(167,139,250,0.40)',
    },
    {
        key: 'Light',
        icon: '☀️',
        label: 'Light',
        sub: 'Always bright',
        // Golden-amber gradient for Light
        activeGrad: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
        activeGlow: 'rgba(251,191,36,0.40)',
    },
    {
        key: 'Soft Dark',
        icon: '🌙',
        label: 'Dark',
        sub: 'Always cozy',
        // Indigo-violet gradient for Soft Dark
        activeGrad: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        activeGlow: 'rgba(99,102,241,0.45)',
    },
];

const Toggle = ({ on, onToggle }) => (
    <motion.div
        onClick={onToggle}
        style={{
            width: '56px', height: '28px',
            background: on ? 'var(--grad-period)' : 'var(--divider)',
            borderRadius: '20px', padding: '4px', cursor: 'pointer',
            display: 'flex',
            justifyContent: on ? 'flex-end' : 'flex-start',
            alignItems: 'center',
            transition: 'background 0.3s ease',
            flexShrink: 0
        }}
    >
        <motion.div layout transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}
        />
    </motion.div>
);

const Settings = ({ settings, setSettings, onBack }) => {
    const { resolvedTheme } = useTheme();

    const handleToggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    const handleSelect = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

    const autoLabel = resolvedTheme === 'soft-dark' ? '🌙 Dark right now' : '☀️ Light right now';

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="page-wrapper"
        >
            <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px', marginTop: '10px' }}>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onBack}
                    style={{
                        background: 'var(--divider)',
                        border: 'none', borderRadius: '50%',
                        width: '40px', height: '40px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--text-main)'
                    }}
                >
                    <ChevronLeft size={24} />
                </motion.button>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>General Settings</h2>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Notifications */}
                <section className="glass" style={{ padding: '20px 24px', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ color: 'var(--color-ovulation)', opacity: 0.8 }}><Bell size={22} /></div>
                        <div>
                            <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>Notifications</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-soft)', display: 'block' }}>Daily reminders &amp; cycle alerts</span>
                        </div>
                    </div>
                    <Toggle on={settings.notifications} onToggle={() => handleToggle('notifications')} />
                </section>

                {/* Cycle Length */}
                <section className="glass" style={{ padding: '24px', borderRadius: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ color: 'var(--color-safe)', opacity: 0.8 }}><Calendar size={22} /></div>
                        <div>
                            <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>Cycle Length</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-soft)', display: 'block' }}>Average number of days</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input type="range" min="21" max="35"
                            value={settings.cycleLength}
                            onChange={(e) => handleSelect('cycleLength', parseInt(e.target.value))}
                            style={{ flex: 1, accentColor: 'var(--color-period)' }}
                        />
                        <span style={{ fontSize: '1.1rem', fontWeight: 600, width: '60px', textAlign: 'right', color: 'var(--text-main)' }}>{settings.cycleLength} days</span>
                    </div>
                </section>

                {/* Reminder Time */}
                <section className="glass" style={{ padding: '24px', borderRadius: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ color: 'var(--color-pms)', opacity: 0.8 }}><Clock size={22} /></div>
                        <div>
                            <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>Reminder Time</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-soft)', display: 'block' }}>When to send notifications</span>
                        </div>
                    </div>
                    <input type="time"
                        value={settings.reminderTime}
                        onChange={(e) => handleSelect('reminderTime', e.target.value)}
                        style={{
                            width: '100%', padding: '12px 20px', borderRadius: '16px',
                            border: '1px solid var(--glass-border)',
                            background: 'var(--input-bg)',
                            color: 'var(--text-main)',
                            fontSize: '1rem', fontFamily: 'inherit', outline: 'none'
                        }}
                    />
                </section>

                {/* ─── Theme Selector ─── */}
                <section className="glass" style={{ padding: '24px', borderRadius: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ color: 'var(--color-ovulation)', opacity: 0.8 }}><Palette size={22} /></div>
                            <div>
                                <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>Theme</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-soft)', display: 'block' }}>Customize app appearance</span>
                            </div>
                        </div>

                        {/* Live Auto badge */}
                        <AnimatePresence mode="wait">
                            {settings.theme === 'Auto' && (
                                <motion.span
                                    key={autoLabel}
                                    initial={{ opacity: 0, y: -6, scale: 0.88 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.88 }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                    style={{
                                        fontSize: '0.72rem',
                                        color: 'var(--text-soft)',
                                        fontWeight: 600,
                                        background: 'var(--input-bg)',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        border: '1px solid var(--glass-border)',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {autoLabel}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        {THEMES.map(t => {
                            const isActive = settings.theme === t.key;
                            return (
                                <motion.button
                                    key={t.key}
                                    onClick={() => handleSelect('theme', t.key)}
                                    whileTap={{ scale: 0.92 }}
                                    // Spring scale-in animation when selected
                                    animate={isActive
                                        ? { scale: 1.05, transition: { type: 'spring', stiffness: 420, damping: 22 } }
                                        : { scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }
                                    }
                                    style={{
                                        padding: '16px 8px',
                                        borderRadius: '22px',
                                        border: isActive
                                            ? '1.5px solid rgba(255,255,255,0.35)'
                                            : '1.5px solid var(--glass-border)',
                                        background: isActive ? t.activeGrad : 'var(--input-bg)',
                                        color: isActive ? 'white' : 'var(--text-main)',
                                        fontWeight: 600,
                                        fontSize: '0.82rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '6px',
                                        boxShadow: isActive
                                            ? `0 8px 24px ${t.activeGlow}, 0 0 0 0 transparent`
                                            : 'none',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition:
                                            'background 0.5s ease, box-shadow 0.5s ease, border-color 0.4s ease, color 0.4s ease',
                                    }}
                                >
                                    {/* Shimmer sheen on active button */}
                                    {isActive && (
                                        <motion.div
                                            initial={{ x: '-120%', opacity: 0 }}
                                            animate={{ x: '160%', opacity: [0, 0.5, 0] }}
                                            transition={{ duration: 0.7, ease: 'easeInOut' }}
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)',
                                                pointerEvents: 'none',
                                            }}
                                        />
                                    )}

                                    <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{t.icon}</span>
                                    <span style={{ letterSpacing: '0.01em' }}>{t.label}</span>
                                    <span style={{
                                        fontSize: '0.68rem',
                                        opacity: isActive ? 0.85 : 0.45,
                                        fontWeight: 400,
                                    }}>{t.sub}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </section>
            </div>
        </motion.div>
    );
};

export default Settings;
