import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'luna-auth-user';
const ACCOUNTS_KEY = 'luna-accounts';

// ---------- helpers ----------
function getAccounts() {
    try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]'); }
    catch { return []; }
}
function saveAccounts(accounts) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}
function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
    catch { return null; }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = getCurrentUser();
        setUser(stored);
        setLoading(false);
    }, []);

    const signup = async (email, password, fullName, phone) => {
        const accounts = getAccounts();
        if (accounts.find(a => a.email.toLowerCase() === email.toLowerCase())) {
            throw new Error('An account with this email already exists.');
        }
        const newUser = {
            id: `user_${Date.now()}`,
            email,
            password,
            full_name: fullName,
            phone,
            created_at: new Date().toISOString()
        };
        saveAccounts([...accounts, newUser]);

        // Auto-login after signup
        const sessionUser = { id: newUser.id, email: newUser.email, full_name: newUser.full_name, phone: newUser.phone };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
        setUser(sessionUser);
        return { user: sessionUser };
    };

    const login = async (email, password) => {
        const accounts = getAccounts();
        const found = accounts.find(
            a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
        );
        if (!found) throw new Error('Invalid email or password.');

        const sessionUser = { id: found.id, email: found.email, full_name: found.full_name, phone: found.phone };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
        setUser(sessionUser);
        return { user: sessionUser };
    };

    const logout = async () => {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
    };

    // Update profile fields in both session and accounts store
    const updateProfile = (updates) => {
        const accounts = getAccounts();
        const idx = accounts.findIndex(a => a.id === user?.id);
        if (idx !== -1) {
            accounts[idx] = { ...accounts[idx], ...updates };
            saveAccounts(accounts);
        }
        const updated = { ...user, ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setUser(updated);
    };

    return (
        <AuthContext.Provider value={{ user, signup, login, logout, loading, updateProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
