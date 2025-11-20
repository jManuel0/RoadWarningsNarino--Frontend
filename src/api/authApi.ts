import { LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth";
import { API_BASE } from "./baseUrl";

async function parseErrorMessage(
  res: Response,
  fallback: string
): Promise<string> {
  try {
    const text = await res.text();
    if (!text) return fallback;

    try {
      const data = JSON.parse(text);
      const msg = (data && (data.message || data.error || data.detail)) ?? text;
      return typeof msg === "string" ? msg : fallback;
    } catch {
      return text || fallback;
    }
  } catch {
    return fallback;
  }
}

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let message = "Error al iniciar sesión";

      if (res.status === 401) {
        message = "Usuario o contraseña incorrectos";
      } else if (res.status >= 400 && res.status < 500) {
        message = await parseErrorMessage(
          res,
          "No se pudo iniciar sesión. Verifica los datos."
        );
      }

      throw new Error(message);
    }

    return res.json();
  },

  async refreshToken(
    refreshToken: string
  ): Promise<{ token: string; expiresIn?: number }> {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      const message = await parseErrorMessage(
        res,
        "No se pudo renovar la sesión"
      );
      throw new Error(message);
    }

    return res.json();
  },

  // Registro: el backend crea el usuario y envía correo de verificación.
  // No devuelve token de sesión.
  async register(data: RegisterRequest): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let message = "Error al registrar usuario";

      if (res.status === 400) {
        message = await parseErrorMessage(
          res,
          "Usuario o correo ya están en uso o los datos son inválidos."
        );
      } else if (res.status === 409) {
        message = "Usuario o correo ya están en uso.";
      } else if (res.status >= 400 && res.status < 500) {
        message = await parseErrorMessage(
          res,
          "No se pudo registrar. Verifica los datos."
        );
      }

      throw new Error(message);
    }

    // No necesitamos procesar el body para el flujo de verificación por correo
  },

  async verifyEmail(token: string): Promise<void> {
    const res = await fetch(
      `${API_BASE}/auth/verify-email?token=${encodeURIComponent(token)}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      const message = await parseErrorMessage(
        res,
        "No se pudo verificar el correo electrónico."
      );
      throw new Error(message);
    }
  },
};
