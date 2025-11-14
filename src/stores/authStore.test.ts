import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./authStore";

describe("authStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      token: null,
      username: null,
      guestMode: false,
    });
    localStorage.clear();
  });

  it("should initialize with default values", () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.username).toBeNull();
    expect(state.guestMode).toBe(false);
    expect(state.isAuthenticated()).toBe(false);
  });

  it("should set authentication credentials", () => {
    const { setAuth } = useAuthStore.getState();
    setAuth("test-token", "testuser");

    const state = useAuthStore.getState();
    expect(state.token).toBe("test-token");
    expect(state.username).toBe("testuser");
    expect(state.guestMode).toBe(false);
    expect(state.isAuthenticated()).toBe(true);
  });

  it("should enable guest mode", () => {
    // First set auth
    useAuthStore.getState().setAuth("token", "user");

    // Then enable guest mode
    useAuthStore.getState().setGuest();

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.username).toBeNull();
    expect(state.guestMode).toBe(true);
    expect(state.isAuthenticated()).toBe(false);
  });

  it("should logout user", () => {
    // First authenticate
    useAuthStore.getState().setAuth("token", "user");
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);

    // Then logout
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.username).toBeNull();
    expect(state.guestMode).toBe(false);
    expect(state.isAuthenticated()).toBe(false);
  });

  it("should return true for isAuthenticated when token exists", () => {
    useAuthStore.getState().setAuth("my-token", "myuser");
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
  });

  it("should return false for isAuthenticated when no token", () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });

  it("should persist to localStorage", () => {
    useAuthStore.getState().setAuth("persistent-token", "persistentuser");

    // Check localStorage
    const stored = localStorage.getItem("auth-storage");
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.state.token).toBe("persistent-token");
    expect(parsed.state.username).toBe("persistentuser");
  });
});
