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
