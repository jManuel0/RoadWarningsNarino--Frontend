import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import QuickAlertModal from "./QuickAlertModal";
import { createAlert } from "@/api/alertApi";
import { notificationService } from "@/utils/notifications";

jest.mock("@/api/alertApi");
jest.mock("@/utils/notifications");

describe("QuickAlertModal", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders when isOpen is true", () => {
    render(<QuickAlertModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText(/crear alerta r\u00e1pida/i)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(<QuickAlertModal isOpen={false} onClose={mockOnClose} />);

    expect(
      screen.queryByText(/crear alerta r\u00e1pida/i)
    ).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<QuickAlertModal isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByRole("button", { name: /cerrar/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("allows selection of alert type", () => {
    render(<QuickAlertModal isOpen={true} onClose={mockOnClose} />);

    const accidenteButton = screen.getByRole("button", { name: /accidente/i });
    fireEvent.click(accidenteButton);

    expect(accidenteButton).toHaveClass("bg-blue-600");
  });

  it("allows selection of severity level", () => {
    render(<QuickAlertModal isOpen={true} onClose={mockOnClose} />);

    const criticaButton = screen.getByRole("button", { name: /cr\u00edtica/i });
    fireEvent.click(criticaButton);

    expect(criticaButton).toHaveClass("bg-red-600");
  });

  it("submits alert with selected options", async () => {
    (createAlert as jest.Mock).mockResolvedValue({
      data: { id: 1, title: "Quick Alert" },
    });

    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementationOnce((success) =>
        success({
          coords: {
            latitude: 1.2136,
            longitude: -77.2811,
          },
        })
      ),
    };

    Object.defineProperty(global.navigator, "geolocation", {
      value: mockGeolocation,
      configurable: true,
    });

    render(<QuickAlertModal isOpen={true} onClose={mockOnClose} />);

    // Select type
    const accidenteButton = screen.getByRole("button", { name: /accidente/i });
    fireEvent.click(accidenteButton);

    // Select severity
    const altaButton = screen.getByRole("button", { name: /alta/i });
    fireEvent.click(altaButton);

    // Submit
    const submitButton = screen.getByRole("button", { name: /crear alerta/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "ACCIDENTE",
          severity: "ALTA",
        })
      );
      expect(notificationService.success).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("shows error when geolocation is not available", async () => {
    Object.defineProperty(global.navigator, "geolocation", {
      value: undefined,
      configurable: true,
    });

    render(<QuickAlertModal isOpen={true} onClose={mockOnClose} />);

    const submitButton = screen.getByRole("button", { name: /crear alerta/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/geolocalización no disponible/i)
      ).toBeInTheDocument();
    });
  });

  it("displays loading state during submission", async () => {
    (createAlert as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementationOnce((success) =>
        success({
          coords: {
            latitude: 1.2136,
            longitude: -77.2811,
          },
        })
      ),
    };

    Object.defineProperty(global.navigator, "geolocation", {
      value: mockGeolocation,
      configurable: true,
    });

    render(<QuickAlertModal isOpen={true} onClose={mockOnClose} />);

    const submitButton = screen.getByRole("button", { name: /crear alerta/i });
    fireEvent.click(submitButton);

    expect(screen.getByRole("button", { name: /creando/i })).toBeDisabled();

    await waitFor(
      () => {
        expect(
          screen.queryByRole("button", { name: /creando/i })
        ).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});
