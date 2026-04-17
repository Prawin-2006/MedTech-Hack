import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { patientAPI } from '../services/api';
import { QrCode, Clock, Shield, AlertTriangle } from 'lucide-react';

export default function EmergencyPage() {
    const { t } = useTranslation();
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateQR = async () => {
        setLoading(true);
        try {
            const res = await patientAPI.generateEmergencyQR();
            setQrData(res.data);
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to generate QR');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-shell">
            <h1 className="page-title mb-6">{t('emergency_qr')}</h1>

            {/* Info card */}
            <div className="glass-card p-5 mb-6">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(244,63,94,0.15)' }}>
                        <AlertTriangle className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Emergency Access QR Code</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                            Generate a temporary QR code that grants emergency access to your critical medical information.
                            The QR code is <strong>single-use</strong> and expires in <strong>30 minutes</strong>.
                            All access is logged immutably on the blockchain.
                        </p>
                    </div>
                </div>
            </div>

            {/* Generate button */}
            {!qrData && (
                <div className="glass-card p-12 text-center">
                    <QrCode className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
                    <p className="font-semibold mb-4">Generate Emergency QR Code</p>
                    <button onClick={generateQR} disabled={loading} className="btn-primary px-8 py-3 mx-auto">
                        {loading ? <span className="spinner w-5 h-5" style={{ borderWidth: '2px' }} /> : <><QrCode className="w-4 h-4" /> {t('generate_qr')}</>}
                    </button>
                </div>
            )}

            {/* QR Code Display */}
            {qrData && (
                <div className="glass-card p-8 max-w-md mx-auto text-center" style={{ animation: 'slideUp 0.5s ease' }}>
                    <div className="inline-block p-4 rounded-2xl mb-4" style={{ background: 'white' }}>
                        <img src={`data:image/png;base64,${qrData.qr_image}`} alt="Emergency QR Code"
                            className="w-48 h-48" />
                    </div>

                    <h2 className="font-bold text-lg mb-2">Emergency QR Generated! ✅</h2>

                    <div className="space-y-3 text-left">
                        <div className="p-3 rounded-xl" style={{ background: 'var(--color-surface-light)' }}>
                            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Token</p>
                            <p className="tx-hash text-sm">{qrData.qr_token}</p>
                        </div>
                        <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: 'var(--color-surface-light)' }}>
                            <Clock className="w-4 h-4 text-amber-400" />
                            <div>
                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t('qr_expires')}</p>
                                <p className="text-sm font-semibold">{qrData.expiry_minutes} {t('minutes')}</p>
                            </div>
                        </div>
                        <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: 'rgba(16,185,129,0.08)' }}>
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <p className="text-xs" style={{ color: '#34d399' }}>Access will be logged on blockchain</p>
                        </div>
                    </div>

                    <button onClick={() => setQrData(null)} className="btn-secondary mt-6 w-full justify-center">
                        Generate New QR
                    </button>
                </div>
            )}
        </div>
    );
}

