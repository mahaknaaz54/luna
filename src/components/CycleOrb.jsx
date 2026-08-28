import { motion } from 'framer-motion';
import { PHASE_METADATA } from '../constants/phases';

/**
 * CycleOrb Component
 * A premium, animated cycle visualization component.
 * 
 * @param {Object} props
 * @param {number} props.currentDay - The current day of the cycle.
 * @param {number} [props.totalDays=28] - The total length of the cycle.
 * @param {string} [props.phase='safe'] - The current phase ('period', 'ovulation', 'pms', 'safe').
 * @param {boolean} [props.isCareMode=false] - Whether care mode is active.
 */
const CycleOrb = ({ currentDay, totalDays = 28, phase = 'safe', isCareMode = false }) => {
    const percentage = Math.min(Math.max((currentDay / totalDays) * 100, 0), 100);
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const style = PHASE_METADATA[phase] || PHASE_METADATA.safe;

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
