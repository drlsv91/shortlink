import { configService } from "../../src/config";
describe("config", () => {
  describe("configService.get", () => {
    it("should get string", () => {
      const port = configService.get("PORT");

      expect(port).toBeDefined();
    });
    it("should get boolean", () => {
      const logging = configService.get("logging", false);

      expect(logging).toBe(false);
    });
    it("should parse json", () => {
      const credential = configService.get("CREDENTIAL", '{"key":"123"}');

      expect(credential).toStrictEqual({ key: "123" });
    });
    it("should throw an error if json data is invalid", () => {
      expect(() => configService.get("CREDENTIAL", '{"key":"123"}}')).toThrow(Error);
    });
    it("should get default env", () => {
      const port = configService.get("PORTT", 3000);

      expect(port).toBe(3000);
    });
  });
  describe("configService.getOrThrow", () => {
    it("should throw an error", () => {
      expect(() => configService.getOrThrow("PORTT")).toThrow(Error);
    });
    it("should not throw an error", () => {
      const port = configService.getOrThrow("PORT");
      expect(port).toBeDefined();
    });
  });

  describe("configService.has", () => {
    it("should return true", () => {
      const port = configService.has("PORT");
      expect(port).toBe(true);
    });
    it("should return false", () => {
      const port = configService.has("PORTT");
      expect(port).toBe(false);
    });
  });

  describe("configService.setEnvConfig", () => {
    const env = configService.setEnvConfig(".env-test");
    expect(env).toBeUndefined();
  });
});
