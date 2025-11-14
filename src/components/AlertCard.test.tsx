import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AlertCard from "./AlertCard";
import { Alert, AlertType, AlertStatus, AlertSeverity } from "@/types/Alert";

const createMockAlert = (overrides?: Partial<Alert>): Alert => ({
  id: 1,
  title: "Accidente en Vía Principal",
  type: AlertType.ACCIDENTE,
  severity: AlertSeverity.ALTA,
  location: "Calle 18 con Carrera 25",
  municipality: "Pasto",
  description: "Accidente de tránsito con vehículos involucrados",
  latitude: 1.2136,
  longitude: -77.2811,
  status: AlertStatus.ACTIVE,
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe("AlertCard", () => {
  it("should render alert information correctly", () => {
    const alert = createMockAlert();
    const onStatusChange = jest.fn();
    const onDelete = jest.fn();

    render(<AlertCard alert={alert} onStatusChange={onStatusChange} onDelete={onDelete} />);

    expect(screen.getByText("Accidente en Vía Principal")).toBeInTheDocument();
    expect(screen.getByText("Calle 18 con Carrera 25")).toBeInTheDocument();
    expect(screen.getByText("Municipio: Pasto")).toBeInTheDocument();
    expect(screen.getByText("Accidente de tránsito con vehículos involucrados")).toBeInTheDocument();
  });

  it("should display fallback text when title is missing", () => {
    const alert = createMockAlert({ title: undefined });
    render(<AlertCard alert={alert} onStatusChange={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText("Alerta sin título")).toBeInTheDocument();
  });

  it("should display fallback text when description is missing", () => {
    const alert = createMockAlert({ description: undefined });
    render(<AlertCard alert={alert} onStatusChange={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText("Sin descripción")).toBeInTheDocument();
  });

  it("should display fallback text when location is missing", () => {
    const alert = createMockAlert({ location: undefined });
    render(<AlertCard alert={alert} onStatusChange={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText("Sin dirección específica")).toBeInTheDocument();
  });

  it("should not display municipality when not provided", () => {
    const alert = createMockAlert({ municipality: undefined });
    render(<AlertCard alert={alert} onStatusChange={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.queryByText(/Municipio:/)).not.toBeInTheDocument();
  });

  it("should display severity badge with correct color", () => {
    const alert = createMockAlert({ severity: AlertSeverity.CRITICA });
    const { container } = render(<AlertCard alert={alert} onStatusChange={jest.fn()} onDelete={jest.fn()} />);

    const severityBadge = screen.getByText(AlertSeverity.CRITICA);
    expect(severityBadge).toHaveClass("bg-red-100", "text-red-800");
  });

  it("should display type badge", () => {
    const alert = createMockAlert({ type: AlertType.ACCIDENTE });
    render(<AlertCard alert={alert} onStatusChange={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText("ACCIDENTE")).toBeInTheDocument();
  });

  it("should display coordinates", () => {
    const alert = createMockAlert({ latitude: 1.2136, longitude: -77.2811 });
    render(<AlertCard alert={alert} onStatusChange={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText(/Lat: 1.21360/)).toBeInTheDocument();
    expect(screen.getByText(/Lng: -77.28110/)).toBeInTheDocument();
  });

  it("should display current status", () => {
    const alert = createMockAlert({ status: AlertStatus.ACTIVE });
    render(<AlertCard alert={alert} onStatusChange={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText("Activa")).toBeInTheDocument();
  });

  describe("Status change buttons", () => {
    it("should not show 'Activar' button when alert is active", () => {
      const alert = createMockAlert({ status: AlertStatus.ACTIVE });
      render(<AlertCard alert={alert} onStatusChange={jest.fn()} onDelete={jest.fn()} />);

      expect(screen.queryByText("Activar")).not.toBeInTheDocument();
    });

    it("should show 'Activar' button when alert is not active", () => {
      const alert = createMockAlert({ status: AlertStatus.RESOLVED });
      render(<AlertCard alert={alert} onStatusChange={jest.fn()} onDelete={jest.fn()} />);

      expect(screen.getByText("Activar")).toBeInTheDocument();
    });

    it("should not show 'En progreso' button when alert is in progress", () => {
      const alert = createMockAlert({ status: AlertStatus.IN_PROGRESS });
      render(<AlertCard alert={alert} onStatusChange={jest.fn()} onDelete={jest.fn()} />);

      expect(screen.queryByText("En progreso")).not.toBeInTheDocument();
    });

    it("should not show 'Resuelta' button when alert is resolved", () => {
      const alert = createMockAlert({ status: AlertStatus.RESOLVED });
      render(<AlertCard alert={alert} onStatusChange={jest.fn()} onDelete={jest.fn()} />);

      expect(screen.queryByText("Resuelta")).not.toBeInTheDocument();
    });

    it("should call onStatusChange when clicking status button", async () => {
      const user = userEvent.setup();
      const alert = createMockAlert({ status: AlertStatus.ACTIVE });
      const onStatusChange = jest.fn();

      render(<AlertCard alert={alert} onStatusChange={onStatusChange} onDelete={jest.fn()} />);

      const inProgressButton = screen.getByText("En progreso");
      await user.click(inProgressButton);

      expect(onStatusChange).toHaveBeenCalledWith(1, AlertStatus.IN_PROGRESS);
    });
  });

  describe("Delete button", () => {
    it("should always show delete button", () => {
      const alert = createMockAlert();
      const { container } = render(<AlertCard alert={alert} onStatusChange={jest.fn()} onDelete={jest.fn()} />);

      const deleteButton = container.querySelector(".text-red-600");
      expect(deleteButton).toBeInTheDocument();
    });

    it("should call onDelete when clicking delete button", async () => {
      const user = userEvent.setup();
      const alert = createMockAlert({ id: 123 });
      const onDelete = jest.fn();

      const { container } = render(<AlertCard alert={alert} onStatusChange={jest.fn()} onDelete={onDelete} />);

      const deleteButton = container.querySelector(".text-red-600") as HTMLElement;
      await user.click(deleteButton);

      expect(onDelete).toHaveBeenCalledWith(123);
    });
  });
});
