import { Share2, Copy, Check } from 'lucide-react';
import { FaWhatsapp, FaTwitter, FaFacebook } from 'react-icons/fa';
import { useState } from 'react';
import { Alert } from '@/types/Alert';
import { notificationService } from '@/utils/notifications';

interface ShareButtonsProps {
  alert: Alert;
}

export default function ShareButtons({ alert }: Readonly<ShareButtonsProps>) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/alerts?id=${alert.id}`;
  const shareText = `⚠️ Alerta Vial: ${alert.type}\n📍 ${alert.location}\n${alert.description}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      notificationService.success('Enlace copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
      notificationService.error('No se pudo copiar el enlace');
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${shareText}\n\nVer más: ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Alerta Vial - ${alert.type}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error al compartir:', error);
        }
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Native Share (Mobile) */}
      {typeof navigator.share === 'function' && (
        <button
          onClick={handleNativeShare}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Compartir"
          type="button"
        >
          <Share2 size={16} className="text-gray-700 dark:text-gray-300" />
        </button>
      )}

      {/* WhatsApp */}
      <button
        onClick={handleWhatsAppShare}
        className="p-2 rounded-lg bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
        title="Compartir en WhatsApp"
        type="button"
      >
        <FaWhatsapp size={16} className="text-green-600 dark:text-green-400" />
      </button>

      {/* Twitter */}
      <button
        onClick={handleTwitterShare}
        className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
        title="Compartir en Twitter"
        type="button"
      >
        <FaTwitter size={16} className="text-blue-600 dark:text-blue-400" />
      </button>

      {/* Facebook */}
      <button
        onClick={handleFacebookShare}
        className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
        title="Compartir en Facebook"
        type="button"
      >
        <FaFacebook size={16} className="text-blue-700 dark:text-blue-500" />
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className={`p-2 rounded-lg transition-colors ${
          copied
            ? 'bg-green-100 dark:bg-green-900'
            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
        title="Copiar enlace"
        type="button"
      >
        {copied ? (
          <Check size={16} className="text-green-600 dark:text-green-400" />
        ) : (
          <Copy size={16} className="text-gray-700 dark:text-gray-300" />
        )}
      </button>
    </div>
  );
}
