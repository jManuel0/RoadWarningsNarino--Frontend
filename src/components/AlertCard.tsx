// src/components/AlertCard.tsx
import { Alert, AlertStatus, AlertSeverity } from "@/types/Alert";
import {
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  MessageCircle,
} from "lucide-react";
import VotingButtons from "./VotingButtons";
import ShareButtons from "./ShareButtons";
import CommentSection from "./CommentSection";
import { commentApi } from "@/api/commentApi";
import { Comment } from "@/types/Comment";
import { useState, useEffect } from "react";

interface AlertCardProps {
  alert: Alert;
  onStatusChange: (id: number, status: AlertStatus) => void;
  onDelete: (id: number) => void;
  onSelectAlert?: (id: number) => void;
}

const statusLabel: Record<AlertStatus, string> = {
  [AlertStatus.ACTIVE]: "Activa",
  [AlertStatus.IN_PROGRESS]: "En progreso",
  [AlertStatus.RESOLVED]: "Resuelta",
  [AlertStatus.EXPIRED]: "",
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
  onSelectAlert,
}: Readonly<AlertCardProps>) {
  const [localUpvotes, setLocalUpvotes] = useState(alert.upvotes ?? 0);
  const [localDownvotes, setLocalDownvotes] = useState(alert.downvotes ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (showComments && comments.length === 0) {
      loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComments, comments.length]);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const data = await commentApi.getCommentsByAlert(alert.id);
      setComments(data);
      setCommentCount(data.length);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (content: string) => {
    const newComment = await commentApi.createComment({
      alertId: alert.id,
      content,
    });
    setComments([...comments, newComment]);
    setCommentCount(commentCount + 1);
  };

  const handleDeleteComment = async (commentId: number) => {
    await commentApi.deleteComment(commentId);
    setComments(comments.filter((c) => c.id !== commentId));
    setCommentCount(commentCount - 1);
  };

  const handleLikeComment = async (commentId: number) => {
    const updated = await commentApi.markHelpful(commentId);
    setComments(comments.map((c) => (c.id === commentId ? updated : c)));
  };

  const handleReportComment = async (commentId: number) => {
    // TODO: implementar endpoint de reporte en backend si está disponible
    console.warn("Report comment not implemented for commentId", commentId);
  };

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
          {alert.latitude != null &&
            alert.longitude != null &&
            onSelectAlert && (
              <button
                type="button"
                onClick={() => onSelectAlert(alert.id)}
                className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Ver en mapa
              </button>
            )}
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
          Lat: {alert.latitude?.toFixed(5)} | Lng: {alert.longitude?.toFixed(5)}
        </div>
        <div>{statusLabel[alert.status]}</div>
      </div>

      {/* Voting, Share & Comment Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t dark:border-gray-700">
        <div className="flex items-center gap-4">
          <VotingButtons
            alertId={alert.id}
            upvotes={localUpvotes}
            downvotes={localDownvotes}
            onVoteChange={handleVoteChange}
          />
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <MessageCircle size={18} />
            <span className="text-sm font-medium">{commentCount}</span>
          </button>
        </div>
        <ShareButtons alert={alert} />
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-2">
          {loadingComments ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <CommentSection
              alertId={alert.id}
              comments={comments}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
              onLikeComment={handleLikeComment}
              onReportComment={handleReportComment}
            />
          )}
        </div>
      )}

      <div className="flex gap-2">
        {alert.status !== AlertStatus.ACTIVE && (
          <button
            onClick={() => onStatusChange(alert.id, AlertStatus.ACTIVE)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            title="Marcar como activa"
          >
            <AlertTriangle size={14} />
            Activar
          </button>
        )}
        {alert.status !== AlertStatus.IN_PROGRESS && (
          <button
            onClick={() => onStatusChange(alert.id, AlertStatus.IN_PROGRESS)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            title="Marcar como en progreso"
          >
            <CheckCircle2 size={14} />
            En progreso
          </button>
        )}
        {alert.status !== AlertStatus.RESOLVED && (
          <button
            onClick={() => onStatusChange(alert.id, AlertStatus.RESOLVED)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            title="Marcar como resuelta"
          >
            <XCircle size={14} />
            Resuelta
          </button>
        )}
        <button
          onClick={() => onDelete(alert.id)}
          className="flex items-center justify-center px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-xs transition-colors"
          title="Eliminar alerta"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
