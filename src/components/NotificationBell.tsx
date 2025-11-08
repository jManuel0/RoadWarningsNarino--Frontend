import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Alert, AlertPriority } from '@/types/Alert';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationBellProps {
  alerts: Alert[];
  onAlertClick?: (alert: Alert) => void;
}

export default function NotificationBell({ alerts, onAlertClick }: Readonly<NotificationBellProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(alerts.length);
  }, [alerts]);

  const criticalAlerts = alerts.filter(a => a.priority === AlertPriority.CRITICA);
  const hasCritical = criticalAlerts.length > 0;

  return (
    <div className="relative">
      {/* Botón de notificación */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-3 rounded-full transition-colors ${
          hasCritical 
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        }`}
      >
        <Bell size={24} />
        
        {/* Badge de contador */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl z-50 max-h-[600px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="font-bold text-lg">Alertas Activas</h3>
                <p className="text-sm text-gray-600">{alerts.length} notificaciones</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Lista de alertas */}
            <div className="overflow-y-auto flex-1">
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No hay alertas activas</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {alerts.map(alert => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        onAlertClick?.(alert);
                        setIsOpen(false);
                      }}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        alert.priority === AlertPriority.CRITICA ? 'bg-red-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Indicador de prioridad */}
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          alert.priority === AlertPriority.CRITICA ? 'bg-red-500 animate-pulse' :
                          alert.priority === AlertPriority.ALTA ? 'bg-orange-500' :
                          alert.priority === AlertPriority.MEDIA ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {alert.type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {alert.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatDistanceToNow(new Date(alert.timestamp), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {alerts.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setUnreadCount(0);
                    setIsOpen(false);
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Marcar todas como leídas
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}