import { ReactNode } from "react";
import {
  AlertTriangle,
  MapPin,
  Bell,
  Search,
  Inbox,
  FileText,
  Users,
  Star,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "search" | "error";
  children?: ReactNode;
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  variant = "default",
  children,
}: Readonly<EmptyStateProps>) {
  const variantStyles = {
    default: {
      iconBg: "bg-gray-100 dark:bg-gray-800",
      iconColor: "text-gray-400 dark:text-gray-600",
      titleColor: "text-gray-900 dark:text-white",
      descColor: "text-gray-500 dark:text-gray-400",
    },
    search: {
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-500 dark:text-blue-400",
      titleColor: "text-gray-900 dark:text-white",
      descColor: "text-gray-500 dark:text-gray-400",
    },
    error: {
      iconBg: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-500 dark:text-red-400",
      titleColor: "text-gray-900 dark:text-white",
      descColor: "text-gray-500 dark:text-gray-400",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div
        className={`${styles.iconBg} p-6 rounded-full mb-6 transition-colors`}
      >
        <Icon className={`${styles.iconColor} w-12 h-12`} />
      </div>

      <h3 className={`text-xl font-semibold ${styles.titleColor} mb-2`}>
        {title}
      </h3>

      <p className={`${styles.descColor} max-w-md mb-6`}>{description}</p>

      {children}

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          {action && (
            <button
              onClick={action.onClick}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {action.label}
            </button>
          )}

          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Componentes pre-configurados para casos comunes

export function NoAlertsEmptyState({
  onCreateAlert,
}: Readonly<{
  onCreateAlert?: () => void;
}>) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="No hay alertas activas"
      description="¡Excelente! No hay alertas viales en tu área en este momento. Puedes crear una nueva alerta si observas algún problema."
      action={
        onCreateAlert
          ? { label: "Crear Alerta", onClick: onCreateAlert }
          : undefined
      }
    />
  );
}

export function NoSearchResultsEmptyState({
  searchTerm,
  onClearSearch,
}: Readonly<{
  searchTerm?: string;
  onClearSearch?: () => void;
}>) {
  return (
    <EmptyState
      icon={Search}
      variant="search"
      title="No se encontraron resultados"
      description={
        searchTerm
          ? `No encontramos alertas que coincidan con "${searchTerm}". Intenta con otros términos de búsqueda.`
          : "No se encontraron alertas con los filtros aplicados."
      }
      action={
        onClearSearch
          ? { label: "Limpiar Búsqueda", onClick: onClearSearch }
          : undefined
      }
    />
  );
}

export function NoNotificationsEmptyState() {
  return (
    <EmptyState
      icon={Bell}
      title="No tienes notificaciones"
      description="Cuando haya nuevas alertas en tu área o actualizaciones importantes, te notificaremos aquí."
    />
  );
}

export function NoFavoritesEmptyState({
  onBrowseAlerts,
}: Readonly<{
  onBrowseAlerts?: () => void;
}>) {
  return (
    <EmptyState
      icon={Star}
      title="No tienes favoritos"
      description="Guarda alertas importantes como favoritas para acceder rápidamente a ellas más tarde."
      action={
        onBrowseAlerts
          ? { label: "Explorar Alertas", onClick: onBrowseAlerts }
          : undefined
      }
    />
  );
}

export function NoStatisticsEmptyState() {
  return (
    <EmptyState
      icon={TrendingUp}
      title="Sin datos estadísticos"
      description="Aún no hay suficientes datos para generar estadísticas. Sigue usando la aplicación y los datos aparecerán aquí."
    />
  );
}

export function NoCommentsEmptyState({
  onAddComment,
}: Readonly<{
  onAddComment?: () => void;
}>) {
  return (
    <EmptyState
      icon={FileText}
      title="No hay comentarios"
      description="Sé el primero en comentar sobre esta alerta. Comparte tu experiencia o información adicional."
      action={
        onAddComment
          ? { label: "Agregar Comentario", onClick: onAddComment }
          : undefined
      }
    />
  );
}

export function ErrorEmptyState({
  title = "Algo salió mal",
  description = "No pudimos cargar la información. Por favor, intenta nuevamente.",
  onRetry,
}: Readonly<{
  title?: string;
  description?: string;
  onRetry?: () => void;
}>) {
  return (
    <EmptyState
      icon={AlertTriangle}
      variant="error"
      title={title}
      description={description}
      action={onRetry ? { label: "Reintentar", onClick: onRetry } : undefined}
    />
  );
}

export function OfflineEmptyState() {
  return (
    <EmptyState
      icon={MapPin}
      variant="error"
      title="Sin conexión"
      description="Parece que estás sin conexión a internet. Algunas funciones pueden no estar disponibles hasta que te conectes."
    />
  );
}

export function NoUsersEmptyState({
  onInviteUsers,
}: Readonly<{
  onInviteUsers?: () => void;
}>) {
  return (
    <EmptyState
      icon={Users}
      title="No hay usuarios"
      description="Esta sección está vacía por el momento. Invita a otros usuarios a unirse a la plataforma."
      action={
        onInviteUsers
          ? { label: "Invitar Usuarios", onClick: onInviteUsers }
          : undefined
      }
    />
  );
}
