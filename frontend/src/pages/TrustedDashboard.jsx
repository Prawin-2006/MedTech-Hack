import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { trustedAPI } from '../services/api';
import { Users, Eye, Droplets, AlertTriangle, Pill, FileText } from 'lucide-react';

export default function TrustedDashboard() {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [records, setRecords] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        trustedAPI.getDashboard().then(res => {
            setData(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const viewRecords = (patientId) => {
        trustedAPI.getRecords(patientId).then(res => {
            setRecords(res.data);
        });
    };

    if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

    return (
        <div className="page-shell">
            <h1 className="page-title mb-6">{t('trusted_persons')} — {t('dashboard')}</h1>

            {/* Patients who trust this user */}
            <div className="glass-card p-5 mb-6">
                <h2 className="font-bold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-400" /> Patients Who Trust You
                </h2>
                {data?.trusted_by?.length > 0 ? (
                    <div className="space-y-3">
                        {data.trusted_by.map((p) => (
                            <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl"
                                style={{ background: 'var(--color-surface-light)' }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                                    style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                                    {p.name?.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{p.name}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className="badge badge-amber">{p.permission_level}</span>
                                        {p.blood_group && (
                                            <span className="flex items-center gap-1 text-xs" style={{ color: '#fb7185' }}>
                                                <Droplets className="w-3 h-3" /> {p.blood_group}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => viewRecords(p.id)} className="btn-secondary text-xs py-2 px-3">
                                    <Eye className="w-3.5 h-3.5" /> {t('view_records')}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
                        No patients have added you as a trusted person yet.
                    </p>
                )}
            </div>

            {/* Records viewer */}
            {records && (
                <div className="glass-card p-5" style={{ animation: 'slideUp 0.3s ease' }}>
                    <h2 className="font-bold mb-2">Records — {records.patient_name}</h2>
                    <p className="text-xs mb-4 px-2 py-1 rounded-lg inline-block"
                        style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}>
                        {records.note}
                    </p>

                    {records.blood_group && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="badge badge-rose flex items-center gap-1">
                                <Droplets className="w-3 h-3" /> {records.blood_group}
                            </span>
                            {records.allergies && (
                                <span className="badge badge-amber flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> {records.allergies}
                                </span>
                            )}
                            {records.medications && (
                                <span className="badge badge-blue flex items-center gap-1">
                                    <Pill className="w-3 h-3" /> {records.medications}
                                </span>
                            )}
                        </div>
                    )}

                    {records.records?.length > 0 ? (
                        <div className="space-y-2">
                            {records.records.map((r) => (
                                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl"
                                    style={{ background: 'var(--color-surface-light)' }}>
                                    <FileText className="w-4 h-4 text-blue-400" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{r.title}</p>
                                        <span className="badge badge-purple text-xs">{r.type}</span>
                                    </div>
                                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                            No records available at your permission level.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

