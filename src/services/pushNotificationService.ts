/**
 * Servicio de Notificaciones Push con Firebase Cloud Messaging (FCM)
 * Maneja suscripciones, permisos y envío de notificaciones
 */

import { getToken, onMessage, deleteToken } from "firebase/messaging";
import { getFirebaseMessaging, isFirebaseConfigured } from "@/config/firebase";
import { alertApi } from "@/api/alertApi";

// VAPID Key pública de Firebase (generar en Firebase Console -> Project Settings -> Cloud Messaging)
const VAPID_PUBLIC_KEY =
  import.meta.env.VITE_FIREBASE_VAPID_KEY || "TU_VAPID_KEY_AQUI";

export interface NotificationPreferences {
  enabled: boolean;
  alertTypes: string[]; // Tipos de alerta para recibir notificaciones
  locations: string[]; // Ubicaciones de interés
  radius: number; // Radio en km
  criticalOnly: boolean; // Solo alertas críticas
  sound: boolean;
  vibration: boolean;
}

class PushNotificationService {
  private fcmToken: string | null = null;
  private preferences: NotificationPreferences;
  private isSupported = false;

  constructor() {
    this.preferences = this.loadPreferences();
    this.checkSupport();
  }

  /**
   * Verificar si las notificaciones push son soportadas
   */
  private checkSupport(): void {
    this.isSupported =
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window;

    if (!this.isSupported) {
      console.warn("⚠️ Push notifications no son soportadas en este navegador");
    }
  }

  /**
   * Verificar si el servicio está listo
   */
  public isReady(): boolean {
    return this.isSupported && isFirebaseConfigured();
  }

