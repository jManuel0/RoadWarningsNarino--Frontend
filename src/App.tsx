import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

// Eager load components needed immediately
import ThemeToggle from "./components/ThemeToggle";
import Navigation from "./components/Navigation";
import InstallPWA from "./components/InstallPWA";
import FloatingClearFilters from "./components/FloatingClearFilters";
import LoadingSpinner from "./components/LoadingSpinner";
import SkipLink from "./components/SkipLink";
import NotificationPermissionPrompt from "./components/NotificationPermissionPrompt";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useAuthStore } from "./stores/authStore";
import { useServiceWorker } from "./hooks/useServiceWorker";
import { useOfflineSync } from "./hooks/useOfflineSync";

// Lazy load pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const Alerts = lazy(() => import("./pages/Alerts"));
const GpsPage = lazy(() => import("./pages/GpsPage"));
const WazePage = lazy(() => import("./pages/WazePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const Welcome = lazy(() => import("./pages/Welcome"));
const Profile = lazy(() => import("./pages/Profile"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const EnhancedMapPage = lazy(() => import("./pages/EnhancedMapPage"));
const DebugPage = lazy(() => import("./pages/DebugPage"));
const AdminAlertsPage = lazy(() => import("./pages/AdminAlertsPage"));

function AppRoutes() {
  const isAuth = useAuthStore((s) => s.isAuthenticated());

  // Si no está logueado -> mandar a bienvenida / login / registro / verificación
  if (!isAuth) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // Ya autenticado
  return (
    <>
      <SkipLink />
      <Navigation />
      <NotificationPermissionPrompt />
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/gps" element={<GpsPage />} />
            <Route path="/waze" element={<WazePage />} />
            <Route path="/map" element={<EnhancedMapPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/debug" element={<DebugPage />} />
            <Route path="/admin/alerts" element={<AdminAlertsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </>
  );
}

function App() {
  // Registrar service worker para funcionalidad PWA
  // Los hooks deben llamarse incondicionalmente
  useServiceWorker();
  useOfflineSync();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Toaster position="top-right" richColors closeButton />
          <div className="absolute top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          <InstallPWA />
          <FloatingClearFilters />
          <AppRoutes />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
