import { useEffect, useState, useCallback } from "react";
import { Calendar, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { userApi, UserProfile, UserStats } from "@/api/userApi";
import { Alert, AlertStatus } from "@/types/Alert";
import { useAuthStore } from "@/stores/authStore";
import AlertCard from "@/components/AlertCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import { notificationService } from "@/utils/notifications";
import { alertApi } from "@/api/alertApi";

export default function Profile() {
  const username = useAuthStore((s) => s.username);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [userAlerts, setUserAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "resolved">(
    "all"
  );

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos de forma independiente con mejor manejo de errores
      const [profileResult, statsResult, alertsResult] =
        await Promise.allSettled([
          userApi.getProfile().catch((err) => {
            console.error("❌ Error al cargar perfil:", err);
            throw err;
          }),
          userApi.getUserStats().catch((err) => {
            console.error("❌ Error al cargar estadísticas:", err);
            // No fallar si las estadísticas no están disponibles
            return {
              totalAlerts: 0,
              activeAlerts: 0,
              resolvedAlerts: 0,
              criticalAlerts: 0,
              mostCommonType: "N/A",
            } as UserStats;
          }),
          userApi.getUserAlerts().catch((err) => {
            console.error("❌ Error al cargar alertas del usuario:", err);
            // No fallar si las alertas no están disponibles
            return [] as Alert[];
          }),
        ]);

      // Extraer datos de los resultados
      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value);
      } else {
        throw new Error("No se pudo cargar el perfil del usuario");
      }

      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value);
      }

      if (alertsResult.status === "fulfilled") {
        setUserAlerts(alertsResult.value);
      }
    } catch (err) {
      console.error("Error loading user data:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "No se pudo cargar la información del perfil. Verifica tu conexión e intenta de nuevo."
        );
      }
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
      notificationService.success("Estado actualizado");
      loadUserData(); // Reload stats
    } catch (err) {
      console.error("Error updating status:", err);
      notificationService.error("No se pudo actualizar el estado");
    }
  };

  const handleDelete = async (id: number) => {
    const ok = window.confirm("¿Estás seguro de eliminar esta alerta?");
    if (!ok) return;

    try {
      await alertApi.deleteAlert(id);
      setUserAlerts(userAlerts.filter((a) => a.id !== id));
      notificationService.success("Alerta eliminada");
      loadUserData(); // Reload stats
    } catch (err) {
      console.error("Error deleting alert:", err);
      notificationService.error("No se pudo eliminar la alerta");
    }
  };

  const filteredAlerts = userAlerts.filter((alert) => {
    if (activeTab === "active") return alert.status === AlertStatus.ACTIVE;
    if (activeTab === "resolved") return alert.status === AlertStatus.RESOLVED;
    return true;
  });

  // Manejar actualización de foto de perfil
  const handlePictureUpdated = (newPictureUrl: string | null) => {
    if (profile) {
      setProfile({
        ...profile,
        profilePicture: newPictureUrl || undefined,
      });
    }
  };

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
        <div className="max-w-md w-full">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle
                className="text-red-600 dark:text-red-400"
                size={24}
              />
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
                Error al cargar el perfil
              </h3>
            </div>
            <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={loadUserData}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Reintentar
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = "/")}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
              >
                Volver al inicio
              </button>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-800 dark:text-yellow-400">
              <strong>Posibles causas:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Backend no está disponible</li>
                <li>Token de sesión expirado</li>
                <li>Problemas de conexión</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-6">
            {/* Foto de perfil con opción de subir */}
            <ProfilePictureUpload
              currentPicture={profile?.profilePicture}
              onPictureUpdated={handlePictureUpdated}
            />

            {/* Información del usuario */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {username || profile?.username}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Miembro desde{" "}
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : "N/A"}
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
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Alertas
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalAlerts || 0}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <AlertCircle
                  className="text-purple-600 dark:text-purple-400"
                  size={24}
                />
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Activas
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-500">
                  {stats?.activeAlerts || 0}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <TrendingUp
                  className="text-blue-600 dark:text-blue-400"
                  size={24}
                />
              </div>
            </div>
          </div>

          {/* Resolved Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Resueltas
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-500">
                  {stats?.resolvedAlerts || 0}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <CheckCircle
                  className="text-green-600 dark:text-green-400"
                  size={24}
                />
              </div>
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Críticas
                </p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-500">
                  {stats?.criticalAlerts || 0}
                </p>
              </div>
              <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
                <Calendar
                  className="text-red-600 dark:text-red-400"
                  size={24}
                />
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
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "all"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Todas ({userAlerts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "active"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Activas (
              {userAlerts.filter((a) => a.status === AlertStatus.ACTIVE).length}
              )
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("resolved")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "resolved"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Resueltas (
              {
                userAlerts.filter((a) => a.status === AlertStatus.RESOLVED)
                  .length
              }
              )
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
