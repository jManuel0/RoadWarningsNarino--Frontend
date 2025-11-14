// Voice Commands Service using Web Speech API
interface VoiceCommand {
  pattern: RegExp;
  action: (matches: RegExpMatchArray) => void;
  description: string;
}

type VoiceCommandCallback = (command: string, data?: any) => void;

class VoiceCommandService {
  private recognition: any = null;
  private isListening = false;
  private commands: VoiceCommand[] = [];
  private onCommandCallback: VoiceCommandCallback | null = null;
  private onStatusChange: ((status: 'listening' | 'stopped' | 'error') => void) | null = null;

  constructor() {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'es-ES'; // Spanish
      this.recognition.maxAlternatives = 1;

      this.setupEventHandlers();
      this.registerDefaultCommands();
    } else {
      console.warn('Speech Recognition not supported in this browser');
    }
  }

  private setupEventHandlers() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
      this.isListening = true;
      this.onStatusChange?.('listening');
    };

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log('🗣️ Voice input:', transcript);
      this.processCommand(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.error('❌ Voice recognition error:', event.error);
      this.onStatusChange?.('error');
    };

    this.recognition.onend = () => {
      console.log('🔇 Voice recognition ended');
      this.isListening = false;
      this.onStatusChange?.('stopped');

      // Auto-restart if it was listening
      if (this.isListening) {
        setTimeout(() => this.start(), 500);
      }
    };
  }

  private registerDefaultCommands() {
    // Mostrar alertas cercanas
    this.addCommand(
      /(?:mostrar|ver|buscar)\s+alertas?\s+(?:cercanas?|cerca|próximas?)/i,
      () => this.onCommandCallback?.('show_nearby_alerts'),
      'Mostrar alertas cercanas'
    );

    // Navegar a casa
    this.addCommand(
      /(?:navegar|ir|llevar(?:me)?)\s+a\s+casa/i,
      () => this.onCommandCallback?.('navigate_home'),
      'Navegar a casa'
    );

    // Crear nueva alerta
    this.addCommand(
      /(?:crear|reportar|nueva)\s+alerta/i,
      () => this.onCommandCallback?.('create_alert'),
      'Crear nueva alerta'
    );

    // Activar/desactivar mapa de calor
    this.addCommand(
      /(?:activar|mostrar|encender)\s+(?:mapa\s+de\s+)?calor/i,
      () => this.onCommandCallback?.('toggle_heatmap', { enabled: true }),
      'Activar mapa de calor'
    );

    this.addCommand(
      /(?:desactivar|ocultar|apagar)\s+(?:mapa\s+de\s+)?calor/i,
      () => this.onCommandCallback?.('toggle_heatmap', { enabled: false }),
      'Desactivar mapa de calor'
    );

    // Zoom in/out
    this.addCommand(
      /(?:acercar|zoom\s+in|más\s+cerca)/i,
      () => this.onCommandCallback?.('zoom_in'),
      'Acercar mapa'
    );

    this.addCommand(
      /(?:alejar|zoom\s+out|más\s+lejos)/i,
      () => this.onCommandCallback?.('zoom_out'),
      'Alejar mapa'
    );

    // Filtrar por severidad
    this.addCommand(
      /(?:mostrar|ver|filtrar)\s+(?:solo\s+)?alertas?\s+(?:críticas?|grave)/i,
      () => this.onCommandCallback?.('filter_severity', { severity: 'CRITICA' }),
      'Filtrar alertas críticas'
    );

    // Mi ubicación
    this.addCommand(
      /(?:mi\s+)?ubicación\s+actual/i,
      () => this.onCommandCallback?.('show_my_location'),
      'Mostrar mi ubicación'
    );

    // Buscar dirección
    this.addCommand(
      /(?:buscar|encontrar)\s+(.+)/i,
      (matches) => this.onCommandCallback?.('search', { query: matches[1] }),
      'Buscar dirección'
    );

    // Estadísticas
    this.addCommand(
      /(?:mostrar|ver)\s+estadísticas/i,
      () => this.onCommandCallback?.('show_statistics'),
      'Ver estadísticas'
    );

    // Modo oscuro
    this.addCommand(
      /(?:activar|encender)\s+modo\s+oscuro/i,
      () => this.onCommandCallback?.('toggle_dark_mode', { enabled: true }),
      'Activar modo oscuro'
    );

    this.addCommand(
      /(?:desactivar|apagar)\s+modo\s+oscuro/i,
      () => this.onCommandCallback?.('toggle_dark_mode', { enabled: false }),
      'Desactivar modo oscuro'
    );

    // Ayuda
    this.addCommand(
      /(?:ayuda|comandos?\s+disponibles|qué\s+puedo\s+decir)/i,
      () => this.onCommandCallback?.('show_help'),
      'Mostrar ayuda'
    );

    // Detener navegación
    this.addCommand(
      /(?:detener|parar|cancelar)\s+navegación/i,
      () => this.onCommandCallback?.('stop_navigation'),
      'Detener navegación'
    );
  }

  private processCommand(transcript: string) {
    for (const command of this.commands) {
      const matches = transcript.match(command.pattern);
      if (matches) {
        console.log('✅ Command matched:', command.description);
        command.action(matches);

        // Speak confirmation
        this.speak(`Comando reconocido: ${command.description}`);
        return;
      }
    }

    console.log('❌ No command matched');
    this.speak('Lo siento, no entendí ese comando');
  }

  addCommand(pattern: RegExp, action: (matches: RegExpMatchArray) => void, description: string) {
    this.commands.push({ pattern, action, description });
  }

  start(): boolean {
    if (!this.recognition) {
      console.error('Speech Recognition not available');
      return false;
    }

    if (this.isListening) {
      console.log('Already listening');
      return true;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting recognition:', error);
      return false;
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  onCommand(callback: VoiceCommandCallback) {
    this.onCommandCallback = callback;
  }

  onStatusChanged(callback: (status: 'listening' | 'stopped' | 'error') => void) {
    this.onStatusChange = callback;
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  getAvailableCommands(): string[] {
    return this.commands.map(c => c.description);
  }
}

// Singleton instance
export const voiceCommandService = new VoiceCommandService();
