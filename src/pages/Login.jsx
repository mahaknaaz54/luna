import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login, signup } = useAuth();

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            if (isSignUp) {
                const data = await signup(email, password, fullName, phone);
                // If email confirmation is required, user won't be auto-logged in
                if (data?.user && !data?.session) {
                    setSuccessMsg('Account created! Please check your email to confirm your account, then log in.');
                    setIsSignUp(false);
                } else if (data?.session) {
                    // Auto-login happened (email confirmation disabled in Supabase)
                    setSuccessMsg('Account created! Logging you in...');
                }
            } else {
                await login(email, password);
            }
        } catch (err) {
            setError(err.message || 'An error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-page)',
                padding: '24px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                style={{ marginBottom: '32px', zIndex: 10 }}
            >
                <div
                    className="glass"
                    style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        background: 'var(--grad-ovulation)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                        color: 'white'
                    }}
                >
                    <Moon size={40} fill="white" />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Luna</h1>
                <p style={{ fontSize: '1rem', color: 'var(--text-soft)', fontWeight: 500 }}>
                    {isSignUp ? 'Create your account' : 'Welcome back'}
                </p>
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                style={{ width: '100%', maxWidth: '340px', zIndex: 10 }}
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    <AnimatePresence mode="wait">
                        {isSignUp && (
                            <motion.div
                                key="signup-fields"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}
                            >
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required={isSignUp}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        border: '1px solid var(--divider)',
                                        background: 'var(--input-bg)',
                                        color: 'var(--text-main)',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                    }}
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        border: '1px solid var(--divider)',
                                        background: 'var(--input-bg)',
                                        color: 'var(--text-main)',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '16px',
                            border: '1px solid var(--divider)',
                            background: 'var(--input-bg)',
                            color: 'var(--text-main)',
                            fontSize: '1rem',
                            outline: 'none',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '16px',
                            border: '1px solid var(--divider)',
                            background: 'var(--input-bg)',
                            color: 'var(--text-main)',
                            fontSize: '1rem',
                            outline: 'none',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                        }}
                    />

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '4px', background: 'rgba(231, 76, 60, 0.1)', padding: '8px', borderRadius: '8px' }}
                        >
                            {error}
                        </motion.div>
                    )}

                    {successMsg && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ color: '#27ae60', fontSize: '0.85rem', marginTop: '4px', background: 'rgba(39, 174, 96, 0.1)', padding: '12px', borderRadius: '8px', fontWeight: 500 }}
                        >
                            {successMsg}
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="glass"
                        style={{
                            width: '100%',
                            padding: '18px',
                            borderRadius: '20px',
                            border: 'none',
                            background: 'var(--grad-period)',
                            color: 'white',
                            fontSize: '1.05rem',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                            opacity: loading ? 0.7 : 1,
                            marginTop: '8px'
                        }}
                    >
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
                    </motion.button>
                </form>

                <div style={{ marginTop: '24px' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-soft)' }}>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    </p>
                    <button
                        onClick={() => { setError(null); setIsSignUp(!isSignUp); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-pms)',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            marginTop: '8px',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        {isSignUp ? 'Log In' : 'Sign Up'}
                    </button>
                </div>
            </motion.div>

            {/* Soft decorative elements */}
            <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: 'absolute', top: '15%', right: '5%', width: '90px', height: '90px',
                    borderRadius: '50%', background: 'var(--grad-period)', filter: 'blur(40px)', opacity: 0.2, zIndex: 0
                }}
            />
            <motion.div
                animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: 'absolute', bottom: '15%', left: '5%', width: '120px', height: '120px',
                    borderRadius: '50%', background: 'var(--grad-ovulation)', filter: 'blur(50px)', opacity: 0.2, zIndex: 0
                }}
            />
        </motion.div>
    );
};

export default Login;
