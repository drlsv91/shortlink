import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { useUrlShortener } from "../../hooks/useUrlShortener";
import UrlForm from "../UrlForm";

// Mock the useUrlShortener hook
jest.mock("../../hooks/useUrlShortener", () => ({
  useUrlShortener: jest.fn(),
}));

// Mock the toast function
jest.mock("sonner", () => ({
  toast: jest.fn(),
}));

describe("UrlForm Component", () => {
  // Common test data
  const mockShortenUrl = jest.fn();
  const mockOnShortenSuccess = jest.fn();
  const mockResult = {
    shortUrl: "http://short.est/abc123",
    originalUrl: "https://example.com/some/long/path",
  };

  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock clipboard API
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: jest.fn(() => Promise.resolve()) },
      writable: true,
      configurable: true,
    });
  });

  it("renders the form correctly", () => {
    // Setup hook mock for initial render
    (useUrlShortener as jest.Mock).mockReturnValue({
      shortenUrl: mockShortenUrl,
      loading: false,
      error: null,
      result: null,
    });

    render(<UrlForm onShortenSuccess={mockOnShortenSuccess} />);

    // Check form elements are present
    expect(screen.getByText("Shorten a URL")).toBeInTheDocument();
    expect(screen.getByLabelText("Enter a long URL")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Shorten" })).toBeInTheDocument();

    // Result should not be visible initially
    expect(screen.queryByText("Your shortened URL:")).not.toBeInTheDocument();
  });

  it("handles url input correctly", async () => {
    // Setup hook mock
    (useUrlShortener as jest.Mock).mockReturnValue({
      shortenUrl: mockShortenUrl,
      loading: false,
      error: null,
      result: null,
    });

    render(<UrlForm onShortenSuccess={mockOnShortenSuccess} />);

    // Get input field
    const inputField = screen.getByLabelText("Enter a long URL");

    // Type into the input
    await userEvent.type(inputField, "https://example.com");

    // Check if the value is updated
    expect(inputField).toHaveValue("https://example.com");
  });

  it("shows loading state during submission", async () => {
    // Set up the hook to show loading
    (useUrlShortener as jest.Mock).mockReturnValue({
      shortenUrl: jest.fn(() => new Promise((resolve) => setTimeout(resolve, 100))),
      loading: true,
      error: null,
      result: null,
    });

    render(<UrlForm onShortenSuccess={mockOnShortenSuccess} />);

    // Check if button shows loading text
    expect(screen.getByRole("button", { name: "Shortening..." })).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("submits the form and calls shortenUrl", async () => {
    // Setup successful shortening
    mockShortenUrl.mockResolvedValue(mockResult);

    (useUrlShortener as jest.Mock).mockReturnValue({
      shortenUrl: mockShortenUrl,
      loading: false,
      error: null,
      result: null,
    });

    render(<UrlForm onShortenSuccess={mockOnShortenSuccess} />);

    // Fill the form
    const inputField = screen.getByLabelText("Enter a long URL");
    await userEvent.type(inputField, "https://example.com");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "Shorten" });
    fireEvent.click(submitButton);

    // Verify shortenUrl was called with the correct URL
    expect(mockShortenUrl).toHaveBeenCalledWith("https://example.com");

    // Wait for onShortenSuccess to be called
    await waitFor(() => {
      expect(mockOnShortenSuccess).toHaveBeenCalled();
    });

    // Input should be cleared after successful submission
    expect(inputField).toHaveValue("");
  });

  it("displays error message when shortening fails", () => {
    // Setup error state
    const errorMessage = "Invalid URL format";

    (useUrlShortener as jest.Mock).mockReturnValue({
      shortenUrl: mockShortenUrl,
      loading: false,
      error: errorMessage,
      result: null,
    });

    render(<UrlForm onShortenSuccess={mockOnShortenSuccess} />);

    // Check if error message is displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("displays result after successful shortening", () => {
    // Setup success state with result
    (useUrlShortener as jest.Mock).mockReturnValue({
      shortenUrl: mockShortenUrl,
      loading: false,
      error: null,
      result: mockResult,
    });

    render(<UrlForm onShortenSuccess={mockOnShortenSuccess} />);

    // Check if result section is displayed
    expect(screen.getByText("Your shortened URL:")).toBeInTheDocument();
    expect(screen.getByText(mockResult.shortUrl)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
  });

  it("copies the shortened URL to clipboard", async () => {
    // Setup success state with result
    (useUrlShortener as jest.Mock).mockReturnValue({
      shortenUrl: mockShortenUrl,
      loading: false,
      error: null,
      result: mockResult,
    });

    render(<UrlForm onShortenSuccess={mockOnShortenSuccess} />);

    // Click the copy button
    const copyButton = screen.getByRole("button", { name: "Copy" });
    fireEvent.click(copyButton);

    // Verify clipboard API was called with the correct URL
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockResult.shortUrl);

    // Check if toast notification was shown
    expect(toast).toHaveBeenCalledWith("URL copied to clipboard!");
  });

  it("prevents submission when URL is empty", async () => {
    // Setup hook mock
    (useUrlShortener as jest.Mock).mockReturnValue({
      shortenUrl: mockShortenUrl,
      loading: false,
      error: null,
      result: null,
    });

    render(<UrlForm onShortenSuccess={mockOnShortenSuccess} />);

    // Submit the form without entering a URL
    const submitButton = screen.getByRole("button", { name: "Shorten" });
    fireEvent.click(submitButton);

    // Verify shortenUrl was not called
    expect(mockShortenUrl).not.toHaveBeenCalled();
  });
});
