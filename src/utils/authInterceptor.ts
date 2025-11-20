import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/api/authApi";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Intercepts fetch requests to add authentication token and handle token refresh
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const authStore = useAuthStore.getState();

  // Check if token is expired and refresh if needed
  if (authStore.isTokenExpired() && authStore.refreshToken) {
    if (isRefreshing) {
      // Wait for token refresh to complete
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token: string) => {
          // Retry original request with new token
          const newOptions = {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${token}`,
            },
          };
          fetch(url, newOptions).then(resolve).catch(reject);
        });
      });
    } else {
      isRefreshing = true;

      try {
        const { token, expiresIn } = await authApi.refreshToken(
          authStore.refreshToken
        );
        authStore.setToken(token, expiresIn);
        isRefreshing = false;
        onTokenRefreshed(token);
      } catch (error) {
        isRefreshing = false;
        authStore.logout();
        window.location.href = "/login";
        throw error;
      }
    }
  }

  // Add auth token to headers
  const headers = {
    ...options.headers,
    ...(authStore.token && { Authorization: `Bearer ${authStore.token}` }),
  };

  const response = await fetch(url, { ...options, headers });

  // Handle 401 - try to refresh token
  if (response.status === 401 && authStore.refreshToken && !isRefreshing) {
    isRefreshing = true;

    try {
      const { token, expiresIn } = await authApi.refreshToken(
        authStore.refreshToken
      );
      authStore.setToken(token, expiresIn);
      isRefreshing = false;
      onTokenRefreshed(token);

      // Retry original request with new token
      const retryHeaders = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };

      return fetch(url, { ...options, headers: retryHeaders });
    } catch (error) {
      isRefreshing = false;
      authStore.logout();
      window.location.href = "/login";
      throw error;
    }
  }

  return response;
}

/**
 * Helper to get auth token for manual use
 */
export function getAuthToken(): string | null {
  const authStore = useAuthStore.getState();

  // Check expiration
  if (authStore.isTokenExpired()) {
    return null;
  }

  return authStore.token;
}

/**
 * Axios interceptor for automatic token refresh
 */
export function setupAxiosInterceptors(axiosInstance: AxiosInstance) {
  // Request interceptor
  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const authStore = useAuthStore.getState();

      // Check if token is expired and refresh if needed
      if (authStore.isTokenExpired() && authStore.refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;

          try {
            const { token, expiresIn } = await authApi.refreshToken(
              authStore.refreshToken
            );
            authStore.setToken(token, expiresIn);
            isRefreshing = false;
            onTokenRefreshed(token);
          } catch (error) {
            isRefreshing = false;
            authStore.logout();
            window.location.href = "/login";
            throw error;
          }
        }
      }

      // Add token to header
      const token = authStore.token;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = (error.config || {}) as AxiosRequestConfig & {
        _retry?: boolean;
      };

      // Handle 401 errors
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const authStore = useAuthStore.getState();

        if (authStore.refreshToken) {
          try {
            const { token, expiresIn } = await authApi.refreshToken(
              authStore.refreshToken
            );
            authStore.setToken(token, expiresIn);

            // Retry original request with new token
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`,
            };
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            authStore.logout();
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        } else {
          authStore.logout();
          window.location.href = "/login";
        }
      }

      throw error;
    }
  );
}