  /**
   * Solicitar permiso de notificaciones al usuario
   */
  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.error("Push notifications no soportadas");
      return false;
    }

    if (!isFirebaseConfigured()) {
      console.error("Firebase no está configurado");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        console.log("✅ Permiso de notificaciones concedido");
        await this.subscribeToPushNotifications();
        return true;
      } else {
        console.log("❌ Permiso de notificaciones denegado");
        return false;
      }
    } catch (error) {
      console.error("Error solicitando permiso:", error);
      return false;
    }
  }

  /**
   * Suscribirse a notificaciones push
   */
  public async subscribeToPushNotifications(): Promise<string | null> {
    const messaging = getFirebaseMessaging();
    if (!messaging) {
      console.error("Firebase Messaging no disponible");
      return null;
    }

    try {
      // Obtener token de FCM
      const token = await getToken(messaging, {
        vapidKey: VAPID_PUBLIC_KEY,
      });

      if (token) {
        this.fcmToken = token;
        console.log("✅ FCM Token obtenido:", token);

        // Guardar token en localStorage
        localStorage.setItem("fcmToken", token);

        // Enviar token al backend para guardar
        await this.sendTokenToBackend(token);

        // Configurar listener para mensajes en foreground
        this.setupForegroundMessageListener();

        return token;
      } else {
        console.error("No se pudo obtener el token de FCM");
        return null;
      }
    } catch (error) {
      console.error("Error obteniendo token de FCM:", error);
      return null;
    }
  }

  /**
   * Enviar token al backend para guardarlo
   */
  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      // NOTA: Implementar endpoint en el backend
      // POST /api/notifications/subscribe
      // Body: { token, userId, preferences }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/notifications/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            token,
            preferences: this.preferences,
            platform: "web",
            timestamp: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        console.log("✅ Token enviado al backend correctamente");
      } else {
        console.error("❌ Error enviando token al backend:", response.status);
      }
    } catch (error) {
      console.error("Error enviando token al backend:", error);
    }
  }

  /**
   * Configurar listener para mensajes en foreground (app abierta)
   */
  private setupForegroundMessageListener(): void {
    const messaging = getFirebaseMessaging();
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      console.log("📨 Mensaje recibido en foreground:", payload);

      const { notification, data } = payload;

      if (notification) {
        // Mostrar notificación personalizada
        this.showNotification(notification.title || "Nueva Alerta", {
          body: notification.body || "",
          icon: notification.icon || "/icons/icon-192x192.png",
          data: data,
        });
      }

      // Actualizar lista de alertas si es necesario
      if (data?.alertId) {
        this.handleAlertNotification(data);
      }
    });
  }

  /**
   * Mostrar notificación nativa del navegador
   */
  private async showNotification(
    title: string,
    options: NotificationOptions
  ): Promise<void> {
    if (!this.preferences.enabled) return;

    try {
      const registration = await navigator.serviceWorker.ready;

      const notificationOptions: NotificationOptions & { vibrate?: number[] } =
        {
          ...options,
          badge: "/icons/icon-72x72.png",
          vibrate: this.preferences.vibration ? [200, 100, 200] : undefined,
          requireInteraction: true, // Mantener visible hasta que el usuario interactúe
          actions: [
            {
              action: "view",
              title: "Ver Alerta",
              icon: "/icons/icon-72x72.png",
            },
            { action: "close", title: "Cerrar" },
          ],
        };

      await registration.showNotification(title, notificationOptions);

      // Reproducir sonido si está habilitado
      if (this.preferences.sound) {
        this.playNotificationSound();
      }
    } catch (error) {
      console.error("Error mostrando notificación:", error);
    }
  }

  /**
   * Manejar notificación de nueva alerta
   */
  private async handleAlertNotification(data: {
    alertId: number;
  }): Promise<void> {
    try {
      // Obtener detalles de la alerta desde el backend
      const alertId = data.alertId;
      const alert = await alertApi.getAlertById(alertId);

      if (alert) {
        // Actualizar store de alertas (si estás usando Zustand)
        // alertStore.addAlert(alert);
        console.log("Nueva alerta recibida:", alert);
      }
    } catch (error) {
      console.error("Error manejando notificación de alerta:", error);
    }
  }

  /**
   * Reproducir sonido de notificación
   */
  private playNotificationSound(): void {
    try {
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 0.5;
      audio.play().catch((err) => {
        console.warn("No se pudo reproducir el sonido:", err);
      });
    } catch (error) {
      console.error("Error reproduciendo sonido:", error);
    }
  }

  /**
   * Desuscribirse de notificaciones push
   */
  public async unsubscribe(): Promise<boolean> {
    const messaging = getFirebaseMessaging();
    if (!messaging) return false;

    try {
      await deleteToken(messaging);
      this.fcmToken = null;
      localStorage.removeItem("fcmToken");

      // Notificar al backend
      await this.removeTokenFromBackend();

      console.log("✅ Desuscrito de notificaciones push");
      return true;
    } catch (error) {
      console.error("Error al desuscribirse:", error);
      return false;
    }
  }

  /**
   * Eliminar token del backend
   */
  private async removeTokenFromBackend(): Promise<void> {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/notifications/unsubscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (error) {
      console.error("Error eliminando token del backend:", error);
    }
  }

  /**
   * Actualizar preferencias de notificaciones
   */
  public async updatePreferences(
    newPreferences: Partial<NotificationPreferences>
  ): Promise<void> {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.savePreferences();

    // Enviar preferencias al backend
    if (this.fcmToken) {
      await this.sendTokenToBackend(this.fcmToken);
    }
  }

  /**
   * Obtener preferencias actuales
   */
  public getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Cargar preferencias desde localStorage
   */
  private loadPreferences(): NotificationPreferences {
    const stored = localStorage.getItem("notificationPreferences");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return this.getDefaultPreferences();
      }
    }
    return this.getDefaultPreferences();
  }

  /**
   * Guardar preferencias en localStorage
   */
  private savePreferences(): void {
    localStorage.setItem(
      "notificationPreferences",
      JSON.stringify(this.preferences)
    );
  }

  /**
   * Preferencias por defecto
   */
  private getDefaultPreferences(): NotificationPreferences {
    return {
      enabled: true,
      alertTypes: [
        "DERRUMBE",
        "ACCIDENTE",
        "INUNDACION",
        "CIERRE_VIAL",
        "MANTENIMIENTO",
      ],
      locations: ["Pasto", "Nariño"],
      radius: 50, // 50 km
      criticalOnly: false,
      sound: true,
      vibration: true,
    };
  }

  /**
   * Verificar estado del permiso de notificaciones
   */
  public getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  /**
   * Obtener token FCM actual
   */
  public getToken(): string | null {
    return this.fcmToken || localStorage.getItem("fcmToken");
  }

  /**
   * Enviar notificación de prueba
   */
  public async sendTestNotification(): Promise<void> {
    await this.showNotification("Notificación de Prueba", {
      body: "Las notificaciones están funcionando correctamente ✅",
      icon: "/icons/icon-192x192.png",
      tag: "test-notification",
    });
  }
}

// Singleton instance
export const pushNotificationService = new PushNotificationService();
