import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { alertApi } from '@/api/alertApi';
import { notificationService } from '@/utils/notifications';

interface VotingButtonsProps {
  alertId: number;
  upvotes?: number;
  downvotes?: number;
  onVoteChange?: (upvotes: number, downvotes: number) => void;
}

export default function VotingButtons({
  alertId,
  upvotes = 0,
  downvotes = 0,
  onVoteChange
}: VotingButtonsProps) {
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState<'up' | 'down' | null>(null);

  const handleUpvote = async () => {
    if (voting || hasVoted === 'up') return;

    setVoting(true);
    try {
      const updated = await alertApi.upvoteAlert(alertId);
      setHasVoted('up');
      onVoteChange?.(updated.upvotes ?? upvotes + 1, updated.downvotes ?? downvotes);
      notificationService.success('Voto registrado');
    } catch (error) {
      console.error('Error al votar:', error);
      notificationService.error('No se pudo registrar el voto');
    } finally {
      setVoting(false);
    }
  };

  const handleDownvote = async () => {
    if (voting || hasVoted === 'down') return;

    setVoting(true);
    try {
      const updated = await alertApi.downvoteAlert(alertId);
      setHasVoted('down');
      onVoteChange?.(updated.upvotes ?? upvotes, updated.downvotes ?? downvotes + 1);
      notificationService.success('Voto registrado');
    } catch (error) {
      console.error('Error al votar:', error);
      notificationService.error('No se pudo registrar el voto');
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Upvote */}
      <button
        onClick={handleUpvote}
        disabled={voting || hasVoted !== null}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
          hasVoted === 'up'
            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
            : 'bg-gray-100 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/50 text-gray-700 dark:text-gray-300'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Marcar como útil"
      >
        <ThumbsUp size={16} />
        <span className="text-sm font-medium">{upvotes}</span>
      </button>

      {/* Downvote */}
      <button
        onClick={handleDownvote}
        disabled={voting || hasVoted !== null}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
          hasVoted === 'down'
            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
            : 'bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/50 text-gray-700 dark:text-gray-300'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Marcar como no útil"
      >
        <ThumbsDown size={16} />
        <span className="text-sm font-medium">{downvotes}</span>
      </button>

      {/* Indicador de confianza */}
      {upvotes + downvotes > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <span>
            {Math.round((upvotes / (upvotes + downvotes)) * 100)}% confiable
          </span>
        </div>
      )}
    </div>
  );
}
