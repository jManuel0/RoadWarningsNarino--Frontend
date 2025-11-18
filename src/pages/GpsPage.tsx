import React, { useEffect, useState } from "react";
import { alertApi } from "@/api/alertApi";
import { Alert, AlertStatus } from "@/types/Alert";
import GPSNavigation from "@/components/GPSNavigation";
import { Navigation, MapPin, AlertCircle } from "lucide-react";
import { notificationService } from "@/utils/notifications";

const GpsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showNavigation, setShowNavigation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await alertApi.getActiveAlerts();
      setAlerts(data.filter(a => a.status === AlertStatus.ACTIVE));
    } catch (error) {
      console.error("Error fetching alerts:", error);
      notificationService.error("No se pudieron cargar las alertas");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowNavigation(true);
  };

  if (showNavigation && selectedAlert) {
    return (
      <GPSNavigation
        destination={{
          lat: selectedAlert.latitude,
          lng: selectedAlert.longitude,
          name: selectedAlert.title
        }}
        onClose={() => {
          setShowNavigation(false);
          setSelectedAlert(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <Navigation size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Navegación GPS</h1>
              <p className="text-blue-100">Navega a las alertas activas en tu zona</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <AlertCircle className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No hay alertas activas
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No se encontraron alertas activas para navegar
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                {/* Alert Image */}
                {alert.imageUrl ? (
                  <img
                    src={alert.imageUrl}
                    alt={alert.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <AlertCircle size={64} className="text-white/50" />
                  </div>
                )}

                {/* Alert Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {alert.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      alert.severity === 'CRITICA' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'ALTA' ? 'bg-orange-100 text-orange-800' :
                      alert.severity === 'MEDIA' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {alert.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500 mb-4">
                    <MapPin size={16} />
                    <span className="truncate">{alert.location}</span>
                  </div>

                  {/* Navigate Button */}
                  <button
                    onClick={() => handleNavigateToAlert(alert)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-medium transition-all hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Navigation size={20} />
                    Navegar aquí
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GpsPage;
