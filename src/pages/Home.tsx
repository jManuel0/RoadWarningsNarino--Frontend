import { useEffect, useState } from 'react';
import { useAlertStore } from '@/stores/alertStore';
import { useObserver } from '@/hooks/UseObserver';
import { alertApi } from '@/api/alertApi';
import MapView from '@/components/MapView';
import NotificationBell from '@/components/NotificationBell';
import AlertCard from '@/components/AlertCard';
import { Alert, AlertStatus } from '@/types/Alert';
import { MapPin, AlertTriangle, RefreshCw } from 'lucide-react';
import { notificationService } from '@/utils/notifications';

export default function Home() {
  const { 
    alerts, 
    loading, 
    error, 
    setAlerts, 
    updateAlert,
    setLoading, 
    setError,
    getActiveAlerts,
    getCriticalAlerts,
    alertSubject 
  } = useAlertStore();

  const [, setSelectedAlert] = useState<Alert | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Solicitar permisos de notificación al montar
  useEffect(() => {
    notificationService.requestPermission();
  }, []);

  // Cargar alertas al montar
  useEffect(() => {
    loadAlerts();
    // Polling cada 30 segundos
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async (showNotification = false) => {
    try {
      setLoading(true);
      const data = await alertApi.getAlerts();
      setAlerts(data);
      setError(null);
      if (showNotification) {
        notificationService.success('Alertas actualizadas', 'Se cargaron las últimas alertas');
      }
    } catch (err) {
      setError('Error al cargar alertas');
      notificationService.error('Error', 'No se pudieron cargar las alertas');
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAlerts(true);
  };

  // Observar nuevas alertas
  useObserver(alertSubject, (newAlert) => {
    console.log('Nueva alerta recibida:', newAlert);
    notificationService.newAlert(newAlert);
    notificationService.browserNotification(newAlert);
  });

  const handleStatusChange = async (id: string, status: AlertStatus) => {
    try {
      await alertApi.updateAlertStatus(id, status);
      updateAlert(id, { status });
      notificationService.success(
        'Estado actualizado',
        `La alerta ha sido marcada como ${status === AlertStatus.RESOLVED ? 'resuelta' : 'en progreso'}`
      );
    } catch (err) {
      notificationService.error('Error', 'No se pudo actualizar el estado de la alerta');
      console.error('Error al actualizar alerta:', err);
    }
  };

  const activeAlerts = getActiveAlerts();
  const criticalAlerts = getCriticalAlerts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-600" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Alertas Viales
                </h1>
                <p className="text-sm text-gray-600">
                  Pasto, Nariño - Colombia
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                title="Actualizar alertas"
              >
                <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
              
              <NotificationBell 
                alerts={activeAlerts}
                onAlertClick={setSelectedAlert}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Estadísticas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alertas Activas</p>
                <p className="text-3xl font-bold text-gray-900">{activeAlerts.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <MapPin className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alertas Críticas</p>
                <p className="text-3xl font-bold text-red-600">{criticalAlerts.length}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Alertas</p>
                <p className="text-3xl font-bold text-gray-900">{alerts.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <MapPin className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mapa */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Mapa de Alertas
              </h2>
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {error}
                </div>
              ) : (
                <MapView 
                  alerts={activeAlerts}
                  onAlertClick={setSelectedAlert}
                />
              )}
            </div>
          </div>

          {/* Lista de alertas */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Alertas Recientes
              </h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {activeAlerts.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No hay alertas activas
                  </p>
                ) : (
                  activeAlerts.map(alert => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}