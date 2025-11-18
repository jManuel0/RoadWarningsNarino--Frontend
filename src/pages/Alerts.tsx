// src/pages/Alerts.tsx

import { useEffect, useState, useCallback } from "react";
import { Plus, Filter, Search, X, Mic } from "lucide-react";

import { useAlertStore } from "@/stores/alertStore";
import { useAuthStore } from "@/stores/authStore";
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

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

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

            {/* Solo usuarios registrados pueden crear alertas */}
            {isAuthenticated ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus size={20} />
                Nueva Alerta
              </button>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-500 mb-1">
                  Crea una cuenta para reportar nuevas alertas
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => (window.location.href = "/login")}
                    className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg"
                  >
                    Iniciar sesión
                  </button>
                  <button
                    type="button"
                    onClick={() => (window.location.href = "/register")}
                    className="px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Registrarme
                  </button>
                </div>
              </div>
            )}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as AlertStatus | "ALL")
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Todos</option>
                <option value={AlertStatus.ACTIVE}>Activas</option>
                <option value={AlertStatus.IN_PROGRESS}>En progreso</option>
                <option value={AlertStatus.RESOLVED}>Resueltas</option>
              </select>
            </div>

            {/* Filtro por severidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severidad
              </label>
              <select
                value={filterSeverity}
                onChange={(e) =>
                  setFilterSeverity(e.target.value as AlertSeverity | "ALL")
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Todas</option>
                <option value={AlertSeverity.CRITICA}>Crítica</option>
                <option value={AlertSeverity.ALTA}>Alta</option>
                <option value={AlertSeverity.MEDIA}>Media</option>
                <option value={AlertSeverity.BAJA}>Baja</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de alertas */}
        <div className="space-y-6">{renderAlertsList()}</div>
      </div>

      {/* Modal de creación de alerta (solo si está autenticado) */}
      {showCreateModal && isAuthenticated && (
        <CreateAlertModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (alertData) => {
            try {
              const newAlert = await alertApi.createAlert(alertData);
              addAlert(newAlert);
              setShowCreateModal(false);
            } catch (err) {
              console.error("Error al crear alerta:", err);
              alert("No se pudo crear la alerta");
            }
          }}
        />
      )}
    </div>
  );
}

interface CreateAlertModalProps {
  onClose: () => void;
  onSubmit: (data: CreateAlertDTO) => Promise<void>;
}

function CreateAlertModal({ onClose, onSubmit }: Readonly<CreateAlertModalProps>) {
  const [type, setType] = useState<AlertType>(AlertType.ACCIDENTE);
  const [severity, setSeverity] = useState<AlertSeverity>(
    AlertSeverity.ALTA
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [municipality, setMunicipality] = useState("Pasto");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<
    number | undefined
  >(undefined);

  const handleMapSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("El título es obligatorio.");
      return;
    }

    if (false && !location.trim()) {
      alert("La dirección es obligatoria.");
      return;
    }

    if (false && !municipality.trim()) {
      alert("El municipio es obligatorio.");
      return;
    }

    if (latitude == null || longitude == null) {
      alert("Por favor selecciona la ubicación en el mapa.");
      return;
    }

    const data: CreateAlertDTO = {
      type,
      severity,
      title,
      description,
      location,
      municipality,
      latitude,
      longitude,
      estimatedDuration,
    };

    await onSubmit(data);
  };

  const handleDictateDescription = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript =
        event.results?.[0]?.[0]?.transcript ?? "";
      if (!transcript) return;
      setDescription((prev) =>
        prev ? `${prev} ${transcript}` : transcript
      );
    };

    recognition.onerror = (event: any) => {
      console.error("Error de reconocimiento de voz:", event.error);
    };

    recognition.start();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Crear nueva alerta
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de alerta *
              </label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as unknown as AlertType)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={AlertType.ACCIDENTE}>Accidente</option>
                <option value={AlertType.DERRUMBE}>Derrumbe</option>
                <option value={AlertType.INUNDACION}>Inundación</option>
                <option value={AlertType.CIERRE_VIAL}>Cierre vial</option>
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
                  setSeverity(
                    e.target.value as unknown as AlertSeverity
                  )
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
                placeholder="Ej: Accidente en la vía Panamericana"
              />
            </div>

           {/* Descripción */}
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Descripción *
        </label>
        <button
          type="button"
          onClick={handleDictateDescription}
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
        >
          <Mic size={14} />
          Dictar
        </button>
      </div>
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

            {/* Municipio (opcional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Municipio (opcional)
              </label>
              <select
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Pasto">Pasto</option>
                <option value="Ipiales">Ipiales</option>
                <option value="Tumaco">Tumaco</option>
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
                  value={latitude ?? ""}
                  onChange={(e) =>
                    setLatitude(
                      e.target.value
                        ? parseFloat(e.target.value)
                        : null
                    )
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
                  value={longitude ?? ""}
                  onChange={(e) =>
                    setLongitude(
                      e.target.value
                        ? parseFloat(e.target.value)
                        : null
                    )
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
