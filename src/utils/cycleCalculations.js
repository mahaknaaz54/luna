/**
 * Luna UI - Cycle Calculations
 * Core algorithms for cycle phase estimation, day counts, and period ranges.
 */

import { formatDate } from './dateUtils';
import { PHASE_METADATA } from '../constants/phases';

/**
 * Calculates current cycle day and current phase based on logged markers and cycle length.
 * 
 * @param {Object} params
 * @param {Date|null} [params.targetDate]
 * @param {string[]} params.periodDays
 * @param {string[]} params.startMarkers
 * @param {string[]} params.endMarkers
 * @param {number} [params.cycleLength=28]
 * @returns {{ currentDay: number, currentPhase: 'period'|'ovulation'|'pms'|'safe' }}
 */
export function calculatePhase({
    targetDate = new Date(),
    periodDays = [],
    startMarkers = [],
    endMarkers = [],
    cycleLength = 28
}) {
    const today = targetDate || new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayStr = formatDate(todayDate);

    // 1. If explicitly logged as a period day
    if (periodDays.includes(todayStr)) {
        return { currentDay: 1, currentPhase: 'period' };
    }

    // 2. Find the latest markers on or before today
    const lastStart = [...startMarkers].filter(d => d <= todayStr).sort().reverse()[0];
    const lastEnd = [...endMarkers].filter(d => d <= todayStr).sort().reverse()[0];

    if (!lastStart) {
        return { currentDay: 1, currentPhase: 'safe' };
    }

    const start = new Date(lastStart.replace(/-/g, '/'));
    const diffTime = todayDate.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const currentDayInCycle = ((diffDays - 1) % (cycleLength || 28)) + 1;

    // 3. If end date exists and is after/on start
    if (lastEnd && lastEnd >= lastStart) {
        const end = new Date(lastEnd.replace(/-/g, '/'));
        const daysSinceEnd = Math.floor((todayDate.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceEnd > 0) {
            if (daysSinceEnd <= 7) return { currentDay: currentDayInCycle, currentPhase: 'safe' };
            if (daysSinceEnd <= 11) return { currentDay: currentDayInCycle, currentPhase: 'ovulation' };
            return { currentDay: currentDayInCycle, currentPhase: 'pms' };
        }
    }

    // 4. Default fallback based on cycle day
    let currentPhase = 'safe';
    if (currentDayInCycle <= 5) currentPhase = 'period';
    else if (currentDayInCycle <= 12) currentPhase = 'safe';
    else if (currentDayInCycle <= 16) currentPhase = 'ovulation';
    else currentPhase = 'pms';

    return { currentDay: currentDayInCycle, currentPhase };
}

/**
 * Gets user-friendly presentation data for a phase.
 * 
 * @param {string} phase
 * @param {number} currentDay
 * @param {number} cycleLength
 * @returns {{ title: string, day: string, msg: string, icon: string, extra: string }}
 */
export function getPhaseDisplayData(phase, currentDay, cycleLength = 28) {
    const meta = PHASE_METADATA[phase] || PHASE_METADATA.safe;
    const nextPeriodIn = cycleLength - currentDay + 1;
    const nextText = nextPeriodIn <= 1 ? 'Period due soon' : `Next period in ${nextPeriodIn} days`;

    return {
        title: meta.title,
        day: `Day ${currentDay}`,
        msg: meta.msg,
        icon: meta.icon,
        extra: nextText
    };
}
