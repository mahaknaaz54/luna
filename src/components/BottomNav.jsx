import { motion } from 'framer-motion';
import { Home, BarChart2, Calendar, User } from 'lucide-react';

const BottomNav = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'insights', icon: BarChart2, label: 'Insights' },
        { id: 'history', icon: Calendar, label: 'History' },
        { id: 'profile', icon: User, label: 'Profile' },
    ];

    return (
        <nav className="glass bottom-nav-container">
            {tabs.slice(0, 2).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <motion.button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        whileTap={{ scale: 1.05 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        style={{
                            position: 'relative',
                            background: 'none',
                            border: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            color: isActive ? 'var(--text-main)' : 'var(--text-soft)',
                            padding: '8px 12px',
                            transition: 'color 0.4s ease',
                        }}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="nav-glow"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.15 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'var(--grad-period)',
                                    borderRadius: '16px',
                                    filter: 'blur(12px)',
                                }}
                            />
                        )}
                        <Icon
                            size={24}
                            strokeWidth={isActive ? 2.5 : 2}
                            style={{
                                transition: 'transform 0.4s ease',
                                transform: isActive ? 'translateY(-2px)' : 'none',
                            }}
                        />
                        <span style={{
                            fontSize: '10px',
                            fontWeight: isActive ? 600 : 400,
                            letterSpacing: '0.02em',
                            opacity: isActive ? 1 : 0.7,
                            transition: 'opacity 0.4s ease'
                        }}>
                            {tab.label}
                        </span>
                        {isActive && (
                            <motion.div
                                layoutId="active-indicator"
                                transition={{ type: "tween", duration: 0.4, ease: "easeInOut" }}
                                style={{
                                    position: 'absolute',
                                    bottom: '4px',
                                    width: '3px',
                                    height: '3px',
                                    borderRadius: '50%',
                                    background: 'var(--color-period)',
                                }}
                            />
                        )}
                    </motion.button>
                );
            })}

            {/* Central Add Button */}
            <motion.button
                whileHover={{ scale: 1.1, translateY: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onTabChange('log-modal')} // We'll handle this in App.jsx
                style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--grad-period)',
                    border: '4px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 10px 25px rgba(255, 126, 185, 0.4)',
                    cursor: 'pointer',
                    zIndex: 10,
                }}
            >
                <span style={{ fontSize: '28px', fontWeight: 300 }}>+</span>
            </motion.button>

            {tabs.slice(2).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <motion.button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        whileTap={{ scale: 1.05 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        style={{
                            position: 'relative',
                            background: 'none',
                            border: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            color: isActive ? 'var(--text-main)' : 'var(--text-soft)',
                            padding: '8px 12px',
                            transition: 'color 0.4s ease',
                        }}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="nav-glow"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.15 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'var(--grad-period)',
                                    borderRadius: '16px',
                                    filter: 'blur(12px)',
                                }}
                            />
                        )}
                        <Icon
                            size={24}
                            strokeWidth={isActive ? 2.5 : 2}
                            style={{
                                transition: 'transform 0.4s ease',
                                transform: isActive ? 'translateY(-2px)' : 'none',
                            }}
                        />
                        <span style={{
                            fontSize: '10px',
                            fontWeight: isActive ? 600 : 400,
                            letterSpacing: '0.02em',
                            opacity: isActive ? 1 : 0.7,
                            transition: 'opacity 0.4s ease'
                        }}>
                            {tab.label}
                        </span>
                        {isActive && (
                            <motion.div
                                layoutId="active-indicator"
                                transition={{ type: "tween", duration: 0.4, ease: "easeInOut" }}
                                style={{
                                    position: 'absolute',
                                    bottom: '4px',
                                    width: '3px',
                                    height: '3px',
                                    borderRadius: '50%',
                                    background: 'var(--color-period)',
                                }}
                            />
                        )}
                    </motion.button>
                );
            })}
        </nav>
    );
};

export default BottomNav;
