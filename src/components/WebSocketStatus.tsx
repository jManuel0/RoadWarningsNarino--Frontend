import { Wifi, WifiOff } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function WebSocketStatus() {
  const { status } = useWebSocket();

  const statusConfig = {
    connected: {
      icon: Wifi,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900',
      text: 'Conectado',
    },
    disconnected: {
      icon: WifiOff,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900',
      text: 'Desconectado',
    },
    error: {
      icon: WifiOff,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900',
      text: 'Error',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div 
      className={`flex items-center gap-2 px-3 py-2 rounded-full ${config.bg} ${config.color} text-sm font-medium`}
      title={`Estado: ${config.text}`}
    >
      <Icon size={16} />
      <span className="hidden sm:inline">{config.text}</span>
    </div>
  );
}