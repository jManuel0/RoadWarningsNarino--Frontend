import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
          RoadWarnings Nariño
        </h1>
        <p className="text-sm text-center text-gray-600 dark:text-gray-300">
        </p>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
        >
          Iniciar sesión
        </button>

        <button
          type="button"
          onClick={() => navigate("/register")}
          className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 py-2 rounded-lg"
        >
          Registrarme
        </button>
      </div>
    </div>
  );
}

