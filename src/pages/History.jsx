import { motion } from 'framer-motion';

const History = ({ onSelectMonth }) => {
    const pastCycles = [
        {
            month: 'February',
            start: 'Feb 08',
            duration: '28 days',
            period: '5 days',
            year: 2026,
            monthIdx: 1,
            phase: 'period',
            color: 'var(--color-period)',
            glow: 'rgba(255, 126, 185, 0.4)',
            active: true
        },
        {
            month: 'January',
            start: 'Jan 10',
            duration: '28 days',
            period: '5 days',
            year: 2026,
            monthIdx: 0,
            phase: 'ovulation',
            color: 'var(--color-ovulation)',
            glow: 'rgba(255, 230, 240, 0.4)',
            active: false
        },
        {
            month: 'December',
            start: 'Dec 12',
            duration: '29 days',
            period: '6 days',
            year: 2025,
            monthIdx: 11,
            phase: 'pms',
            color: 'var(--color-pms)',
            glow: 'rgba(224, 195, 252, 0.4)',
            active: false
        },
        {
            month: 'November',
            start: 'Nov 14',
            duration: '28 days',
            period: '5 days',
            year: 2025,
            monthIdx: 10,
            phase: 'safe',
            color: 'var(--color-safe)',
            glow: 'rgba(195, 252, 224, 0.4)',
            active: false
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="page-wrapper"
        >
            <header style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 500, opacity: 0.6, marginBottom: '4px' }}>Insights</h2>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.03em' }}>Cycle <span className="gradient-text" style={{ background: 'var(--grad-period)', WebkitBackgroundClip: 'text' }}>History</span></h1>
            </header>

            <div className="timeline-container">
                <div className="timeline-line" />

                {pastCycles.map((cycle, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="timeline-item"
                    >
                        <div className="timeline-node-container">
                            <div
                                className={`timeline-node ${cycle.active ? 'active-glow' : ''}`}
                                style={{
                                    background: cycle.color,
                                    '--glow-color': cycle.glow
                                }}
                            />
                        </div>

                        <div className="timeline-content">
                            <motion.div
                                className="timeline-card"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onSelectMonth(cycle.year, cycle.monthIdx)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h4>{cycle.month} {cycle.year}</h4>
                                        <p>Started on {cycle.start}</p>
                                    </div>
                                </div>

                                <div className="timeline-stats">
                                    <div className="timeline-stat-item">
                                        <span className="timeline-stat-label">Cycle Length</span>
                                        <span className="timeline-stat-value">{cycle.duration}</span>
                                    </div>
                                    <div className="timeline-stat-item" style={{ textAlign: 'right' }}>
                                        <span className="timeline-stat-label">Period</span>
                                        <span className="timeline-stat-value">{cycle.period}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="glass" style={{ padding: '24px', borderRadius: '32px', marginTop: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px' }}>Monthly Stats</h3>
                <div className="responsive-grid">
                    <div style={{ background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '24px', textAlign: 'center' }}>
                        <span className="timeline-stat-label" style={{ display: 'block', marginBottom: '4px' }}>Avg. Cycle</span>
                        <span style={{ fontSize: '1.4rem', fontWeight: 600 }}>28.3 <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>d</span></span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '24px', textAlign: 'center' }}>
                        <span className="timeline-stat-label" style={{ display: 'block', marginBottom: '4px' }}>Avg. Period</span>
                        <span style={{ fontSize: '1.4rem', fontWeight: 600 }}>5.2 <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>d</span></span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default History;
