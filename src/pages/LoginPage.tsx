import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/api/authApi";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const setAuth = useAuthStore((s) => s.setAuth);
  const setGuest = useAuthStore((s) => s.setGuest);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Llamada real al backend
      const res = await authApi.login({ username, password });
      // ajusta según lo que te devuelva tu backend:
      // setAuth(res.token, res.username || username);
      setAuth(res.token, username);

      navigate("/home"); // 👈 ir al dashboard principal
    } catch (err) {
      console.error(err);
      setError("Usuario o contraseña incorrectos");
    }
  };

  const handleGuest = () => {
    // Modo invitado: solo GPS y lectura
    setGuest(true);
    navigate("/gps");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          RoadWarnings Nariño
        </h1>
        <p className="text-sm text-gray-500 text-center">
          Inicia sesión para gestionar alertas o entra como invitado para usar el GPS.
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-sm mb-1">Usuario</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Contraseña</label>
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
          >
            Entrar
          </button>
        </form>

        <button
          onClick={handleGuest}
          className="w-full mt-2 border border-gray-300 rounded-lg py-2 text-gray-700 hover:bg-gray-50"
        >
          Usar GPS como invitado
        </button>

        <p className="text-xs text-center text-gray-500 mt-3">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
