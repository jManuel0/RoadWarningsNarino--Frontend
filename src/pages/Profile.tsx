import { useEffect, useState, useCallback } from 'react';
import { User, Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { userApi, UserProfile, UserStats } from '@/api/userApi';
import { Alert, AlertStatus } from '@/types/Alert';
import { useAuthStore } from '@/stores/authStore';
import AlertCard from '@/components/AlertCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { notificationService } from '@/utils/notifications';
import { alertApi } from '@/api/alertApi';

export default function Profile() {
  const username = useAuthStore((s) => s.username);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [userAlerts, setUserAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'resolved'>('all');

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileData, statsData, alertsData] = await Promise.all([
        userApi.getProfile(),
        userApi.getUserStats(),
        userApi.getUserAlerts(),
      ]);

      setProfile(profileData);
      setStats(statsData);
      setUserAlerts(alertsData);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('No se pudo cargar la información del perfil');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleStatusChange = async (id: number, status: AlertStatus) => {
    try {
      await alertApi.updateAlertStatus(id, status);
      setUserAlerts(
        userAlerts.map((a) => (a.id === id ? { ...a, status } : a))
      );
      notificationService.success('Estado actualizado');
      loadUserData(); // Reload stats
    } catch (err) {
      console.error('Error updating status:', err);
      notificationService.error('No se pudo actualizar el estado');
    }
  };

  const handleDelete = async (id: number) => {
    const ok = window.confirm('¿Estás seguro de eliminar esta alerta?');
    if (!ok) return;

    try {
      await alertApi.deleteAlert(id);
      setUserAlerts(userAlerts.filter((a) => a.id !== id));
      notificationService.success('Alerta eliminada');
      loadUserData(); // Reload stats
    } catch (err) {
      console.error('Error deleting alert:', err);
      notificationService.error('No se pudo eliminar la alerta');
    }
  };

  const filteredAlerts = userAlerts.filter((alert) => {
    if (activeTab === 'active') return alert.status === AlertStatus.ACTIVE;
    if (activeTab === 'resolved') return alert.status === AlertStatus.RESOLVED;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-red-700 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full">
              <User className="text-blue-600 dark:text-blue-400" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {username || profile?.username}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Miembro desde {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Alertas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalAlerts || 0}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <AlertCircle className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Activas</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-500">
                  {stats?.activeAlerts || 0}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </div>

          {/* Resolved Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resueltas</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-500">
                  {stats?.resolvedAlerts || 0}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Críticas</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-500">
                  {stats?.criticalAlerts || 0}
                </p>
              </div>
              <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
                <Calendar className="text-red-600 dark:text-red-400" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts History */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Mis Alertas
          </h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b dark:border-gray-700">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'all'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Todas ({userAlerts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'active'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Activas ({userAlerts.filter((a) => a.status === AlertStatus.ACTIVE).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('resolved')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'resolved'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Resueltas ({userAlerts.filter((a) => a.status === AlertStatus.RESOLVED).length})
            </button>
          </div>

          {/* Alert List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAlerts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                No hay alertas en esta categoría
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
