import { renderHook, act } from "@testing-library/react";

const loadAuthStore = () => require("./authStore");

describe("authStore", () => {
  let useAuthStore: ReturnType<typeof loadAuthStore>["useAuthStore"];

  const resetStore = () => {
    jest.resetModules();
    useAuthStore = loadAuthStore().useAuthStore;
  };

  beforeEach(() => {
    resetStore();
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.logout();
    });
    localStorage.clear();
  });

  it("initializes with null token and username", () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.token).toBeNull();
    expect(result.current.username).toBeNull();
    expect(result.current.isAuthenticated()).toBe(false);
  });

  it("sets auth credentials correctly", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setAuth("test-token", "testuser");
    });

    expect(result.current.token).toBe("test-token");
    expect(result.current.username).toBe("testuser");
    expect(result.current.isAuthenticated()).toBe(true);
  });

  it("clears auth on logout", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setAuth("test-token", "testuser");
    });

    expect(result.current.isAuthenticated()).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.username).toBeNull();
    expect(result.current.isAuthenticated()).toBe(false);
  });

  it("persists auth to localStorage", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setAuth("test-token", "testuser");
    });

    const stored = localStorage.getItem("auth-storage");
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.state.token).toBe("test-token");
    expect(parsed.state.username).toBe("testuser");
  });

  it("loads auth from localStorage on initialization", () => {
    localStorage.setItem(
      "auth-storage",
      JSON.stringify({
        state: {
          token: "persisted-token",
          username: "persisteduser",
        },
        version: 0,
      })
    );

    resetStore();
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.token).toBe("persisted-token");
    expect(result.current.username).toBe("persisteduser");
    expect(result.current.isAuthenticated()).toBe(true);
  });

  it("handles empty token as not authenticated", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setAuth("", "testuser");
    });

    expect(result.current.isAuthenticated()).toBe(false);
  });
});
