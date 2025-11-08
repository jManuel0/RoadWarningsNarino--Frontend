import { useEffect, useState } from 'react';
import { websocketService } from '@/services/websocketService';
import { Alert } from '@/types/Alert';

export function useWebSocket(onNewAlert?: (alert: Alert) => void) {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');

  useEffect(() => {
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
    isConnected: status === 'connected',
  };
}