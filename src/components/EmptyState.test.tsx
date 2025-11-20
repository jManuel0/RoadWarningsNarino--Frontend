import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmptyState, {
  NoAlertsEmptyState,
  NoSearchResultsEmptyState,
  NoNotificationsEmptyState,
  NoFavoritesEmptyState,
  ErrorEmptyState,
  OfflineEmptyState,
  NoStatisticsEmptyState,
  NoCommentsEmptyState,
  NoUsersEmptyState,
} from "./EmptyState";
import { AlertTriangle } from "lucide-react";

describe("EmptyState components", () => {
  describe("EmptyState", () => {
    it("renders with title and description", () => {
      render(
        <EmptyState
          icon={AlertTriangle}
          title="No data"
          description="There is no data to display"
        />
      );

      expect(screen.getByText("No data")).toBeInTheDocument();
      expect(
        screen.getByText("There is no data to display")
      ).toBeInTheDocument();
    });

    it("renders action button when provided", async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <EmptyState
          icon={AlertTriangle}
          title="No data"
          description="Test description"
          action={{
            label: "Add data",
            onClick: handleClick,
          }}
        />
      );

      const button = screen.getByRole("button", { name: /add data/i });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("applies search variant styles", () => {
      const { container } = render(
        <EmptyState
          icon={AlertTriangle}
          title="Search"
          description="Test"
          variant="search"
        />
      );

      expect(container.querySelector(".bg-blue-50")).toBeInTheDocument();
    });

    it("applies error variant styles", () => {
      const { container } = render(
        <EmptyState
          icon={AlertTriangle}
          title="Error"
          description="Test"
          variant="error"
        />
      );

      expect(container.querySelector(".bg-red-50")).toBeInTheDocument();
    });
  });

  describe("NoAlertsEmptyState", () => {
    it("renders no alerts message", () => {
      render(<NoAlertsEmptyState />);

      expect(screen.getByText(/no hay alertas/i)).toBeInTheDocument();
    });

    it("renders create alert button when handler provided", async () => {
      const handleCreate = jest.fn();
      const user = userEvent.setup();

      render(<NoAlertsEmptyState onCreateAlert={handleCreate} />);

      const button = screen.getByRole("button", { name: /crear alerta/i });
      await user.click(button);

      expect(handleCreate).toHaveBeenCalledTimes(1);
    });

    it("does not render button when no handler", () => {
      render(<NoAlertsEmptyState />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("NoSearchResultsEmptyState", () => {
    it("renders no search results message", () => {
      render(<NoSearchResultsEmptyState searchTerm="accident" />);

      expect(
        screen.getByText(/no se encontraron resultados/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/accident/i)).toBeInTheDocument();
    });

    it("renders clear search button when handler provided", async () => {
      const handleClear = jest.fn();
      const user = userEvent.setup();

      render(
        <NoSearchResultsEmptyState
          searchTerm="test"
          onClearSearch={handleClear}
        />
      );

      const button = screen.getByRole("button", { name: /limpiar búsqueda/i });
      await user.click(button);

      expect(handleClear).toHaveBeenCalledTimes(1);
    });
  });

  describe("NoNotificationsEmptyState", () => {
    it("renders no notifications message", () => {
      render(<NoNotificationsEmptyState />);

      expect(screen.getByText(/no tienes notificaciones/i)).toBeInTheDocument();
    });
  });

  describe("NoFavoritesEmptyState", () => {
    it("renders no favorites message", () => {
      render(<NoFavoritesEmptyState />);

      expect(screen.getByText(/no tienes favoritos/i)).toBeInTheDocument();
    });

    it("renders explore button when handler provided", async () => {
      const handleExplore = jest.fn();
      const user = userEvent.setup();

      render(<NoFavoritesEmptyState onBrowseAlerts={handleExplore} />);

      const button = screen.getByRole("button", { name: /explorar alertas/i });
      await user.click(button);

      expect(handleExplore).toHaveBeenCalledTimes(1);
    });
  });

  describe("ErrorEmptyState", () => {
    it("renders error message", () => {
      render(<ErrorEmptyState description="Something went wrong" />);

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it("renders retry button when handler provided", async () => {
      const handleRetry = jest.fn();
      const user = userEvent.setup();

      render(<ErrorEmptyState onRetry={handleRetry} />);

      const button = screen.getByRole("button", { name: /reintentar/i });
      await user.click(button);

      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it("uses default error message when not provided", () => {
      render(<ErrorEmptyState />);

      expect(screen.getByText(/algo salió mal/i)).toBeInTheDocument();
    });
  });

  describe("OfflineEmptyState", () => {
    it("renders offline message", () => {
      render(<OfflineEmptyState />);

      expect(screen.getByText(/sin conexión/i)).toBeInTheDocument();
    });
  });

  describe("NoStatisticsEmptyState", () => {
    it("renders no statistics message", () => {
      render(<NoStatisticsEmptyState />);

      expect(screen.getByText(/sin datos estadísticos/i)).toBeInTheDocument();
    });
  });

  describe("NoCommentsEmptyState", () => {
    it("renders no comments message", () => {
      render(<NoCommentsEmptyState />);

      expect(screen.getByText(/no hay comentarios/i)).toBeInTheDocument();
    });

    it("renders add comment button when handler provided", async () => {
      const handleAdd = jest.fn();
      const user = userEvent.setup();

      render(<NoCommentsEmptyState onAddComment={handleAdd} />);

      const button = screen.getByRole("button", {
        name: /agregar comentario/i,
      });
      await user.click(button);

      expect(handleAdd).toHaveBeenCalledTimes(1);
    });
  });

  describe("NoUsersEmptyState", () => {
    it("renders no users message", () => {
      render(<NoUsersEmptyState />);

      expect(screen.getByText(/no hay usuarios/i)).toBeInTheDocument();
    });

    it("renders invite button when handler provided", async () => {
      const handleInvite = jest.fn();
      const user = userEvent.setup();

      render(<NoUsersEmptyState onInviteUsers={handleInvite} />);

      const button = screen.getByRole("button", { name: /invitar usuarios/i });
      await user.click(button);

      expect(handleInvite).toHaveBeenCalledTimes(1);
    });
  });
});
