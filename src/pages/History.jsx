import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Trash2, ChevronRight } from 'lucide-react';

const History = ({ cycleEntries = [], onDeleteEntry, onSelectMonth }) => {
    const [expandedMonth, setExpandedMonth] = useState(null);

    const formatDateStr = (dateStr) => {
        const d = new Date(dateStr.replace(/-/g, '/'));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getPhaseColor = (phase) => {
        if (phase?.includes('period')) return 'var(--color-period)';
        if (phase === 'ovulation') return 'var(--color-ovulation)';
        if (phase === 'pms') return 'var(--color-pms)';
        return 'var(--color-safe)';
    };

    const getPhaseGlow = (phase) => {
        if (phase?.includes('period')) return 'rgba(255, 126, 185, 0.4)';
        if (phase === 'ovulation') return 'rgba(255, 230, 240, 0.4)';
        if (phase === 'pms') return 'rgba(224, 195, 252, 0.4)';
        return 'rgba(195, 252, 224, 0.4)';
    };

    const formatPhaseName = (phase) => {
        if (!phase) return 'Logged Entry';
        if (phase === 'period_start') return 'Period Started';
        if (phase === 'period_end') return 'Period Ended';
        return phase.charAt(0).toUpperCase() + phase.slice(1) + ' Phase';
    };

    // Group entries by month
    const groupedByMonth = useMemo(() => {
        const displayEntries = cycleEntries.filter(e => e.phase !== 'safe' || e.mood || e.notes || (e.symptoms && e.symptoms.length > 0));

        const groups = {};
        displayEntries.forEach(entry => {
            const d = new Date(entry.period_start_date.replace(/-/g, '/'));
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!groups[key]) {
                groups[key] = {
                    key,
                    label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                    entries: [],
                };
            }
            groups[key].entries.push(entry);
        });

        // Sort months descending (most recent first)
        return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key));
    }, [cycleEntries]);

    const monthIcons = ['🌸', '💐', '🌷', '🌺', '🌻', '🌼', '🍂', '🍁', '❄️', '☀️', '🌙', '✨'];

    const handleToggleMonth = (key) => {
        setExpandedMonth(prev => (prev === key ? null : key));
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="page-wrapper"
        >
            <header style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 500, opacity: 0.6, marginBottom: '4px' }}>Insights</h2>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.03em' }}>Log <span className="gradient-text" style={{ background: 'var(--grad-period)', WebkitBackgroundClip: 'text' }}>History</span></h1>
            </header>

            {groupedByMonth.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', opacity: 0.5 }}>
                    <p>No history entries found.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '100px' }}>
                    {groupedByMonth.map((group, gi) => {
                        const isExpanded = expandedMonth === group.key;
                        const monthNum = parseInt(group.key.split('-')[1], 10) - 1;
                        const icon = monthIcons[monthNum % monthIcons.length];

                        return (
                            <motion.div
                                key={group.key}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(gi * 0.06, 0.4) }}
                            >
                                {/* Month Header Button */}
                                <motion.button
                                    onClick={() => handleToggleMonth(group.key)}
                                    className="glass"
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        width: '100%',
                                        padding: '20px 24px',
                                        borderRadius: '24px',
                                        border: isExpanded ? '1px solid rgba(255, 126, 185, 0.3)' : '1px solid var(--glass-border)',
                                        background: isExpanded
                                            ? 'rgba(255, 126, 185, 0.08)'
                                            : 'var(--card-bg)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        color: 'inherit',
                                        textAlign: 'left',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '16px',
                                            background: isExpanded ? 'var(--grad-period)' : 'var(--glass-bg)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.3rem',
                                            transition: 'all 0.3s ease',
                                        }}>
                                            {icon}
                                        </div>
                                        <div>
                                            <p style={{
                                                fontSize: '1.1rem',
                                                fontWeight: 600,
                                                margin: 0,
                                                letterSpacing: '-0.01em',
                                            }}>
                                                {group.label}
                                            </p>
                                            <p style={{
                                                fontSize: '0.8rem',
                                                opacity: 0.5,
                                                margin: '2px 0 0 0',
                                            }}>
                                                {group.entries.length} {group.entries.length === 1 ? 'entry' : 'entries'}
                                            </p>
                                        </div>
                                    </div>

                                    <motion.div
                                        animate={{ rotate: isExpanded ? 90 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        style={{ opacity: 0.5 }}
                                    >
                                        <ChevronRight size={20} />
                                    </motion.div>
                                </motion.button>

                                {/* Expanded entries for this month */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div style={{ paddingTop: '8px', paddingLeft: '12px' }}>
                                                <div className="timeline-container" style={{ position: 'relative' }}>
                                                    <div className="timeline-line" />

                                                    {group.entries.map((entry, i) => (
                                                        <motion.div
                                                            key={entry.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: Math.min(i * 0.05, 0.3) }}
                                                            className="timeline-item"
                                                        >
                                                            <div className="timeline-node-container">
                                                                <div
                                                                    className="timeline-node active-glow"
                                                                    style={{
                                                                        background: getPhaseColor(entry.phase),
                                                                        '--glow-color': getPhaseGlow(entry.phase)
                                                                    }}
                                                                />
                                                            </div>

                                                            <div className="timeline-content">
                                                                <motion.div
                                                                    className="timeline-card"
                                                                    whileHover={{ scale: 1.01 }}
                                                                    style={{ position: 'relative' }}
                                                                >
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                        <div>
                                                                            <h4 style={{ textTransform: 'capitalize' }}>{formatPhaseName(entry.phase)}</h4>
                                                                            <p>{formatDateStr(entry.period_start_date)}</p>
                                                                        </div>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); onDeleteEntry(entry.id); }}
                                                                            style={{
                                                                                background: 'rgba(255, 75, 75, 0.1)',
                                                                                border: 'none',
                                                                                color: '#ff4b4b',
                                                                                width: '32px',
                                                                                height: '32px',
                                                                                borderRadius: '50%',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                cursor: 'pointer',
                                                                                transition: 'all 0.2s'
                                                                            }}
                                                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 75, 75, 0.2)'}
                                                                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 75, 75, 0.1)'}
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>

                                                                    {(entry.mood || entry.notes || (entry.symptoms && entry.symptoms.length > 0)) && (
                                                                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--divider)' }}>
                                                                            {entry.mood && (
                                                                                <div style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
                                                                                    <span style={{ opacity: 0.6 }}>Mood: </span>
                                                                                    <span style={{ fontSize: '1.2rem' }}>{entry.mood}</span>
                                                                                </div>
                                                                            )}
                                                                            {entry.symptoms && entry.symptoms.length > 0 && (
                                                                                <div style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
                                                                                    <span style={{ opacity: 0.6 }}>Symptoms: </span>
                                                                                    <span style={{ fontWeight: 500 }}>{entry.symptoms.join(', ')}</span>
                                                                                </div>
                                                                            )}
                                                                            {entry.notes && (
                                                                                <div style={{ fontSize: '0.9rem', opacity: 0.8, fontStyle: 'italic', background: 'var(--bg-subtle)', padding: '12px', borderRadius: '12px' }}>
                                                                                    "{entry.notes}"
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default History;
