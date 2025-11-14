import { useState } from 'react';
import { Filter, X, Calendar } from 'lucide-react';
import { Alert, AlertType, AlertSeverity, AlertStatus } from '@/types/Alert';

interface FilterOptions {
  types: AlertType[];
  severities: AlertSeverity[];
  statuses: AlertStatus[];
  dateFrom: string;
  dateTo: string;
  municipality: string;
}

interface AdvancedFiltersProps {
  alerts: Alert[];
  onFilterChange: (filtered: Alert[]) => void;
  onReset: () => void;
}

const initialFilters: FilterOptions = {
  types: [],
  severities: [],
  statuses: [],
  dateFrom: '',
  dateTo: '',
  municipality: '',
};

export default function AdvancedFilters({
  alerts,
  onFilterChange,
  onReset,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  const handleTypeToggle = (type: AlertType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];

    setFilters({ ...filters, types: newTypes });
  };

  const handleSeverityToggle = (severity: AlertSeverity) => {
    const newSeverities = filters.severities.includes(severity)
      ? filters.severities.filter((s) => s !== severity)
      : [...filters.severities, severity];

    setFilters({ ...filters, severities: newSeverities });
  };

  const handleStatusToggle = (status: AlertStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];

    setFilters({ ...filters, statuses: newStatuses });
  };

  const applyFilters = () => {
    let filtered = [...alerts];

    // Filtrar por tipo
    if (filters.types.length > 0) {
      filtered = filtered.filter((alert) => filters.types.includes(alert.type));
    }

    // Filtrar por severidad
    if (filters.severities.length > 0) {
      filtered = filtered.filter((alert) =>
        filters.severities.includes(alert.severity)
      );
    }

    // Filtrar por estado
    if (filters.statuses.length > 0) {
      filtered = filtered.filter((alert) =>
        filters.statuses.includes(alert.status)
      );
    }

    // Filtrar por fecha desde
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter((alert) => {
        if (!alert.createdAt) return true;
        return new Date(alert.createdAt) >= fromDate;
      });
    }

    // Filtrar por fecha hasta
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((alert) => {
        if (!alert.createdAt) return true;
        return new Date(alert.createdAt) <= toDate;
      });
    }

    // Filtrar por municipio
    if (filters.municipality.trim()) {
      const searchTerm = filters.municipality.toLowerCase();
      filtered = filtered.filter((alert) =>
        alert.municipality?.toLowerCase().includes(searchTerm) ||
        alert.location.toLowerCase().includes(searchTerm)
      );
    }

    onFilterChange(filtered);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    onReset();
    setIsOpen(false);
  };

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.severities.length > 0 ||
    filters.statuses.length > 0 ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.municipality.trim();

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          hasActiveFilters
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <Filter size={20} />
        <span className="font-medium">Filtros</span>
        {hasActiveFilters && (
          <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
            {[
              filters.types.length,
              filters.severities.length,
              filters.statuses.length,
              filters.dateFrom ? 1 : 0,
              filters.dateTo ? 1 : 0,
              filters.municipality ? 1 : 0,
            ].reduce((a, b) => a + b, 0)}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Filtros Avanzados
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Tipo de Alerta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Alerta
                </label>
                <div className="space-y-2">
                  {Object.values(AlertType).map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.types.includes(type)}
                        onChange={() => handleTypeToggle(type)}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {type.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Severidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Severidad
                </label>
                <div className="space-y-2">
                  {Object.values(AlertSeverity).map((severity) => (
                    <label key={severity} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.severities.includes(severity)}
                        onChange={() => handleSeverityToggle(severity)}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {severity}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <div className="space-y-2">
                  {Object.values(AlertStatus).map((status) => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.statuses.includes(status)}
                        onChange={() => handleStatusToggle(status)}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {status.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fecha Desde */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Fecha Desde
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters({ ...filters, dateFrom: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Fecha Hasta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters({ ...filters, dateTo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Municipio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Municipio/Ubicación
                </label>
                <input
                  type="text"
                  placeholder="Buscar por municipio..."
                  value={filters.municipality}
                  onChange={(e) =>
                    setFilters({ ...filters, municipality: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-6 pt-4 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
