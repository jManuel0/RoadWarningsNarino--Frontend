// Geofencing Service - Alerts user when entering dangerous zones
import { Alert, AlertSeverity } from '@/types/Alert';
import { notificationService } from '@/utils/notifications';

interface GeofenceZone {
  id: number;
  alert: Alert;
  lat: number;
  lng: number;
  radius: number; // in meters
  entered: boolean;
}

type GeofenceCallback = (alert: Alert, action: 'enter' | 'exit') => void;

class GeofencingService {
  private zones: GeofenceZone[] = [];
  private watchId: number | null = null;
  private isMonitoring = false;
  private currentPosition: { lat: number; lng: number } | null = null;
  private callbacks: GeofenceCallback[] = [];
  private enteredZones: Set<number> = new Set();

  // Default radius based on severity (in meters)
  private readonly radiusBySeverity = {
    [AlertSeverity.CRITICA]: 1000,  // 1 km
    [AlertSeverity.ALTA]: 750,      // 750 m
    [AlertSeverity.MEDIA]: 500,     // 500 m
    [AlertSeverity.BAJA]: 250,      // 250 m
  };

  startMonitoring(alerts: Alert[]): boolean {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return false;
    }

    if (this.isMonitoring) {
      console.log('Already monitoring');
      return true;
    }

    // Convert alerts to geofence zones
    this.zones = alerts.map(alert => ({
      id: alert.id,
      alert,
      lat: alert.latitude,
      lng: alert.longitude,
      radius: this.radiusBySeverity[alert.severity] || 500,
      entered: false,
    }));

    console.log(`📍 Starting geofencing with ${this.zones.length} zones`);

    // Start watching position
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.onPositionUpdate(position),
      (error) => this.onPositionError(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    this.isMonitoring = true;
    return true;
  }

  stopMonitoring() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.isMonitoring = false;
    this.enteredZones.clear();
    console.log('🛑 Geofencing stopped');
  }

  private onPositionUpdate(position: GeolocationPosition) {
    const { latitude, longitude } = position.coords;
    this.currentPosition = { lat: latitude, lng: longitude };

    console.log(`📍 Position update: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);

    // Check each zone
    this.zones.forEach((zone) => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        zone.lat,
        zone.lng
      );

      const wasInside = this.enteredZones.has(zone.id);
      const isInside = distance <= zone.radius;

      // Enter event
      if (isInside && !wasInside) {
        this.onEnterZone(zone);
        this.enteredZones.add(zone.id);
      }

      // Exit event
      if (!isInside && wasInside) {
        this.onExitZone(zone);
        this.enteredZones.delete(zone.id);
      }
    });
  }

  private onPositionError(error: GeolocationPositionError) {
    console.error('Geolocation error:', error);
    notificationService.error(
      'Error de ubicación',
      'No se pudo obtener tu ubicación para el geofencing'
    );
  }

  private onEnterZone(zone: GeofenceZone) {
    console.log(`🚨 ENTERED zone: ${zone.alert.title} (${zone.radius}m)`);

    // Trigger callbacks
    this.callbacks.forEach(callback => callback(zone.alert, 'enter'));

    // Show notification based on severity
    const messages = {
      [AlertSeverity.CRITICA]: {
        title: '⚠️ ZONA CRÍTICA',
        body: `Estás cerca de: ${zone.alert.title}. ¡EXTREMA PRECAUCIÓN!`,
        requireInteraction: true,
      },
      [AlertSeverity.ALTA]: {
        title: '⚠️ Alerta Importante',
        body: `Zona de riesgo: ${zone.alert.title}. Conduce con precaución.`,
        requireInteraction: false,
      },
      [AlertSeverity.MEDIA]: {
        title: '⚠️ Aviso',
        body: `${zone.alert.title} cerca de tu ubicación.`,
        requireInteraction: false,
      },
      [AlertSeverity.BAJA]: {
        title: 'ℹ️ Información',
        body: `${zone.alert.title} en la zona.`,
        requireInteraction: false,
      },
    };

    const config = messages[zone.alert.severity];

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(config.title, {
        body: config.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: `geofence-${zone.id}`,
        requireInteraction: config.requireInteraction,
        vibrate: zone.alert.severity === AlertSeverity.CRITICA ? [200, 100, 200] : [200],
      });
    }

    // Toast notification
    notificationService.newAlert(zone.alert);

    // Voice alert for critical
    if (zone.alert.severity === AlertSeverity.CRITICA) {
      this.speakAlert(`Alerta crítica: ${zone.alert.type}. ${zone.alert.description}`);
    }
  }

  private onExitZone(zone: GeofenceZone) {
    console.log(`✅ EXITED zone: ${zone.alert.title}`);

    // Trigger callbacks
    this.callbacks.forEach(callback => callback(zone.alert, 'exit'));

    // Subtle notification
    notificationService.info(
      'Zona segura',
      `Has salido de la zona de ${zone.alert.title}`
    );
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  private speakAlert(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }

  updateAlerts(alerts: Alert[]) {
    if (!this.isMonitoring) return;

    console.log(`🔄 Updating geofence zones: ${alerts.length} alerts`);

    // Update zones
    this.zones = alerts.map(alert => ({
      id: alert.id,
      alert,
      lat: alert.latitude,
      lng: alert.longitude,
      radius: this.radiusBySeverity[alert.severity] || 500,
      entered: this.enteredZones.has(alert.id),
    }));

    // Recheck position if available
    if (this.currentPosition) {
      const fakePosition: GeolocationPosition = {
        coords: {
          latitude: this.currentPosition.lat,
          longitude: this.currentPosition.lng,
          accuracy: 0,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };
      this.onPositionUpdate(fakePosition);
    }
  }

  onGeofenceEvent(callback: GeofenceCallback) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  getMonitoringStatus(): boolean {
    return this.isMonitoring;
  }

  getCurrentPosition(): { lat: number; lng: number } | null {
    return this.currentPosition;
  }

  getActiveZones(): GeofenceZone[] {
    return this.zones;
  }

  getEnteredZones(): Alert[] {
    return this.zones
      .filter(zone => this.enteredZones.has(zone.id))
      .map(zone => zone.alert);
  }

  getNearbyAlerts(radiusMeters: number = 2000): Array<Alert & { distance: number }> {
    if (!this.currentPosition) return [];

    return this.zones
      .map(zone => {
        const distance = this.calculateDistance(
          this.currentPosition!.lat,
          this.currentPosition!.lng,
          zone.lat,
          zone.lng
        );

        return {
          ...zone.alert,
          distance,
        };
      })
      .filter(alert => alert.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance);
  }
}

// Singleton instance
export const geofencingService = new GeofencingService();
