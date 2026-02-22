import React, { createContext, useContext, useState, useEffect } from 'react';

const CareModeContext = createContext();

export const useCareMode = () => {
    const context = useContext(CareModeContext);
    if (!context) {
        throw new Error('useCareMode must be used within a CareModeProvider');
    }
    return context;
};

export const CareModeProvider = ({ children }) => {
    const [isCareMode, setIsCareMode] = useState(() => {
        return localStorage.getItem('care-mode') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('care-mode', isCareMode);
        // Apply data attribute to the document element for CSS targeting
        if (isCareMode) {
            document.documentElement.setAttribute('data-care-mode', 'true');
        } else {
            document.documentElement.removeAttribute('data-care-mode');
        }
    }, [isCareMode]);

    const toggleCareMode = () => setIsCareMode(prev => !prev);

    return (
        <CareModeContext.Provider value={{ isCareMode, toggleCareMode, setIsCareMode }}>
            {children}
        </CareModeContext.Provider>
    );
};
