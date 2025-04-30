import "./helpers/prisma-mock";

jest.mock("../src/utils/logger", () => {
  const originalModule = jest.requireActual("../src/utils/logger");
  return {
    ...originalModule,
    logger: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    },
  };
});

const originalPerformanceNow = performance.now;
beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2023-10-25T12:00:00Z"));

  performance.now = jest
    .fn()
    .mockReturnValueOnce(1000) // Start time
    .mockReturnValueOnce(1050); // End time (50ms later)
});

afterAll(() => {
  jest.useRealTimers();
  performance.now = originalPerformanceNow;
});
