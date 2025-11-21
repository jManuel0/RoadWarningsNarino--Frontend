import { useEffect, useState, useCallback } from "react";
import { websocketService } from "@/services/websocketService";
import { Alert } from "@/types/Alert";
import { notificationService } from "@/utils/notifications";

export function useWebSocket(onNewAlert?: (alert: Alert) => void) {
  const [status, setStatus] = useState<"connected" | "disconnected" | "error">(
    "disconnected"
  );

  useEffect(() => {
    // Actualizar el estado inicial según la conexión actual
    const initialStatus =
      websocketService.getStatus() === "connected"
        ? "connected"
        : "disconnected";
    setStatus(initialStatus);

    // Suscribirse a cambios de estado
    const unsubscribeStatus = websocketService.onStatusChange(setStatus);

    // Suscribirse a nuevas alertas
    let unsubscribeAlerts: (() => void) | undefined;

    if (onNewAlert) {
      unsubscribeAlerts = websocketService.subscribe(onNewAlert);
    }

    // Cleanup
    return () => {
      unsubscribeStatus();
      if (unsubscribeAlerts) {
        unsubscribeAlerts();
      }
    };
  }, [onNewAlert]);

  return {
    status,
    isConnected: status === "connected",
  };
}

// Hook for real-time alert updates with notifications
export function useRealtimeAlerts(callbacks?: {
  onCreated?: (alert: Alert) => void;
  onUpdated?: (alert: Alert) => void;
  onDeleted?: (alertId: number) => void;
}) {
  const [latestUpdate, setLatestUpdate] = useState<{
    type: "created" | "updated" | "deleted";
    data: Alert | number;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    const handleNewAlert = (alert: Alert) => {
      console.log("🆕 Real-time: New alert", alert);
      setLatestUpdate({ type: "created", data: alert, timestamp: Date.now() });
      callbacks?.onCreated?.(alert);

      // Show browser notification
      notificationService.browserNotification(alert);
    };

    // Subscribe to websocket events
    const unsubNew = websocketService.subscribe(handleNewAlert);
    // Note: websocketService needs to support these additional events

    return () => {
      unsubNew();
    };
  }, [callbacks]);

  return { latestUpdate };
}

// Hook for real-time comments
export function useRealtimeComments(
  alertId: number,
  onNewComment?: (comment: unknown) => void
) {
  const [commentCount, setCommentCount] = useState(0);

  const handleNewComment = useCallback(
    (data: { alertId: number; comment: unknown }) => {
      if (data.alertId === alertId) {
        console.log("💬 Real-time: New comment", data);
        setCommentCount((prev) => prev + 1);
        onNewComment?.(data.comment);
      }
    },
    [alertId, onNewComment]
  );

  useEffect(() => {
    // Subscribe to comment events (would need to be implemented in websocketService)
    // For now, this is a placeholder
    return () => {
      // Cleanup
    };
  }, [handleNewComment]);

  return { commentCount };
}

// Hook for real-time vote updates
export function useRealtimeVotes(
  alertId: number,
  onVoteChange?: (votes: { upvotes: number; downvotes: number }) => void
) {
  const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0 });

  const handleVoteUpdate = useCallback(
    (data: { alertId: number; upvotes: number; downvotes: number }) => {
      if (data.alertId === alertId) {
        console.log("👍 Real-time: Vote updated", data);
        setVotes({ upvotes: data.upvotes, downvotes: data.downvotes });
        onVoteChange?.(data);
      }
    },
    [alertId, onVoteChange]
  );

  useEffect(() => {
    // Subscribe to vote events (would need to be implemented in websocketService)
    // For now, this is a placeholder
    return () => {
      // Cleanup
    };
  }, [handleVoteUpdate]);

  return { votes };
}
