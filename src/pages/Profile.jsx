import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogOut, Phone, Mail, Shield, Edit2, X, Check } from 'lucide-react';
import { useCareMode } from '../context/CareModeContext';

const Profile = ({ userInfo, setUserInfo, onNavigate, onLogout }) => {
    const { isCareMode, setIsCareMode } = useCareMode();
    const [editingField, setEditingField] = useState(null); // 'phone' or 'email'
    const [tempValue, setTempValue] = useState('');

    const handleEdit = (field) => {
        setEditingField(field);
        setTempValue(userInfo?.[field] || (field === 'phone' ? '+1 234 567 890' : 'luna.user@example.com'));
    };

    const handleSave = () => {
        setUserInfo({ ...userInfo, [editingField]: tempValue });
        setEditingField(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="page-wrapper"
        >
            <header style={{ textAlign: 'center', marginBottom: '40px', marginTop: '20px' }}>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="glass"
                    style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        margin: '0 auto 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3.5rem',
                        background: 'var(--grad-ovulation)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                        border: '4px solid white',
                    }}
                >
                    👤
                </motion.div>
                <h2 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-main)' }}>{userInfo?.name || 'Luna User'}</h2>
                <p style={{ fontSize: '0.95rem', opacity: 0.5, fontWeight: 500 }}>Premium Member ✨</p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <section className="glass" style={{ padding: '24px', borderRadius: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ color: 'var(--color-pms)', opacity: 0.7 }}><Phone size={20} /></div>
                            <div>
                                <span style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Phone Number</span>
                                <span style={{ fontSize: '1rem', fontWeight: 500 }}>{userInfo?.phone || '+1 234 567 890'}</span>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit('phone')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', opacity: 0.4 }}
                        >
                            <Edit2 size={18} />
                        </motion.button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ color: 'var(--color-pms)', opacity: 0.7 }}><Mail size={20} /></div>
                            <div>
                                <span style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Email Address</span>
                                <span style={{ fontSize: '1rem', fontWeight: 500 }}>{userInfo?.email || 'luna.user@example.com'}</span>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit('email')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', opacity: 0.4 }}
                        >
                            <Edit2 size={18} />
                        </motion.button>
                    </div>
                </section>

                <section className="glass" style={{ padding: '20px 24px', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ color: 'var(--color-pms)', opacity: 0.7 }}><Shield size={20} /></div>
                        <div>
                            <span style={{ fontSize: '1rem', fontWeight: 600 }}>Care Mode</span>
                            <span style={{ fontSize: '0.75rem', opacity: 0.5, display: 'block' }}>Softer experience & slow motion</span>
                        </div>
                    </div>
                    <motion.div
                        onClick={() => setIsCareMode(!isCareMode)}
                        style={{
                            width: '56px',
                            height: '28px',
                            background: isCareMode ? 'var(--grad-period)' : 'rgba(0,0,0,0.1)',
                            borderRadius: '20px',
                            padding: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: isCareMode ? 'flex-end' : 'flex-start',
                            alignItems: 'center',
                            transition: 'background 0.3s ease'
                        }}
                    >
                        <motion.div
                            layout
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            style={{
                                width: '20px',
                                height: '20px',
                                background: 'white',
                                borderRadius: '50%',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        />
                    </motion.div>
                </section>

                <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onNavigate?.('settings')}
                        className="glass"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '20px 24px',
                            borderRadius: '32px',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Settings size={20} strokeWidth={2} />
                            <span style={{ fontWeight: 600, fontSize: '1rem' }}>General Settings</span>
                        </div>
                        <ChevronRightIcon size={18} opacity={0.3} />
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onNavigate?.('privacy-security')}
                        className="glass"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '20px 24px',
                            borderRadius: '32px',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Shield size={20} strokeWidth={2} />
                            <span style={{ fontWeight: 600, fontSize: '1rem' }}>Privacy & Security</span>
                        </div>
                        <ChevronRightIcon size={18} opacity={0.3} />
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={onLogout}
                        className="glass"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '20px 24px',
                            borderRadius: '24px',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left',
                            color: '#ff4b4b'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <LogOut size={20} strokeWidth={2} />
                            <span style={{ fontWeight: 600, fontSize: '1rem' }}>Log Out</span>
                        </div>
                    </motion.button>
                </section>
            </div>

            <AnimatePresence>
                {editingField && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.2)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 3000,
                            padding: '20px'
                        }}
                        onClick={() => setEditingField(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="glass"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '340px',
                                padding: '32px',
                                borderRadius: '40px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Edit {editingField === 'phone' ? 'Phone' : 'Email'}</h3>
                                <button onClick={() => setEditingField(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}><X size={20} /></button>
                            </div>

                            <input
                                autoFocus
                                type={editingField === 'phone' ? 'tel' : 'email'}
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '16px 20px',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    background: 'rgba(255,255,255,0.5)',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSave}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: 'var(--grad-period)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Check size={18} /> Save Changes
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Helper for the chevron
const ChevronRightIcon = ({ size, opacity }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity }}>
        <path d="m9 18 6-6-6-6" />
    </svg>
);

export default Profile;
