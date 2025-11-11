import { useState } from "react";
import { authApi } from "@/api/authApi";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMsg(null);
    try {
      await authApi.register({ username, password });
      setMsg("Registro exitoso, ahora puedes iniciar sesión");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error(err);
      setError("No se pudo registrar, intenta con otro usuario");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Crear cuenta
        </h1>

        {msg && (
          <div className="bg-green-50 text-green-700 px-3 py-2 rounded text-sm">
            {msg}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

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
          Registrarme
        </button>

        <p className="text-xs text-center text-gray-500">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
