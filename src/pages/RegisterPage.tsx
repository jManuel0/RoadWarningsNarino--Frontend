import { useState } from "react";
import { authApi } from "@/api/authApi";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuthStore } from "@/stores/authStore";
import { notificationService } from "@/utils/notifications";

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);

  const validate = () => {
    const errors: typeof fieldErrors = {};

    if (!/^[A-Za-z0-9_-]+$/.test(username)) {
      errors.username =
        "Solo letras, números, guiones (-) y guiones bajos (_), sin espacios.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email =
        "Ingresa un correo con formato válido (ej. usuario@dominio.com).";
    }

    if (password.length < 8 || password.length > 30) {
      errors.password = "La contraseña debe tener entre 8 y 30 caracteres.";
    } else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      errors.password =
        "La contraseña debe incluir al menos una letra mayúscula y una minúscula.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;
    if (!validate()) {
      return;
    }

    setError(null);
    setIsLoading(true);
    setIsWakingUp(false);

    const wakeUpTimeout = window.setTimeout(() => {
      setIsWakingUp(true);
    }, 10000);

    try {
      const response = await authApi.register({ username, email, password });

      // Guardar el token y autenticar al usuario
      setAuth(
        response.token,
        response.username,
        response.refreshToken,
        response.expiresIn
      );

      // Mostrar notificación de éxito
      notificationService.success(
        "¡Cuenta creada exitosamente!",
        "Bienvenido a RoadWarnings Nariño"
      );

      // Redirigir a la página principal
      navigate("/");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo registrar. Verifica los datos.";
      setError(message);
    } finally {
      window.clearTimeout(wakeUpTimeout);
      setIsLoading(false);
      setIsWakingUp(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
          Registrarse
        </h1>

        {isLoading && (
          <div className="flex flex-col items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <LoadingSpinner size="sm" />
            <p>Creando tu cuenta...</p>
            {isWakingUp && (
              <p className="text-xs text-amber-600 text-center">
                El servidor se está despertando, puede tardar unos minutos en
                responder.
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
            Usuario
          </label>
          <input
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Solo letras, números, guiones (-) y guiones bajos (_).
          </p>
          {fieldErrors.username && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
            Correo
          </label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full border rounded px-3 py-2 pr-20 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-2 flex items-center text-xs text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
            >
              {showPassword ? "Ocultar" : "Ver"}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Entre 8 y 30 caracteres, debe tener al menos una mayúscula y una
            minúscula.
          </p>
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
