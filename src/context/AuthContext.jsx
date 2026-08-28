import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Get initial session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getSession();

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            setLoading(false);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const signup = async (email, password, fullName, phone) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) throw error;

        // Update auto-created profile with full_name and phone
        if (data?.user) {
            await new Promise(resolve => setTimeout(resolve, 500));

            const { error: profileError } = await supabase.from('users_profile')
                .update({
                    full_name: fullName,
                    phone: phone,
                })
                .eq('id', data.user.id);

            if (profileError) {
                console.error("Error updating user profile:", profileError);
            }
        }
        return data;
    };

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    return (
        <AuthContext.Provider value={{ user, session, signup, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
