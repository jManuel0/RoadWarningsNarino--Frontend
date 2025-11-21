import { Wifi, WifiOff } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function WebSocketStatus() {
  const { status } = useWebSocket();

  // No mostrar nada si está desconectado (WebSocket es opcional)
  if (status === "disconnected") {
    return null;
  }

  const statusConfig = {
    connected: {
      icon: Wifi,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900",
      text: "Tiempo Real",
    },
    error: {
      icon: WifiOff,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900",
      text: "Modo Básico",
    },
  };

  const config = statusConfig[status === "connected" ? "connected" : "error"];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-full ${config.bg} ${config.color} text-sm font-medium`}
      title={
        status === "connected"
          ? "Actualizaciones en tiempo real activas"
          : "Actualizaciones manuales (recarga la página)"
      }
    >
      <Icon size={16} />
      <span className="hidden sm:inline">{config.text}</span>
    </div>
  );
}
