// src/stores/settingsStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface SettingsState {
  theme: Theme;
  mapDarkMode: boolean;
  autoReroute: boolean;
  voiceGuidance: boolean;
  avoidCriticalAlerts: boolean;

  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setMapDarkMode: (enabled: boolean) => void;
  setAutoReroute: (enabled: boolean) => void;
  setVoiceGuidance: (enabled: boolean) => void;
  setAvoidCriticalAlerts: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: "light",
      mapDarkMode: true,
      autoReroute: true,
      voiceGuidance: false,
      avoidCriticalAlerts: true,

      setTheme: (theme) => {
        set({ theme });
        // Aplicar el tema al DOM
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === "light" ? "dark" : "light";
        get().setTheme(newTheme);
      },

      setMapDarkMode: (enabled) => set({ mapDarkMode: enabled }),
      setAutoReroute: (enabled) => set({ autoReroute: enabled }),
      setVoiceGuidance: (enabled) => set({ voiceGuidance: enabled }),
      setAvoidCriticalAlerts: (enabled) => set({ avoidCriticalAlerts: enabled }),
    }),
    {
      name: "settings-storage",
      onRehydrateStorage: () => (state) => {
        // Aplicar el tema cuando se carga desde localStorage
        if (state?.theme === "dark") {
          document.documentElement.classList.add("dark");
        }
      },
    }
  )
);
