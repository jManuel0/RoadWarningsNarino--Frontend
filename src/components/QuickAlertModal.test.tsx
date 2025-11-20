import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import QuickAlertModal from "./QuickAlertModal";
import { alertApi } from "@/api/alertApi";
import { notificationService } from "@/utils/notifications";
import { AlertSeverity, AlertType } from "@/types/Alert";
import type { RoutePoint } from "@/stores/navigationStore";

jest.mock("@/api/alertApi");
jest.mock("@/utils/notifications");

const mockOnClose = jest.fn();
const defaultLocation: RoutePoint = { lat: 1.2136, lng: -77.2811 };

const renderModal = () =>
  render(
    <QuickAlertModal
      isOpen={true}
      onClose={mockOnClose}
      location={defaultLocation}
    />
  );

describe("QuickAlertModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (alertApi.createAlert as jest.Mock).mockResolvedValue({
      id: 1,
      type: AlertType.ACCIDENTE,
      severity: AlertSeverity.ALTA,
      title: "Quick Alert",
      description: "Detalle",
      latitude: defaultLocation.lat,
      longitude: defaultLocation.lng,
      location: "Test",
      status: "ACTIVE",
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date().toISOString(),
    });
  });

  it("renders correctly when open", () => {
    renderModal();

    expect(screen.getByText(/reportar alerta/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        `${defaultLocation.lat.toFixed(4)}, ${defaultLocation.lng.toFixed(4)}`
      )
    ).toBeInTheDocument();
  });

  it("is hidden when closed", () => {
    render(
      <QuickAlertModal
        isOpen={false}
        onClose={mockOnClose}
        location={defaultLocation}
      />
    );

    expect(screen.queryByText(/reportar alerta/i)).not.toBeInTheDocument();
  });

  it("allows selecting type and severity", () => {
    renderModal();

    const accidenteButton = screen.getByRole("button", { name: /accidente/i });
    fireEvent.click(accidenteButton);
    expect(accidenteButton).toHaveClass("bg-blue-600");

    const altaButton = screen.getByRole("button", { name: /alta/i });
    fireEvent.click(altaButton);
    expect(altaButton).toHaveClass("bg-orange-600");
  });

  it("submits alert with the selected data", async () => {
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: /accidente/i }));
    fireEvent.click(screen.getByRole("button", { name: /alta/i }));

    const submitButton = screen.getByRole("button", { name: /reportar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(alertApi.createAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: AlertType.ACCIDENTE,
          severity: AlertSeverity.ALTA,
          latitude: defaultLocation.lat,
          longitude: defaultLocation.lng,
        })
      );
      expect(notificationService.success).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

});
