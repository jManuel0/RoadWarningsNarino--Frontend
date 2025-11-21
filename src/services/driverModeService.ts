import { Alert, AlertSeverity, AlertStatus } from "@/types/Alert";
import { offlineAlertService } from "@/services/offlineAlertService";
import { useAlertStore } from "@/stores/alertStore";
import { pushNotificationService } from "@/services/pushNotificationService";

type ModeListener = (enabled: boolean) => void;

class DriverModeService {
  private enabled = false;
  private lastAnnounced = 0;
  private cooldown = 18_000;
  private listener: ((alert: Alert) => void) | null = null;
  private modeListeners = new Set<ModeListener>();

  isEnabled(): boolean {
    return this.enabled;
  }

  enable(): void {
    if (this.enabled) return;
    this.enabled = true;
    this.attachToSubject();
    this.modeListeners.forEach((listener) => listener(true));
    this.announceText(
      "Modo conductor activado. Te avisaré de alertas críticas por voz."
    );
    this.speakCachedAlerts();
  }

  disable(): void {
    if (!this.enabled) return;
    this.enabled = false;
    this.detachFromSubject();
    this.modeListeners.forEach((listener) => listener(false));
    this.announceText("Modo conductor desactivado.");
  }

  toggle(): void {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  onModeChange(listener: ModeListener): () => void {
    this.modeListeners.add(listener);
    return () => {
      this.modeListeners.delete(listener);
    };
  }

  private attachToSubject(): void {
    if (this.listener) return;
    const subject = useAlertStore.getState().alertSubject;
    this.listener = (alert) => this.handleAlert(alert);
    subject.attach(this.listener);
  }

  private detachFromSubject(): void {
    if (!this.listener) return;
    const subject = useAlertStore.getState().alertSubject;
    subject.detach(this.listener);
    this.listener = null;
  }

  private handleAlert(alert: Alert): void {
    if (!this.enabled) return;
    if (!this.shouldAnnounce(alert)) return;
    const now = Date.now();
    if (now - this.lastAnnounced < this.cooldown) return;

    const phrase = this.buildAlertPhrase(alert);
    this.announceText(phrase);
    this.lastAnnounced = now;
  }

  private shouldAnnounce(alert: Alert): boolean {
    if (alert.status !== AlertStatus.ACTIVE) return false;
    const prefs = pushNotificationService.getPreferences();
    if (prefs.criticalOnly && alert.severity !== AlertSeverity.CRITICA) {
      return false;
    }

    if (prefs.locations.length) {
      const matchesLocation = prefs.locations.some((location) =>
        alert.location.toLowerCase().includes(location.toLowerCase())
      );
      if (!matchesLocation) {
        return false;
      }
    }

    return (
      alert.severity === AlertSeverity.CRITICA ||
      alert.severity === AlertSeverity.ALTA
    );
  }

  private buildAlertPhrase(alert: Alert): string {
    const priority = alert.severity;
    const summary = (alert.description ?? "situación reportada").slice(0, 120);
    return `Alerta ${priority} en ${alert.location}. ${summary}. Mantente atento.`;
  }

  private speakCachedAlerts(): void {
    const cached = offlineAlertService
      .getCachedAlerts()
      .filter((alert) => this.shouldAnnounce(alert));

    if (!cached.length) return;

    const phrases = cached.slice(0, 2).map((alert) => {
      return `${alert.type} en ${alert.location} con severidad ${alert.severity}`;
    });

    this.announceText(
      `Actualmente hay ${cached.length} alertas importantes. ${phrases.join(
        ". "
      )}.`
    );
  }

  private announceText(text: string): void {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 0.85;
    utterance.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }
}

export const driverModeService = new DriverModeService();
