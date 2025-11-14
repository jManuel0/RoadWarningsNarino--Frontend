// src/components/QuickAlertModal.tsx
import { useState } from "react";
import { X, AlertTriangle, Camera, MapPin } from "lucide-react";
import { AlertType, AlertSeverity, AlertStatus } from "@/types/Alert";
import { useAuthStore } from "@/stores/authStore";
import { alertApi } from "@/api/alertApi";
import { toast } from "sonner";
import { RoutePoint } from "@/stores/navigationStore";

interface QuickAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: RoutePoint;
  onAlertCreated?: () => void;
}

const ALERT_TYPES = [
  { type: AlertType.ACCIDENTE, label: "Accidente", icon: "🚗💥", color: "bg-red-600" },
  { type: AlertType.DERRUMBE, label: "Derrumbe", icon: "🪨", color: "bg-orange-600" },
  { type: AlertType.INUNDACION, label: "Inundación", icon: "🌊", color: "bg-blue-600" },
  { type: AlertType.CIERRE_VIAL, label: "Cierre Vial", icon: "🚧", color: "bg-yellow-600" },
  { type: AlertType.MANTENIMIENTO, label: "Mantenimiento", icon: "🔧", color: "bg-gray-600" },
];

const SEVERITIES = [
  { severity: AlertSeverity.CRITICA, label: "Crítica", color: "bg-red-600" },
  { severity: AlertSeverity.ALTA, label: "Alta", color: "bg-orange-600" },
  { severity: AlertSeverity.MEDIA, label: "Media", color: "bg-yellow-600" },
  { severity: AlertSeverity.BAJA, label: "Baja", color: "bg-green-600" },
];

export default function QuickAlertModal({
  isOpen,
  onClose,
  location,
  onAlertCreated,
}: QuickAlertModalProps) {
  const [selectedType, setSelectedType] = useState<AlertType | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity>(
    AlertSeverity.MEDIA
  );
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { username } = useAuthStore();

  const handleSubmit = async () => {
    if (!selectedType) {
      toast.error("Selecciona el tipo de alerta");
      return;
    }

    setLoading(true);

    try {
      const alertData = {
        type: selectedType,
        title: ALERT_TYPES.find((t) => t.type === selectedType)?.label || "Alerta",
        description: description || "Alerta reportada desde navegación",
        latitude: location.lat,
        longitude: location.lng,
        location: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
        municipality: "En ruta", // Se puede mejorar con geocoding
        severity: selectedSeverity,
        status: AlertStatus.ACTIVE,
        username: username || "Usuario",
      };

      await alertApi.createAlert(alertData);

      toast.success("Alerta creada exitosamente", {
        description: "Gracias por mantener a la comunidad informada",
      });

      onAlertCreated?.();
      onClose();
      setSelectedType(null);
      setDescription("");
    } catch (error) {
      console.error("Error creating alert:", error);
      toast.error("Error al crear la alerta", {
        description: "Por favor intenta nuevamente",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-full">
              <AlertTriangle size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Reportar Alerta
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <MapPin size={12} />
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tipo de Alerta */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              ¿Qué está pasando?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ALERT_TYPES.map((alert) => (
                <button
                  key={alert.type}
                  onClick={() => setSelectedType(alert.type)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedType === alert.type
                      ? `${alert.color} text-white border-transparent scale-105`
                      : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400"
                  }`}
                >
                  <div className="text-3xl mb-2">{alert.icon}</div>
                  <div
                    className={`text-sm font-medium ${
                      selectedType === alert.type
                        ? "text-white"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {alert.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Severidad */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Gravedad
            </label>
            <div className="grid grid-cols-4 gap-2">
              {SEVERITIES.map((sev) => (
                <button
                  key={sev.severity}
                  onClick={() => setSelectedSeverity(sev.severity)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedSeverity === sev.severity
                      ? `${sev.color} text-white border-transparent scale-110`
                      : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <div
                    className={`text-xs font-bold ${
                      selectedSeverity === sev.severity
                        ? "text-white"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {sev.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Detalles (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agrega más detalles sobre lo que está ocurriendo..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedType || loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Enviando...
                </>
              ) : (
                <>
                  <AlertTriangle size={20} />
                  Reportar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
