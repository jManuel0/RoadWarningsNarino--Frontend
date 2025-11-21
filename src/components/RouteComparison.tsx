// src/components/RouteComparison.tsx
import { Clock, TrendingUp, AlertTriangle, Navigation } from 'lucide-react';

interface RouteOption {
  id: string;
  name: string;
  distance: number; // en km
  duration: number; // en minutos
  traffic: 'low' | 'medium' | 'high';
  alerts: number;
  isFastest?: boolean;
  isShortest?: boolean;
  isSafest?: boolean;
}

interface RouteComparisonProps {
  routes: RouteOption[];
  selectedRoute: string;
  onSelectRoute: (routeId: string) => void;
}

export default function RouteComparison({ routes, selectedRoute, onSelectRoute }: RouteComparisonProps) {
  const getTrafficColor = (traffic: string) => {
    switch (traffic) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrafficLabel = (traffic: string) => {
    switch (traffic) {
      case 'low': return 'Fluido';
      case 'medium': return 'Moderado';
      case 'high': return 'Congestionado';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Rutas disponibles
      </h3>
      
      {routes.map((route) => (
        <button
          key={route.id}
          onClick={() => onSelectRoute(route.id)}
          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
            selectedRoute === route.id
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400'
          }`}
        >
          {/* Route Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Navigation 
                size={20} 
                className={selectedRoute === route.id ? 'text-blue-600' : 'text-gray-600'}
              />
              <span className="font-semibold text-gray-900 dark:text-white">
                {route.name}
              </span>
            </div>
            
            {/* Badges */}
            <div className="flex gap-1">
              {route.isFastest && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                  Más rápida
                </span>
              )}
              {route.isShortest && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                  Más corta
                </span>
              )}
              {route.isSafest && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                  Más segura
                </span>
              )}
            </div>
          </div>

          {/* Route Stats */}
          <div className="grid grid-cols-3 gap-4 mb-3">
            {/* Duration */}
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-500" />
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {route.duration} min
                </div>
                <div className="text-xs text-gray-500">Tiempo</div>
              </div>
            </div>

            {/* Distance */}
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-gray-500" />
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {route.distance.toFixed(1)} km
                </div>
                <div className="text-xs text-gray-500">Distancia</div>
              </div>
            </div>

            {/* Alerts */}
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-gray-500" />
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {route.alerts}
                </div>
                <div className="text-xs text-gray-500">Alertas</div>
              </div>
            </div>
          </div>

          {/* Traffic Status */}
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Tráfico:</span>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getTrafficColor(route.traffic)}`}>
              {getTrafficLabel(route.traffic)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
