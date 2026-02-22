import { motion } from 'framer-motion';
import HeatmapCalendar from '../components/HeatmapCalendar';
import InsightCard from '../components/InsightCard';

const Insights = ({ viewDate, onViewDateChange, periodDays, onDateClick, phase, symptomLogs, calculatePhase }) => {
    const mockInsights = [
        { id: 1, text: "You usually feel low energy 2 days before your period.", icon: "⚡" },
        { id: 2, text: "Your ovulation phase averages 4 days.", icon: "✨" },
        { id: 3, text: "Your cycle has been consistent this month.", icon: "🌙" }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="page-wrapper"
        >
            <header style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 500, opacity: 0.6, marginBottom: '4px' }}>Insights</h2>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.03em' }}>Cycle <span className="gradient-text" style={{ background: 'var(--grad-ovulation)', WebkitBackgroundClip: 'text' }}>Overview</span></h1>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '100px' }}>
                <HeatmapCalendar
                    viewDate={viewDate}
                    onViewDateChange={onViewDateChange}
                    periodDays={periodDays}
                    onDateClick={onDateClick}
                    phase={phase}
                    symptomLogs={symptomLogs}
                    calculatePhase={calculatePhase}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px', opacity: 0.8 }}>AI Insights</h3>
                    {mockInsights.map((insight, index) => (
                        <InsightCard
                            key={insight.id}
                            insight={insight.text}
                            phase={phase}
                            icon={insight.icon}
                        />
                    ))}
                </div>

                <div className="glass" style={{ padding: '24px', borderRadius: '32px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Upcoming Predictions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '16px', background: 'var(--grad-ovulation)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>🌸</div>
                                <div>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Ovulation Window</p>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Estimated in 5 days</p>
                                </div>
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.8 }}>Feb 26 - Mar 2</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '16px', background: 'var(--grad-period)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>🩸</div>
                                <div>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Next Period</p>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Expected in 15 days</p>
                                </div>
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.8 }}>Mar 10</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Insights;
