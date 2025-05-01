import { Pagination, URL } from "@/types/url";
import { render, screen } from "@testing-library/react";
import { mockPagination, mockUrls } from "../../../__mocks__/api";
import { useUrlList } from "../../hooks/useUrlList";
import HomePage from "../../pages/HomePage";

// Mock the useUrlList hook
jest.mock("../../hooks/useUrlList", () => ({
  useUrlList: jest.fn(),
}));

// Mock the components used in HomePage
jest.mock("../../components/UrlForm", () => ({
  __esModule: true,
  default: ({ onShortenSuccess }: { onShortenSuccess: () => void }) => (
    <div data-testid="url-form">
      URL Form Component <button onClick={onShortenSuccess}>Shorten URL</button>
    </div>
  ),
}));

jest.mock("../../components/UrlList", () => ({
  __esModule: true,
  default: ({
    urls,
    pagination,
    loading,
    error,
    searchTerm,
    onSearchChange,
    onPageChange,
  }: {
    urls: URL[];
    pagination: Pagination;
    loading: boolean;
    error: string | null;
    searchTerm: string;
    onSearchChange: (text: string) => void;
    onPageChange: (page: number) => void;
  }) => (
    <div data-testid="url-list">
      URL List Component
      <div data-testid="loading">{loading ? "Loading" : "Not Loading"}</div>
      <div data-testid="error">{error ?? "No Error"}</div>
      <div data-testid="search-term">Search: {searchTerm}</div>
      <button onClick={() => onSearchChange("new-search")}>Change Search</button>
      <button onClick={() => onPageChange(2)}>Change Page</button>
      <div data-testid="url-count">URLs: {urls.length}</div>
      <div data-testid="pagination">Page: {pagination.page}</div>
    </div>
  ),
}));

describe("HomePage Component", () => {
  const mockSetSearchTerm = jest.fn();
  const mockHandlePageChange = jest.fn();
  const mockRefreshUrls = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation for useUrlList
    (useUrlList as jest.Mock).mockReturnValue({
      urls: mockUrls,
      pagination: mockPagination,
      loading: false,
      error: null,
      searchTerm: "",
      setSearchTerm: mockSetSearchTerm,
      page: 1,
      handlePageChange: mockHandlePageChange,
      refreshUrls: mockRefreshUrls,
    });
  });

  it("renders the component with all subcomponents", () => {
    render(<HomePage />);

    // Check for main title and subtitle
    expect(screen.getByText("ShortLink")).toBeInTheDocument();
    expect(screen.getByText("A simple URL shortening service")).toBeInTheDocument();

    // Check for subcomponents
    expect(screen.getByTestId("url-form")).toBeInTheDocument();
    expect(screen.getByTestId("url-list")).toBeInTheDocument();
  });

  it("passes the correct props to UrlList component", () => {
    render(<HomePage />);

    // Check props passed to UrlList
    expect(screen.getByTestId("loading")).toHaveTextContent("Not Loading");
    expect(screen.getByTestId("error")).toHaveTextContent("No Error");
    expect(screen.getByTestId("url-count")).toHaveTextContent(`URLs: ${mockUrls.length}`);
    expect(screen.getByTestId("pagination")).toHaveTextContent(`Page: ${mockPagination.page}`);
  });

  it("handles loading state correctly", () => {
    (useUrlList as jest.Mock).mockReturnValue({
      urls: [],
      pagination: mockPagination,
      loading: true,
      error: null,
      searchTerm: "",
      setSearchTerm: mockSetSearchTerm,
      page: 1,
      handlePageChange: mockHandlePageChange,
      refreshUrls: mockRefreshUrls,
    });

    render(<HomePage />);

    expect(screen.getByTestId("loading")).toHaveTextContent("Loading");
  });

  it("handles error state correctly", () => {
    const errorMessage = "Failed to load URLs";
    (useUrlList as jest.Mock).mockReturnValue({
      urls: [],
      pagination: mockPagination,
      loading: false,
      error: errorMessage,
      searchTerm: "",
      setSearchTerm: mockSetSearchTerm,
      page: 1,
      handlePageChange: mockHandlePageChange,
      refreshUrls: mockRefreshUrls,
    });

    render(<HomePage />);

    expect(screen.getByTestId("error")).toHaveTextContent(errorMessage);
  });

  it("calls refreshUrls when URL is shortened", () => {
    render(<HomePage />);

    // Find and click the shorten button
    const shortenButton = screen.getByText("Shorten URL");
    shortenButton.click();

    // Check if refreshUrls was called
    expect(mockRefreshUrls).toHaveBeenCalledTimes(1);
  });

  it("calls setSearchTerm when search is changed", () => {
    render(<HomePage />);

    // Find and click the search change button
    const searchButton = screen.getByText("Change Search");
    searchButton.click();

    // Check if setSearchTerm was called with the correct value
    expect(mockSetSearchTerm).toHaveBeenCalledWith("new-search");
  });

  it("calls handlePageChange when page is changed", () => {
    render(<HomePage />);

    // Find and click the page change button
    const pageButton = screen.getByText("Change Page");
    pageButton.click();

    // Check if handlePageChange was called with the correct value
    expect(mockHandlePageChange).toHaveBeenCalledWith(2);
  });
});
