import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import CreateAlertForm from "./CreateAlertForm";
import { createAlert } from "@/api/alertApi";
import { uploadApi } from "@/api/uploadApi";
import { notificationService } from "@/utils/notifications";

// Mock APIs
jest.mock("@/api/alertApi");
jest.mock("@/api/uploadApi");
jest.mock("@/utils/notifications");

describe("CreateAlertForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form fields correctly", () => {
    render(<CreateAlertForm />);

    expect(screen.getByLabelText(/t\u00edtulo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripci\u00f3n/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar/i })).toBeInTheDocument();
  });

  it("allows user to input title and description", () => {
    render(<CreateAlertForm />);

    const titleInput = screen.getByLabelText(
      /t\u00edtulo/i
    ) as HTMLInputElement;
    const descInput = screen.getByLabelText(
      /descripci\u00f3n/i
    ) as HTMLTextAreaElement;

    fireEvent.change(titleInput, { target: { value: "Test Alert" } });
    fireEvent.change(descInput, { target: { value: "Test Description" } });

    expect(titleInput.value).toBe("Test Alert");
    expect(descInput.value).toBe("Test Description");
  });

  it("requests geolocation when 'Use My Location' button is clicked", async () => {
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

    render(<CreateAlertForm />);

    const useLocationBtn = screen.getByRole("button", {
      name: /usar mi ubicaci\u00f3n/i,
    });
    fireEvent.click(useLocationBtn);

    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalledWith(
        "Ubicaci\u00f3n obtenida"
      );
    });
  });

  it("shows error when geolocation fails", async () => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementationOnce((_, error) =>
        error({
          code: 1,
          message: "Permission denied",
        })
      ),
    };

    Object.defineProperty(global.navigator, "geolocation", {
      value: mockGeolocation,
      configurable: true,
    });

    render(<CreateAlertForm />);

    const useLocationBtn = screen.getByRole("button", {
      name: /usar mi ubicaci\u00f3n/i,
    });
    fireEvent.click(useLocationBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/no se pudo obtener tu ubicaci\u00f3n/i)
      ).toBeInTheDocument();
    });
  });

  it("submits form with valid data", async () => {
    (createAlert as jest.Mock).mockResolvedValue({
      data: { id: 1, title: "Test Alert" },
    });

    render(<CreateAlertForm />);

    const titleInput = screen.getByLabelText(/t\u00edtulo/i);
    const descInput = screen.getByLabelText(/descripci\u00f3n/i);

    fireEvent.change(titleInput, { target: { value: "Test Alert" } });
    fireEvent.change(descInput, { target: { value: "Test Description" } });

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

    const useLocationBtn = screen.getByRole("button", {
      name: /usar mi ubicaci\u00f3n/i,
    });
    fireEvent.click(useLocationBtn);

    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });

    const submitBtn = screen.getByRole("button", { name: /enviar/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(createAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Alert",
          description: "Test Description",
          latitude: 1.2136,
          longitude: -77.2811,
        })
      );
    });
  });

  it("uploads image before submitting alert", async () => {
    (uploadApi.uploadImage as jest.Mock).mockResolvedValue({
      data: { url: "https://example.com/image.jpg" },
    });
    (createAlert as jest.Mock).mockResolvedValue({
      data: { id: 1, title: "Test Alert" },
    });

    render(<CreateAlertForm />);

    // Simulate image selection
    const file = new File(["test"], "test.png", { type: "image/png" });
    const imageInput = screen.getByLabelText(/subir imagen/i);

    fireEvent.change(imageInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText(/preview/i)).toBeInTheDocument();
    });

    // Fill form and submit
    const titleInput = screen.getByLabelText(/t\u00edtulo/i);
    fireEvent.change(titleInput, { target: { value: "Test Alert" } });

    const submitBtn = screen.getByRole("button", { name: /enviar/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(uploadApi.uploadImage).toHaveBeenCalledWith(file);
      expect(createAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          imageUrl: "https://example.com/image.jpg",
        })
      );
    });
  });

  it("shows loading state while submitting", async () => {
    (createAlert as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<CreateAlertForm />);

    const submitBtn = screen.getByRole("button", { name: /enviar/i });
    fireEvent.click(submitBtn);

    expect(screen.getByRole("button", { name: /enviando/i })).toBeDisabled();

    await waitFor(
      () => {
        expect(screen.getByRole("button", { name: /enviar/i })).toBeEnabled();
      },
      { timeout: 2000 }
    );
  });

  it("handles API errors gracefully", async () => {
    (createAlert as jest.Mock).mockRejectedValue(new Error("Network error"));

    render(<CreateAlertForm />);

    const submitBtn = screen.getByRole("button", { name: /enviar/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/error al crear la alerta/i)).toBeInTheDocument();
    });
  });
});
