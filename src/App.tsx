import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

// Eager load components needed immediately
import ThemeToggle from "./components/ThemeToggle";
import Navigation from "./components/Navigation";
import InstallPWA from "./components/InstallPWA";
import OfflineIndicator from "./components/OfflineIndicator";
import FloatingClearFilters from "./components/FloatingClearFilters";
import LoadingSpinner from "./components/LoadingSpinner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useAuthStore } from "./stores/authStore";
import { useServiceWorker } from "./hooks/useServiceWorker";

// Lazy load pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Statistics = lazy(() => import("./pages/Statistics"));
const GpsPage = lazy(() => import("./pages/GpsPage"));
const WazePage = lazy(() => import("./pages/WazePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const Welcome = lazy(() => import("./pages/Welcome"));
const Profile = lazy(() => import("./pages/Profile"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));

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
      <Navigation />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/gps" element={<GpsPage />} />
          <Route path="/waze" element={<WazePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  // Registrar service worker para funcionalidad PWA
  useServiceWorker();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Toaster position="top-right" richColors closeButton />
          <div className="absolute top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          <OfflineIndicator />
          <InstallPWA />
          <FloatingClearFilters />
          <AppRoutes />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
