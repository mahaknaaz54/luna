import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Components
import BottomNav from './components/BottomNav';
import FloatingBubble from './components/FloatingBubble';
import PhaseBackground from './components/PhaseBackground';

// Pages
import Home from './pages/Home';
import Insights from './pages/Insights';
import History from './pages/History';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import PrivacySecurity from './pages/PrivacySecurity';
import Login from './pages/Login';

// Context
import { CareModeProvider, useCareMode } from './context/CareModeContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Utils
import { DEFAULT_SETTINGS, VALID_THEMES } from './constants/phases';
import { formatDate } from './utils/dateUtils';
import { calculatePhase, getPhaseDisplayData } from './utils/cycleCalculations';

// Smooth crossfade overlay when switching theme
function ThemeFadeOverlay() {
  const { isTransitioning } = useTheme();
  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          key="theme-fade"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bg-soft)',
            zIndex: 8888,
            pointerEvents: 'none',
          }}
        />
      )}
    </AnimatePresence>
  );
}

const TABS = ['home', 'insights', 'history', 'profile', 'settings'];

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [direction, setDirection] = useState(0);

  const { user, logout } = useAuth();
  const { isCareMode } = useCareMode();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
      setActiveTab('home');
    }
  };

  const [symptomLogs, setSymptomLogs] = useState({});
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [comment, setComment] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [logDate, setLogDate] = useState(null);

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('luna-settings');
      if (!saved) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(saved);
      if (!VALID_THEMES.includes(parsed?.theme)) parsed.theme = 'Auto';
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem('luna-settings', JSON.stringify(settings));
    window.dispatchEvent(new Event('luna-settings-change'));
  }, [settings]);

  const updateLogDate = useCallback((date) => {
    setLogDate(date);
    if (date && symptomLogs[date]) {
      setSelectedEmoji(symptomLogs[date].emoji || null);
      setComment(symptomLogs[date].comment || '');
      setSelectedSymptoms(symptomLogs[date].symptoms || []);
    } else {
      setSelectedEmoji(null);
      setComment('');
      setSelectedSymptoms([]);
    }
  }, [symptomLogs]);

  const handleTabChange = (newTab) => {
    if (newTab === 'log-modal') {
      const today = new Date().toISOString().split('T')[0];
      updateLogDate(today);
      return;
    }
    const currentIndex = TABS.indexOf(activeTab);
    const newIndex = TABS.indexOf(newTab);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(newTab);
  };

  const [cycleData, setCycleData] = useState({
    periodDays: [],
    startMarkers: [],
    endMarkers: [],
    cycleLength: settings?.cycleLength || 28
  });

  const [cycleEntries, setCycleEntries] = useState([]);
  const [refreshTick, setRefreshTick] = useState(0);

  // ---------- localStorage helpers ----------
  const getCycleKey = () => `luna-cycle-${user?.id}`;

  const loadCycleEntries = () => {
    if (!user) return [];
    try { return JSON.parse(localStorage.getItem(getCycleKey()) || '[]'); }
    catch { return []; }
  };

  const persistCycleEntries = (entries) => {
    if (!user) return;
    localStorage.setItem(getCycleKey(), JSON.stringify(entries));
  };

  useEffect(() => {
    if (!user) return;
    const data = loadCycleEntries();
    setCycleEntries(data);

    const newSymptomLogs = {};
    const newPeriodDays = [];
    const newStartMarkers = [];
    const newEndMarkers = [];

    data.forEach(entry => {
      const d = entry.period_start_date;
      if (entry.mood || entry.notes || (entry.symptoms && entry.symptoms.length > 0)) {
        newSymptomLogs[d] = {
          emoji: entry.mood,
          comment: entry.notes,
          symptoms: entry.symptoms || []
        };
      }
      if (entry.phase === 'period_start') {
        newStartMarkers.push(d);
        newPeriodDays.push(d);
      } else if (entry.phase === 'period_end') {
        newEndMarkers.push(d);
        newPeriodDays.push(d);
      } else if (entry.phase === 'period') {
        newPeriodDays.push(d);
      }
    });

    // Auto-fill continuous period days between start and end markers
    const finalPeriodDays = new Set([...newPeriodDays]);
    newStartMarkers.sort().forEach(startD => {
      const nextEnd = newEndMarkers.filter(d => d >= startD).sort()[0];
      if (nextEnd) {
        let curr = new Date(startD.replace(/-/g, '/'));
        const end = new Date(nextEnd.replace(/-/g, '/'));
        let count = 0;
        while (curr <= end && count < 10) {
          finalPeriodDays.add(formatDate(curr));
          curr.setDate(curr.getDate() + 1);
          count++;
        }
      }
    });

    setSymptomLogs(newSymptomLogs);
    setCycleData(prev => ({
      ...prev,
      periodDays: Array.from(finalPeriodDays),
      startMarkers: newStartMarkers,
      endMarkers: newEndMarkers
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refreshTick]);

  const handleDeleteEntry = (id) => {
    if (!user) return;
    const updated = loadCycleEntries().filter(e => e.id !== id);
    persistCycleEntries(updated);
    setRefreshTick(prev => prev + 1);
  };

  useEffect(() => {
    setCycleData(prev => ({ ...prev, cycleLength: settings.cycleLength }));
  }, [settings.cycleLength]);

  const currentCyclePhase = useCallback((targetDate) => {
    return calculatePhase({
      targetDate,
      periodDays: cycleData.periodDays,
      startMarkers: cycleData.startMarkers,
      endMarkers: cycleData.endMarkers,
      cycleLength: cycleData.cycleLength
    });
  }, [cycleData]);

  const { currentDay, currentPhase: phase } = currentCyclePhase();
  const phaseData = getPhaseDisplayData(phase, currentDay, cycleData.cycleLength);

  const saveEntry = (date, updates) => {
    if (!user) return;
    const entries = loadCycleEntries();
    const idx = entries.findIndex(e => e.period_start_date === date);
    if (idx !== -1) {
      entries[idx] = { ...entries[idx], ...updates };
    } else {
      entries.push({
        id: `entry_${Date.now()}`,
        user_id: user.id,
        period_start_date: date,
        cycle_length: settings.cycleLength || 28,
        ...updates
      });
    }
    persistCycleEntries(entries);
  };

  const handleLogAction = async (date, action) => {
    let phaseUpdate = null;
    let nextPeriodDays = [...cycleData.periodDays];
    let nextStartMarkers = [...cycleData.startMarkers];
    let nextEndMarkers = [...cycleData.endMarkers];

    if (action === 'toggle') {
      if (nextPeriodDays.includes(date)) {
        nextPeriodDays = nextPeriodDays.filter(d => d !== date);
        nextStartMarkers = nextStartMarkers.filter(d => d !== date);
        nextEndMarkers = nextEndMarkers.filter(d => d !== date);
        phaseUpdate = 'safe';
      } else {
        nextPeriodDays.push(date);
        phaseUpdate = 'period';
      }
    } else if (action === 'started') {
      if (!nextStartMarkers.includes(date)) {
        nextStartMarkers.push(date);
        nextPeriodDays.push(date);
        phaseUpdate = 'period_start';
        const nextEnd = nextEndMarkers.filter(d => d > date).sort()[0];
        if (nextEnd) {
          let curr = new Date(date.replace(/-/g, '/'));
          const end = new Date(nextEnd.replace(/-/g, '/'));
          let count = 0;
          while (curr < end && count < 10) {
            curr.setDate(curr.getDate() + 1);
            const dStr = formatDate(curr);
            if (!nextPeriodDays.includes(dStr)) nextPeriodDays.push(dStr);
            count++;
          }
        }
      } else {
        nextStartMarkers = nextStartMarkers.filter(d => d !== date);
        phaseUpdate = 'safe';
      }
    } else if (action === 'ended') {
      if (!nextEndMarkers.includes(date)) {
        nextEndMarkers.push(date);
        nextPeriodDays.push(date);
        phaseUpdate = 'period_end';
        const prevStart = nextStartMarkers.filter(d => d < date).sort().reverse()[0];
        if (prevStart) {
          let curr = new Date(prevStart.replace(/-/g, '/'));
          const end = new Date(date.replace(/-/g, '/'));
          let count = 0;
          while (curr < end && count < 10) {
            curr.setDate(curr.getDate() + 1);
            const dStr = formatDate(curr);
            if (!nextPeriodDays.includes(dStr)) nextPeriodDays.push(dStr);
            count++;
          }
        }
      } else {
        nextEndMarkers = nextEndMarkers.filter(d => d !== date);
        phaseUpdate = 'safe';
      }
    }

    setCycleData(prev => ({
      ...prev,
      periodDays: [...new Set(nextPeriodDays)],
      startMarkers: nextStartMarkers,
      endMarkers: nextEndMarkers
    }));

    if (action === 'save') {
      setSymptomLogs(prev => ({
        ...prev,
        [date]: { emoji: selectedEmoji, comment: comment, symptoms: selectedSymptoms }
      }));
      saveEntry(date, { mood: selectedEmoji, notes: comment, symptoms: selectedSymptoms });
    } else {
      saveEntry(date, { phase: phaseUpdate });
    }

    setRefreshTick(prev => prev + 1);
    setLogDate(null);
  };

  const pageVariants = {
    initial: (dir) => ({
      x: dir > 0 ? '10%' : '-10%',
      opacity: 0,
      filter: 'blur(10px)'
    }),
    animate: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        x: { type: "tween", duration: 0.6, ease: "easeOut" },
        opacity: { duration: 0.4 },
        filter: { duration: 0.4 }
      }
    },
    exit: (dir) => ({
      x: dir > 0 ? '-10%' : '10%',
      opacity: 0,
      filter: 'blur(10px)',
      transition: {
        x: { type: "tween", duration: 0.6, ease: "easeIn" },
        opacity: { duration: 0.4 },
        filter: { duration: 0.4 }
      }
    })
  };

  const renderPage = () => {
    let content;
    switch (activeTab) {
      case 'home':
        content = <Home data={phaseData} phase={phase} currentDay={currentDay} cycleLength={cycleData.cycleLength} isCareMode={isCareMode} />;
        break;
      case 'insights':
        content = (
          <Insights
            viewDate={viewDate}
            onViewDateChange={setViewDate}
            periodDays={cycleData.periodDays}
            onDateClick={updateLogDate}
            phase={phase}
            symptomLogs={symptomLogs}
            calculatePhase={currentCyclePhase}
            cycleEntries={cycleEntries}
          />
        );
        break;
      case 'history':
        content = <History cycleEntries={cycleEntries} onDeleteEntry={handleDeleteEntry} />;
        break;
      case 'profile':
        content = <Profile onNavigate={handleTabChange} onLogout={handleLogout} />;
        break;
      case 'privacy-security':
        content = (
          <PrivacySecurity
            onBack={() => handleTabChange('profile')}
            cycleData={cycleData}
            symptomLogs={symptomLogs}
          />
        );
        break;
      case 'settings':
        content = <Settings settings={settings} setSettings={setSettings} onBack={() => handleTabChange('profile')} />;
        break;
      default:
        content = <Home data={phaseData} phase={phase} currentDay={currentDay} cycleLength={cycleData.cycleLength} isCareMode={isCareMode} />;
    }

    return (
      <motion.div
        key={activeTab}
        custom={direction}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ width: '100%', height: '100%' }}
      >
        {content}
      </motion.div>
    );
  };

  if (!user) {
    return (
      <AnimatePresence>
        <Login key="login-page" />
      </AnimatePresence>
    );
  }

  return (
    <div className="app-container" data-care-mode={isCareMode}>
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'var(--bg-page)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-main)', opacity: 0.6 }}
            >
              Safely logging out...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ThemeFadeOverlay />
      <PhaseBackground phase={phase} isCareMode={isCareMode} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          {renderPage()}
        </AnimatePresence>
      </motion.div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* AI Chat Floating Action Button */}
      <FloatingBubble />

      {/* Daily Log Selection Modal */}
      <AnimatePresence>
        {logDate && (
          <div
            className="modal-overlay"
            onClick={() => setLogDate(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.1)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '24px'
            }}
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.9 }}
              className="glass"
              onClick={e => e.stopPropagation()}
              style={{
                padding: '32px',
                maxWidth: '380px',
                width: '100%',
                borderRadius: '40px',
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                border: '1px solid var(--glass-border)',
                background: 'var(--overlay-bg)'
              }}
            >
              <header style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '8px' }}>How are you feeling?</h3>
                <p style={{ fontSize: '0.9rem', opacity: 0.5 }}>{logDate}</p>
              </header>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                {['😊', '😔', '🩸', '⚡', '☁️', '🌸'].map(emoji => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedEmoji(emoji)}
                    style={{
                      fontSize: '1.8rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      filter: selectedEmoji === emoji ? 'none' : 'grayscale(1) opacity(0.5)',
                      transform: selectedEmoji === emoji ? 'scale(1.2)' : 'scale(1)',
                      transition: 'all 0.2s ease'
                    }}
                    aria-label={`Select mood ${emoji}`}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                {['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Acne', 'Cravings'].map(symp => (
                  <motion.button
                    key={symp}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSymptoms(prev => prev.includes(symp) ? prev.filter(s => s !== symp) : [...prev, symp])}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: '1px solid var(--border-subtle)',
                      background: selectedSymptoms.includes(symp) ? 'var(--grad-period)' : 'var(--glass-bg)',
                      color: selectedSymptoms.includes(symp) ? 'white' : 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {symp}
                  </motion.button>
                ))}
              </div>

              <textarea
                placeholder="Add a comment or notes..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{
                  width: '100%',
                  height: '100px',
                  borderRadius: '24px',
                  border: '1px solid var(--border-subtle)',
                  padding: '16px',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  background: 'var(--input-bg)',
                  marginBottom: '24px',
                  outline: 'none',
                  resize: 'none'
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    style={{ padding: '16px', border: 'none', borderRadius: '20px', cursor: 'pointer', color: 'white', background: 'var(--grad-period)', fontWeight: 600, fontSize: '0.9rem' }}
                    onClick={() => handleLogAction(logDate, 'started')}
                  >
                    Period Started 🩸
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    style={{ padding: '16px', border: 'none', borderRadius: '20px', cursor: 'pointer', color: 'white', background: 'var(--color-pms)', fontWeight: 600, fontSize: '0.9rem' }}
                    onClick={() => handleLogAction(logDate, 'ended')}
                  >
                    Period Ended ✨
                  </motion.button>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  style={{ padding: '16px', border: 'none', borderRadius: '20px', cursor: 'pointer', color: 'var(--text-main)', background: 'var(--border-subtle)', fontWeight: 600, fontSize: '0.9rem' }}
                  onClick={() => handleLogAction(logDate, 'save')}
                >
                  Done
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CareModeProvider>
        <AppContentWrapper />
      </CareModeProvider>
    </AuthProvider>
  );
}

const VALID_THEME_MODES = new Set(['Auto', 'Light', 'Soft Dark']);

function safeReadTheme(raw) {
  const val = raw?.theme;
  return typeof val === 'string' && VALID_THEME_MODES.has(val) ? val : 'Auto';
}

function AppContentWrapper() {
  const [themeMode, setThemeMode] = useState(() => {
    try {
      const saved = localStorage.getItem('luna-settings');
      return safeReadTheme(saved ? JSON.parse(saved) : {});
    } catch {
      return 'Auto';
    }
  });

  useEffect(() => {
    const sync = () => {
      try {
        const s = JSON.parse(localStorage.getItem('luna-settings') || '{}');
        setThemeMode(safeReadTheme(s));
      } catch {
        setThemeMode('Auto');
      }
    };
    window.addEventListener('luna-settings-change', sync);
    return () => window.removeEventListener('luna-settings-change', sync);
  }, []);

  return (
    <ThemeProvider themeMode={themeMode}>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
