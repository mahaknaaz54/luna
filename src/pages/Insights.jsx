import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeatmapCalendar from '../components/HeatmapCalendar';
import InsightCard from '../components/InsightCard';
import { fetchAIAnalysis } from '../api/analyzeApi';

const Insights = ({ viewDate, onViewDateChange, periodDays, onDateClick, phase, symptomLogs, calculatePhase, cycleEntries = [] }) => {
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);

    useEffect(() => {
        const loadAIAnalysis = async () => {
            if (!cycleEntries || cycleEntries.length < 3) return; // Don't bother if too little data

            setAiLoading(true);
            setAiError(null);
            try {
                const data = await fetchAIAnalysis();
                setAiAnalysis(data);
            } catch (err) {
                console.error("AI Analysis error:", err);
                setAiError(err.message);
            } finally {
                setAiLoading(false);
            }
        };

        loadAIAnalysis();
    }, [cycleEntries]);

    const generatedInsights = useMemo(() => {
        if (!cycleEntries || cycleEntries.length === 0) {
            return [
                { id: 1, text: "Start logging your days to get personalized insights.", icon: "✨" }
            ];
        }

        const insights = [];
        let idCounter = 1;

        const periodStarts = cycleEntries.filter(e => e.phase === 'period_start').map(e => new Date(e.period_start_date)).sort((a, b) => a - b);
        if (periodStarts.length > 1) {
            let totalDiff = 0;
            for (let i = 1; i < periodStarts.length; i++) {
                totalDiff += (periodStarts[i] - periodStarts[i - 1]) / (1000 * 60 * 60 * 24);
            }
            const avg = Math.round(totalDiff / (periodStarts.length - 1));
            insights.push({ id: idCounter++, text: `Your average cycle length is ${avg} days.`, icon: "🌙" });
        } else {
            const defaultLen = cycleEntries[0]?.cycle_length || 28;
            insights.push({ id: idCounter++, text: `You've set your cycle to ${defaultLen} days! Log more periods for an exact average.`, icon: "🌙" });
        }

        const symptomCounts = {};
        const moodCounts = {};

        cycleEntries.forEach(entry => {
            if (entry.symptoms) {
                entry.symptoms.forEach(s => {
                    symptomCounts[s] = (symptomCounts[s] || 0) + 1;
                });
            }
            if (entry.mood) {
                moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
            }
        });

        const sortedSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]);
        if (sortedSymptoms.length > 0) {
            const topSymptom = sortedSymptoms[0][0];
            insights.push({ id: idCounter++, text: `You frequently log experiencing ${topSymptom.toLowerCase()}.`, icon: "☁️" });
        }

        const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
        if (sortedMoods.length > 0) {
            const topMood = sortedMoods[0][0];
            insights.push({ id: idCounter++, text: `Your most frequently logged mood is ${topMood}.`, icon: topMood });
        }

        if (insights.length < 3) {
            insights.push({ id: idCounter++, text: "Your body is unique. Consistency is key to better insights.", icon: "✨" })
        }

        return insights.slice(0, 3);
    }, [cycleEntries]);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="page-wrapper"
        >
            <header style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 500, opacity: 0.6, marginBottom: '4px' }}>Insights</h2>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.03em' }}>Cycle <span className="gradient-text" style={{ background: 'var(--grad-ovulation)', WebkitBackgroundClip: 'text' }}>Overview</span></h1>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '100px' }}>
                <HeatmapCalendar
                    viewDate={viewDate}
                    onViewDateChange={onViewDateChange}
                    periodDays={periodDays}
                    onDateClick={onDateClick}
                    phase={phase}
                    symptomLogs={symptomLogs}
                    calculatePhase={calculatePhase}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, opacity: 0.8 }}>AI Insights</h3>
                        {aiLoading && <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Luna is analyzing...</span>}
                    </div>

                    {aiError && (
                        <div className="glass" style={{ padding: '16px', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--color-pms)', border: '1px solid rgba(255,100,100,0.2)' }}>
                            {aiError.includes('not configured') ? "AI not configured. Add your Gemini API key to see deep insights." : `Note: Using local insights. (${aiError})`}
                        </div>
                    )}

                    {aiAnalysis ? (
                        <>
                            <InsightCard
                                insight={aiAnalysis.summary}
                                phase={phase}
                                icon="🌙"
                            />
                            {aiAnalysis.patterns.map((p, i) => (
                                <InsightCard
                                    key={`pattern-${i}`}
                                    insight={p}
                                    phase={phase}
                                    icon="🔍"
                                />
                            ))}
                            {aiAnalysis.recommendations.map((r, i) => (
                                <InsightCard
                                    key={`rec-${i}`}
                                    insight={r}
                                    phase={phase}
                                    icon="✨"
                                />
                            ))}
                        </>
                    ) : (
                        generatedInsights.map((insight) => (
                            <InsightCard
                                key={insight.id}
                                insight={insight.text}
                                phase={phase}
                                icon={insight.icon}
                            />
                        ))
                    )}
                </div>

                <div className="glass" style={{ padding: '24px', borderRadius: '32px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Upcoming Predictions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '16px', background: 'var(--grad-ovulation)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>🌸</div>
                                <div>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Ovulation Window</p>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Estimated in 5 days</p>
                                </div>
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.8 }}>Feb 26 - Mar 2</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '16px', background: 'var(--grad-period)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>🩸</div>
                                <div>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Next Period</p>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Expected in 15 days</p>
                                </div>
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.8 }}>Mar 10</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Insights;
