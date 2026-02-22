import React from 'react';
import { motion } from 'framer-motion';

/**
 * CycleOrb Component
 * A premium, animated cycle visualization component.
 * 
 * @param {number} currentDay - The current day of the cycle.
 * @param {number} totalDays - The total length of the cycle (default 28).
 * @param {string} phase - The current phase ('period', 'ovulation', 'pms', 'safe').
 */
const CycleOrb = ({ currentDay, totalDays = 28, phase = 'safe', isCareMode }) => {
    const percentage = Math.min(Math.max((currentDay / totalDays) * 100, 0), 100);
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    // Phase-specific colors and glows
    const phaseStyles = {
        period: {
            glow: 'rgba(255, 126, 185, 0.6)',
            start: '#ff7eb9',
            end: '#7d12ff',
            label: 'Period'
        },
        ovulation: {
            glow: 'rgba(251, 194, 235, 0.6)',
            start: '#ffd1ff',
            end: '#a18cd1',
            label: 'Ovulation'
        },
        pms: {
            glow: 'rgba(224, 195, 252, 0.6)',
            start: '#e0c3fc',
            end: '#8ec5fc',
            label: 'PMS'
        },
        safe: {
            glow: 'rgba(150, 230, 161, 0.6)',
            start: '#d4fc79',
            end: '#96e6a1',
            label: 'Follicular'
        }
    };

    const style = phaseStyles[phase] || phaseStyles.safe;

    const containerVariants = {
        animate: {
            y: [0, -12, 0],
            rotate: [-1, 1, -1],
            transition: {
                y: {
                    duration: isCareMode ? 8 : 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                },
                rotate: {
                    duration: isCareMode ? 12 : 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }
            }
        },
        breath: {
            scale: [1, 1.04, 1],
            transition: {
                duration: isCareMode ? 10 : 5,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="orb-container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            padding: '40px 0',
            position: 'relative'
        }}>
            <motion.div
                variants={containerVariants}
                animate={["animate", "breath"]}
                className="orb-main"
                style={{
                    width: '240px',
                    height: '240px',
                    borderRadius: '50%',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: `0 0 ${isCareMode ? '20px' : '40px'} ${style.glow}`,
                    opacity: isCareMode ? 0.9 : 1,
                    transition: 'box-shadow 0.8s ease, opacity 0.8s ease'
                }}
            >
                {/* SVG Progress Ring */}
                <svg
                    width="240"
                    height="240"
                    viewBox="0 0 200 200"
                    style={{
                        position: 'absolute',
                        transform: 'rotate(-90deg)',
                    }}
                >
                    {/* Background circle */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="transparent"
                        stroke="rgba(0,0,0,0.03)"
                        strokeWidth="8"
                    />
                    {/* Animated Progress circle */}
                    <motion.circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="transparent"
                        stroke={`url(#orbGradient-${phase})`}
                        strokeWidth="8"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{
                            strokeDasharray: circumference,
                        }}
                    />

                    <defs>
                        <linearGradient id={`orbGradient-${phase}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={style.start} />
                            <stop offset="100%" stopColor={style.end} />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Center Content */}
                <div style={{
                    textAlign: 'center',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={currentDay}
                        style={{
                            fontSize: '4rem',
                            fontWeight: 600,
                            color: 'var(--text-main)',
                            lineHeight: 1,
                            marginBottom: '4px'
                        }}
                    >
                        {currentDay}
                    </motion.span>
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={phase}
                        style={{
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            color: 'var(--text-soft)',
                            fontWeight: 500
                        }}
                    >
                        {style.label}
                    </motion.span>
                </div>
            </motion.div>
        </div>
    );
};

export default CycleOrb;
