import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard, FileText, Shield, Users, QrCode, Link2,
    Brain, LogOut, Menu, X, Globe, Heart
} from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const changeLang = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('medchain_lang', lang);
    };

    const patientLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
        { to: '/records', icon: FileText, label: t('medical_records') },
        { to: '/access', icon: Shield, label: t('grant_access') },
        { to: '/trusted', icon: Users, label: t('trusted_persons') },
        { to: '/emergency', icon: QrCode, label: t('emergency_qr') },
        { to: '/blockchain', icon: Link2, label: t('blockchain_logs') },
        { to: '/ai', icon: Brain, label: t('ai_features') },
    ];

    const doctorLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
        { to: '/patients', icon: Users, label: t('my_patients') },
        { to: '/blockchain', icon: Link2, label: t('blockchain_logs') },
        { to: '/ai', icon: Brain, label: t('ai_features') },
    ];

    const trustedLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
        { to: '/blockchain', icon: Link2, label: t('blockchain_logs') },
    ];

    const links = user?.role === 'doctor' ? doctorLinks
        : user?.role === 'trusted_person' ? trustedLinks
            : patientLinks;

    return (
        <div className="flex min-h-screen">
            {/* Mobile header */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
                style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-400" />
                    <span className="font-bold text-sm">{t('app_name')}</span>
                </div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg" style={{ background: 'rgba(148,163,184,0.1)' }}>
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </header>

            {/* Sidebar overlay (mobile) */}
            {sidebarOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
                style={{ background: 'rgba(15, 23, 42, 0.95)', borderRight: '1px solid rgba(148,163,184,0.1)' }}>

                {/* Logo */}
                <div className="p-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #10b981)' }}>
                        <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-sm">{t('app_name')}</h1>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t('tagline')}</p>
                    </div>
                </div>

                {/* User info */}
                <div className="p-4" style={{ borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                    <p className="font-semibold text-sm truncate">{user?.full_name}</p>
                    <span className="badge badge-blue mt-1 inline-block">{t(user?.role || 'patient')}</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 overflow-y-auto space-y-1">
                    {links.map(({ to, icon: Icon, label }) => (
                        <NavLink key={to} to={to}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}>
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Language switcher */}
                <div className="p-3" style={{ borderTop: '1px solid rgba(148,163,184,0.1)' }}>
                    <div className="flex items-center gap-1 mb-3 px-1">
                        <Globe className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{t('language')}</span>
                    </div>
                    <div className="flex gap-1">
                        {[{ code: 'en', label: 'EN' }, { code: 'hi', label: 'हि' }, { code: 'ta', label: 'த' }].map(({ code, label }) => (
                            <button key={code} onClick={() => changeLang(code)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${i18n.language === code
                                    ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                                style={i18n.language === code
                                    ? { background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }
                                    : { background: 'rgba(148,163,184,0.1)' }}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Logout */}
                <div className="p-3" style={{ borderTop: '1px solid rgba(148,163,184,0.1)' }}>
                    <button onClick={handleLogout} className="nav-link w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
                        <LogOut className="w-4 h-4" />
                        <span>{t('logout')}</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 pt-14 md:pt-0 min-h-screen">
                <div className="p-4 md:p-8 max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
