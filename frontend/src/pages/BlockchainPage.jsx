import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { blockchainAPI } from '../services/api';
import { Link2, Box, Hash, Clock, Activity, CheckCircle, Search } from 'lucide-react';

export default function BlockchainPage() {
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifyHash, setVerifyHash] = useState('');
    const [verifyResult, setVerifyResult] = useState(null);

    useEffect(() => {
        Promise.all([
            blockchainAPI.getLogs(30),
            blockchainAPI.getStatus(),
        ]).then(([logsRes, statusRes]) => {
            setLogs(logsRes.data.logs || []);
            setStatus(statusRes.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleVerify = async () => {
        if (!verifyHash) return;
        try {
            const res = await blockchainAPI.verify(verifyHash);
            setVerifyResult(res.data);
        } catch {
            setVerifyResult({ verified: false });
        }
    };

    const actionColors = {
        record_upload: '#3b82f6', record_view: '#10b981', access_grant: '#f59e0b',
        access_revoke: '#f43f5e', emergency_access: '#ef4444', user_register: '#8b5cf6',
        trusted_add: '#06b6d4', trusted_remove: '#f97316', prescription_upload: '#10b981',
        emergency_qr_generated: '#ec4899', note_added: '#6366f1',
    };

    if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

    return (
        <div className="page-shell">
            <h1 className="page-title mb-6">{t('blockchain_logs')}</h1>

            {/* Chain status */}
            {status && (
                <div className="glass-card p-5 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Box className="w-5 h-5 text-blue-400" />
                        <h2 className="font-bold">Blockchain Status</h2>
                        <span className="pulse-dot bg-emerald-400 ml-auto" />
                        <span className="text-xs text-emerald-400 font-semibold">Live</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl" style={{ background: 'var(--color-surface-light)' }}>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Network</p>
                            <p className="text-sm font-bold mt-0.5">{status.network}</p>
                        </div>
                        <div className="p-3 rounded-xl" style={{ background: 'var(--color-surface-light)' }}>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Total Blocks</p>
                            <p className="text-sm font-bold mt-0.5">{status.total_blocks}</p>
                        </div>
                        <div className="p-3 rounded-xl" style={{ background: 'var(--color-surface-light)' }}>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Transactions</p>
                            <p className="text-sm font-bold mt-0.5">{status.total_transactions}</p>
                        </div>
                        <div className="p-3 rounded-xl" style={{ background: 'var(--color-surface-light)' }}>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Consensus</p>
                            <p className="text-sm font-bold mt-0.5">{status.consensus}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Verify hash */}
            <div className="glass-card p-5 mb-6">
                <h2 className="font-bold mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-400" /> Verify Record Hash
                </h2>
                <div className="flex gap-2">
                    <input className="input-field flex-1" placeholder="Enter data hash to verify"
                        value={verifyHash} onChange={e => setVerifyHash(e.target.value)} />
                    <button onClick={handleVerify} className="btn-primary">Verify</button>
                </div>
                {verifyResult && (
                    <div className={`mt-3 p-3 rounded-xl text-sm flex items-center gap-2`}
                        style={{ background: verifyResult.verified ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)' }}>
                        <CheckCircle className={`w-4 h-4 ${verifyResult.verified ? 'text-emerald-400' : 'text-rose-400'}`} />
                        <span style={{ color: verifyResult.verified ? '#34d399' : '#fb7185' }}>
                            {verifyResult.verified
                                ? `Verified! TX: ${verifyResult.tx_hash?.slice(0, 20)}... | Block #${verifyResult.block_number}`
                                : 'Hash not found on blockchain'}
                        </span>
                    </div>
                )}
            </div>

            {/* Transaction logs */}
            <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <h2 className="font-bold">Transaction History</h2>
                    <span className="text-xs ml-auto" style={{ color: 'var(--color-text-muted)' }}>
                        {logs.length} transactions
                    </span>
                </div>
                <div className="space-y-2">
                    {logs.map((log, i) => (
                        <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl"
                            style={{ background: 'rgba(148,163,184,0.03)', animation: `slideIn ${0.15 + i * 0.05}s ease` }}>
                            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                                style={{ background: actionColors[log.action_type] || '#94a3b8' }} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                        {log.action_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </span>
                                    <span className="badge badge-blue">Block #{log.block_number}</span>
                                </div>
                                <p className="tx-hash mt-1 text-xs break-all">{log.tx_hash}</p>
                            </div>
                            <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                                {new Date(log.timestamp).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

