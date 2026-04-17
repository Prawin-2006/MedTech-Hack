import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { patientAPI } from '../services/api';
import { Shield, Plus, X, Trash2, UserPlus } from 'lucide-react';

export default function AccessPage() {
    const { t } = useTranslation();
    const [grants, setGrants] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ grantee_email: '', access_level: 'full' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchGrants = () => {
        patientAPI.getAccessList().then(res => {
            setGrants(res.data.grants || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => { fetchGrants(); }, []);

    const handleGrant = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await patientAPI.grantAccess(form);
            setShowModal(false);
            setForm({ grantee_email: '', access_level: 'full' });
            fetchGrants();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to grant access');
        }
    };

    const handleRevoke = async (id) => {
        if (!confirm('Revoke access from this doctor?')) return;
        await patientAPI.revokeAccess(id);
        fetchGrants();
    };

    if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

    return (
        <div className="page-shell">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">{t('grant_access')}</h1>
                <button onClick={() => setShowModal(true)} className="btn-primary">
                    <UserPlus className="w-4 h-4" /> Grant Doctor Access
                </button>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold">Grant Access to Doctor</h2>
                            <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-white/5">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {error && <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(244,63,94,0.1)', color: '#fb7185' }}>{error}</div>}
                        <form onSubmit={handleGrant} className="space-y-4">
                            <div>
                                <label className="input-label">Doctor's Email</label>
                                <input className="input-field" type="email" placeholder="doctor@hospital.com"
                                    value={form.grantee_email} onChange={e => setForm({ ...form, grantee_email: e.target.value })} required />
                            </div>
                            <div>
                                <label className="input-label">{t('access_level')}</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['basic', 'medium', 'full'].map(level => (
                                        <button key={level} type="button" onClick={() => setForm({ ...form, access_level: level })}
                                            className={`p-3 rounded-xl text-xs font-bold text-center transition-all ${form.access_level === level ? 'ring-2 ring-blue-500' : ''}`}
                                            style={{
                                                background: form.access_level === level ? 'rgba(59,130,246,0.15)' : 'rgba(148,163,184,0.08)',
                                                color: form.access_level === level ? '#60a5fa' : 'var(--color-text-secondary)',
                                            }}>
                                            {t(level)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="btn-success w-full justify-center py-3">
                                <Shield className="w-4 h-4" /> {t('grant_access')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {grants.length > 0 ? (
                <div className="space-y-3">
                    {grants.map((g, i) => (
                        <div key={g.id} className="glass-card p-4 flex items-center gap-4"
                            style={{ animation: `slideIn ${0.2 + i * 0.08}s ease` }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                                {g.doctor_name?.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm">Dr. {g.doctor_name}</p>
                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{g.doctor_email}</p>
                            </div>
                            <span className="badge badge-emerald">{g.access_level}</span>
                            <button onClick={() => handleRevoke(g.id)} className="btn-danger flex items-center gap-1">
                                <Trash2 className="w-3 h-3" /> {t('revoke_access')}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card p-12 text-center">
                    <Shield className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                    <p className="font-semibold">{t('no_access')}</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Grant access to your doctors so they can view your records
                    </p>
                </div>
            )}
        </div>
    );
}

