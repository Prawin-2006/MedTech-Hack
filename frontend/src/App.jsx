import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './i18n';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import TrustedDashboard from './pages/TrustedDashboard';
import RecordsPage from './pages/RecordsPage';
import AccessPage from './pages/AccessPage';
import TrustedPage from './pages/TrustedPage';
import EmergencyPage from './pages/EmergencyPage';
import EmergencyAccessPage from './pages/EmergencyAccessPage';
import BlockchainPage from './pages/BlockchainPage';
import AIPage from './pages/AIPage';
import DoctorPatientView from './pages/DoctorPatientView';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="spinner" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'doctor') return <DoctorDashboard />;
  if (user?.role === 'trusted_person') return <TrustedDashboard />;
  return <PatientDashboard />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/emergency/:token" element={<EmergencyAccessPage />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<DashboardRouter />} />
            <Route path="records" element={<RecordsPage />} />
            <Route path="access" element={<AccessPage />} />
            <Route path="trusted" element={<TrustedPage />} />
            <Route path="emergency" element={<EmergencyPage />} />
            <Route path="blockchain" element={<BlockchainPage />} />
            <Route path="ai" element={<AIPage />} />
            <Route path="patients/:patientId" element={<DoctorPatientView />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
