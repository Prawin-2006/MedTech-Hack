import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('medchain_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('medchain_token');
            localStorage.removeItem('medchain_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ===== Auth API =====
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', { email: data.email, password: data.password }),
    getProfile: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    verifyAadhaar: (number) => api.post(`/auth/aadhaar-verify?aadhaar_number=${number}`),
};

// ===== Patient API =====
export const patientAPI = {
    getDashboard: () => api.get('/patients/dashboard'),
    getRecords: () => api.get('/patients/records'),
    uploadRecord: (formData) => api.post('/patients/records', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    grantAccess: (data) => api.post('/patients/grant-access', data),
    revokeAccess: (id) => api.delete(`/patients/revoke-access/${id}`),
    getAccessList: () => api.get('/patients/access-list'),
    addTrusted: (data) => api.post('/patients/trusted', data),
    removeTrusted: (id) => api.delete(`/patients/trusted/${id}`),
    getTrustedList: () => api.get('/patients/trusted-list'),
    generateEmergencyQR: () => api.post('/patients/emergency-qr'),
};

// ===== Doctor API =====
export const doctorAPI = {
    getDashboard: () => api.get('/doctors/dashboard'),
    getPatients: () => api.get('/doctors/patients'),
    getPatientRecords: (patientId) => api.get(`/doctors/records/${patientId}`),
    uploadPrescription: (formData) => api.post('/doctors/prescriptions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    addNote: (data) => api.post('/doctors/notes', data),
};

// ===== Trusted API =====
export const trustedAPI = {
    getDashboard: () => api.get('/trusted/dashboard'),
    getRecords: (patientId) => api.get(`/trusted/records/${patientId}`),
};

// ===== Emergency API =====
export const emergencyAPI = {
    access: (token) => api.get(`/emergency/${token}`),
};

// ===== Blockchain API =====
export const blockchainAPI = {
    getStatus: () => api.get('/blockchain/status'),
    getLogs: (limit = 20) => api.get(`/blockchain/logs?limit=${limit}`),
    getAllLogs: (limit = 50) => api.get(`/blockchain/all-logs?limit=${limit}`),
    verify: (hash) => api.get(`/blockchain/verify/${hash}`),
};

// ===== AI API =====
export const aiAPI = {
    summarize: (data) => api.post('/ai/summarize', data),
    drugCheck: (data) => api.post('/ai/drug-check', data),
    voiceInput: (lang) => api.get(`/ai/voice-input?language=${lang}`),
};

export default api;
