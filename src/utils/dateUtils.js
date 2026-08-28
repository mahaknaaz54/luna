/**
 * Luna UI - Date Utilities
 * Clean helpers for date formatting, month labels, and time-based greetings.
 */

export const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export const MONTH_ICONS = ['🌸', '💐', '🌷', '🌺', '🌻', '🌼', '🍂', '🍁', '❄️', '☀️', '🌙', '✨'];

/**
 * Formats a Date object or date string to 'YYYY-MM-DD'
 * @param {Date|string|number} date
 * @returns {string}
 */
export function formatDate(date) {
    if (!date) return '';
    const d = new Date(typeof date === 'string' ? date.replace(/-/g, '/') : date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Formats a date string to a human-readable format, e.g. "Feb 28, 2026"
 * @param {string} dateStr
 * @returns {string}
 */
export function formatDateStr(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr.replace(/-/g, '/'));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Returns a time-appropriate greeting: "Good morning", "Good afternoon", "Good evening", or "Good night"
 * @param {Date} [now]
 * @returns {string}
 */
export function getGreeting(now = new Date()) {
    const hour = now.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    if (hour < 22) return 'Good evening';
    return 'Good night';
}
