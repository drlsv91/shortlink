import { UrlEncoder } from "../../src/utils/urlEncoder";
describe("URL Encoder", () => {
  describe("encode", () => {
    it("should generate a short URL of the correct length", () => {
      const code = UrlEncoder.encode("http:example.com");
      expect(code.length).toBe(7);
    });
  });
});
