/**
 * Página de Ejemplo: Mapa Avanzado con Sistema Geoespacial Completo
 *
 * Esta página demuestra el uso del componente RoadAlertsMap
 * con todas sus funcionalidades integradas.
 */

import { useState } from 'react';
import { RoadAlertsMap } from '@/components/map/RoadAlertsMap';
import { RoadAlert, Route } from '@/types/map.types';
import { useSettingsStore } from '@/stores/settingsStore';

export default function AdvancedMapPage() {
  const [selectedAlert, setSelectedAlert] = useState<RoadAlert | null>(null);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const { theme } = useSettingsStore();

  const handleAlertClick = (alert: RoadAlert) => {
    console.log('Alerta seleccionada:', alert);
    setSelectedAlert(alert);
  };

  const handleRouteCalculated = (route: Route) => {
    console.log('Ruta calculada:', route);
    setCurrentRoute(route);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🗺️ Mapa de Alertas Viales
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Departamento de Nariño - Sistema Geoespacial Avanzado
              </p>
            </div>

            <div className="flex items-center gap-4">
              {selectedAlert && (
                <div className="hidden md:flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    Alerta seleccionada:
                  </span>
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    {selectedAlert.title}
                  </span>
                </div>
              )}

              {currentRoute && (
                <div className="hidden md:flex items-center gap-2 bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium text-green-900 dark:text-green-200">
                    Ruta activa
                  </span>
                  <span className="text-xs text-green-700 dark:text-green-300">
                    {(currentRoute.distance / 1000).toFixed(1)} km
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mapa Principal */}
      <main className="flex-1 relative overflow-hidden">
        <RoadAlertsMap
          height="100%"
          showControls={true}
          enableClustering={true}
          updateInterval={10000}
          onAlertClick={handleAlertClick}
          onRouteCalculated={handleRouteCalculated}
          darkMode={theme === 'dark'}
        />

        {/* Panel de información flotante (opcional) */}
        {selectedAlert && (
          <div className="absolute top-4 left-4 z-[1001] bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 max-w-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {selectedAlert.title}
              </h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p className="line-clamp-3">{selectedAlert.description}</p>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium">Tipo:</span>
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {selectedAlert.type}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium">Severidad:</span>
                <span
                  className={`px-2 py-1 rounded font-semibold ${
                    selectedAlert.severity === 'CRITICAL'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      : selectedAlert.severity === 'HIGH'
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                      : selectedAlert.severity === 'MEDIUM'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  }`}
                >
                  {selectedAlert.severity}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  📍 {selectedAlert.location}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  👤 Reportado por: {selectedAlert.username}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  👍 {selectedAlert.upvotes} · 👎 {selectedAlert.downvotes}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer con instrucciones */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">📍</span>
                Haz clic en tu ubicación para seguimiento GPS
              </span>
              <span className="flex items-center gap-2">
                <span className="text-orange-600 dark:text-orange-400">🚨</span>
                Selecciona alertas para ver detalles
              </span>
              <span className="flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400">🧭</span>
                Usa "Navegar" para calcular rutas
              </span>
            </div>

            <div className="text-xs">
              Sistema de Mapas Geoespaciales v1.0
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
