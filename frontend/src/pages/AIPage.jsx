import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { aiAPI } from '../services/api';
import { Brain, FileSearch, Pill, AlertTriangle, CheckCircle, Mic, Sparkles } from 'lucide-react';

export default function AIPage() {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('summarize');

    // Summarizer state
    const [summaryText, setSummaryText] = useState('');
    const [summaryResult, setSummaryResult] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(false);

    // Drug checker state
    const [drugs, setDrugs] = useState('');
    const [drugResult, setDrugResult] = useState(null);
    const [drugLoading, setDrugLoading] = useState(false);

    // Voice state
    const [voiceResult, setVoiceResult] = useState(null);

    const handleSummarize = async () => {
        if (!summaryText.trim()) return;
        setSummaryLoading(true);
        try {
            const res = await aiAPI.summarize({ text: summaryText, record_type: 'general' });
            setSummaryResult(res.data);
        } catch { alert('Summarization failed'); }
        finally { setSummaryLoading(false); }
    };

    const handleDrugCheck = async () => {
        const drugList = drugs.split(',').map(d => d.trim()).filter(Boolean);
        if (drugList.length < 2) { alert('Enter at least 2 drugs separated by commas'); return; }
        setDrugLoading(true);
        try {
            const res = await aiAPI.drugCheck({ drugs: drugList });
            setDrugResult(res.data);
        } catch { alert('Drug check failed'); }
        finally { setDrugLoading(false); }
    };

    const handleVoice = async () => {
        try {
            const res = await aiAPI.voiceInput(i18n.language);
            setVoiceResult(res.data);
        } catch { alert('Voice input failed'); }
    };

    const tabs = [
        { id: 'summarize', label: t('summarize'), icon: FileSearch },
        { id: 'drugs', label: t('drug_check'), icon: Pill },
        { id: 'voice', label: t('voice_input'), icon: Mic },
    ];

    return (
        <div className="page-shell">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Brain className="w-7 h-7 text-purple-400" /> {t('ai_features')}
            </h1>

            {/* Tab selector */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap selector-btn ${activeTab === tab.id ? 'active' : ''}`}
                        style={{
                            background: activeTab === tab.id ? 'rgba(15,23,42,0.12)' : 'var(--color-surface-lighter)',
                            color: activeTab === tab.id ? 'var(--color-secondary-dark)' : 'var(--color-text-secondary)',
                        }}>
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Summarizer */}
            {activeTab === 'summarize' && (
                <div className="glass-card p-5" style={{ animation: 'slideUp 0.3s ease' }}>
                    <h2 className="font-bold mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" /> Medical Record Summarizer
                    </h2>
                    <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
                        Paste medical text below to generate an AI-powered summary with key findings
                    </p>
                    <textarea className="input-field mb-3" rows={6}
                        placeholder="Patient presented with complaints of persistent headache for 3 days. BP: 140/90. Diagnosed with hypertension. Prescribed Amlodipine 5mg OD..."
                        value={summaryText} onChange={e => setSummaryText(e.target.value)} />
                    <button onClick={handleSummarize} disabled={summaryLoading} className="btn-primary mb-4">
                        {summaryLoading ? <span className="spinner w-4 h-4" style={{ borderWidth: '2px' }} /> : <><Sparkles className="w-4 h-4" /> {t('summarize')}</>}
                    </button>

                    {summaryResult && (
                        <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)', animation: 'slideUp 0.3s ease' }}>
                            <div>
                                <p className="text-xs font-semibold mb-1" style={{ color: '#a78bfa' }}>Summary</p>
                                <p className="text-sm">{summaryResult.summary}</p>
                            </div>
                            {summaryResult.key_findings?.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold mb-1" style={{ color: '#a78bfa' }}>Key Findings</p>
                                    <div className="space-y-1">
                                        {summaryResult.key_findings.map((f, i) => (
                                            <div key={i} className="flex items-start gap-2 text-xs">
                                                <span className="badge badge-purple flex-shrink-0">{f.category}</span>
                                                <span style={{ color: 'var(--color-text-secondary)' }}>{f.context}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                <span>Confidence: {Math.round(summaryResult.confidence * 100)}%</span>
                                <span>•</span>
                                <span>{summaryResult.ai_model}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Drug Interaction Checker */}
            {activeTab === 'drugs' && (
                <div className="glass-card p-5" style={{ animation: 'slideUp 0.3s ease' }}>
                    <h2 className="font-bold mb-3 flex items-center gap-2">
                        <Pill className="w-5 h-5 text-blue-400" /> Drug Interaction Checker
                    </h2>
                    <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
                        Enter drug names separated by commas to check for interactions
                    </p>
                    <input className="input-field mb-3" placeholder="Aspirin, Warfarin, Ibuprofen"
                        value={drugs} onChange={e => setDrugs(e.target.value)} />
                    <button onClick={handleDrugCheck} disabled={drugLoading} className="btn-primary mb-4">
                        {drugLoading ? <span className="spinner w-4 h-4" style={{ borderWidth: '2px' }} /> : <><Pill className="w-4 h-4" /> Check Interactions</>}
                    </button>

                    {drugResult && (
                        <div className="space-y-3" style={{ animation: 'slideUp 0.3s ease' }}>
                            <div className="p-3 rounded-xl flex items-center gap-2"
                                style={{ background: drugResult.interactions_found > 0 ? 'rgba(244,63,94,0.08)' : 'rgba(16,185,129,0.08)' }}>
                                {drugResult.interactions_found > 0
                                    ? <AlertTriangle className="w-5 h-5 text-rose-400" />
                                    : <CheckCircle className="w-5 h-5 text-emerald-400" />}
                                <span className="font-semibold text-sm">
                                    {drugResult.interactions_found > 0
                                        ? `${drugResult.interactions_found} interaction(s) found!`
                                        : 'No known interactions found'}
                                </span>
                            </div>

                            {drugResult.interactions?.map((inter, i) => (
                                <div key={i} className="p-4 rounded-xl" style={{ background: 'var(--color-surface-light)', border: '1px solid rgba(148,163,184,0.1)' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-bold text-sm">{inter.drug_1}</span>
                                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>×</span>
                                        <span className="font-bold text-sm">{inter.drug_2}</span>
                                        <span className={`badge ml-auto ${inter.severity === 'HIGH' ? 'badge-rose' : inter.severity === 'MODERATE' ? 'badge-amber' : 'badge-blue'}`}>
                                            {inter.severity}
                                        </span>
                                    </div>
                                    <p className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>{inter.description}</p>
                                    <p className="text-xs font-semibold" style={{ color: '#34d399' }}>💡 {inter.recommendation}</p>
                                </div>
                            ))}

                            <p className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>
                                ⚠️ {drugResult.disclaimer}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Voice Input */}
            {activeTab === 'voice' && (
                <div className="glass-card p-5" style={{ animation: 'slideUp 0.3s ease' }}>
                    <h2 className="font-bold mb-3 flex items-center gap-2">
                        <Mic className="w-5 h-5 text-emerald-400" /> {t('voice_input')} (Bhashini API)
                    </h2>
                    <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
                        Simulate voice-to-text input in your selected language
                    </p>
                    <button onClick={handleVoice} className="btn-success mb-4">
                        <Mic className="w-4 h-4" /> Start Voice Input (Simulated)
                    </button>

                    {voiceResult && (
                        <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', animation: 'slideUp 0.3s ease' }}>
                            <p className="text-sm font-medium">{voiceResult.text}</p>
                            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                <span>Language: {voiceResult.language}</span>
                                <span>•</span>
                                <span>Confidence: {Math.round(voiceResult.confidence * 100)}%</span>
                                <span>•</span>
                                <span>{voiceResult.service}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

