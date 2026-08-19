import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import InstallPrompt from './components/InstallPrompt';
import { Toaster } from 'react-hot-toast';

// Landing & Auth Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Victim Pages
import VictimDashboard from './pages/victim/VictimDashboard';
import CreateReport from './pages/victim/CreateReport';
import MyReports from './pages/victim/MyReports';
import ReportAnalysis from './pages/victim/ReportAnalysis';

// Donor Pages
import DonorDashboard from './pages/donor/DonorDashboard';
import BrowseRequests from './pages/donor/BrowseRequests';
import MyDonations from './pages/donor/MyDonations';

// NGO Pages
import NgoDashboard from './pages/ngo/NgoDashboard';
import CreateRequest from './pages/ngo/CreateRequest';
import MyRequests from './pages/ngo/MyRequests';
import ManageDonations from './pages/ngo/ManageDonations';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import FloodReports from './pages/admin/FloodReports';
import ManageVictims from './pages/admin/ManageVictims';
import NgoRequests from './pages/admin/NgoRequests';
import AllDonations from './pages/admin/AllDonations';

// Heatmap page wrapper (shared across roles)
import HeatmapPage from './pages/shared/HeatmapPage';

function DashboardLayout() {
  return (
    <>
      <Navbar />
      <main className="dashboard-main">
        <Routes>
          {/* Victim Routes */}
          <Route element={<ProtectedRoute role="VICTIM" />}>
            <Route path="victim" element={<VictimDashboard />} />
            <Route path="victim/create-report" element={<CreateReport />} />
            <Route path="victim/my-reports" element={<MyReports />} />
            <Route path="victim/report-analysis" element={<ReportAnalysis />} />
            <Route path="victim/heatmap" element={<HeatmapPage role="VICTIM" />} />
          </Route>

          {/* Donor Routes */}
          <Route element={<ProtectedRoute role="DONOR" />}>
            <Route path="donor" element={<DonorDashboard />} />
            <Route path="donor/browse-requests" element={<BrowseRequests />} />
            <Route path="donor/my-donations" element={<MyDonations />} />
            <Route path="donor/heatmap" element={<HeatmapPage role="DONOR" />} />
          </Route>

          {/* NGO Routes */}
          <Route element={<ProtectedRoute role="NGO" />}>
            <Route path="ngo" element={<NgoDashboard />} />
            <Route path="ngo/create-request" element={<CreateRequest />} />
            <Route path="ngo/my-requests" element={<MyRequests />} />
            <Route path="ngo/manage-donations" element={<ManageDonations />} />
            <Route path="ngo/heatmap" element={<HeatmapPage role="NGO" />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute role="ADMIN" />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/flood-reports" element={<FloodReports />} />
            <Route path="admin/manage-victims" element={<ManageVictims />} />
            <Route path="admin/ngo-requests" element={<NgoRequests />} />
            <Route path="admin/donations" element={<AllDonations />} />
            <Route path="admin/heatmap" element={<HeatmapPage role="ADMIN" />} />
          </Route>
        </Routes>
      </main>
      <ScrollToTop />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(15, 23, 42, 0.95)',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(16px)',
              borderRadius: '12px',
              fontSize: '0.9rem',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#0f1629' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0f1629' },
            },
          }}
        />
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Dashboard Routes */}
          <Route path="/*" element={<DashboardLayout />} />
        </Routes>
        <InstallPrompt />
      </AuthProvider>
    </LanguageProvider>
  </BrowserRouter>
  );
}

export default App;
