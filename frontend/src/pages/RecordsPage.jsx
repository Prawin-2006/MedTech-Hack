import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { patientAPI } from '../services/api';
import { FileText, Upload, Plus, X, Link2, Clock, FileImage, Pill, TestTube, Stethoscope } from 'lucide-react';

const recordTypes = [
    { value: 'lab_report', label: 'Lab Report', icon: TestTube },
    { value: 'prescription', label: 'Prescription', icon: Pill },
    { value: 'imaging', label: 'Imaging/Scan', icon: FileImage },
    { value: 'clinical_notes', label: 'Clinical Notes', icon: Stethoscope },
    { value: 'other', label: 'Other', icon: FileText },
];

export default function RecordsPage() {
    const { t } = useTranslation();
    const [records, setRecords] = useState([]);
    const [showUpload, setShowUpload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({ title: '', record_type: 'lab_report', description: '', file: null });

    const fetchRecords = () => {
        patientAPI.getRecords().then(res => {
            setRecords(res.data.records || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => { fetchRecords(); }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!form.file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('record_type', form.record_type);
        formData.append('description', form.description);
        formData.append('file', form.file);

        try {
            await patientAPI.uploadRecord(formData);
            setShowUpload(false);
            setForm({ title: '', record_type: 'lab_report', description: '', file: null });
            fetchRecords();
        } catch (err) {
            alert(err.response?.data?.detail || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const getTypeIcon = (type) => {
        const found = recordTypes.find(r => r.value === type);
        return found ? found.icon : FileText;
    };

    if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

    return (
        <div className="page-shell">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">{t('medical_records')}</h1>
                <button onClick={() => setShowUpload(true)} className="btn-primary">
                    <Plus className="w-4 h-4" /> {t('upload_record')}
                </button>
            </div>

            {/* Upload Modal */}
            {showUpload && (
                <div className="modal-overlay" onClick={() => setShowUpload(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold">{t('upload_record')}</h2>
                            <button onClick={() => setShowUpload(false)} className="p-1 rounded-lg hover:bg-white/5">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="input-label">Title</label>
                                <input className="input-field" placeholder="Blood Test Report - Jan 2026"
                                    value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                            </div>
                            <div>
                                <label className="input-label">Record Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {recordTypes.map((recordType) => (
                                        <button key={recordType.value} type="button" onClick={() => setForm({ ...form, record_type: recordType.value })}
                                            className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all selector-btn ${form.record_type === recordType.value ? 'active' : ''}`}
                                            style={{
                                                background: form.record_type === recordType.value ? 'rgba(15,23,42,0.12)' : 'var(--color-surface-lighter)',
                                                color: form.record_type === recordType.value ? 'var(--color-secondary-dark)' : 'var(--color-text-secondary)',
                                            }}>
                                            <recordType.icon className="w-4 h-4" /> {recordType.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="input-label">Description</label>
                                <textarea className="input-field" rows={3} placeholder="Optional notes..."
                                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div>
                                <label className="input-label">File (PDF/Image)</label>
                                <div className="border-2 border-dashed rounded-xl p-6 text-center transition-all"
                                    style={{ borderColor: 'rgba(148,163,184,0.2)' }}>
                                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" id="file-upload"
                                        onChange={e => setForm({ ...form, file: e.target.files[0] })} />
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                                        <p className="text-sm font-medium">{form.file ? form.file.name : 'Click to select file'}</p>
                                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>PDF, JPG, PNG (max 10MB)</p>
                                    </label>
                                </div>
                            </div>
                            <button type="submit" disabled={uploading} className="btn-success w-full justify-center py-3">
                                {uploading ? <span className="spinner w-5 h-5" style={{ borderWidth: '2px' }} /> : <><Upload className="w-4 h-4" /> {t('upload')}</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Records list */}
            {records.length > 0 ? (
                <div className="space-y-3">
                    {records.map((r, i) => {
                        const TypeIcon = getTypeIcon(r.record_type);
                        return (
                            <div key={r.id} className="glass-card p-4 flex items-start gap-4"
                                style={{ animation: `slideIn ${0.2 + i * 0.08}s ease` }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(59,130,246,0.12)' }}>
                                    <TypeIcon className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm">{r.title}</p>
                                    {r.description && (
                                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                                            {r.description}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <span className="badge badge-purple">{r.record_type.replace(/_/g, ' ')}</span>
                                        {r.ipfs_hash && (
                                            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                                <Link2 className="w-3 h-3" /> IPFS
                                            </span>
                                        )}
                                        {r.blockchain_hash && (
                                            <span className="tx-hash text-xs">{r.blockchain_hash.slice(0, 18)}...</span>
                                        )}
                                    </div>
                                    {r.ai_summary && (
                                        <div className="mt-2 p-2 rounded-lg text-xs" style={{ background: 'rgba(139,92,246,0.08)', color: '#a78bfa' }}>
                                            🤖 {r.ai_summary}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-shrink-0 text-right">
                                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                        <Clock className="w-3 h-3 inline" /> {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                                    </span>
                                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>by {r.uploaded_by}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="glass-card p-12 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                    <p className="font-semibold">{t('no_records')}</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Upload your first medical record to get started
                    </p>
                </div>
            )}
        </div>
    );
}

