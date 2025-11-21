import { alertApi } from "@/api/alertApi";
import { offlineAlertService } from "@/services/offlineAlertService";
import { useAlertStore } from "@/stores/alertStore";

let syncing = false;

export async function syncQueuedAlerts(): Promise<void> {
  if (!navigator.onLine || syncing) return;
  const queue = offlineAlertService.getQueuedActions();
  if (!queue.length) {
    await refreshCachedAlerts();
    return;
  }

  syncing = true;
  const store = useAlertStore.getState();

  try {
    for (const action of queue) {
      if (action.type === "create-alert") {
        try {
          const createdAlert = await alertApi.createAlert(action.payload);
          store.addAlert(createdAlert);
          offlineAlertService.removeQueuedAction(action.id);
        } catch (error) {
          console.warn("No se pudo sincronizar alerta pendiente:", error);
          // Leave the action queued for the next attempt.
        }
      }
    }

    await refreshCachedAlerts();
  } catch (error) {
    console.warn("Error sincronizando acciones pendientes:", error);
  } finally {
    syncing = false;
  }
}

export async function refreshCachedAlerts(): Promise<void> {
  if (!navigator.onLine) return;

  try {
    const alerts = await alertApi.getAlerts();
    useAlertStore.getState().setAlerts(alerts);
  } catch (error) {
    console.warn("No se pudieron refrescar alertas:", error);
  }
}
