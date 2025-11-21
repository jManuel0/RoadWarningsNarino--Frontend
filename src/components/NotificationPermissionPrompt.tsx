/**
 * Componente para solicitar permisos de notificaciones push
 * Muestra un banner amigable para que el usuario active las notificaciones
 */

import { useState, useEffect } from "react";
import { Bell, BellOff, X, Settings } from "lucide-react";
import { driverModeService } from "@/services/driverModeService";
import { pushNotificationService } from "@/services/pushNotificationService";
import { offlineAlertService } from "@/services/offlineAlertService";
import { toast } from "sonner";

export default function NotificationPermissionPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [, setPermissionStatus] = useState<NotificationPermission>("default");
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = () => {
    const status = pushNotificationService.getPermissionStatus();
    setPermissionStatus(status);

    // Mostrar prompt solo si:
    // 1. Las notificaciones están soportadas
    // 2. El permiso no ha sido otorgado ni denegado
    // 3. El usuario no ha cerrado el prompt antes (en esta sesión)
    const promptDismissed = sessionStorage.getItem(
      "notificationPromptDismissed"
    );

    if (
      pushNotificationService.isReady() &&
      status === "default" &&
      !promptDismissed
    ) {
      // Mostrar después de 3 segundos para no ser intrusivo
      setTimeout(() => setShowPrompt(true), 3000);
    }
  };

  const handleEnableNotifications = async () => {
    setIsRequesting(true);

    try {
      const granted = await pushNotificationService.requestPermission();

      if (granted) {
        toast.success("¡Notificaciones activadas!", {
          description: "Recibirás alertas en tiempo real sobre eventos viales.",
        });
        setPermissionStatus("granted");
        setShowPrompt(false);

        // Enviar notificación de prueba
        setTimeout(() => {
          pushNotificationService.sendTestNotification();
        }, 1000);
      } else {
        toast.error("Permiso denegado", {
          description:
            "No podrás recibir notificaciones de alertas. Puedes activarlas desde la configuración del navegador.",
        });
        setPermissionStatus("denied");
        setShowPrompt(false);
      }
    } catch (error) {
      console.error("Error activando notificaciones:", error);
      toast.error("Error al activar notificaciones");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("notificationPromptDismissed", "true");
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              Activa las Notificaciones
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Recibe alertas en tiempo real sobre derrumbes, accidentes y otros
              eventos importantes en las vías de Nariño.
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleEnableNotifications}
                disabled={isRequesting}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRequesting ? "Activando..." : "Activar"}
              </button>

              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium text-sm"
              >
                Ahora no
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente para mostrar el estado actual de las notificaciones
 * Útil para la página de configuración/perfil
 */
export function NotificationStatus() {
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermission>("default");
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [driverModeEnabled, setDriverModeEnabled] = useState(
    driverModeService.isEnabled()
  );
  const [offlineQueueLength, setOfflineQueueLength] = useState(
    offlineAlertService.getQueueLength()
  );

  useEffect(() => {
    updateStatus();
  }, []);

  useEffect(() => {
    return driverModeService.onModeChange(setDriverModeEnabled);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOfflineQueueLength(offlineAlertService.getQueueLength());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateStatus = () => {
    setPermissionStatus(pushNotificationService.getPermissionStatus());
    setToken(pushNotificationService.getToken());
  };

  const handleToggleNotifications = async () => {
    setIsLoading(true);

    try {
      if (permissionStatus === "granted") {
        // Desactivar
        await pushNotificationService.unsubscribe();
        toast.success("Notificaciones desactivadas");
      } else {
        // Activar
        const granted = await pushNotificationService.requestPermission();
        if (granted) {
          toast.success("Notificaciones activadas");
        } else {
          toast.error("Permiso denegado");
        }
      }
      updateStatus();
    } catch {
      toast.error("Error al cambiar configuración");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    await pushNotificationService.sendTestNotification();
  };

  const handleToggleDriverMode = () => {
    driverModeService.toggle();
  };

  if (!pushNotificationService.isReady()) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <BellOff className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <div>
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
              Notificaciones no disponibles
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Firebase no está configurado o tu navegador no soporta
              notificaciones push.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {permissionStatus === "granted" ? (
              <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Notificaciones Push
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {permissionStatus === "granted" && "Activas"}
                {permissionStatus === "denied" && "Bloqueadas"}
                {permissionStatus === "default" && "No configuradas"}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleNotifications}
            disabled={isLoading || permissionStatus === "denied"}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              permissionStatus === "granted"
                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading
              ? "Cargando..."
              : permissionStatus === "granted"
                ? "Desactivar"
                : "Activar"}
          </button>
        </div>

        {permissionStatus === "granted" && token && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleTestNotification}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Enviar notificación de prueba
            </button>
          </div>
        )}

        {permissionStatus === "denied" && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Las notificaciones están bloqueadas. Para activarlas:
            </p>
            <ol className="text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside space-y-1">
              <li>
                Haz clic en el icono de candado en la barra de direcciones
              </li>
              <li>Encuentra "Notificaciones" en los permisos</li>
              <li>Cambia el permiso a "Permitir"</li>
              <li>Recarga la página</li>
            </ol>
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-slate-900/40 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
              Modo Conductor
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Recibe alertas críticas y de alta severidad por voz mientras
              conduces. Solo notifica cuando estés activo en este modo.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleDriverMode}
            aria-pressed={driverModeEnabled}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              driverModeEnabled
                ? "bg-green-600 text-white hover:bg-green-500"
                : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
            }`}
          >
            {driverModeEnabled
              ? "Modo conductor activo"
              : "Activar modo conductor"}
          </button>
        </div>

        {offlineQueueLength > 0 && (
          <p className="text-xs text-orange-700 dark:text-orange-300">
            Hay {offlineQueueLength} alertas pendientes por sincronizar. Se
            enviarán cuando haya conexión.
          </p>
        )}
      </div>

      {/* Configuración de preferencias */}
      <NotificationPreferences />
    </div>
  );
}

/**
 * Componente para configurar preferencias de notificaciones
 */
function NotificationPreferences() {
  const [preferences, setPreferences] = useState(
    pushNotificationService.getPreferences()
  );

  const handleUpdatePreference = async (
    key: keyof typeof preferences,
    value: boolean
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    await pushNotificationService.updatePreferences({ [key]: value });
    toast.success("Preferencias actualizadas");
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings size={18} className="text-gray-600 dark:text-gray-400" />
        <h4 className="font-medium text-gray-900 dark:text-white">
          Preferencias de Notificación
        </h4>
      </div>

      <div className="space-y-3">
        {/* Solo alertas críticas */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Solo alertas críticas
          </span>
          <input
            type="checkbox"
            checked={preferences.criticalOnly}
            onChange={(e) =>
              handleUpdatePreference("criticalOnly", e.target.checked)
            }
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
        </label>

        {/* Sonido */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Sonido
          </span>
          <input
            type="checkbox"
            checked={preferences.sound}
            onChange={(e) => handleUpdatePreference("sound", e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
        </label>

        {/* Vibración */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Vibración
          </span>
          <input
            type="checkbox"
            checked={preferences.vibration}
            onChange={(e) =>
              handleUpdatePreference("vibration", e.target.checked)
            }
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
        </label>

        {/* Radio de notificación */}
        <div>
          <label className="text-sm text-gray-700 dark:text-gray-300 block mb-2">
            Radio de notificación: {preferences.radius} km
          </label>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={preferences.radius}
            onChange={(e) =>
              handleUpdatePreference("radius", Number(e.target.value))
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
