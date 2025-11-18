import { useState, useEffect } from 'react';
import { Shield, ShieldOff, MapPin, Bell, AlertTriangle, TrendingUp } from 'lucide-react';
import { geofencingService } from '@/services/geofencing';
import { Alert, AlertSeverity } from '@/types/Alert';

interface GeofencingControlProps {
  alerts: Alert[];
}

export default function GeofencingControl({ alerts }: Readonly<GeofencingControlProps>) {
  const [isActive, setIsActive] = useState(false);
  const [enteredZones, setEnteredZones] = useState<Alert[]>([]);
  const [nearbyAlerts, setNearbyAlerts] = useState<Array<Alert & { distance: number }>>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Subscribe to geofence events
    const unsubscribe = geofencingService.onGeofenceEvent((alert, action) => {
      if (action === 'enter') {
        setEnteredZones(prev => [...prev, alert]);
      } else {
        setEnteredZones(prev => prev.filter(a => a.id !== alert.id));
      }
    });

    // Update nearby alerts every 10 seconds
    const interval = setInterval(() => {
      if (isActive) {
        const nearby = geofencingService.getNearbyAlerts(2000);
        setNearbyAlerts(nearby);
      }
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [isActive]);

  useEffect(() => {
    // Update alerts in geofencing service
    if (isActive) {
      geofencingService.updateAlerts(alerts);
    }
  }, [alerts, isActive]);

  const toggleGeofencing = async () => {
    if (isActive) {
      geofencingService.stopMonitoring();
      setIsActive(false);
      setEnteredZones([]);
      setNearbyAlerts([]);
    } else {
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      const started = geofencingService.startMonitoring(alerts);
      if (started) {
        setIsActive(true);

        // Get initial nearby alerts
        setTimeout(() => {
          const nearby = geofencingService.getNearbyAlerts(2000);
          setNearbyAlerts(nearby);
        }, 2000);
      } else {
        alert('No se pudo activar el geofencing. Verifica los permisos de ubicación.');
      }
    }
  };

  const getSeverityColor = (severity: AlertSeverity): string => {
    const colors = {
      [AlertSeverity.CRITICA]: 'text-red-600 bg-red-100 dark:bg-red-900/30',
      [AlertSeverity.ALTA]: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
      [AlertSeverity.MEDIA]: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
      [AlertSeverity.BAJA]: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    };
    return colors[severity] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isActive ? (
              <Shield className="text-green-600 dark:text-green-400" size={24} />
            ) : (
              <ShieldOff className="text-gray-400" size={24} />
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Alertas por Proximidad
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isActive ? 'Monitoreando tu ubicación' : 'Desactivado'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleGeofencing}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              isActive
                ? 'bg-green-600'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isActive ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Status */}
      {isActive && (
        <div className="p-4 space-y-3">
          {/* Active Zones */}
          {enteredZones.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">
                    ⚠️ Dentro de zona de alerta
                  </p>
                  <div className="space-y-2">
                    {enteredZones.map(alert => (
                      <div
                        key={alert.id}
                        className="bg-white dark:bg-gray-800 rounded p-2 text-xs"
                      >
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-1 ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {alert.title}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {alert.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <MapPin className="mx-auto mb-1 text-blue-600 dark:text-blue-400" size={20} />
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {alerts.length}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Zonas</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <Bell className="mx-auto mb-1 text-green-600 dark:text-green-400" size={20} />
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {enteredZones.length}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Activas</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <TrendingUp className="mx-auto mb-1 text-orange-600 dark:text-orange-400" size={20} />
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {nearbyAlerts.length}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Cercanas</p>
            </div>
          </div>

          {/* Nearby Alerts */}
          {nearbyAlerts.length > 0 && (
            <div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full text-left text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center justify-between hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span>Alertas Cercanas (2 km)</span>
                <span className="text-xs text-gray-500">
                  {showDetails ? '▼' : '▶'}
                </span>
              </button>

              {showDetails && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {nearbyAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          📍 {(alert.distance / 1000).toFixed(1)} km
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {alert.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {alert.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-900 dark:text-blue-300">
              <strong>💡 Cómo funciona:</strong> Recibirás notificaciones automáticas cuando te acerques a zonas con alertas. Las alertas críticas incluyen vibración y voz.
            </p>
          </div>
        </div>
      )}

      {/* Inactive State */}
      {!isActive && (
        <div className="p-4">
          <div className="text-center py-6">
            <ShieldOff size={48} className="mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Activa las alertas de proximidad para recibir notificaciones cuando te acerques a zonas peligrosas.
            </p>
            <button
              onClick={toggleGeofencing}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              Activar Geofencing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
