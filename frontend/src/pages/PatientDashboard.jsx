import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { patientAPI } from '../services/api';
import { FileText, Shield, Users, Activity, TrendingUp, Clock, Droplets, AlertTriangle } from 'lucide-react';

export default function PatientDashboard() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        patientAPI.getDashboard().then(res => {
            setData(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="spinner" />
        </div>
    );

    const stats = data?.stats || {};

    return (
        <div style={{ animation: 'slideUp 0.4s ease' }}>
            {/* Welcome header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                    {t('welcome')}, {data?.user?.full_name || user?.full_name} 👋
                </h1>
                <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
                    Your health records are secured on the blockchain
                </p>
            </div>

            {/* Quick info chips */}
            {(data?.user?.blood_group || data?.user?.allergies) && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {data.user.blood_group && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                            style={{ background: 'rgba(244,63,94,0.12)', color: '#fb7185' }}>
                            <Droplets className="w-3.5 h-3.5" /> {data.user.blood_group}
                        </span>
                    )}
                    {data.user.allergies && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                            style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24' }}>
                            <AlertTriangle className="w-3.5 h-3.5" /> {data.user.allergies}
                        </span>
                    )}
                </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="glass-card stat-card blue p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(59,130,246,0.15)' }}>
                            <FileText className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="badge badge-blue">{t('medical_records')}</span>
                    </div>
                    <p className="text-3xl font-bold">{stats.total_records || 0}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{t('total_records')}</p>
                </div>

                <div className="glass-card stat-card emerald p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(16,185,129,0.15)' }}>
                            <Shield className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="badge badge-emerald">{t('doctor')}</span>
                    </div>
                    <p className="text-3xl font-bold">{stats.active_doctor_access || 0}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{t('active_doctors')}</p>
                </div>

                <div className="glass-card stat-card amber p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(245,158,11,0.15)' }}>
                            <Users className="w-5 h-5 text-amber-400" />
                        </div>
                        <span className="badge badge-amber">{t('trusted_persons')}</span>
                    </div>
                    <p className="text-3xl font-bold">{stats.trusted_persons || 0}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{t('trusted_persons')}</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <h2 className="font-bold">{t('recent_activity')}</h2>
                    <span className="pulse-dot bg-emerald-400 ml-auto" />
                </div>

                {data?.recent_activity?.length > 0 ? (
                    <div className="space-y-3">
                        {data.recent_activity.map((log, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                                style={{ background: 'rgba(148,163,184,0.05)', animation: `slideIn ${0.3 + i * 0.1}s ease` }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(59,130,246,0.15)' }}>
                                    <Clock className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                                    <p className="tx-hash mt-1">{log.tx_hash}</p>
                                </div>
                                <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                                    {new Date(log.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                        No recent activity. Upload records or grant access to get started.
                    </p>
                )}
            </div>
        </div>
    );
}
