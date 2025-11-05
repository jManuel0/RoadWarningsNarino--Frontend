import { useEffect, useState } from 'react';
import { useAlertStore } from '@/stores/alertStore';
import { alertApi } from '@/api/alertApi';
import AlertCard from '@/components/AlertCard';
import { AlertStatus, AlertType, AlertPriority, CreateAlertDTO } from '@/types/Alert';
import { Plus, Filter, Search, X } from 'lucide-react';

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
    setError 
  } = useAlertStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<AlertStatus | 'ALL'>('ALL');
  const [filterPriority, setFilterPriority] = useState<AlertPriority | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await alertApi.getAlerts();
      setAlerts(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar alertas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: AlertStatus) => {
    try {
      await alertApi.updateAlertStatus(id, status);
      updateAlert(id, { status });
    } catch (err) {
      console.error('Error al actualizar alerta:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta alerta?')) return;
    
    try {
      await alertApi.deleteAlert(id);
      removeAlert(id);
    } catch (err) {
      console.error('Error al eliminar alerta:', err);
    }
  };

  // Filtrar alertas
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || alert.status === filterStatus;
    const matchesPriority = filterPriority === 'ALL' || alert.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar alertas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
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
                onChange={(e) => setFilterStatus(e.target.value as AlertStatus | 'ALL')}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Todos los estados</option>
                <option value={AlertStatus.ACTIVE}>Activas</option>
                <option value={AlertStatus.IN_PROGRESS}>En Progreso</option>
                <option value={AlertStatus.RESOLVED}>Resueltas</option>
              </select>
            </div>

            {/* Filtro por prioridad */}
            <div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value) as AlertPriority)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Todas las prioridades</option>
                <option value={AlertPriority.CRITICA}>Crítica</option>
                <option value={AlertPriority.ALTA}>Alta</option>
                <option value={AlertPriority.MEDIA}>Media</option>
                <option value={AlertPriority.BAJA}>Baja</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de alertas */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Filter size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No se encontraron alertas con los filtros seleccionados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
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
              console.error('Error al crear alerta:', err);
              alert('Error al crear la alerta');
            }
          }}
        />
      )}
    </div>
  );
}

// Modal de crear alerta
interface CreateAlertModalProps {
  onClose: () => void;
  onSubmit: (alert: CreateAlertDTO) => void;
}

function CreateAlertModal({ onClose, onSubmit }: CreateAlertModalProps) {
  const [formData, setFormData] = useState<CreateAlertDTO>({
    type: AlertType.CIERRE_VIAL,
    priority: AlertPriority.MEDIA,
    location: {
      lat: 1.2136,
      lng: -77.2811,
      address: '',
    },
    affectedRoads: [],
    description: '',
    estimatedDuration: undefined,
  });

  const [roadInput, setRoadInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.location.address) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }
    onSubmit(formData);
  };

  const addRoad = () => {
    if (roadInput.trim()) {
      setFormData({
        ...formData,
        affectedRoads: [...formData.affectedRoads, roadInput.trim()],
      });
      setRoadInput('');
    }
  };

  const removeRoad = (index: number) => {
    setFormData({
      ...formData,
      affectedRoads: formData.affectedRoads.filter((_, i) => i !== index),
    });
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
            {/* Tipo de alerta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Alerta *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as AlertType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={AlertType.DERRUMBE}>Derrumbe</option>
                <option value={AlertType.ACCIDENTE}>Accidente</option>
                <option value={AlertType.INUNDACION}>Inundación</option>
                <option value={AlertType.CIERRE_VIAL}>Cierre Vial</option>
                <option value={AlertType.MANTENIMIENTO}>Mantenimiento</option>
              </select>
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) as AlertPriority })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={AlertPriority.CRITICA}>Crítica</option>
                <option value={AlertPriority.ALTA}>Alta</option>
                <option value={AlertPriority.MEDIA}>Media</option>
                <option value={AlertPriority.BAJA}>Baja</option>
              </select>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                value={formData.location.address}
                onChange={(e) => setFormData({
                  ...formData,
                  location: { ...formData.location, address: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Calle 18 con Carrera 25"
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
                  step="0.000001"
                  value={formData.location.lat}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, lat: parseFloat(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitud
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.location.lng}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, lng: parseFloat(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Vías afectadas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vías Afectadas
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={roadInput}
                  onChange={(e) => setRoadInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRoad())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre de la vía"
                />
                <button
                  type="button"
                  onClick={addRoad}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.affectedRoads.map((road, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {road}
                    <button
                      type="button"
                      onClick={() => removeRoad(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Duración estimada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración Estimada (minutos)
              </label>
              <input
                type="number"
                value={formData.estimatedDuration || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  estimatedDuration: e.target.value ? parseInt(e.target.value) : undefined
                })}
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