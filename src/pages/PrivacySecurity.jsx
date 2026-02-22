import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowLeft, Download, Trash2, Fingerprint, AlertTriangle, CheckCircle2 } from 'lucide-react';

const PrivacySecurity = ({ onBack, cycleData, symptomLogs }) => {
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(() => {
        return localStorage.getItem('luna-biometric-lock') === 'true';
    });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [showExportSuccess, setShowExportSuccess] = useState(false);

    const toggleBiometric = () => {
        const newState = !isBiometricEnabled;
        setIsBiometricEnabled(newState);
        localStorage.setItem('luna-biometric-lock', newState);
    };

    const handleExport = () => {
        const dataToExport = {
            cycleData,
            symptomLogs,
            exportDate: new Date().toISOString(),
            app: "Luna UI"
        };
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `luna_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setShowExportSuccess(true);
        setTimeout(() => setShowExportSuccess(false), 3000);
    };

    const handleDeleteAccount = () => {
        // Mock delete functionality
        console.log("Account deleted");
        setIsDeleteModalOpen(false);
        alert("Account would be deleted in a real app.");
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="page-wrapper"
            style={{ padding: '24px 24px 100px' }}
        >
            <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onBack}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        color: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <ArrowLeft size={24} />
                </motion.button>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Privacy & Security</h2>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Biometric Lock Section */}
                <section className="glass" style={{ padding: '24px', borderRadius: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ color: 'var(--color-pms)', background: 'rgba(0,0,0,0.03)', padding: '10px', borderRadius: '16px' }}>
                                <Fingerprint size={22} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Biometric Lock</h3>
                                <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Requires FaceID or TouchID to open</p>
                            </div>
                        </div>
                        <motion.div
                            onClick={toggleBiometric}
                            style={{
                                width: '56px',
                                height: '28px',
                                background: isBiometricEnabled ? 'var(--grad-period)' : 'rgba(0,0,0,0.1)',
                                borderRadius: '20px',
                                padding: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: isBiometricEnabled ? 'flex-end' : 'flex-start',
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
                    </div>
                </section>

                {/* Export Data Section */}
                <section className="glass" style={{ padding: '24px', borderRadius: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ color: 'var(--color-safe)', background: 'rgba(0,0,0,0.03)', padding: '10px', borderRadius: '16px' }}>
                                <Download size={22} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Export Cycle Data</h3>
                                <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Download your history as JSON</p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleExport}
                            style={{
                                background: 'rgba(0,0,0,0.05)',
                                border: 'none',
                                padding: '10px 16px',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                color: 'var(--text-main)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {showExportSuccess ? <CheckCircle2 size={16} color="#4caf50" /> : "Export"}
                        </motion.button>
                    </div>
                </section>

                {/* Privacy Info */}
                <section style={{ padding: '0 12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', opacity: 0.6 }}>
                        <Shield size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <p style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                            Your data is encrypted and stored locally on your device. Luna never shares your private health information with third parties.
                        </p>
                    </div>
                </section>

                {/* Delete Account Section - Warning Styling */}
                <section
                    className="glass"
                    style={{
                        padding: '24px',
                        borderRadius: '32px',
                        marginTop: '40px',
                        border: '1px solid rgba(255, 75, 75, 0.2)',
                        background: 'rgba(255, 245, 245, 0.5)'
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ color: '#ff4b4b', background: 'rgba(255, 75, 75, 0.1)', padding: '10px', borderRadius: '16px' }}>
                                <AlertTriangle size={22} />
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ff4b4b' }}>Danger Zone</h3>
                        </div>
                        <p style={{ fontSize: '0.85rem', opacity: 0.6, lineHeight: '1.5' }}>
                            Deleting your account will permanently erase all your cycle history and symptom logs. This action cannot be undone.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsDeleteModalOpen(true)}
                            style={{
                                background: '#ff4b4b',
                                color: 'white',
                                border: 'none',
                                padding: '16px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                marginTop: '8px',
                                boxShadow: '0 8px 20px rgba(255, 75, 75, 0.2)'
                            }}
                        >
                            <Trash2 size={18} />
                            Delete My Account
                        </motion.button>
                    </div>
                </section>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div
                        className="modal-overlay"
                        onClick={() => setIsDeleteModalOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.15)',
                            backdropFilter: 'blur(12px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 3000,
                            padding: '24px'
                        }}
                    >
                        <motion.div
                            initial={{ y: 100, opacity: 0, scale: 0.9, rotateX: 20 }}
                            animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
                            exit={{ y: 100, opacity: 0, scale: 0.9, rotateX: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="glass"
                            onClick={e => e.stopPropagation()}
                            style={{
                                padding: '32px',
                                maxWidth: '380px',
                                width: '100%',
                                borderRadius: '40px',
                                textAlign: 'center',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.4)',
                                background: 'rgba(255,255,255,0.8)',
                                perspective: '1000px'
                            }}
                        >
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: 'rgba(255, 75, 75, 0.1)',
                                borderRadius: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ff4b4b',
                                margin: '0 auto 24px'
                            }}>
                                <Trash2 size={32} />
                            </div>

                            <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-main)' }}>Are you sure?</h3>
                            <p style={{ fontSize: '0.95rem', opacity: 0.6, marginBottom: '32px', lineHeight: '1.5' }}>
                                This will permanently delete all your data. This action is irreversible.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleDeleteAccount}
                                    style={{
                                        padding: '16px',
                                        background: '#ff4b4b',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '20px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontSize: '1rem'
                                    }}
                                >
                                    Yes, Delete Everything
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    style={{
                                        padding: '16px',
                                        background: 'rgba(0,0,0,0.05)',
                                        color: 'var(--text-main)',
                                        border: 'none',
                                        borderRadius: '20px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontSize: '1rem'
                                    }}
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PrivacySecurity;
