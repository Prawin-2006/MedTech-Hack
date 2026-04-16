import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { emergencyAPI } from '../services/api';
import { AlertTriangle, Heart, Droplets, Pill, FileText, Shield, Phone } from 'lucide-react';

export default function EmergencyAccessPage() {
    const { token } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        emergencyAPI.access(token).then(res => {
            setData(res.data);
            setLoading(false);
        }).catch(err => {
            setError(err.response?.data?.detail || 'Invalid or expired emergency token');
            setLoading(false);
        });
    }, [token]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a, #1a1a3e)' }}>
            <div className="spinner" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a, #1a1a3e)' }}>
            <div className="glass-card p-8 max-w-md text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-rose-400" />
                <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen p-4 md:p-8" style={{ background: 'linear-gradient(135deg, #0f172a, #1a1a3e)' }}>
            <div className="max-w-lg mx-auto">
                {/* Emergency header */}
                <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl"
                    style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)' }}>
                    <Heart className="w-8 h-8 text-rose-400" />
                    <div>
                        <h1 className="text-xl font-bold text-rose-400">🚨 Emergency Access</h1>
                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            This access has been logged on the blockchain
                        </p>
                    </div>
                </div>

                {/* Patient info */}
                <div className="glass-card p-5 mb-4">
                    <h2 className="font-bold mb-3">Patient Information</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold">{data.patient.name}</span>
                        </div>
                        {data.patient.blood_group && (
                            <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(244,63,94,0.08)' }}>
                                <Droplets className="w-4 h-4 text-rose-400" />
                                <span className="text-sm font-bold text-rose-400">{data.patient.blood_group}</span>
                            </div>
                        )}
                        {data.patient.allergies && (
                            <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.08)' }}>
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                <span className="text-sm">{data.patient.allergies}</span>
                            </div>
                        )}
                        {data.patient.medications && (
                            <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(59,130,246,0.08)' }}>
                                <Pill className="w-4 h-4 text-blue-400" />
                                <span className="text-sm">{data.patient.medications}</span>
                            </div>
                        )}
                        {data.patient.phone && (
                            <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.08)' }}>
                                <Phone className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm">{data.patient.phone}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Critical records */}
                {data.critical_records?.length > 0 && (
                    <div className="glass-card p-5">
                        <h2 className="font-bold mb-3">Recent Medical Records</h2>
                        <div className="space-y-2">
                            {data.critical_records.map((r, i) => (
                                <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(148,163,184,0.05)' }}>
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm font-medium">{r.title}</span>
                                    </div>
                                    {r.description && <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{r.description}</p>}
                                    <span className="badge badge-purple mt-1 inline-block text-xs">{r.type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-4 p-3 rounded-xl flex items-center gap-2" style={{ background: 'rgba(16,185,129,0.08)' }}>
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <p className="text-xs" style={{ color: '#34d399' }}>
                        {data.disclaimer}
                    </p>
                </div>
            </div>
        </div>
    );
}
