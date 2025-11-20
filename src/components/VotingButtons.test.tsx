import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import VotingButtons from "./VotingButtons";
import { alertApi } from "@/api/alertApi";
import { notificationService } from "@/utils/notifications";

jest.mock("@/api/alertApi");
jest.mock("@/utils/notifications");

describe("VotingButtons", () => {
  const mockOnVoteChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders upvote and downvote buttons", () => {
    render(
      <VotingButtons
        alertId={1}
        upvotes={5}
        downvotes={2}
        onVoteChange={mockOnVoteChange}
      />
    );

    expect(screen.getByRole("button", { name: /upvote/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /downvote/i })
    ).toBeInTheDocument();
  });

  it("displays correct vote counts", () => {
    render(
      <VotingButtons
        alertId={1}
        upvotes={5}
        downvotes={2}
        onVoteChange={mockOnVoteChange}
      />
    );

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("calls upvoteAlert when upvote button is clicked", async () => {
    (alertApi.upvoteAlert as jest.Mock).mockResolvedValue({
      data: { upvotes: 6, downvotes: 2 },
    });

    render(
      <VotingButtons
        alertId={1}
        upvotes={5}
        downvotes={2}
        onVoteChange={mockOnVoteChange}
      />
    );

    const upvoteButton = screen.getByRole("button", { name: /upvote/i });
    fireEvent.click(upvoteButton);

    await waitFor(() => {
      expect(alertApi.upvoteAlert).toHaveBeenCalledWith(1);
      expect(mockOnVoteChange).toHaveBeenCalled();
    });
  });

  it("calls downvoteAlert when downvote button is clicked", async () => {
    (alertApi.downvoteAlert as jest.Mock).mockResolvedValue({
      data: { upvotes: 5, downvotes: 3 },
    });

    render(
      <VotingButtons
        alertId={1}
        upvotes={5}
        downvotes={2}
        onVoteChange={mockOnVoteChange}
      />
    );

    const downvoteButton = screen.getByRole("button", { name: /downvote/i });
    fireEvent.click(downvoteButton);

    await waitFor(() => {
      expect(alertApi.downvoteAlert).toHaveBeenCalledWith(1);
      expect(mockOnVoteChange).toHaveBeenCalled();
    });
  });

  it("disables buttons while voting", async () => {
    (alertApi.upvoteAlert as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <VotingButtons
        alertId={1}
        upvotes={5}
        downvotes={2}
        onVoteChange={mockOnVoteChange}
      />
    );

    const upvoteButton = screen.getByRole("button", { name: /upvote/i });
    fireEvent.click(upvoteButton);

    expect(upvoteButton).toBeDisabled();
    expect(screen.getByRole("button", { name: /downvote/i })).toBeDisabled();

    await waitFor(
      () => {
        expect(upvoteButton).toBeEnabled();
      },
      { timeout: 2000 }
    );
  });

  it("handles voting errors gracefully", async () => {
    (alertApi.upvoteAlert as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    render(
      <VotingButtons
        alertId={1}
        upvotes={5}
        downvotes={2}
        onVoteChange={mockOnVoteChange}
      />
    );

    const upvoteButton = screen.getByRole("button", { name: /upvote/i });
    fireEvent.click(upvoteButton);

    await waitFor(() => {
      expect(notificationService.error).toHaveBeenCalledWith(
        expect.stringContaining("error")
      );
    });
  });

  it("prevents multiple simultaneous votes", async () => {
    (alertApi.upvoteAlert as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <VotingButtons
        alertId={1}
        upvotes={5}
        downvotes={2}
        onVoteChange={mockOnVoteChange}
      />
    );

    const upvoteButton = screen.getByRole("button", { name: /upvote/i });

    fireEvent.click(upvoteButton);
    fireEvent.click(upvoteButton);
    fireEvent.click(upvoteButton);

    await waitFor(
      () => {
        expect(alertApi.upvoteAlert).toHaveBeenCalledTimes(1);
      },
      { timeout: 2000 }
    );
  });
});
