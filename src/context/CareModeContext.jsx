import { createContext, useContext, useState, useEffect } from 'react';

const CareModeContext = createContext(null);

export const useCareMode = () => {
    const context = useContext(CareModeContext);
    if (!context) {
        throw new Error('useCareMode must be used within a CareModeProvider');
    }
    return context;
};

export const CareModeProvider = ({ children }) => {
    const [isCareMode, setIsCareMode] = useState(() => {
        return typeof localStorage !== 'undefined' && localStorage.getItem('care-mode') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('care-mode', String(isCareMode));
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
