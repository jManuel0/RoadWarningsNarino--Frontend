import { Alert, AlertType, AlertPriority, AlertStatus } from '../types/Alert';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, Clock, MapPin, X } from 'lucide-react';

interface AlertCardProps {
  alert: Alert;
  onStatusChange?: (id: string, status: AlertStatus) => void;
  onDelete?: (id: string) => void;
}

const alertTypeIcons = {
  [AlertType.DERRUMBE]: '🪨',
  [AlertType.ACCIDENTE]: '🚗',
  [AlertType.INUNDACION]: '🌊',
  [AlertType.CIERRE_VIAL]: '🚧',
  [AlertType.MANTENIMIENTO]: '🔧',
};

const priorityColors = {
  [AlertPriority.CRITICA]: 'bg-red-100 border-red-500 text-red-900',
  [AlertPriority.ALTA]: 'bg-orange-100 border-orange-500 text-orange-900',
  [AlertPriority.MEDIA]: 'bg-yellow-100 border-yellow-500 text-yellow-900',
  [AlertPriority.BAJA]: 'bg-blue-100 border-blue-500 text-blue-900',
};

const priorityLabels = {
  [AlertPriority.CRITICA]: 'Crítica',
  [AlertPriority.ALTA]: 'Alta',
  [AlertPriority.MEDIA]: 'Media',
  [AlertPriority.BAJA]: 'Baja',
};

const statusColors = {
  [AlertStatus.ACTIVE]: 'bg-red-500',
  [AlertStatus.IN_PROGRESS]: 'bg-yellow-500',
  [AlertStatus.RESOLVED]: 'bg-green-500',
};

const statusLabels = {
  [AlertStatus.ACTIVE]: 'Activa',
  [AlertStatus.IN_PROGRESS]: 'En Progreso',
  [AlertStatus.RESOLVED]: 'Resuelta',
};

export default function AlertCard({ alert, onStatusChange, onDelete }: Readonly<AlertCardProps>) {
  const priorityColor = priorityColors[alert.priority];
  const statusColor = statusColors[alert.status];

  return (
    <div className={`border-l-4 rounded-lg p-4 shadow-md ${priorityColor} relative`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{alertTypeIcons[alert.type]}</span>
          <div>
            <h3 className="font-bold text-lg">{alert.type.replace('_', ' ')}</h3>
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white">
              Prioridad: {priorityLabels[alert.priority]}
            </span>
          </div>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(alert.id)}
            className="text-gray-500 hover:text-red-600 transition-colors"
            title="Eliminar alerta"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-sm mb-3">{alert.description}</p>

      {/* Location */}
      <div className="flex items-center gap-2 text-sm mb-2">
        <MapPin size={16} />
        <span>{alert.location.address}</span>
      </div>

      {/* Affected Roads */}
      {alert.affectedRoads.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold mb-1">Vías afectadas:</p>
          <div className="flex flex-wrap gap-1">
            {alert.affectedRoads.map((road, index) => (
              <span
                key={`${alert.id}-road-${index}-${road}`}
                className="text-xs px-2 py-1 bg-white rounded-full"
              >
                {road}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Time and Duration */}
      <div className="flex items-center gap-4 text-xs mb-3">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>
            {formatDistanceToNow(new Date(alert.timestamp), {
              addSuffix: true,
              locale: es,
            })}
          </span>
        </div>
        {alert.estimatedDuration && (
          <span>Duración estimada: {alert.estimatedDuration} min</span>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${statusColor}`}></span>
          <span className="text-sm font-medium">{statusLabels[alert.status]}</span>
        </div>

        {/* Status Actions */}
        {onStatusChange && alert.status !== AlertStatus.RESOLVED && (
          <div className="flex gap-2">
            {alert.status === AlertStatus.ACTIVE && (
              <button
                onClick={() => onStatusChange(alert.id, AlertStatus.IN_PROGRESS)}
                className="text-xs px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              >
                En Progreso
              </button>
            )}
            <button
              onClick={() => onStatusChange(alert.id, AlertStatus.RESOLVED)}
              className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-1"
            >
              <CheckCircle size={14} />
              Resolver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}