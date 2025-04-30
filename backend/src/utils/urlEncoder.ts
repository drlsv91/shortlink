import crypto from "crypto";

export class UrlEncoder {
  private static readonly BASE62_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  private static readonly SHORT_URL_LENGTH = 7;

  /**
   * Generates a short URL path from the original URL
   * Uses a combination of hashing and encoding to ensure uniqueness
   */
  static encode(url: string): string {
    // Create a hash from the URL and current timestamp
    const timestamp = new Date().getTime().toString();
    const data = url + timestamp;
    const hash = crypto.createHash("sha256").update(data).digest("hex");

    let shortPath = "";

    for (let i = 0; i < this.SHORT_URL_LENGTH; i++) {
      // Use modulo of hash value for each position to get index in the BASE62_CHARS
      // We read 2 hex chars (1 byte) at a time from the hash
      const hexSegment = hash.slice(i * 2, i * 2 + 2);
      const value = parseInt(hexSegment, 16);

      shortPath += this.BASE62_CHARS[value % this.BASE62_CHARS.length];
    }

    return shortPath;
  }
}
