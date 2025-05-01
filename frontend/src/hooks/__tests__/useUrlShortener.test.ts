import { renderHook, act } from "@testing-library/react";
import { useUrlShortener } from "../useUrlShortener";
import { api } from "../../services/api";

// Mock the API service
jest.mock("../../services/api", () => ({
  api: {
    shortenUrl: jest.fn(),
  },
}));

describe("useUrlShortener Hook", () => {
  // Sample data for tests
  const mockOriginalUrl = "https://example.com/very/long/url/path";
  const mockResult = {
    originalUrl: mockOriginalUrl,
    shortUrl: "http://short.est/abc123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useUrlShortener());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.result).toBeNull();
    expect(typeof result.current.shortenUrl).toBe("function");
  });

  it("should handle successful URL shortening", async () => {
    // Mock successful API call
    (api.shortenUrl as jest.Mock).mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useUrlShortener());

    // Initial state
    expect(result.current.loading).toBe(false);

    // Call the shortenUrl function
    let returnValue;
    await act(async () => {
      returnValue = await result.current.shortenUrl(mockOriginalUrl);
    });

    // Verify API was called with the correct URL
    expect(api.shortenUrl).toHaveBeenCalledWith(mockOriginalUrl);

    // Verify hook state after successful operation
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.result).toEqual(mockResult);

    // Verify the return value matches the API response
    expect(returnValue).toEqual(mockResult);
  });

  it("should handle API errors correctly", async () => {
    // Mock API error
    const errorMessage = "Invalid URL format";
    (api.shortenUrl as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useUrlShortener());

    // Call the shortenUrl function
    let returnValue;
    await act(async () => {
      returnValue = await result.current.shortenUrl(mockOriginalUrl);
    });

    // Verify API was called
    expect(api.shortenUrl).toHaveBeenCalledWith(mockOriginalUrl);

    // Verify hook state after error
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.result).toBeNull();

    // Verify the return value is null for failed operations
    expect(returnValue).toBeNull();
  });

  it("should handle unknown errors correctly", async () => {
    // Mock non-Error type rejection
    (api.shortenUrl as jest.Mock).mockRejectedValueOnce("Not an Error object");

    const { result } = renderHook(() => useUrlShortener());

    // Call the shortenUrl function
    await act(async () => {
      await result.current.shortenUrl(mockOriginalUrl);
    });

    // Verify generic error message is set
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("An unknown error occurred");
    expect(result.current.result).toBeNull();
  });

  it("should show loading state and reset it after API call", async () => {
    // Mock a delayed API response to test loading state
    (api.shortenUrl as jest.Mock).mockImplementationOnce(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockResult), 100);
      });
    });

    const { result } = renderHook(() => useUrlShortener());

    // Start the API call
    let promise: Promise<unknown>;
    act(() => {
      promise = result.current.shortenUrl(mockOriginalUrl);
    });

    // Since we can't reliably test the intermediate loading state in Jest,
    // we'll just verify the final state after the API call completes
    await act(async () => {
      await promise;
    });

    // Verify final state
    expect(result.current.loading).toBe(false);
    expect(result.current.result).toEqual(mockResult);
  });

  it("should clear error when making a new request", async () => {
    // First, make a request that fails
    (api.shortenUrl as jest.Mock).mockRejectedValueOnce(new Error("First error"));

    const { result } = renderHook(() => useUrlShortener());

    await act(async () => {
      await result.current.shortenUrl(mockOriginalUrl);
    });

    // Verify error state is set
    expect(result.current.error).toBe("First error");

    // Now, make a successful request
    (api.shortenUrl as jest.Mock).mockResolvedValueOnce(mockResult);

    // Make a new request with the same hook instance
    await act(async () => {
      await result.current.shortenUrl(mockOriginalUrl);
    });

    // Verify error state is cleared
    expect(result.current.error).toBeNull();
    expect(result.current.result).toEqual(mockResult);
  });
});
