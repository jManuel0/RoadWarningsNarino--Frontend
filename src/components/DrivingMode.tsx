import { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, HelpCircle, X, Car, Zap } from "lucide-react";
import { voiceCommandService } from "@/services/voiceCommands";

interface DrivingModeProps {
  onCommand: (command: string, data?: unknown) => void;
  onClose: () => void;
}

export default function DrivingMode({
  onCommand,
  onClose,
}: Readonly<DrivingModeProps>) {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState<"listening" | "stopped" | "error">(
    "stopped"
  );
  const [, setLastCommand] = useState<string>("");
  const [showHelp, setShowHelp] = useState(false);
  const [transcript, setTranscript] = useState<string>("Esperando comando...");
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if voice commands are supported
    setIsSupported(voiceCommandService.isSupported());

    // Setup command callback
    voiceCommandService.onCommand((command, data) => {
      setLastCommand(command);
      onCommand(command, data);

      // Show transcript
      const commandText =
        voiceCommandService
          .getAvailableCommands()
          .find((c) => c.toLowerCase().includes(command.replace(/_/g, " "))) ||
        command;
      setTranscript(`✓ ${commandText}`);

      // Reset after 3 seconds
      setTimeout(() => setTranscript("Esperando comando..."), 3000);
    });

    // Setup status callback
    voiceCommandService.onStatusChanged((newStatus) => {
      setStatus(newStatus);
      setIsListening(newStatus === "listening");
    });

    return () => {
      voiceCommandService.stop();
    };
  }, [onCommand]);

  const toggleListening = () => {
    if (isListening) {
      voiceCommandService.stop();
    } else {
      const started = voiceCommandService.start();
      if (!started) {
        alert(
          "No se pudo iniciar el reconocimiento de voz. Verifica los permisos del micrófono."
        );
      }
    }
  };

  const commands = [
    { text: "Mostrar alertas cercanas", icon: "📍" },
    { text: "Navegar a casa", icon: "🏠" },
    { text: "Crear alerta", icon: "➕" },
    { text: "Activar mapa de calor", icon: "🗺️" },
    { text: "Mi ubicación actual", icon: "📌" },
    { text: "Acercar mapa", icon: "🔍" },
    { text: "Alejar mapa", icon: "🔎" },
    { text: "Mostrar estadísticas", icon: "📊" },
    { text: "Modo oscuro", icon: "🌙" },
    { text: "Detener navegación", icon: "⏹️" },
  ];

  if (!isSupported) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <MicOff size={64} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Comandos de Voz No Disponibles
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tu navegador no soporta reconocimiento de voz. Intenta usar
              Chrome, Edge o Safari.
            </p>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl max-w-2xl w-full p-8 border-2 border-blue-500/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Car size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Modo de Conducción
                <Zap size={20} className="text-yellow-400" />
              </h2>
              <p className="text-sm text-gray-400">Controla con tu voz</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X size={24} />
          </button>
        </div>

        {/* Voice Visualizer */}
        <div className="bg-black/40 rounded-xl p-8 mb-6 border border-gray-700">
          <div className="flex flex-col items-center justify-center">
            {/* Mic Button */}
            <button
              onClick={toggleListening}
              className={`relative mb-6 transition-all duration-300 ${
                isListening ? "scale-110 animate-pulse" : "scale-100"
              }`}
            >
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/50"
                    : status === "error"
                      ? "bg-gradient-to-br from-gray-600 to-gray-700"
                      : "bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/30"
                }`}
              >
                {isListening ? (
                  <Mic size={64} className="text-white" />
                ) : (
                  <MicOff size={64} className="text-white" />
                )}
              </div>

              {/* Listening Animation Rings */}
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                  <div className="absolute inset-0 rounded-full bg-red-500/10 animate-pulse" />
                </>
              )}
            </button>

            {/* Status */}
            <div className="text-center">
              <p
                className={`text-lg font-semibold mb-2 ${
                  isListening ? "text-red-400" : "text-gray-400"
                }`}
              >
                {isListening ? "🎤 Escuchando..." : "🔇 Toca para activar"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 min-h-[24px]">
                {transcript}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Commands */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Volume2 size={20} />
              Comandos Rápidos
            </h3>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 text-sm"
            >
              <HelpCircle size={16} />
              {showHelp ? "Ocultar" : "Ver todos"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {commands
              .slice(0, showHelp ? commands.length : 6)
              .map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => voiceCommandService.speak(cmd.text)}
                  className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg p-3 text-left transition-colors group"
                >
                  <span className="text-2xl mb-1 block">{cmd.icon}</span>
                  <span className="text-sm text-gray-300 group-hover:text-white">
                    "{cmd.text}"
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="text-blue-400 flex-shrink-0">
              <HelpCircle size={20} />
            </div>
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-1">💡 Consejos</p>
              <ul className="space-y-1 text-xs">
                <li>• Habla claramente y a velocidad normal</li>
                <li>• Usa los comandos exactos mostrados arriba</li>
                <li>• El micrófono seguirá activo hasta que lo detengas</li>
                <li>• Puedes decir "ayuda" para ver todos los comandos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={toggleListening}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              isListening
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isListening ? (
              <>
                <MicOff size={20} />
                Detener
              </>
            ) : (
              <>
                <Mic size={20} />
                Activar Voz
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
}
