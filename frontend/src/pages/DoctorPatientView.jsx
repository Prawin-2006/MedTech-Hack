import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doctorAPI } from '../services/api';
import { ArrowLeft, FileText, Upload, Plus, X, PenLine, Droplets, AlertTriangle, Pill, Clock } from 'lucide-react';

export default function DoctorPatientView() {
    const { patientId } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPrescription, setShowPrescription] = useState(false);
    const [showNote, setShowNote] = useState(false);
    const [noteForm, setNoteForm] = useState({ title: '', note_content: '' });
    const [prescFile, setPrescFile] = useState(null);
    const [prescTitle, setPrescTitle] = useState('');

    useEffect(() => {
        doctorAPI.getPatientRecords(patientId).then(res => {
            setData(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [patientId]);

    const handleUploadPrescription = async (e) => {
        e.preventDefault();
        if (!prescFile) return;
        const formData = new FormData();
        formData.append('patient_id', patientId);
        formData.append('title', prescTitle);
        formData.append('file', prescFile);
        try {
            await doctorAPI.uploadPrescription(formData);
            setShowPrescription(false);
            setPrescFile(null);
            setPrescTitle('');
            // Reload
            const res = await doctorAPI.getPatientRecords(patientId);
            setData(res.data);
        } catch (err) { alert(err.response?.data?.detail || 'Upload failed'); }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        try {
            await doctorAPI.addNote({ ...noteForm, patient_id: parseInt(patientId) });
            setShowNote(false);
            setNoteForm({ title: '', note_content: '' });
            const res = await doctorAPI.getPatientRecords(patientId);
            setData(res.data);
        } catch (err) { alert(err.response?.data?.detail || 'Failed to add note'); }
    };

    if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

    return (
        <div className="page-shell">
            <button onClick={() => navigate(-1)} className="btn-secondary mb-4">
                <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {/* Patient info */}
            <div className="glass-card p-5 mb-6">
                <h1 className="text-xl font-bold mb-3">{data?.patient?.name}</h1>
                <div className="flex flex-wrap gap-2">
                    {data?.patient?.blood_group && (
                        <span className="badge badge-rose flex items-center gap-1">
                            <Droplets className="w-3 h-3" /> {data.patient.blood_group}
                        </span>
                    )}
                    {data?.patient?.allergies && (
                        <span className="badge badge-amber flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> {data.patient.allergies}
                        </span>
                    )}
                    {data?.patient?.medications && (
                        <span className="badge badge-blue flex items-center gap-1">
                            <Pill className="w-3 h-3" /> {data.patient.medications}
                        </span>
                    )}
                    <span className="badge badge-emerald">{data?.access_level} access</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mb-6">
                <button onClick={() => setShowPrescription(true)} className="btn-primary">
                    <Upload className="w-4 h-4" /> {t('upload_prescription')}
                </button>
                <button onClick={() => setShowNote(true)} className="btn-secondary">
                    <PenLine className="w-4 h-4" /> {t('add_note')}
                </button>
            </div>

            {/* Prescription Modal */}
            {showPrescription && (
                <div className="modal-overlay" onClick={() => setShowPrescription(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold">{t('upload_prescription')}</h2>
                            <button onClick={() => setShowPrescription(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleUploadPrescription} className="space-y-4">
                            <div>
                                <label className="input-label">Title</label>
                                <input className="input-field" placeholder="Prescription - Apr 2026"
                                    value={prescTitle} onChange={e => setPrescTitle(e.target.value)} required />
                            </div>
                            <div>
                                <label className="input-label">File</label>
                                <input type="file" accept=".pdf,.jpg,.png" className="input-field"
                                    onChange={e => setPrescFile(e.target.files[0])} required />
                            </div>
                            <button type="submit" className="btn-success w-full justify-center py-3">
                                <Upload className="w-4 h-4" /> Upload
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Note Modal */}
            {showNote && (
                <div className="modal-overlay" onClick={() => setShowNote(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold">{t('add_note')}</h2>
                            <button onClick={() => setShowNote(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleAddNote} className="space-y-4">
                            <div>
                                <label className="input-label">Title</label>
                                <input className="input-field" placeholder="Follow-up consultation"
                                    value={noteForm.title} onChange={e => setNoteForm({ ...noteForm, title: e.target.value })} required />
                            </div>
                            <div>
                                <label className="input-label">Clinical Notes</label>
                                <textarea className="input-field" rows={5} placeholder="Patient condition, observations..."
                                    value={noteForm.note_content} onChange={e => setNoteForm({ ...noteForm, note_content: e.target.value })} required />
                            </div>
                            <button type="submit" className="btn-success w-full justify-center py-3">
                                <PenLine className="w-4 h-4" /> Save Note
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Records */}
            <div className="glass-card p-5">
                <h2 className="font-bold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" /> {t('medical_records')}
                </h2>
                {data?.records?.length > 0 ? (
                    <div className="space-y-3">
                        {data.records.map((r, i) => (
                            <div key={r.id} className="p-3 rounded-xl flex items-start gap-3"
                                style={{ background: 'var(--color-surface-light)', animation: `slideIn ${0.2 + i * 0.08}s ease` }}>
                                <FileText className="w-4 h-4 text-blue-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{r.title}</p>
                                    {r.description && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{r.description}</p>}
                                    <div className="flex gap-2 mt-1">
                                        <span className="badge badge-purple">{r.record_type.replace(/_/g, ' ')}</span>
                                        {r.blockchain_hash && <span className="tx-hash text-xs">{r.blockchain_hash.slice(0, 18)}...</span>}
                                    </div>
                                </div>
                                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                    <Clock className="w-3 h-3 inline" /> {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
                        {t('no_records')}
                    </p>
                )}
            </div>
        </div>
    );
}

