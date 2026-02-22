import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

const History = ({ cycleEntries = [], onDeleteEntry, onSelectMonth }) => {
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

    // Filter to only show entries that have some meaningful content, though technically all do.
    const displayEntries = cycleEntries.filter(e => e.phase !== 'safe' || e.mood || e.notes || (e.symptoms && e.symptoms.length > 0));

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

            {displayEntries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', opacity: 0.5 }}>
                    <p>No history entries found.</p>
                </div>
            ) : (
                <div className="timeline-container">
                    <div className="timeline-line" />

                    {displayEntries.map((entry, i) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(i * 0.05, 0.5) }}
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
                                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
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
                                                <div style={{ fontSize: '0.9rem', opacity: 0.8, fontStyle: 'italic', background: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '12px' }}>
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
            )}
        </motion.div>
    );
};

export default History;
