// src/hooks/useMapDarkMode.ts
import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

/**
 * Hook para aplicar el modo oscuro a los contenedores de mapas de Leaflet
 * Detecta cambios en el tema y aplica filtros CSS automáticamente
 */
export function useMapDarkMode(mapContainerRef: React.RefObject<HTMLDivElement>) {
  const { theme, mapDarkMode } = useSettingsStore();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const mapContainer = mapContainerRef.current;
    const isDark = theme === "dark" && mapDarkMode;

    if (isDark) {
      // Aplicar filtros para modo oscuro
      mapContainer.style.filter =
        "invert(1) hue-rotate(180deg) brightness(0.9) contrast(1.1)";
      mapContainer.style.transition = "filter 0.3s ease-in-out";

      // Invertir los marcadores y controles para que se vean correctamente
      const markers = mapContainer.querySelectorAll(".leaflet-marker-icon");
      const controls = mapContainer.querySelectorAll(".leaflet-control");
      const popups = mapContainer.querySelectorAll(".leaflet-popup");

      markers.forEach((marker) => {
        (marker as HTMLElement).style.filter =
          "invert(1) hue-rotate(180deg) brightness(1.1)";
      });

      controls.forEach((control) => {
        (control as HTMLElement).style.filter =
          "invert(1) hue-rotate(180deg) brightness(1.1)";
      });

      popups.forEach((popup) => {
        (popup as HTMLElement).style.filter =
          "invert(1) hue-rotate(180deg) brightness(1.1)";
      });
    } else {
      // Remover filtros en modo claro
      mapContainer.style.filter = "";

      const markers = mapContainer.querySelectorAll(".leaflet-marker-icon");
      const controls = mapContainer.querySelectorAll(".leaflet-control");
      const popups = mapContainer.querySelectorAll(".leaflet-popup");

      markers.forEach((marker) => {
        (marker as HTMLElement).style.filter = "";
      });

      controls.forEach((control) => {
        (control as HTMLElement).style.filter = "";
      });

      popups.forEach((popup) => {
        (popup as HTMLElement).style.filter = "";
      });
    }

    // Observer para manejar elementos dinámicos (marcadores, popups añadidos después)
    const observer = new MutationObserver((mutations) => {
      if (!isDark) return;

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (
              node.classList.contains("leaflet-marker-icon") ||
              node.classList.contains("leaflet-control") ||
              node.classList.contains("leaflet-popup")
            ) {
              node.style.filter =
                "invert(1) hue-rotate(180deg) brightness(1.1)";
            }
          }
        });
      });
    });

    observer.observe(mapContainer, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [theme, mapDarkMode, mapContainerRef]);
}
