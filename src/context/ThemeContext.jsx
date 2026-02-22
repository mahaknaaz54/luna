import { createContext, useContext, useState, useEffect, useRef } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};

/**
 * Resolves the actual CSS theme ('light' | 'soft-dark') from the user's
 * selected mode ('Auto' | 'Light' | 'Soft Dark') and the current time.
 * Auto: 07:00–18:59 → light, 19:00–06:59 → soft-dark
 */
function resolveTheme(mode) {
    if (mode === 'Light') return 'light';
    if (mode === 'Soft Dark') return 'soft-dark';
    // Auto: hour 7 (inclusive) to 19 (exclusive) = light
    const hour = new Date().getHours();
    return hour >= 7 && hour < 19 ? 'light' : 'soft-dark';
}

export const ThemeProvider = ({ children, themeMode }) => {
    const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(themeMode));
    const [isTransitioning, setIsTransitioning] = useState(false);
    const transitionTimerRef = useRef(null);

    // Helper: change resolvedTheme and fire the transition flag
    const applyTheme = (newTheme) => {
        setResolvedTheme(prev => {
            if (prev === newTheme) return prev;
            // Trigger fade overlay
            setIsTransitioning(true);
            clearTimeout(transitionTimerRef.current);
            transitionTimerRef.current = setTimeout(() => setIsTransitioning(false), 650);
            return newTheme;
        });
    };

    // Re-resolve whenever the user changes the mode setting
    useEffect(() => {
        applyTheme(resolveTheme(themeMode));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [themeMode]);

    // For Auto mode: poll every 60 s so switches happen without a page reload
    useEffect(() => {
        if (themeMode !== 'Auto') return;
        const id = setInterval(() => {
            applyTheme(resolveTheme('Auto'));
        }, 60_000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [themeMode]);

    // Apply data-theme to <body> for global CSS variable targeting
    useEffect(() => {
        document.body.setAttribute('data-theme', resolvedTheme);
        document.documentElement.style.colorScheme =
            resolvedTheme === 'soft-dark' ? 'dark' : 'light';
    }, [resolvedTheme]);

    // Cleanup on unmount
    useEffect(() => () => clearTimeout(transitionTimerRef.current), []);

    return (
        <ThemeContext.Provider value={{ resolvedTheme, themeMode, isTransitioning }}>
            {children}
        </ThemeContext.Provider>
    );
};
