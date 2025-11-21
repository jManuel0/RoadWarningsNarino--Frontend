import { useState, useRef } from "react";
import { Camera, Trash2, Upload, X } from "lucide-react";
import { userApi } from "@/api/userApi";
import { notificationService } from "@/utils/notifications";

interface ProfilePictureUploadProps {
  currentPicture?: string;
  onPictureUpdated: (newPictureUrl: string | null) => void;
}

export default function ProfilePictureUpload({
  currentPicture,
  onPictureUpdated,
}: Readonly<ProfilePictureUploadProps>) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Obtener iniciales del usuario para avatar por defecto
  const getInitials = () => {
    const username = localStorage.getItem("username") || "U";
    return username.charAt(0).toUpperCase();
  };

  // Validar archivo
  const validateFile = (file: File): string | null => {
    // Validar tipo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return "Solo se permiten imágenes JPG, PNG o WebP";
    }

    // Validar tamaño (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return "La imagen no debe superar los 5MB";
    }

    return null;
  };

  // Manejar selección de archivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar
    const error = validateFile(file);
    if (error) {
      notificationService.error(error);
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setShowModal(true);
    };
    reader.readAsDataURL(file);
  };

  // Subir foto
  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) return;

    const file = fileInputRef.current.files[0];
    setIsUploading(true);

    try {
      const response = await userApi.uploadProfilePicture(file);
      onPictureUpdated(response.profilePictureUrl);
      notificationService.success("Foto de perfil actualizada");
      setShowModal(false);
      setPreview(null);
    } catch (error) {
      console.error("Error al subir foto:", error);
      notificationService.error(
        error instanceof Error ? error.message : "Error al subir la foto"
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Eliminar foto
  const handleDelete = async () => {
    const confirm = window.confirm(
      "¿Estás seguro de eliminar tu foto de perfil?"
    );
    if (!confirm) return;

    setIsUploading(true);

    try {
      await userApi.deleteProfilePicture();
      onPictureUpdated(null);
      notificationService.success("Foto de perfil eliminada");
    } catch (error) {
      console.error("Error al eliminar foto:", error);
      notificationService.error("Error al eliminar la foto");
    } finally {
      setIsUploading(false);
    }
  };

  // Cancelar
  const handleCancel = () => {
    setShowModal(false);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      {/* Avatar con botón de editar */}
      <div className="relative group">
        {/* Avatar */}
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600">
          {currentPicture ? (
            <img
              src={currentPicture}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
              {getInitials()}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="absolute -bottom-2 -right-2 flex gap-2">
          {/* Botón para cambiar foto */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Cambiar foto"
          >
            <Camera size={20} />
          </button>

          {/* Botón para eliminar foto (solo si existe) */}
          {currentPicture && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isUploading}
              className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Eliminar foto"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>

        {/* Input de archivo (oculto) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Modal de confirmación con preview */}
      {showModal && preview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Nueva foto de perfil
              </h3>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isUploading}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            {/* Preview */}
            <div className="mb-6">
              <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 shadow-lg">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
              Esta será tu nueva foto de perfil. Se verá en tu perfil y en todas
              tus alertas.
            </p>

            {/* Acciones */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isUploading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Subir foto
                  </>
                )}
              </button>
            </div>

            {/* Nota sobre límites */}
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4 text-center">
              Formatos permitidos: JPG, PNG, WebP • Tamaño máximo: 5MB
            </p>
          </div>
        </div>
      )}
    </>
  );
}
