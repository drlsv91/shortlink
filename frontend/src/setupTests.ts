import "@testing-library/jest-dom";

// Properly mock the clipboard API
Object.defineProperty(global.navigator, "clipboard", {
  value: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
  configurable: true,
});

// Mock toast function
jest.mock("sonner", () => ({
  toast: jest.fn(),
}));
