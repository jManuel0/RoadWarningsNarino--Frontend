import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "@/api/authApi";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Token de verificación no encontrado.");
      return;
    }

    const verify = async () => {
      setStatus("loading");
      setMessage("");
      try {
        await authApi.verifyEmail(token);
        setStatus("success");
        setMessage(
          "Correo verificado correctamente. Ya puedes iniciar sesión con tu cuenta."
        );
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "No se pudo verificar tu correo electrónico.";
        setStatus("error");
        setMessage(msg);
      }
    };

    verify();
  }, [searchParams]);

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
          Verificación de correo
        </h1>

        {status === "loading" && (
          <div className="flex flex-col items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <LoadingSpinner size="sm" />
            <p>Verificando tu correo electrónico...</p>
          </div>
        )}

        {status === "success" && (
          <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200 px-3 py-2 rounded text-sm">
            {message}
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 px-3 py-2 rounded text-sm">
            {message}
          </div>
        )}

        {(status === "success" || status === "error") && (
          <button
            type="button"
            onClick={handleGoToLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg mt-2"
          >
            Ir a iniciar sesión
          </button>
        )}
      </div>
    </div>
  );
}

