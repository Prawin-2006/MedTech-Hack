import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Heart, Mail, Lock, User, Phone, Droplets, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
    const { register } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: '', password: '', full_name: '', role: 'patient',
        phone: '', blood_group: '', allergies: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(form);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { value: 'patient', label: t('patient'), emoji: '🏥' },
        { value: 'doctor', label: t('doctor'), emoji: '⚕️' },
        { value: 'trusted_person', label: t('trusted_person'), emoji: '👨‍👩‍👧' },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1a1a3e 40%, #0f172a 100%)' }}>
            <div className="fixed top-20 right-20 w-72 h-72 rounded-full opacity-10 blur-3xl" style={{ background: '#10b981' }} />

            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #10b981)' }}>
                        <Heart className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-xl font-bold">{t('register')}</h1>
                </div>

                <div className="glass-card p-6" style={{ animation: 'slideUp 0.5s ease' }}>
                    {error && (
                        <div className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2"
                            style={{ background: 'rgba(244,63,94,0.1)', color: '#fb7185' }}>
                            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        {/* Role selector */}
                        <div>
                            <label className="input-label">{t('role')}</label>
                            <div className="grid grid-cols-3 gap-2">
                                {roles.map(({ value, label, emoji }) => (
                                    <button key={value} type="button" onClick={() => setForm({ ...form, role: value })}
                                        className={`p-2.5 rounded-xl text-center text-xs font-semibold transition-all ${form.role === value ? 'ring-2 ring-blue-500' : ''}`}
                                        style={{
                                            background: form.role === value ? 'rgba(59,130,246,0.15)' : 'rgba(148,163,184,0.08)',
                                            color: form.role === value ? '#60a5fa' : 'var(--color-text-secondary)',
                                        }}>
                                        <span className="text-lg block mb-0.5">{emoji}</span>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="input-label">{t('full_name')}</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                                <input name="full_name" className="input-field pl-10" placeholder="John Doe"
                                    value={form.full_name} onChange={handleChange} required />
                            </div>
                        </div>

                        <div>
                            <label className="input-label">{t('email')}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                                <input name="email" type="email" className="input-field pl-10" placeholder="name@example.com"
                                    value={form.email} onChange={handleChange} required />
                            </div>
                        </div>

                        <div>
                            <label className="input-label">{t('password')}</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                                <input name="password" type="password" className="input-field pl-10" placeholder="Min 6 characters"
                                    value={form.password} onChange={handleChange} required minLength={6} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="input-label">{t('phone')}</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                                    <input name="phone" className="input-field pl-10" placeholder="+91"
                                        value={form.phone} onChange={handleChange} />
                                </div>
                            </div>
                            <div>
                                <label className="input-label">{t('blood_group')}</label>
                                <select name="blood_group" className="input-field" value={form.blood_group} onChange={handleChange}>
                                    <option value="">Select</option>
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {form.role === 'patient' && (
                            <div>
                                <label className="input-label">{t('allergies')}</label>
                                <input name="allergies" className="input-field" placeholder="Penicillin, Dust, etc."
                                    value={form.allergies} onChange={handleChange} />
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
                            {loading ? <span className="spinner w-5 h-5" style={{ borderWidth: '2px' }} /> : t('register')}
                        </button>
                    </form>

                    <div className="mt-5 text-center">
                        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Already have an account? </span>
                        <Link to="/login" className="text-sm font-semibold" style={{ color: '#60a5fa' }}>{t('login')}</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
