import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeatmapCalendar = ({ viewDate, onViewDateChange, periodDays, onDateClick, phase, symptomLogs, calculatePhase }) => {
    const [pulsingDate, setPulsingDate] = useState(null);

    const handleDateClick = (dateStr) => {
        setPulsingDate(dateStr);
        onDateClick(dateStr);
        // Reset pulsing after animation completes
        setTimeout(() => setPulsingDate(null), 1000);
    };
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const getPhaseGradient = (dateStr) => {
        const { currentPhase } = calculatePhase(new Date(dateStr.replace(/-/g, '/')));

        if (currentPhase === 'period') return 'var(--grad-period)';
        if (currentPhase === 'ovulation') return 'var(--grad-ovulation)';
        if (currentPhase === 'pms') return 'var(--grad-pms)';
        return 'var(--grad-safe)';
    };

    const getOpacity = (day) => {
        // Simulate intensity variations (e.g., flow strength or symptom severity)
        const intensities = [0.4, 0.7, 0.9, 1, 0.8, 0.6];
        return intensities[day % intensities.length];
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass"
            style={{
                padding: '24px',
                borderRadius: '32px',
                width: '100%',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {monthNames[currentMonth]} {currentYear}
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onViewDateChange(new Date(currentYear, currentMonth - 1, 1))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)' }}
                    >
                        <ChevronLeft size={20} />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onViewDateChange(new Date(currentYear, currentMonth + 1, 1))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)' }}
                    >
                        <ChevronRight size={20} />
                    </motion.button>
                </div>
            </div>

            <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', minWidth: '280px', maxWidth: '400px', margin: '0 auto' }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                        <span key={d} style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.4, textAlign: 'center', marginBottom: '8px' }}>
                            {d}
                        </span>
                    ))}

                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();

                        return (
                            <motion.div
                                key={day}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 1.1 }}
                                onClick={() => handleDateClick(dateStr)}
                                style={{
                                    aspectRatio: '1/1',
                                    borderRadius: '50%',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    color: 'var(--text-main)',
                                    boxShadow: isToday ? '0 0 15px var(--color-period)' : 'none',
                                    border: isToday ? '2px solid var(--text-main)' : 'none',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: getPhaseGradient(dateStr),
                                    opacity: getOpacity(day),
                                    zIndex: 0
                                }} />
                                <AnimatePresence>
                                    {pulsingDate === dateStr && (
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0.5 }}
                                            animate={{ scale: 2, opacity: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                borderRadius: '12px',
                                                border: '2px solid white',
                                                pointerEvents: 'none',
                                                zIndex: 1
                                            }}
                                        />
                                    )}
                                </AnimatePresence>
                                <span style={{ position: 'relative', zIndex: 2 }}>{day}</span>
                                {symptomLogs && symptomLogs[dateStr] && symptomLogs[dateStr].emoji && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '4px',
                                        right: '4px',
                                        fontSize: '0.65rem',
                                        zIndex: 3
                                    }}>
                                        {symptomLogs[dateStr].emoji}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {[
                    { label: 'Period', grad: 'var(--grad-period)' },
                    { label: 'Ovulation', grad: 'var(--grad-ovulation)' },
                    { label: 'PMS', grad: 'var(--grad-pms)' },
                    { label: 'Safe', grad: 'var(--grad-safe)' },
                ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.grad }} />
                        <span style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 500 }}>{item.label}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default HeatmapCalendar;
