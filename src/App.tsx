import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import GpsPage from './pages/GpsPage';
import Home from '@/pages/Home';
import Alerts from '@/pages/Alerts';
import Statistics from '@/pages/Statistics';
import ThemeToggle from '@/components/ThemeToggle';
import { Home as HomeIcon, AlertTriangle, BarChart3 } from 'lucide-react';
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";



function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Route path="/gps" element={<GpsPage />} />
        <div className="flex justify-between">
          <div className="flex gap-8">
            <Link
              to="/"
              className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors ${
                isActive('/')
                  ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <HomeIcon size={20} />
              <span className="font-medium">Inicio</span>
            </Link>

            <Link
              to="/alerts"
              className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors ${
                isActive('/alerts')
                  ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <AlertTriangle size={20} />
              <span className="font-medium">Gestión de Alertas</span>
            </Link>

            <Link
              to="/statistics"
              className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors ${
                isActive('/statistics')
                  ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <BarChart3 size={20} />
              <span className="font-medium">Estadísticas</span>
            </Link>
          </div>

          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Toaster position="top-right" richColors closeButton />
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}



  return (
    <div>
      <h1>🧭 RoadWarnings GPS</h1>
      <MapWithGps />
    </div>
  );




export default App;