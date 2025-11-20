/**
 * Environment configuration with runtime validation
 */

interface EnvConfig {
  apiUrl: string;
  wsUrl: string;
  googleMapsApiKey?: string;
  useMock: boolean;
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Validates and returns environment variables
 */
function validateEnv(): EnvConfig {
  const apiUrl = import.meta.env.VITE_API_URL;
  const wsUrl = import.meta.env.VITE_WS_URL;
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const useMock = import.meta.env.VITE_USE_MOCK === "true";
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  // Required variables
  if (!apiUrl) {
    throw new Error("VITE_API_URL is required. Please check your .env file.");
  }

  if (!wsUrl) {
    console.warn(
      "VITE_WS_URL is not set. WebSocket functionality may not work."
    );
  }

  // Validate URL format
  try {
    new URL(apiUrl);
  } catch {
    throw new Error(`VITE_API_URL is not a valid URL: ${apiUrl}`);
  }

  if (wsUrl) {
    if (!wsUrl.startsWith("ws://") && !wsUrl.startsWith("wss://")) {
      throw new Error(`VITE_WS_URL must start with ws:// or wss://: ${wsUrl}`);
    }
  }

  // Warn about missing optional variables
  if (!googleMapsApiKey && isProduction) {
    console.warn(
      "VITE_GOOGLE_MAPS_API_KEY is not set. Google Maps features will be limited."
    );
  }

  return {
    apiUrl,
    wsUrl: wsUrl || "",
    googleMapsApiKey,
    useMock,
    isDevelopment,
    isProduction,
  };
}

// Validate on import
const env = validateEnv();

// Export validated config
export const ENV = Object.freeze(env);

// Helper functions
export function getApiUrl(path: string = ""): string {
  const url = ENV.apiUrl.endsWith("/") ? ENV.apiUrl.slice(0, -1) : ENV.apiUrl;

  if (!path) return url;

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${url}${cleanPath}`;
}

export function getWsUrl(): string {
  return ENV.wsUrl;
}

export function isDevelopment(): boolean {
  return ENV.isDevelopment;
}

export function isProduction(): boolean {
  return ENV.isProduction;
}

export function useMockData(): boolean {
  return ENV.useMock;
}

// Log configuration in development
if (ENV.isDevelopment) {
  console.log("Environment Configuration:", {
    apiUrl: ENV.apiUrl,
    wsUrl: ENV.wsUrl,
    googleMapsApiKey: ENV.googleMapsApiKey
      ? "***" + ENV.googleMapsApiKey.slice(-4)
      : "not set",
    useMock: ENV.useMock,
    mode: ENV.isDevelopment ? "development" : "production",
  });
}
