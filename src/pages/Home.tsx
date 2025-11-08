import { useEffect, useState, useCallback, useRef } from 'react';
import { useAlertStore } from '@/stores/alertStore';
import { useObserver } from '@/hooks/UseObserver';
import { alertApi } from '@/api/alertApi';
import MapView from '@/components/MapView';
import NotificationBell from '@/components/NotificationBell';
import AlertCard from '@/components/AlertCard';
import MapSearchBar from '@/components/MapSearchBar';
import { Alert, AlertStatus } from '@/types/Alert';
import { MapPin, AlertTriangle, RefreshCw, X } from 'lucide-react';
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

  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const loadAlerts = useCallback(async (showNotification = false) => {
    try {
      setLoading(true);
      const data = await alertApi.getAlerts();
      setAlerts(data);
      setError(null);
      if (showNotification) {
        notificationService.success('Alertas actualizadas');
      }
    } catch (err) {
      setError('Error al cargar alertas');
      notificationService.error('No se pudieron cargar las alertas');
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [setLoading, setAlerts, setError]);

  // Solicitar permisos de notificación al montar
  useEffect(() => {
    notificationService.requestPermission();
  }, []);

  // Cargar alertas al montar
  useEffect(() => {
    loadAlerts();
    // Polling cada 30 segundos
    const interval = setInterval(() => loadAlerts(), 30000);
    return () => clearInterval(interval);
  }, [loadAlerts]);

  // Manejar apertura/cierre del modal dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClickOutside = (e: MouseEvent) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        handleCloseModal();
      }
    };

    if (selectedAlert) {
      dialog.showModal();
      dialog.addEventListener('click', handleClickOutside);
    } else {
      dialog.close();
    }

    return () => {
      dialog.removeEventListener('click', handleClickOutside);
    };
  }, [selectedAlert]);

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
        `Alerta marcada como ${status === AlertStatus.RESOLVED ? 'resuelta' : 'en progreso'}`
      );
    } catch (err) {
      notificationService.error('No se pudo actualizar el estado de la alerta');
      console.error('Error al actualizar alerta:', err);
    }
  };

  const handleSearch = (filtered: Alert[]) => {
    setFilteredAlerts(filtered);
    setIsFiltered(true);
  };

  const handleResetSearch = () => {
    setFilteredAlerts([]);
    setIsFiltered(false);
  };

  const handleCloseModal = () => {
    setSelectedAlert(null);
  };

  const activeAlerts = getActiveAlerts();
  const criticalAlerts = getCriticalAlerts();
  const displayAlerts = isFiltered ? filteredAlerts : activeAlerts;

  // Función para obtener el mensaje de estado de alertas
  const getEmptyAlertsMessage = () => {
    if (isFiltered) {
      return 'No se encontraron alertas con los filtros aplicados';
    }
    return 'No hay alertas activas';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-600 dark:text-red-500" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Alertas Viales
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pasto, Nariño - Colombia
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                title="Actualizar alertas"
                aria-label="Actualizar alertas"
              >
                <RefreshCw 
                  size={20} 
                  className={`${isRefreshing ? 'animate-spin' : ''} text-gray-700 dark:text-gray-200`} 
                />
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Alertas Activas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {activeAlerts.length}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <MapPin className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Alertas Críticas</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-500">
                  {criticalAlerts.length}
                </p>
              </div>
              <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
                <AlertTriangle className="text-red-600 dark:text-red-500" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Alertas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {alerts.length}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <MapPin className="text-green-600 dark:text-green-500" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mapa con buscador */}
          <div className="lg:col-span-2 space-y-4">
            {/* Buscador avanzado */}
            <MapSearchBar
              alerts={activeAlerts}
              onSearch={handleSearch}
              onReset={handleResetSearch}
            />

            {/* Mapa */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Mapa de Alertas
                </h2>
                {isFiltered && (
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {displayAlerts.length} de {activeAlerts.length} alertas
                  </span>
                )}
              </div>
              
              {(() => {
                if (loading) {
                  return (
                    <div className="flex items-center justify-center h-96">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  );
                }

                if (error) {
                  return (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
                      {error}
                    </div>
                  );
                }

                return (
                  <MapView
                    alerts={displayAlerts}
                    onAlertClick={setSelectedAlert}
                  />
                );
              })()}
            </div>
          </div>

          {/* Lista de alertas */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Alertas Recientes
                </h2>
                {isFiltered && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    Filtradas
                  </span>
                )}
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {displayAlerts.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    {getEmptyAlertsMessage()}
                  </p>
                ) : (
                  displayAlerts.map(alert => (
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

      {/* Modal de alerta seleccionada */}
      <dialog
        ref={dialogRef}
        aria-labelledby="modal-title"
        className="backdrop:bg-black backdrop:bg-opacity-50 bg-transparent p-4 max-w-2xl w-full rounded-lg open:flex open:flex-col"
      >
        {selectedAlert && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h3
                id="modal-title"
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                {selectedAlert.type.replace('_', ' ')}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Cerrar modal"
              >
                <X size={24} />
              </button>
            </div>

            <AlertCard
              alert={selectedAlert}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}
      </dialog>
    </div>
  );
}