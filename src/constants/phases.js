/**
 * Luna UI - Phase Styles & Constants
 * Centralized phase color palettes, glows, labels, and theme settings.
 */

export const PHASE_TYPES = {
    PERIOD: 'period',
    PERIOD_START: 'period_start',
    PERIOD_END: 'period_end',
    OVULATION: 'ovulation',
    PMS: 'pms',
    SAFE: 'safe',
};

export const PHASE_METADATA = {
    period: {
        glow: 'rgba(255, 126, 185, 0.6)',
        color: 'var(--color-period)',
        start: '#ff7eb9',
        end: '#7d12ff',
        label: 'Period',
        title: 'Period Phase',
        icon: '🩸',
        msg: 'Slow down and cozy up. Deep berry tones & rest.',
        gradient: 'linear-gradient(135deg, #2D0B1F 0%, #1A0510 100%)',
        accent1: 'rgba(255, 126, 185, 0.08)',
        accent2: 'rgba(125, 18, 255, 0.05)',
        particleColor: 'rgba(255, 255, 255, 0.12)',
    },
    ovulation: {
        glow: 'rgba(251, 194, 235, 0.6)',
        color: 'var(--color-ovulation)',
        start: '#ffd1ff',
        end: '#a18cd1',
        label: 'Ovulation',
        title: 'Ovulation window',
        icon: '🌸',
        msg: 'Peak energy & golden glow. You are radiant today.',
        gradient: 'linear-gradient(135deg, #FFF5F7 0%, #FEE2E8 100%)',
        accent1: 'rgba(255, 209, 255, 0.15)',
        accent2: 'rgba(251, 194, 235, 0.1)',
        particleColor: 'rgba(255, 182, 193, 0.15)',
    },
    pms: {
        glow: 'rgba(224, 195, 252, 0.6)',
        color: 'var(--color-pms)',
        start: '#e0c3fc',
        end: '#8ec5fc',
        label: 'PMS',
        title: 'PMS Phase',
        icon: '☁️',
        msg: 'Calm & comforting atmosphere. Be gentle with yourself.',
        gradient: 'linear-gradient(135deg, #F0F4FF 0%, #E6E9FE 100%)',
        accent1: 'rgba(224, 195, 252, 0.12)',
        accent2: 'rgba(142, 197, 252, 0.08)',
        particleColor: 'rgba(173, 216, 230, 0.12)',
    },
    safe: {
        glow: 'rgba(150, 230, 161, 0.6)',
        color: 'var(--color-safe)',
        start: '#d4fc79',
        end: '#96e6a1',
        label: 'Follicular',
        title: 'Safe Days',
        icon: '🌿',
        msg: 'Soft sage & minimal floral. New beginnings.',
        gradient: 'linear-gradient(135deg, #F7FFF9 0%, #EDF9F0 100%)',
        accent1: 'rgba(212, 252, 121, 0.08)',
        accent2: 'rgba(150, 230, 161, 0.1)',
        particleColor: 'rgba(144, 238, 144, 0.1)',
    },
};

export const DARK_PHASE_METADATA = {
    period: {
        ...PHASE_METADATA.period,
        gradient: 'linear-gradient(135deg, #1e0a28 0%, #16102a 100%)',
        accent1: 'rgba(244, 114, 182, 0.10)',
        accent2: 'rgba(124, 58, 237, 0.07)',
        particleColor: 'rgba(255, 255, 255, 0.08)',
    },
    ovulation: {
        ...PHASE_METADATA.ovulation,
        gradient: 'linear-gradient(135deg, #1a0e2e 0%, #16102a 100%)',
        accent1: 'rgba(192, 132, 252, 0.10)',
        accent2: 'rgba(129, 140, 248, 0.07)',
        particleColor: 'rgba(200, 180, 255, 0.08)',
    },
    pms: {
        ...PHASE_METADATA.pms,
        gradient: 'linear-gradient(135deg, #131428 0%, #16102a 100%)',
        accent1: 'rgba(167, 139, 250, 0.10)',
        accent2: 'rgba(129, 140, 248, 0.06)',
        particleColor: 'rgba(173, 216, 230, 0.07)',
    },
    safe: {
        ...PHASE_METADATA.safe,
        gradient: 'linear-gradient(135deg, #0e1e1a 0%, #16102a 100%)',
        accent1: 'rgba(110, 231, 183, 0.08)',
        accent2: 'rgba(187, 247, 208, 0.05)',
        particleColor: 'rgba(144, 238, 144, 0.07)',
    },
};

export const DEFAULT_SETTINGS = {
    notifications: true,
    cycleLength: 28,
    reminderTime: '09:00',
    theme: 'Auto',
};

export const VALID_THEMES = ['Auto', 'Light', 'Soft Dark'];
