import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { patientAPI } from '../services/api';
import { Users, Plus, X, Trash2, UserPlus, Eye, EyeOff } from 'lucide-react';

const permissionDescriptions = {
    basic: 'Blood group & allergies only',
    medium: 'Medications + prescriptions & lab reports',
    full: 'Complete medical records access',
};

export default function TrustedPage() {
    const { t } = useTranslation();
    const [trusted, setTrusted] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ trusted_email: '', permission_level: 'basic' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTrusted = () => {
        patientAPI.getTrustedList().then(res => {
            setTrusted(res.data.trusted || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => { fetchTrusted(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await patientAPI.addTrusted(form);
            setShowModal(false);
            setForm({ trusted_email: '', permission_level: 'basic' });
            fetchTrusted();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to add trusted person');
        }
    };

    const handleRemove = async (id) => {
        if (!confirm('Remove this trusted person?')) return;
        await patientAPI.removeTrusted(id);
        fetchTrusted();
    };

    if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

    return (
        <div style={{ animation: 'slideUp 0.4s ease' }}>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">{t('trusted_persons')}</h1>
                <button onClick={() => setShowModal(true)} className="btn-primary">
                    <UserPlus className="w-4 h-4" /> {t('add_trusted')}
                </button>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold">{t('add_trusted')}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-white/5">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {error && <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(244,63,94,0.1)', color: '#fb7185' }}>{error}</div>}
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="input-label">Person's Email</label>
                                <input className="input-field" type="email" placeholder="family@example.com"
                                    value={form.trusted_email} onChange={e => setForm({ ...form, trusted_email: e.target.value })} required />
                            </div>
                            <div>
                                <label className="input-label">{t('permission_level')}</label>
                                <div className="space-y-2">
                                    {['basic', 'medium', 'full'].map(level => (
                                        <button key={level} type="button" onClick={() => setForm({ ...form, permission_level: level })}
                                            className={`w-full p-3 rounded-xl text-left transition-all ${form.permission_level === level ? 'ring-2 ring-amber-500' : ''}`}
                                            style={{
                                                background: form.permission_level === level ? 'rgba(245,158,11,0.1)' : 'rgba(148,163,184,0.05)',
                                            }}>
                                            <div className="flex items-center gap-2">
                                                {level === 'full' ? <Eye className="w-4 h-4" style={{ color: '#fbbf24' }} />
                                                    : <EyeOff className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
                                                <span className="font-bold text-sm">{t(level)}</span>
                                            </div>
                                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                                {permissionDescriptions[level]}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="btn-success w-full justify-center py-3">
                                <UserPlus className="w-4 h-4" /> {t('add_trusted')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {trusted.length > 0 ? (
                <div className="space-y-3">
                    {trusted.map((tp, i) => (
                        <div key={tp.id} className="glass-card p-4 flex items-center gap-4"
                            style={{ animation: `slideIn ${0.2 + i * 0.08}s ease` }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                                style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                                {tp.name?.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{tp.name}</p>
                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{tp.email}</p>
                            </div>
                            <span className="badge badge-amber">{tp.permission_level}</span>
                            <button onClick={() => handleRemove(tp.id)} className="btn-danger flex items-center gap-1">
                                <Trash2 className="w-3 h-3" /> {t('delete')}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card p-12 text-center">
                    <Users className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                    <p className="font-semibold">No trusted persons added</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Add family or friends with tiered access to your health info
                    </p>
                </div>
            )}
        </div>
    );
}
