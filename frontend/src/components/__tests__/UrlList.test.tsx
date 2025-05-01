import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { mockPagination, mockUrls } from "../../../__mocks__/api";
import UrlList from "../UrlList";

// Mock the toast library
jest.mock("sonner", () => ({
  toast: jest.fn(),
}));

describe("UrlList Component", () => {
  const defaultProps = {
    urls: mockUrls,
    pagination: mockPagination,
    loading: false,
    error: null,
    searchTerm: "",
    onSearchChange: jest.fn(),
    onPageChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component with URLs correctly", () => {
    render(<UrlList {...defaultProps} />);

    // Check the heading
    expect(screen.getByText("Your URLs")).toBeInTheDocument();

    // Check that all URLs are rendered
    mockUrls.forEach((url) => {
      expect(screen.getByText(url.originalUrl)).toBeInTheDocument();
      expect(screen.getByText(url.shortUrl)).toBeInTheDocument();
      expect(screen.getByText(url.visitCount.toString())).toBeInTheDocument();
    });

    // Check pagination info
    expect(screen.getByText(`Page ${mockPagination.page} of ${mockPagination.totalPages}`)).toBeInTheDocument();
  });

  it("renders loading state correctly", () => {
    render(<UrlList {...defaultProps} loading={true} />);

    expect(screen.queryByText("Your URLs")).toBeInTheDocument();
    expect(screen.queryByText(mockUrls[0].originalUrl)).toBeInTheDocument();
  });

  it("renders error state correctly", () => {
    const errorMessage = "Failed to load URLs";
    render(<UrlList {...defaultProps} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByText("Your URLs")).toBeInTheDocument();
    expect(screen.queryByText(mockUrls[0].originalUrl)).toBeInTheDocument();
  });

  it("renders empty state when no URLs are available", () => {
    render(<UrlList {...defaultProps} urls={[]} />);

    expect(screen.getByText("No URLs found")).toBeInTheDocument();
  });

  it("calls onSearchChange when search input value changes", async () => {
    render(<UrlList {...defaultProps} />);

    // Find the search input
    const searchInput = screen.getByPlaceholderText("Enter at least 3 characters to search");

    // Type in the search box
    fireEvent.change(searchInput, { target: { value: "example" } });

    // Wait for debounce timeout
    await waitFor(
      () => {
        expect(defaultProps.onSearchChange).toHaveBeenCalledWith("example");
      },
      { timeout: 600 }
    ); // Slightly longer than the 500ms debounce
  });

  it("calls onPageChange when pagination buttons are clicked", () => {
    render(<UrlList {...defaultProps} />);

    // Find next page button
    const nextButton = screen.getByLabelText("Next page");
    fireEvent.click(nextButton);

    // Check if page change is triggered
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(mockPagination.page + 1);
  });

  it("copies URL to clipboard when Copy button is clicked", () => {
    render(<UrlList {...defaultProps} />);

    // Find the first copy button
    const copyButtons = screen.getAllByText("Copy");
    fireEvent.click(copyButtons[0]);

    // Check if clipboard API was called
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockUrls[0].shortUrl);

    // Check if toast was shown
    expect(toast).toHaveBeenCalledWith("URL copied to clipboard!");
  });

  it("maintains focus in search box after search", async () => {
    render(<UrlList {...defaultProps} />);

    // Find the search input
    const searchInput = screen.getByPlaceholderText("Enter at least 3 characters to search");

    // Focus and type in the search box
    searchInput.focus();
    fireEvent.change(searchInput, { target: { value: "example" } });

    // Check if input is focused
    expect(document.activeElement).toBe(searchInput);

    // Wait for debounce and check if focus is maintained
    await waitFor(
      () => {
        expect(defaultProps.onSearchChange).toHaveBeenCalledWith("example");
        expect(document.activeElement).toBe(searchInput);
      },
      { timeout: 600 }
    );
  });

  it("disables pagination buttons correctly", () => {
    // Test with first page (prev buttons should be disabled)
    render(<UrlList {...defaultProps} pagination={{ ...mockPagination, page: 1, hasPrevPage: false }} />);

    expect(screen.getByLabelText("Previous page")).toBeDisabled();
    expect(screen.getByLabelText("Next page")).not.toBeDisabled();
  });
});
