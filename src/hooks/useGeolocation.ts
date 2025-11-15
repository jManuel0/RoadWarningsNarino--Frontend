/**
 * Hook de React para geolocalización en tiempo real
 * Proporciona la ubicación actual del usuario, seguimiento continuo y manejo de errores
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Coordinates, GeolocationState } from '@/types/map.types';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

/**
 * Opciones por defecto para la geolocalización
 */
const DEFAULT_OPTIONS: PositionOptions = {
  enableHighAccuracy: true, // Usar GPS de alta precisión
  timeout: 10000, // Timeout de 10 segundos
  maximumAge: 0, // No usar caché de ubicación
};

/**
 * Opciones para seguimiento continuo
 */
const WATCH_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 1000, // Aceptar posiciones con hasta 1 segundo de antigüedad
};

// ============================================================================
// TIPOS
// ============================================================================

interface UseGeolocationOptions {
  /**
   * Iniciar seguimiento automáticamente al montar el componente
   */
  enableHighAccuracy?: boolean;

  /**
   * Timeout para obtener la ubicación (en milisegundos)
   */
  timeout?: number;

  /**
   * Edad máxima de la posición en caché (en milisegundos)
   */
  maximumAge?: number;

  /**
   * Callback cuando se obtiene una nueva posición
   */
  onPosition?: (position: Coordinates) => void;

  /**
   * Callback cuando ocurre un error
   */
  onError?: (error: GeolocationPositionError) => void;
}

interface UseGeolocationReturn extends GeolocationState {
  /**
   * Obtiene la ubicación actual una sola vez
   */
  getCurrentPosition: () => Promise<Coordinates>;

  /**
   * Inicia el seguimiento continuo de la ubicación
   */
  startTracking: () => void;

  /**
   * Detiene el seguimiento continuo
   */
  stopTracking: () => void;

  /**
   * Reinicia el seguimiento
   */
  resetTracking: () => void;

  /**
   * Verifica si la geolocalización está disponible
   */
  isSupported: boolean;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

/**
 * Hook para acceder a la geolocalización del dispositivo
 * @param options - Opciones de configuración
 * @returns Estado de geolocalización y métodos de control
 *
 * @example
 * ```tsx
 * const { position, error, isTracking, startTracking, stopTracking } = useGeolocation({
 *   onPosition: (pos) => console.log('Nueva posición:', pos),
 *   onError: (err) => console.error('Error:', err.message)
 * });
 * ```
 */
export function useGeolocation(
  options: UseGeolocationOptions = {}
): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    accuracy: null,
    heading: null,
    speed: null,
    error: null,
    isTracking: false,
    lastUpdate: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const optionsRef = useRef(options);

  // Actualizar opciones sin causar re-renders
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Verificar si la geolocalización está soportada
  const isSupported =
    typeof window !== 'undefined' && 'geolocation' in navigator;

  /**
   * Procesa una posición obtenida de la Geolocation API
   */
  const handlePosition = useCallback((position: GeolocationPosition) => {
    const coordinates: Coordinates = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    const newState: GeolocationState = {
      position: coordinates,
      accuracy: position.coords.accuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      error: null,
      isTracking: true,
      lastUpdate: new Date(),
    };

    setState(newState);

    // Llamar callback si existe
    optionsRef.current.onPosition?.(coordinates);

    console.log('📍 Ubicación actualizada:', {
      lat: coordinates.lat.toFixed(6),
      lng: coordinates.lng.toFixed(6),
      accuracy: `${position.coords.accuracy.toFixed(0)}m`,
    });
  }, []);

  /**
   * Maneja errores de geolocalización
   */
  const handleError = useCallback((error: GeolocationPositionError) => {
    console.error('❌ Error de geolocalización:', {
      code: error.code,
      message: error.message,
    });

    setState((prev) => ({
      ...prev,
      error,
      isTracking: false,
    }));

    // Llamar callback si existe
    optionsRef.current.onError?.(error);
  }, []);

  /**
   * Obtiene la ubicación actual una sola vez
   */
  const getCurrentPosition = useCallback((): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      if (!isSupported) {
        const error = new Error('Geolocalización no soportada');
        reject(error);
        return;
      }

      const positionOptions: PositionOptions = {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? DEFAULT_OPTIONS.timeout,
        maximumAge: options.maximumAge ?? DEFAULT_OPTIONS.maximumAge,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setState((prev) => ({
            ...prev,
            position: coords,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            error: null,
            lastUpdate: new Date(),
          }));

          resolve(coords);
        },
        (error) => {
          handleError(error);
          reject(error);
        },
        positionOptions
      );
    });
  }, [isSupported, options, handleError]);

  /**
   * Inicia el seguimiento continuo de la ubicación
   */
  const startTracking = useCallback(() => {
    if (!isSupported) {
      console.error('Geolocalización no soportada');
      return;
    }

    // Si ya está rastreando, no hacer nada
    if (watchIdRef.current !== null) {
      console.log('El seguimiento ya está activo');
      return;
    }

    const positionOptions: PositionOptions = {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? WATCH_OPTIONS.timeout,
      maximumAge: options.maximumAge ?? WATCH_OPTIONS.maximumAge,
    };

    console.log('🎯 Iniciando seguimiento de ubicación...');

    const watchId = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      positionOptions
    );

    watchIdRef.current = watchId;

    setState((prev) => ({
      ...prev,
      isTracking: true,
      error: null,
    }));
  }, [isSupported, options, handlePosition, handleError]);

  /**
   * Detiene el seguimiento continuo
   */
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      console.log('⏸️ Deteniendo seguimiento de ubicación');
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;

      setState((prev) => ({
        ...prev,
        isTracking: false,
      }));
    }
  }, []);

  /**
   * Reinicia el seguimiento
   */
  const resetTracking = useCallback(() => {
    stopTracking();
    setState({
      position: null,
      accuracy: null,
      heading: null,
      speed: null,
      error: null,
      isTracking: false,
      lastUpdate: null,
    });
  }, [stopTracking]);

  // Limpiar seguimiento al desmontar
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    ...state,
    getCurrentPosition,
    startTracking,
    stopTracking,
    resetTracking,
    isSupported,
  };
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Obtiene un mensaje de error legible en español
 * @param error - Error de geolocalización
 * @returns Mensaje de error en español
 */
export function getGeolocationErrorMessage(
  error: GeolocationPositionError
): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Permiso de ubicación denegado. Por favor, habilita el acceso a la ubicación en la configuración de tu navegador.';

    case error.POSITION_UNAVAILABLE:
      return 'Ubicación no disponible. Verifica tu conexión GPS o WiFi.';

    case error.TIMEOUT:
      return 'Tiempo de espera agotado. Intenta nuevamente.';

    default:
      return `Error desconocido: ${error.message}`;
  }
}

/**
 * Verifica si el navegador soporta geolocalización
 * @returns true si la geolocalización está soportada
 */
export function isGeolocationSupported(): boolean {
  return typeof window !== 'undefined' && 'geolocation' in navigator;
}

/**
 * Solicita permiso de geolocalización
 * @returns Promesa que resuelve cuando se obtiene el permiso
 */
export async function requestGeolocationPermission(): Promise<boolean> {
  if (!isGeolocationSupported()) {
    return false;
  }

  try {
    // Intentar obtener la ubicación actual para activar el prompt de permisos
    await new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve(),
        (error) => reject(error),
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: Infinity,
        }
      );
    });

    return true;
  } catch (error) {
    console.error('Error solicitando permiso de geolocalización:', error);
    return false;
  }
}
