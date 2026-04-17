import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { useTranslation } from 'react-i18next';
import { doctorAPI } from '../services/api';
import { Users, FileText, Eye, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        doctorAPI.getDashboard().then(res => {
            setData(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

    return (
        <div className="page-shell">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                    {t('welcome')}, Dr. {data?.doctor?.name || user?.full_name} ⚕️
                </h1>
                <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
                    {data?.total_patients || 0} patients have granted you access
                </p>
            </div>

            {/* Stats */}
            <div className="glass-card stat-card blue p-5 mb-6 max-w-sm">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(59,130,246,0.15)' }}>
                        <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{data?.total_patients || 0}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t('my_patients')}</p>
                    </div>
                </div>
            </div>

            {/* Patient list */}
            <div className="glass-card p-5">
                <h2 className="font-bold mb-4 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-emerald-400" /> {t('my_patients')}
                </h2>

                {data?.patients?.length > 0 ? (
                    <div className="space-y-3">
                        {data.patients.map((p, i) => (
                            <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.01]"
                                style={{ background: 'var(--color-surface-light)', animation: `slideIn ${0.3 + i * 0.1}s ease`, cursor: 'pointer' }}
                                onClick={() => navigate(`/patients/${p.id}`)}>
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm"
                                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                    {p.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm">{p.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {p.blood_group && <span className="badge badge-rose">{p.blood_group}</span>}
                                        {p.allergies && <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>⚠️ {p.allergies}</span>}
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <span className="badge badge-blue">{p.access_level}</span>
                                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                        <FileText className="w-3 h-3 inline" /> {p.records_count} records
                                    </p>
                                </div>
                                <Eye className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                        No patients have granted you access yet.
                    </p>
                )}
            </div>
        </div>
    );
}

