import LocationPickerMap from "@/components/LocationPickerMap"; // si ya lo tienes
import { AlertSeverity, AlertType, CreateAlertDTO } from "@/types/Alert";
import { X } from "lucide-react";
import { useState } from "react";

// ...

interface CreateAlertModalProps {
  onClose: () => void;
  onSubmit: (alert: CreateAlertDTO) => Promise<void> | void;
}

function CreateAlertModal({ onClose, onSubmit }: Readonly<CreateAlertModalProps>) {
  const [type, setType] = useState<AlertType>(AlertType.CIERRE_VIAL);
  const [severity, setSeverity] = useState<AlertSeverity>(AlertSeverity.MEDIA);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [municipality, setMunicipality] = useState("Pasto");
  const [latitude, setLatitude] = useState(1.2136);
  const [longitude, setLongitude] = useState(-77.2811);
  const [estimatedDuration, setEstimatedDuration] = useState<number | undefined>();

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
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
                onChange={(e) => setSeverity(e.target.value as AlertSeverity)}
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
                {/* agrega más */}
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
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
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
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Duración */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración Estimada (minutos)
              </label>
              <input
                type="number"
                value={estimatedDuration ?? ""}
                onChange={(e) =>
                  setEstimatedDuration(
                    e.target.value ? parseInt(e.target.value, 10) : undefined
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
