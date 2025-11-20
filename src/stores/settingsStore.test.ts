import { renderHook, act } from "@testing-library/react";

const loadSettingsStore = () => require("./settingsStore");

describe("settingsStore", () => {
  let useSettingsStore: ReturnType<typeof loadSettingsStore>["useSettingsStore"];
  const resetStore = () => {
    jest.resetModules();
    useSettingsStore = loadSettingsStore().useSettingsStore;
  };

  beforeEach(() => {
    resetStore();
    const { result } = renderHook(() => useSettingsStore());
    act(() => {
      result.current.setTheme("light");
      result.current.setMapDarkMode(true);
      result.current.setRoutePreference("safest");
      result.current.setAutoReroute(true);
      result.current.setVoiceGuidance(false);
      result.current.setAvoidCriticalAlerts(true);
    });
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("initializes with default settings", () => {
    const { result } = renderHook(() => useSettingsStore());

    expect(result.current.theme).toBe("light");
    expect(result.current.mapDarkMode).toBe(true);
    expect(result.current.routePreference).toBe("safest");
    expect(result.current.autoReroute).toBe(true);
    expect(result.current.voiceGuidance).toBe(false);
    expect(result.current.avoidCriticalAlerts).toBe(true);
  });

  it("sets theme and updates DOM", () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.setTheme("dark");
    });

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    act(() => {
      result.current.setTheme("light");
    });

    expect(result.current.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("toggles theme correctly", () => {
    const { result } = renderHook(() => useSettingsStore());

    expect(result.current.theme).toBe("light");

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("sets map dark mode", () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.setMapDarkMode(false);
    });

    expect(result.current.mapDarkMode).toBe(false);

    act(() => {
      result.current.setMapDarkMode(true);
    });

    expect(result.current.mapDarkMode).toBe(true);
  });

  it("sets route preference", () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.setRoutePreference("fastest");
    });

    expect(result.current.routePreference).toBe("fastest");

    act(() => {
      result.current.setRoutePreference("shortest");
    });

    expect(result.current.routePreference).toBe("shortest");
  });

  it("sets auto reroute", () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.setAutoReroute(false);
    });

    expect(result.current.autoReroute).toBe(false);
  });

  it("sets voice guidance", () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.setVoiceGuidance(true);
    });

    expect(result.current.voiceGuidance).toBe(true);
  });

  it("sets avoid critical alerts", () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.setAvoidCriticalAlerts(false);
    });

    expect(result.current.avoidCriticalAlerts).toBe(false);
  });

  it("persists settings to localStorage", () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.setTheme("dark");
      result.current.setRoutePreference("fastest");
    });

    const stored = localStorage.getItem("settings-storage");
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.state.theme).toBe("dark");
    expect(parsed.state.routePreference).toBe("fastest");
  });

  it("loads settings from localStorage on initialization", () => {
    localStorage.setItem(
      "settings-storage",
      JSON.stringify({
        state: {
          theme: "dark",
          mapDarkMode: false,
          routePreference: "shortest",
          autoReroute: false,
          voiceGuidance: true,
          avoidCriticalAlerts: false,
        },
        version: 0,
      })
    );

    resetStore();
    const { result } = renderHook(() => useSettingsStore());

    expect(result.current.theme).toBe("dark");
    expect(result.current.mapDarkMode).toBe(false);
    expect(result.current.routePreference).toBe("shortest");
    expect(result.current.autoReroute).toBe(false);
    expect(result.current.voiceGuidance).toBe(true);
    expect(result.current.avoidCriticalAlerts).toBe(false);
  });
});
