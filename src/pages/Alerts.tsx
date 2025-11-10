import { useEffect, useState, useCallback } from "react";
import { Plus, Filter, Search, X } from "lucide-react";

import { useAlertStore } from "@/stores/alertStore";
import { alertApi } from "@/api/alertApi";
import AlertCard from "@/components/AlertCard";
import LocationPickerMap from "@/components/LocationPickerMap";

import {
  Alert,
  AlertStatus,
  AlertType,
  AlertSeverity,
  CreateAlertDTO,
} from "@/types/Alert";

export default function Alerts() {
  const {
    alerts,
    loading,
    error,
    setAlerts,
    addAlert,
    updateAlert,
    removeAlert,
    setLoading,
    setError,
  } = useAlertStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<AlertStatus | "ALL">("ALL");
  const [filterSeverity, setFilterSeverity] =
    useState<AlertSeverity | "ALL">("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await alertApi.getAlerts();
      setAlerts(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Error al cargar alertas");
    } finally {
      setLoading(false);
    }
  }, [setLoading, setAlerts, setError]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleStatusChange = async (id: number, status: AlertStatus) => {
    try {
      await alertApi.updateAlertStatus(id, status);
      updateAlert(id, { status });
    } catch (err) {
      console.error("Error al actualizar alerta:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta alerta?")) return;

    try {
      await alertApi.deleteAlert(id);
      removeAlert(id);
    } catch (err) {
      console.error("Error al eliminar alerta:", err);
    }
  };

  // Filtrado de alertas
  const filteredAlerts = alerts.filter((alert: Alert) => {
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      (alert.description || "").toLowerCase().includes(term) ||
      (alert.location || "").toLowerCase().includes(term) ||
      String(alert.type).toLowerCase().includes(term);

    const matchesStatus =
      filterStatus === "ALL" || alert.status === filterStatus;

    const matchesSeverity =
      filterSeverity === "ALL" || alert.severity === filterSeverity;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const renderAlertsList = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      );
    }

    if (filteredAlerts.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Filter
            size={48}
            className="mx-auto text-gray-400 mb-4"
          />
          <p className="text-gray-600">
            No se encontraron alertas con los filtros seleccionados
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Alertas
              </h1>
              <p className="text-sm text-gray-600">
                {filteredAlerts.length} de {alerts.length} alertas
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Nueva Alerta
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Buscar alertas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>

            {/* Filtro por estado */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value === "ALL"
                      ? "ALL"
                      : (e.target.value as AlertStatus)
                  )
                }
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Todos los estados</option>
                <option value={AlertStatus.ACTIVE}>Activas</option>
                <option value={AlertStatus.IN_PROGRESS}>En Progreso</option>
                <option value={AlertStatus.RESOLVED}>Resueltas</option>
              </select>
            </div>

            {/* Filtro por severidad */}
            <div>
              <select
                value={filterSeverity}
                onChange={(e) =>
                  setFilterSeverity(
                    e.target.value === "ALL"
                      ? "ALL"
                      : (e.target.value as AlertSeverity)
                  )
                }
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Todas las severidades</option>
                <option value={AlertSeverity.CRITICA}>Crítica</option>
                <option value={AlertSeverity.ALTA}>Alta</option>
                <option value={AlertSeverity.MEDIA}>Media</option>
                <option value={AlertSeverity.BAJA}>Baja</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de alertas */}
        {renderAlertsList()}
      </div>

      {/* Modal de crear alerta */}
      {showCreateModal && (
        <CreateAlertModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (alertData) => {
            try {
              const newAlert = await alertApi.createAlert(alertData);
              addAlert(newAlert);
              setShowCreateModal(false);
            } catch (err) {
              console.error("Error al crear alerta:", err);
              alert("Error al crear la alerta");
            }
          }}
        />
      )}
    </div>
  );
}

/* =====================
 * Modal Crear Alerta
 * ===================== */

interface CreateAlertModalProps {
  onClose: () => void;
  onSubmit: (alert: CreateAlertDTO) => Promise<void> | void;
}

function CreateAlertModal({
  onClose,
  onSubmit,
}: Readonly<CreateAlertModalProps>) {
  const [type, setType] = useState<AlertType>(AlertType.CIERRE_VIAL);
  const [severity, setSeverity] = useState<AlertSeverity>(AlertSeverity.MEDIA);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [municipality, setMunicipality] = useState("Pasto");
  const [latitude, setLatitude] = useState(1.2136);
  const [longitude, setLongitude] = useState(-77.2811);
  const [estimatedDuration, setEstimatedDuration] =
    useState<number | undefined>();

  const handleMapSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !location.trim()) {
      alert("Por favor completa título, descripción y dirección.");
      return;
    }

    const payload: CreateAlertDTO = {
      type,
      title,
      description,
      latitude,
      longitude,
      location,
      municipality,
      severity,
      estimatedDuration,
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Nueva Alerta</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Alerta *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AlertType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={AlertType.DERRUMBE}>Derrumbe</option>
                <option value={AlertType.ACCIDENTE}>Accidente</option>
                <option value={AlertType.INUNDACION}>Inundación</option>
                <option value={AlertType.CIERRE_VIAL}>Cierre Vial</option>
                <option value={AlertType.MANTENIMIENTO}>Mantenimiento</option>
              </select>
            </div>

            {/* Severidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severidad *
              </label>
              <select
                value={severity}
                onChange={(e) =>
                  setSeverity(e.target.value as AlertSeverity)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={AlertSeverity.CRITICA}>Crítica</option>
                <option value={AlertSeverity.ALTA}>Alta</option>
                <option value={AlertSeverity.MEDIA}>Media</option>
                <option value={AlertSeverity.BAJA}>Baja</option>
              </select>
            </div>

            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Accidente vehicular"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe la situación..."
              />
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Calle 18 con Carrera 25"
              />
            </div>

            {/* Municipio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Municipio
              </label>
              <select
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Pasto">Pasto</option>
                <option value="Ipiales">Ipiales</option>
                <option value="Tumaco">Tumaco</option>
                {/* agrega más municipios aquí */}
              </select>
            </div>

            {/* Mapa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona la ubicación en el mapa *
              </label>
              <LocationPickerMap
                lat={latitude}
                lng={longitude}
                onChange={handleMapSelect}
              />
            </div>

            {/* Coordenadas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitud
                </label>
                <input
                  type="number"
                  value={latitude}
                  onChange={(e) =>
                    setLatitude(parseFloat(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitud
                </label>
                <input
                  type="number"
                  value={longitude}
                  onChange={(e) =>
                    setLongitude(parseFloat(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Duración estimada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración Estimada (minutos)
              </label>
              <input
                type="number"
                value={estimatedDuration ?? ""}
                onChange={(e) =>
                  setEstimatedDuration(
                    e.target.value
                      ? parseInt(e.target.value, 10)
                      : undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Opcional"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Crear Alerta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
