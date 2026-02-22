import { motion } from 'framer-motion';
import './InsightCard.css';

const InsightCard = ({ insight, phase, icon }) => {
    // Fallback icons if none provided
    const getIcon = () => {
        if (icon) return icon;
        switch (phase) {
            case 'period': return '🩸';
            case 'ovulation': return '🌸';
            case 'pms': return '☁️';
            case 'safe': return '🌿';
            default: return '✨';
        }
    };

    return (
        <motion.div
            className={`insight-card phase-${phase}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="insight-icon-container">
                <div className="insight-icon-glow" />
                {getIcon()}
            </div>
            <div className="insight-content">
                <p className="insight-text">{insight}</p>
            </div>
        </motion.div>
    );
};

export default InsightCard;
