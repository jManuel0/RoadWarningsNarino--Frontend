import { useState } from "react";
import { authApi } from "@/api/authApi";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

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

    if (password.length < 8 || password.length > 100) {
      errors.password = "La contraseña debe tener entre 8 y 100 caracteres.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setError(null);
    try {
      const res = await authApi.register({ username, email, password });
      setAuth(res.token, username);
      navigate("/alerts");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo registrar. Verifica los datos.";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Registrarse
        </h1>

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
          <p className="mt-1 text-xs text-gray-500">
            Solo letras, números, guiones (-) y guiones bajos (_).
          </p>
          {fieldErrors.username && (
            <p className="mt-1 text-xs text-red-600">
              {fieldErrors.username}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Correo</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
          )}
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
          <p className="mt-1 text-xs text-gray-500">
            Entre 8 y 100 caracteres.
          </p>
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-600">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
        >
          Crear cuenta
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
