import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export default function Welcome() {
  const navigate = useNavigate();
  const setGuest = useAuthStore((s) => s.setGuest);

  const handleGuest = () => {
    setGuest();
    navigate("/gps");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          RoadWarnings Nariño
        </h1>
        <p className="text-sm text-center text-gray-600">
          Elige cómo quieres usar la aplicación
        </p>

        <button
          onClick={() => navigate("/login")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
        >
          Iniciar sesión
        </button>

        <button
          onClick={() => navigate("/register")}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg"
        >
          Registrarme
        </button>

        <button
          onClick={handleGuest}
          className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg text-sm"
        >
          Entrar como invitado (solo GPS y ver alertas)
        </button>
      </div>
    </div>
  );
}
