import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import OfflineBanner from './components/OfflineBanner';
import ScrollToTop from './components/ScrollToTop';
import InstallPrompt from './components/InstallPrompt';
import { Toaster } from 'react-hot-toast';

// Landing & Auth Pages (Lazy Loaded)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const VerifyOtpPage = lazy(() => import('./pages/auth/VerifyOtpPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));

// Victim Pages (Lazy Loaded)
const VictimDashboard = lazy(() => import('./pages/victim/VictimDashboard'));
const CreateReport = lazy(() => import('./pages/victim/CreateReport'));
const MyReports = lazy(() => import('./pages/victim/MyReports'));
const ReportAnalysis = lazy(() => import('./pages/victim/ReportAnalysis'));

// Donor Pages (Lazy Loaded)
const DonorDashboard = lazy(() => import('./pages/donor/DonorDashboard'));
const BrowseRequests = lazy(() => import('./pages/donor/BrowseRequests'));
const MyDonations = lazy(() => import('./pages/donor/MyDonations'));

// NGO Pages (Lazy Loaded)
const NgoDashboard = lazy(() => import('./pages/ngo/NgoDashboard'));
const CreateRequest = lazy(() => import('./pages/ngo/CreateRequest'));
const MyRequests = lazy(() => import('./pages/ngo/MyRequests'));
const ManageDonations = lazy(() => import('./pages/ngo/ManageDonations'));

// Admin Pages (Lazy Loaded)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const FloodReports = lazy(() => import('./pages/admin/FloodReports'));
const ManageVictims = lazy(() => import('./pages/admin/ManageVictims'));
const NgoRequests = lazy(() => import('./pages/admin/NgoRequests'));
const AllDonations = lazy(() => import('./pages/admin/AllDonations'));

// Heatmap page wrapper (shared across roles)
const HeatmapPage = lazy(() => import('./pages/shared/HeatmapPage'));

// 404 Not Found Page
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="page-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading-container">
        <div className="spinner" />
        <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading view...</p>
      </div>
    </div>
  );
}

function DashboardLayout() {
  return (
    <>
      <Navbar />
      <OfflineBanner />
      <main className="dashboard-main">
        <Suspense fallback={<PageLoader />}>
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

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
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
          containerStyle={{
            pointerEvents: 'none',
            top: 'max(16px, env(safe-area-inset-top, 16px))',
          }}
          toastOptions={{
            duration: 4000,
            style: {
              pointerEvents: 'auto',
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
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/404" element={<NotFound />} />

            {/* Protected Dashboard Routes */}
            <Route path="/*" element={<DashboardLayout />} />
          </Routes>
        </Suspense>
        <InstallPrompt />
      </AuthProvider>
    </LanguageProvider>
  </BrowserRouter>
  );
}

export default App;
