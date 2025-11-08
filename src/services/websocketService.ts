import { Alert } from '@/types/Alert';

type WebSocketCallback = (alert: Alert) => void;
type StatusCallback = (status: 'connected' | 'disconnected' | 'error') => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private callbacks: WebSocketCallback[] = [];
  private statusCallbacks: StatusCallback[] = [];
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 3000;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.connect();
  }

  connect() {
    const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:4000/ws';
    
    try {
      this.socket = new WebSocket(WS_URL);
      
      this.socket.onopen = () => {
        console.log('✅ WebSocket conectado');
        this.reconnectAttempts = 0;
        this.notifyStatus('connected');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'alert' && data.payload) {
            const alert: Alert = {
              ...data.payload,
              timestamp: new Date(data.payload.timestamp)
            };
            this.notifyCallbacks(alert);
          }
        } catch (error) {
          console.error('Error al procesar mensaje WebSocket:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('❌ Error en WebSocket:', error);
        this.notifyStatus('error');
      };

      this.socket.onclose = () => {
        console.log('🔌 WebSocket desconectado');
        this.notifyStatus('disconnected');
        this.handleReconnect();
      };
    } catch (error) {
      console.error('Error al conectar WebSocket:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reintentando conexión (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Máximo de reintentos alcanzado');
    }
  }

  subscribe(callback: WebSocketCallback) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  onStatusChange(callback: StatusCallback) {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyCallbacks(alert: Alert) {
    this.callbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error en callback de WebSocket:', error);
      }
    });
  }

  private notifyStatus(status: 'connected' | 'disconnected' | 'error') {
    this.statusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error en callback de estado:', error);
      }
    });
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('⚠️ WebSocket no está conectado');
    }
  }

  getStatus(): 'connected' | 'disconnected' | 'connecting' {
    if (!this.socket) return 'disconnected';
    
    switch (this.socket.readyState) {
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CONNECTING:
        return 'connecting';
      default:
        return 'disconnected';
    }
  }
}

// Instancia singleton
export const websocketService = new WebSocketService();