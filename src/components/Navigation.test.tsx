import { render, screen, fireEvent } from "@/test/test-utils";
import { BrowserRouter } from "react-router-dom";
import Navigation from "./Navigation";
import { useAuthStore } from "@/stores/authStore";

// Mock the auth store
jest.mock("@/stores/authStore");

describe("Navigation", () => {
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      isAuthenticated: () => true,
      logout: mockLogout,
      username: "testuser",
    });
  });

  it("renders all navigation links", () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    expect(screen.getByText(/inicio/i)).toBeInTheDocument();
    expect(screen.getByText(/alertas/i)).toBeInTheDocument();
    expect(screen.getByText(/estad\u00edsticas/i)).toBeInTheDocument();
    expect(screen.getByText(/gps/i)).toBeInTheDocument();
    expect(screen.getByText(/navegaci\u00f3n/i)).toBeInTheDocument();
  });

  it("shows profile link when authenticated", () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    expect(screen.getByText(/perfil/i)).toBeInTheDocument();
  });

  it("shows logout button when authenticated", () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    const logoutButton = screen.getByRole("button", {
      name: /cerrar sesi\u00f3n/i,
    });
    expect(logoutButton).toBeInTheDocument();
  });

  it("calls logout function when logout button is clicked", () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    const logoutButton = screen.getByRole("button", {
      name: /cerrar sesi\u00f3n/i,
    });
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it("highlights active link based on current path", () => {
    window.history.pushState({}, "", "/alerts");

    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    const alertsLink = screen.getByText(/alertas/i).closest("a");
    expect(alertsLink).toHaveClass("text-blue-600");
  });

  it("renders correctly when user is not authenticated", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      isAuthenticated: () => false,
      logout: mockLogout,
      username: null,
    });

    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    expect(screen.queryByText(/perfil/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /cerrar sesi\u00f3n/i })
    ).not.toBeInTheDocument();
  });
});
