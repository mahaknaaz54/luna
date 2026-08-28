import { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PHASE_METADATA, DARK_PHASE_METADATA } from '../constants/phases';

// Pre-computed deterministic positions & delays for organic shapes
const ORGANIC_SHAPES_CONFIG = [
    { size: 450, speed: 50, delay: 0, left: '15%', top: '20%' },
    { size: 550, speed: 65, delay: 3, left: '65%', top: '55%' },
    { size: 400, speed: 55, delay: 7, left: '40%', top: '80%' },
];

// Pre-computed deterministic particle seeds (up to 40 particles)
const PARTICLE_SEEDS = Array.from({ length: 40 }, (_, i) => {
    // Pseudo-random pseudo-deterministic generator using sinusoids
    const pseudoRand1 = Math.abs(Math.sin((i + 1) * 9301 + 49297) % 1);
    const pseudoRand2 = Math.abs(Math.sin((i + 1) * 49297 + 9301) % 1);
    const pseudoRand3 = Math.abs(Math.sin((i + 1) * 233280 + 7) % 1);
    return {
        key: i,
        left: (pseudoRand1 * 100).toFixed(2),
        size: (pseudoRand2 * 3 + 1).toFixed(1),
        duration: (20 + pseudoRand3 * 15).toFixed(1),
        delay: (pseudoRand2 * 20).toFixed(1),
    };
});

// Layer 2: Blurred floating organic shapes
const OrganicShape = ({ color, size, speed, delay, left, top }) => {
    return (
        <motion.div
            animate={{
                x: [0, -60, 60, 0],
                y: [0, 80, -80, 0],
                rotate: [0, 90, 180, 360],
                scale: [1, 1.15, 0.85, 1],
            }}
            transition={{
                duration: speed,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut"
            }}
            style={{
                position: 'absolute',
                left,
                top,
                width: size,
                height: size,
                borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                background: color,
                filter: 'blur(80px)',
                opacity: 0.6,
                willChange: 'transform',
            }}
        />
    );
};

// Layer 3: Tiny low-opacity particles drifting upward
const TinyParticle = ({ color, particle }) => {
    return (
        <motion.div
            initial={{ y: '110vh', opacity: 0 }}
            animate={{
                y: '-10vh',
                opacity: [0, 0.6, 0]
            }}
            transition={{
                duration: Number(particle.duration),
                repeat: Infinity,
                delay: Number(particle.delay),
                ease: "linear"
            }}
            style={{
                position: 'absolute',
                left: `${particle.left}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 10px ${color}`,
                willChange: 'transform',
            }}
        />
    );
};

const PhaseBackground = ({ phase = 'safe', isCareMode = false }) => {
    const [isDark, setIsDark] = useState(
        () => (typeof document !== 'undefined' && document.body.getAttribute('data-theme') === 'soft-dark')
    );

    useEffect(() => {
        if (typeof document === 'undefined') return;
        const obs = new MutationObserver(() => {
            setIsDark(document.body.getAttribute('data-theme') === 'soft-dark');
        });
        obs.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
        return () => obs.disconnect();
    }, []);

    const palette = isDark ? DARK_PHASE_METADATA : PHASE_METADATA;
    const current = palette[phase] || palette.safe;

    const shapes = useMemo(() => [
        { ...ORGANIC_SHAPES_CONFIG[0], color: current.accent1 },
        { ...ORGANIC_SHAPES_CONFIG[1], color: current.accent2 },
        { ...ORGANIC_SHAPES_CONFIG[2], color: current.accent1 },
    ], [current]);

    const [isMobile, setIsMobile] = useState(
        () => (typeof window !== 'undefined' ? window.innerWidth < 768 : false)
    );

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const particleCount = isCareMode ? 20 : (isMobile ? 15 : 40);
    const visibleParticles = useMemo(() => PARTICLE_SEEDS.slice(0, particleCount), [particleCount]);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden' }}>
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={phase}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                    }}
                >
                    {/* Layer 1: Base animated gradient */}
                    <motion.div
                        animate={{
                            scale: isCareMode ? [1, 1.02, 1] : [1, 1.08, 1],
                            rotate: isCareMode ? [0, 0.5, -0.5, 0] : [0, 2, -2, 0]
                        }}
                        transition={{
                            duration: isCareMode ? 40 : 25,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{
                            position: 'absolute',
                            inset: '-20%',
                            background: current.gradient,
                        }}
                    />

                    {/* Layer 2: Organic Shapes (Moving opposite to general upward drift) */}
                    <div style={{ position: 'absolute', inset: 0, opacity: isCareMode ? 0.4 : 0.7 }}>
                        {shapes.map((s, i) => (
                            <OrganicShape key={`${phase}-shape-${i}`} {...s} />
                        ))}
                    </div>

                    {/* Layer 3: Tiny Particles (Drifting upward) */}
                    <div style={{ position: 'absolute', inset: 0, opacity: isCareMode ? 0.3 : 0.5 }}>
                        {visibleParticles.map((p) => (
                            <TinyParticle key={`${phase}-particle-${p.key}`} color={current.particleColor} particle={p} />
                        ))}
                    </div>

                    {/* Fine-tuned overlay for depth */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: phase === 'period'
                                ? 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.1) 100%)'
                                : 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(255,255,255,0.05) 100%)',
                            pointerEvents: 'none'
                        }}
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default PhaseBackground;
