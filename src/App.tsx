import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import Home from "./pages/Home";
import Alerts from "./pages/Alerts";
import Statistics from "./pages/Statistics";
import GpsPage from "./pages/GpsPage";
import WazePage from "./pages/WazePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Welcome from "./pages/Welcome";
import Profile from "./pages/Profile";
import ThemeToggle from "./components/ThemeToggle";
import Navigation from "./components/Navigation";
import InstallPWA from "./components/InstallPWA";
import OfflineIndicator from "./components/OfflineIndicator";
import FloatingClearFilters from "./components/FloatingClearFilters";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useAuthStore } from "./stores/authStore";
import { useServiceWorker } from "./hooks/useServiceWorker";

function AppRoutes() {
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  const guest = useAuthStore((s) => s.guestMode);

  // Si no está logueado ni en modo invitado -> mandar a bienvenida
  if (!isAuth && !guest) {
    return (
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    );
  }

  // Ya autenticado o invitado
  return (
    <>
      <Navigation />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  // Register service worker for PWA functionality
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
