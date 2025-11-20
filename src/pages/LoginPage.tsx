import { useState } from "react";
import { authApi } from "@/api/authApi";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate, Link } from "react-router-dom";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError(null);
    setIsLoading(true);
    setIsWakingUp(false);

    const wakeUpTimeout = window.setTimeout(() => {
      setIsWakingUp(true);
    }, 10000);

    try {
      const res = await authApi.login({ username, password });
      setAuth(res.token, res.username, res.refreshToken, res.expiresIn);
      navigate("/alerts");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Usuario o contraseña incorrectos";
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
          Iniciar sesión
        </h1>

        {isLoading && (
          <div className="flex flex-col items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <LoadingSpinner size="sm" />
            <p>Procesando tu inicio de sesión...</p>
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
            Usuario o correo
          </label>
          <input
            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
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
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  );
}
