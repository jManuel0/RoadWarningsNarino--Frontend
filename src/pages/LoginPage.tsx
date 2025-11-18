import { useState } from "react";
import { authApi } from "@/api/authApi";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate, Link } from "react-router-dom";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      setAuth(res.token, username);
      navigate("/alerts");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Usuario o contraseña incorrectos";
      setError(message);
    } finally {
      window.clearTimeout(wakeUpTimeout);
      setIsLoading(false);
      setIsWakingUp(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Iniciar sesion
        </h1>

        {isLoading && (
          <div className="flex flex-col items-center gap-2 text-sm text-gray-600">
            <LoadingSpinner size="sm" />
            <p>Procesando tu inicio de sesion...</p>
            {isWakingUp && (
              <p className="text-xs text-amber-600 text-center">
                El servidor se esta despertando, puede tardar unos minutos en
                responder.
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm mb-1">Usuario o correo</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Contrasena</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-xs text-center text-gray-500">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Registrate
          </Link>
        </p>
      </form>
    </div>
  );
}

