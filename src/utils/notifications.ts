import { toast } from 'sonner';
import { Alert, AlertPriority } from '@/types/Alert';

export const notificationService = {
  // Notificación de nueva alerta
  newAlert: (alert: Alert) => {
    const priorityConfig = {
      [AlertPriority.CRITICA]: {
        duration: 10000,
        style: { background: '#dc2626', color: 'white' }
      },
      [AlertPriority.ALTA]: {
        duration: 7000,
        style: { background: '#ea580c', color: 'white' }
      },
      [AlertPriority.MEDIA]: {
        duration: 5000,
        style: { background: '#facc15', color: 'black' }
      },
      [AlertPriority.BAJA]: {
        duration: 3000,
        style: { background: '#3b82f6', color: 'white' }
      }
    };

    const config = priorityConfig[alert.priority];

    toast.error(`🚨 ${alert.type}`, {
      description: `${alert.description} - ${alert.location.address}`,
      duration: config.duration,
      style: config.style,
    });
  },

  // Notificación de éxito
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
    });
  },

  // Notificación de error
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
    });
  },

  // Notificación de información
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    });
  },

  // Solicitar permisos de notificaciones del navegador
  requestPermission: async () => {
    if ('Notification' in globalThis && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notificaciones activadas', {
          description: 'Recibirás alertas en tiempo real',
        });
      }
    }
  },

  // Notificación del navegador
  browserNotification: (alert: Alert) => {
    if ('Notification' in globalThis && Notification.permission === 'granted') {
      new Notification(`🚨 ${alert.type}`, {
        body: alert.description,
        icon: '/alert-icon.png',
        badge: '/badge-icon.png',
        tag: alert.id,
        requireInteraction: alert.priority === AlertPriority.CRITICA,
      });
    }
  }
};