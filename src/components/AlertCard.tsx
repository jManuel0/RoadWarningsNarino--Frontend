// src/components/AlertCard.tsx
import { Alert, AlertStatus, AlertSeverity } from "@/types/Alert";
import { XCircle, CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";
import VotingButtons from "./VotingButtons";
import ShareButtons from "./ShareButtons";
import { useState } from "react";

interface AlertCardProps {
  alert: Alert;
  onStatusChange: (id: number, status: AlertStatus) => void;
  onDelete: (id: number) => void;
}

const statusLabel: Record<AlertStatus, string> = {
  [AlertStatus.ACTIVE]: "Activa",
  [AlertStatus.IN_PROGRESS]: "En progreso",
  [AlertStatus.RESOLVED]: "Resuelta",
};

const severityColor: Record<AlertSeverity, string> = {
  [AlertSeverity.CRITICA]: "bg-red-100 text-red-800",
  [AlertSeverity.ALTA]: "bg-orange-100 text-orange-800",
  [AlertSeverity.MEDIA]: "bg-yellow-100 text-yellow-800",
  [AlertSeverity.BAJA]: "bg-green-100 text-green-800",
};

export default function AlertCard({
  alert,
  onStatusChange,
  onDelete,
}: Readonly<AlertCardProps>) {
  const [localUpvotes, setLocalUpvotes] = useState(alert.upvotes ?? 0);
  const [localDownvotes, setLocalDownvotes] = useState(alert.downvotes ?? 0);

  const handleVoteChange = (upvotes: number, downvotes: number) => {
    setLocalUpvotes(upvotes);
    setLocalDownvotes(downvotes);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {alert.title || "Alerta sin título"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {alert.location || "Sin dirección específica"}
          </p>
          {alert.municipality && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Municipio: {alert.municipality}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
              severityColor[alert.severity]
            }`}
          >
            {alert.severity}
          </span>
          <span className="px-2 py-1 rounded-full text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {alert.type}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
        {alert.description || "Sin descripción"}
      </p>

      {alert.imageUrl && (
        <img
          src={alert.imageUrl}
          alt={alert.title}
          className="w-full h-48 object-cover rounded-lg"
        />
      )}

      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <div>
          Lat: {alert.latitude?.toFixed(5)} | Lng:{" "}
          {alert.longitude?.toFixed(5)}
        </div>
        <div>{statusLabel[alert.status]}</div>
      </div>

      {/* Voting & Share Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t dark:border-gray-700">
        <VotingButtons
          alertId={alert.id}
          upvotes={localUpvotes}
          downvotes={localDownvotes}
          onVoteChange={handleVoteChange}
        />
        <ShareButtons alert={alert} />
      </div>

      <div className="flex gap-2">
        {alert.status !== AlertStatus.ACTIVE && (
          <button
            onClick={() =>
              onStatusChange(alert.id, AlertStatus.ACTIVE)
            }
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 border rounded text-xs hover:bg-gray-50"
          >
            <AlertTriangle size={14} />
            Activar
          </button>
        )}
        {alert.status !== AlertStatus.IN_PROGRESS && (
          <button
            onClick={() =>
              onStatusChange(alert.id, AlertStatus.IN_PROGRESS)
            }
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 border rounded text-xs hover:bg-gray-50"
          >
            <CheckCircle2 size={14} />
            En progreso
          </button>
        )}
        {alert.status !== AlertStatus.RESOLVED && (
          <button
            onClick={() =>
              onStatusChange(alert.id, AlertStatus.RESOLVED)
            }
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 border rounded text-xs hover:bg-gray-50"
          >
            <XCircle size={14} />
            Resuelta
          </button>
        )}
        <button
          onClick={() => onDelete(alert.id)}
          className="flex items-center justify-center px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
