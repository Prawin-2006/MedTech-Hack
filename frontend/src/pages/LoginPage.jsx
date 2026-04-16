import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Heart, Mail, Lock, User, Phone, Droplets, ShieldCheck, Stethoscope, Users } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1a1a3e 40%, #0f172a 100%)' }}>
            {/* Background decorations */}
            <div className="fixed top-20 left-20 w-72 h-72 rounded-full opacity-10 blur-3xl" style={{ background: '#3b82f6' }} />
            <div className="fixed bottom-20 right-20 w-72 h-72 rounded-full opacity-10 blur-3xl" style={{ background: '#10b981' }} />

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8" style={{ animation: 'slideUp 0.5s ease' }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #10b981)' }}>
                        <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">{t('app_name')}</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{t('tagline')}</p>
                </div>

                {/* Login Card */}
                <div className="glass-card p-8" style={{ animation: 'slideUp 0.6s ease' }}>
                    <h2 className="text-xl font-bold mb-6">{t('login')}</h2>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(244,63,94,0.1)', color: '#fb7185', border: '1px solid rgba(244,63,94,0.2)' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="input-label">{t('email')}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                                <input type="email" className="input-field pl-10" placeholder="name@example.com"
                                    value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">{t('password')}</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                                <input type="password" className="input-field pl-10" placeholder="••••••••"
                                    value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                            {loading ? <span className="spinner w-5 h-5" style={{ borderWidth: '2px' }} /> : t('login')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Don't have an account? </span>
                        <Link to="/register" className="text-sm font-semibold" style={{ color: '#60a5fa' }}>
                            {t('register')}
                        </Link>
                    </div>
                </div>

                {/* Feature badges */}
                <div className="flex flex-wrap justify-center gap-2 mt-6" style={{ animation: 'slideUp 0.8s ease' }}>
                    {[
                        { icon: ShieldCheck, label: 'Blockchain Secured' },
                        { icon: Stethoscope, label: 'HIPAA Ready' },
                        { icon: Users, label: 'Multi-Role' },
                    ].map(({ icon: Icon, label }) => (
                        <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                            style={{ background: 'rgba(148,163,184,0.08)', color: 'var(--color-text-secondary)' }}>
                            <Icon className="w-3 h-3" /> {label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
