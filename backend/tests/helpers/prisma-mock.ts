import { PrismaClient } from "../../generated/prisma";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

jest.mock("../../src/db/prisma.ts", () => ({
  __esModule: true,
  default: prismaMock,
}));

beforeEach(() => {
  mockReset(prismaMock);

  prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock));
});
