import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from '@/pages/Home';
import Alerts from '@/pages/Alerts';
import { Home as HomeIcon, AlertTriangle } from 'lucide-react';

function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <Link
            to="/"
            className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors ${
              isActive('/')
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <HomeIcon size={20} />
            <span className="font-medium">Inicio</span>
          </Link>

          <Link
            to="/alerts"
            className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors ${
              isActive('/alerts')
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <AlertTriangle size={20} />
            <span className="font-medium">Gestión de Alertas</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" richColors closeButton />
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/alerts" element={<Alerts />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;