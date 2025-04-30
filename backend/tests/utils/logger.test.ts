import { createLogger } from "../../src/utils/logger";
describe("Logger", () => {
  let logger: ReturnType<typeof createLogger>;

  beforeEach(() => {
    logger = createLogger();

    jest.clearAllMocks();
  });

  it("should log info messages", () => {
    const consoleSpy = jest.spyOn(console, "info").mockImplementation(() => {});

    logger.info("test info");

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[INFO] test info"));
    consoleSpy.mockRestore();
  });

  it("should log debug messages", () => {
    const consoleSpy = jest.spyOn(console, "debug").mockImplementation(() => {});

    logger.debug("test debug");

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[DEBUG] test debug"));
    consoleSpy.mockRestore();
  });
  it("should log debug data", () => {
    const consoleSpy = jest.spyOn(console, "debug").mockImplementation(() => {});

    logger.debug("test debug", { message: "debug message" });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[DEBUG] test debug"));
    consoleSpy.mockRestore();
  });
  it("should log warn messages", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    logger.warn("test warn");

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[WARN] test warn"));
    consoleSpy.mockRestore();
  });
  it("should log error messages", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    logger.error("test error");

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[ERROR] test error"));
    consoleSpy.mockRestore();
  });
  it("should log error", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    logger.error("test error", Error("error message"));

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[ERROR] test error"));
    consoleSpy.mockRestore();
  });
});
