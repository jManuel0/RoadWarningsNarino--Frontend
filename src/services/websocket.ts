// WebSocket service for real-time notifications
import { Alert } from '@/types/Alert';

type WebSocketEventType =
  | 'ALERT_CREATED'
  | 'ALERT_UPDATED'
  | 'ALERT_DELETED'
  | 'ALERT_COMMENTED'
  | 'ALERT_VOTED';

interface WebSocketMessage {
  type: WebSocketEventType;
  data: any;
}

type EventListener = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private readonly listeners: Map<WebSocketEventType, Set<EventListener>> = new Map();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 3000;
  private heartbeatInterval: number | null = null;
  private isConnecting = false;
  private readonly url: string;

  constructor() {
    // Use wss:// in production, ws:// in development
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host =  import.meta.env.VITE_API_URL?.replace(/^https?:\/\//, '') ||
                 'localhost:8080';
    this.url = `${protocol}//${host}/ws`;
  }

  connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return Promise.resolve();
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        console.log(`🔌 Connecting to WebSocket: ${this.url}`);
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnecting = false;
          reject(new Error('Network timeout'));
        };

        this.ws.onclose = () => {
          console.log('🔌 WebSocket closed');
          this.isConnecting = false;
          this.stopHeartbeat();
          this.attemptReconnect();
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'PING' }));
      }
    }, 30000); // Every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  private handleMessage(message: WebSocketMessage): void {
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach(listener => listener(message.data));
    }

    // Also trigger 'ALL' listeners for all events
    const allListeners = this.listeners.get('ALERT_CREATED' as any);
    if (allListeners && message.type !== 'ALERT_CREATED') {
      // This is a hack, we need a proper 'ALL' event type
    }
  }

  on(event: WebSocketEventType, listener: EventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off(event: WebSocketEventType, listener: EventListener): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  // Convenience methods for specific events
  onAlertCreated(callback: (alert: Alert) => void): () => void {
    this.on('ALERT_CREATED', callback);
    return () => this.off('ALERT_CREATED', callback);
  }

  onAlertUpdated(callback: (alert: Alert) => void): () => void {
    this.on('ALERT_UPDATED', callback);
    return () => this.off('ALERT_UPDATED', callback);
  }

  onAlertDeleted(callback: (alertId: number) => void): () => void {
    this.on('ALERT_DELETED', callback);
    return () => this.off('ALERT_DELETED', callback);
  }

  onAlertCommented(callback: (data: { alertId: number; comment: any }) => void): () => void {
    this.on('ALERT_COMMENTED', callback);
    return () => this.off('ALERT_COMMENTED', callback);
  }

  onAlertVoted(callback: (data: { alertId: number; upvotes: number; downvotes: number }) => void): () => void {
    this.on('ALERT_VOTED', callback);
    return () => this.off('ALERT_VOTED', callback);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const websocketService = new WebSocketService();

// Auto-connect on first import (can be disabled if needed)
if (typeof window !== 'undefined') {
  websocketService.connect().catch(console.error);
}
