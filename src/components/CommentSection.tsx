import { useState, useEffect } from 'react';
import { MessageCircle, Send, Trash2, Flag, ThumbsUp, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuthStore } from '@/stores/authStore';

export interface Comment {
  id: number;
  alertId: number;
  userId: number;
  username: string;
  content: string;
  likes: number;
  createdAt: string;
  isEdited?: boolean;
}

interface CommentSectionProps {
  alertId: number;
  comments: Comment[];
  onAddComment: (content: string) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
  onLikeComment: (commentId: number) => Promise<void>;
  onReportComment: (commentId: number) => Promise<void>;
}

export default function CommentSection({
  alertId,
  comments: initialComments,
  onAddComment,
  onDeleteComment,
  onLikeComment,
  onReportComment,
}: Readonly<CommentSectionProps>) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: number) => {
    if (likedComments.has(commentId)) return;

    try {
      await onLikeComment(commentId);
      setLikedComments(prev => new Set(prev).add(commentId));
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este comentario?')) return;

    try {
      await onDeleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleReport = async (commentId: number) => {
    if (!window.confirm('¿Reportar este comentario como inapropiado?')) return;

    try {
      await onReportComment(commentId);
      alert('Comentario reportado. Será revisado por moderadores.');
    } catch (error) {
      console.error('Error reporting comment:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <MessageCircle className="text-blue-600 dark:text-blue-400" size={20} />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Comentarios ({comments.length})
          </h3>
        </div>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {newComment.length}/500 caracteres
                </span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg transition-all disabled:cursor-not-allowed font-medium"
                >
                  <Send size={16} />
                  {isSubmitting ? 'Enviando...' : 'Comentar'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Inicia sesión para comentar
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">
              No hay comentarios aún. ¡Sé el primero en comentar!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {comment.username?.charAt(0).toUpperCase() || <User size={20} />}
                    </div>
                  </div>

                  {/* Comment Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {comment.username}
                        </span>
                        {comment.isEdited && (
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            (editado)
                          </span>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      {user && user.id === comment.userId && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Eliminar comentario"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <p className="mt-2 text-gray-700 dark:text-gray-300 break-words">
                      {comment.content}
                    </p>

                    {/* Comment Actions */}
                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={() => handleLike(comment.id)}
                        disabled={!user || likedComments.has(comment.id)}
                        className={`flex items-center gap-1 text-sm transition-colors ${
                          likedComments.has(comment.id)
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                        } disabled:cursor-not-allowed`}
                      >
                        <ThumbsUp size={14} />
                        <span>{comment.likes}</span>
                      </button>

                      {user && user.id !== comment.userId && (
                        <button
                          onClick={() => handleReport(comment.id)}
                          className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Reportar comentario"
                        >
                          <Flag size={14} />
                          <span className="text-xs">Reportar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
