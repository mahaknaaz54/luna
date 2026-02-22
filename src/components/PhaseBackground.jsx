import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const phaseStyles = {
    period: {
        gradient: 'linear-gradient(135deg, #2D0B1F 0%, #1A0510 100%)',
        accent1: 'rgba(255, 126, 185, 0.08)',
        accent2: 'rgba(125, 18, 255, 0.05)',
        particleColor: 'rgba(255, 255, 255, 0.12)'
    },
    ovulation: {
        gradient: 'linear-gradient(135deg, #FFF5F7 0%, #FEE2E8 100%)',
        accent1: 'rgba(255, 209, 255, 0.15)',
        accent2: 'rgba(251, 194, 235, 0.1)',
        particleColor: 'rgba(255, 182, 193, 0.15)'
    },
    pms: {
        gradient: 'linear-gradient(135deg, #F0F4FF 0%, #E6E9FE 100%)',
        accent1: 'rgba(224, 195, 252, 0.12)',
        accent2: 'rgba(142, 197, 252, 0.08)',
        particleColor: 'rgba(173, 216, 230, 0.12)'
    },
    safe: {
        gradient: 'linear-gradient(135deg, #F7FFF9 0%, #EDF9F0 100%)',
        accent1: 'rgba(212, 252, 121, 0.08)',
        accent2: 'rgba(150, 230, 161, 0.1)',
        particleColor: 'rgba(144, 238, 144, 0.1)'
    }
};

// Soft-dark overlay gradient — keeps indigo base, adds subtle phase tint
const darkPhaseStyles = {
    period: {
        gradient: 'linear-gradient(135deg, #1e0a28 0%, #16102a 100%)',
        accent1: 'rgba(244, 114, 182, 0.10)',
        accent2: 'rgba(124, 58, 237, 0.07)',
        particleColor: 'rgba(255, 255, 255, 0.08)'
    },
    ovulation: {
        gradient: 'linear-gradient(135deg, #1a0e2e 0%, #16102a 100%)',
        accent1: 'rgba(192, 132, 252, 0.10)',
        accent2: 'rgba(129, 140, 248, 0.07)',
        particleColor: 'rgba(200, 180, 255, 0.08)'
    },
    pms: {
        gradient: 'linear-gradient(135deg, #131428 0%, #16102a 100%)',
        accent1: 'rgba(167, 139, 250, 0.10)',
        accent2: 'rgba(129, 140, 248, 0.06)',
        particleColor: 'rgba(173, 216, 230, 0.07)'
    },
    safe: {
        gradient: 'linear-gradient(135deg, #0e1e1a 0%, #16102a 100%)',
        accent1: 'rgba(110, 231, 183, 0.08)',
        accent2: 'rgba(187, 247, 208, 0.05)',
        particleColor: 'rgba(144, 238, 144, 0.07)'
    }
};


// Layer 2: Blurred floating organic shapes
const OrganicShape = ({ color, size, speed, delay }) => {
    // Randomize initial positions once
    const pos = useMemo(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
    }), []);

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
                left: pos.left,
                top: pos.top,
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
const TinyParticle = ({ color, delay }) => {
    const left = useMemo(() => Math.random() * 100, []);
    const size = useMemo(() => Math.random() * 3 + 1, []);
    const duration = useMemo(() => 20 + Math.random() * 15, []);

    return (
        <motion.div
            initial={{ y: '110vh', opacity: 0 }}
            animate={{
                y: '-10vh',
                opacity: [0, 0.6, 0]
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "linear"
            }}
            style={{
                position: 'absolute',
                left: `${left}%`,
                width: size,
                height: size,
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
        () => document.body.getAttribute('data-theme') === 'soft-dark'
    );

    useEffect(() => {
        const obs = new MutationObserver(() => {
            setIsDark(document.body.getAttribute('data-theme') === 'soft-dark');
        });
        obs.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
        return () => obs.disconnect();
    }, []);

    const palette = isDark ? darkPhaseStyles : phaseStyles;
    const current = palette[phase] || palette.safe;

    const shapes = useMemo(() => [
        { size: 450, color: current.accent1, speed: 50, delay: 0 },
        { size: 550, color: current.accent2, speed: 65, delay: 3 },
        { size: 400, color: current.accent1, speed: 55, delay: 7 },
    ], [current]);

    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const particleCount = isCareMode ? 20 : (isMobile ? 15 : 40);
    const particles = useMemo(() =>
        Array.from({ length: particleCount }).map((_, i) => ({
            delay: Math.random() * 20,
            key: i
        }))
        , [particleCount]);

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
                        {particles.map((p) => (
                            <TinyParticle key={`${phase}-particle-${p.key}`} color={current.particleColor} delay={p.delay} />
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
