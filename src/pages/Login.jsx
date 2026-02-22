import { motion } from 'framer-motion';
import { Moon } from 'lucide-react';

const Login = ({ onLogin }) => {
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
                background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
                padding: '24px',
                textAlign: 'center'
            }}
        >
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                style={{ marginBottom: '40px' }}
            >
                <div
                    className="glass"
                    style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        background: 'var(--grad-ovulation)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                        color: 'white'
                    }}
                >
                    <Moon size={48} fill="white" />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Luna</h1>
                <p style={{ fontSize: '1.1rem', opacity: 0.6, fontWeight: 500 }}>Your cycle, in harmony.</p>
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                style={{ width: '100%', maxWidth: '320px' }}
            >
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onLogin}
                    className="glass"
                    style={{
                        width: '100%',
                        padding: '20px',
                        borderRadius: '24px',
                        border: 'none',
                        background: 'var(--grad-period)',
                        color: 'white',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }}
                >
                    Begin Journey
                </motion.button>

                <p style={{ marginTop: '24px', fontSize: '0.85rem', opacity: 0.4 }}>
                    By continuing, you agree to our Terms of Service.
                </p>
            </motion.div>

            {/* Soft decorative elements */}
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, 0]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: 'absolute',
                    top: '15%',
                    right: '10%',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--grad-period)',
                    filter: 'blur(30px)',
                    opacity: 0.3,
                    zIndex: -1
                }}
            />
            <motion.div
                animate={{
                    y: [0, 20, 0],
                    rotate: [0, -5, 0]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: 'absolute',
                    bottom: '15%',
                    left: '10%',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'var(--grad-ovulation)',
                    filter: 'blur(40px)',
                    opacity: 0.3,
                    zIndex: -1
                }}
            />
        </motion.div>
    );
};

export default Login;
