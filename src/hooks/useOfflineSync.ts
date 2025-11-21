import { useEffect } from "react";
import { syncQueuedAlerts } from "@/services/offlineSyncService";
import { offlineAlertService } from "@/services/offlineAlertService";
import { useAlertStore } from "@/stores/alertStore";

export function useOfflineSync() {
  useEffect(() => {
    try {
      const cachedAlerts = offlineAlertService.getCachedAlerts();
      if (cachedAlerts.length) {
        useAlertStore.getState().setAlerts(cachedAlerts);
      }

      const handleOnline = () => {
        try {
          syncQueuedAlerts();
        } catch (error) {
          console.error("Failed to sync queued alerts:", error);
        }
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("focus", handleOnline);

      syncQueuedAlerts();

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("focus", handleOnline);
      };
    } catch (error) {
      console.error("Failed to initialize offline sync:", error);
    }
  }, []);
}
