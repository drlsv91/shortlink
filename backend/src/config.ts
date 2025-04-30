import * as dotenv from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";
import { logger } from "./utils/logger";

/**
 * Provides type-safe access to configuration values with validation
 */
export class ConfigService {
  private envConfig!: { [key: string]: string };

  constructor(envFilePath: string = `.env`) {
    this.setEnvConfig(envFilePath);
  }
  setEnvConfig(envFilePath: string = `.env`) {
    const rootPath = resolve(process.cwd(), envFilePath);
    const fallbackPath = resolve(__dirname, "../../", envFilePath);

    const path = existsSync(rootPath) ? rootPath : existsSync(fallbackPath) ? fallbackPath : null;

    if (path) {
      this.envConfig = dotenv.config({ path }).parsed ?? {};
      logger.debug(`Loaded environment from ${path}`);
    } else {
      this.envConfig = process.env as any;
      logger.debug("Using process.env as environment config");
    }
  }

  /**
   * Get a configuration value by key with optional default value
   * @param key The configuration key to look up
   * @param defaultValue Optional default value if key is not found
   */
  get<T = string>(key: string, defaultValue?: T): T {
    const value = this.envConfig[key] ?? process.env[key] ?? defaultValue;

    if (value === undefined) {
      logger.warn(`Configuration key "${key}" is not defined and no default value was provided`);
      return value as T;
    }

    // Try to parse JSON if the value looks like JSON
    if (
      typeof value === "string" &&
      (value.startsWith("{") || value.startsWith("[")) &&
      (value.endsWith("}") || value.endsWith("]"))
    ) {
      try {
        return JSON.parse(value);
      } catch (e: any) {
        throw new Error(e.message);
      }
    }

    // Type conversion based on defaultValue type
    if (defaultValue !== undefined) {
      if (typeof defaultValue === "number") {
        return Number(value) as unknown as T;
      }
      if (typeof defaultValue === "boolean") {
        return (value === "true" || value === "1") as unknown as T;
      }
    }

    return value as T;
  }

  /**
   * Get a configuration value by key, throwing an error if it doesn't exist
   * @param key The configuration key to look up
   */
  getOrThrow<T = string>(key: string): T {
    const value = this.get<T>(key);

    if (value === undefined) {
      const error = `Configuration key "${key}" is required but not defined`;
      logger.error(error);
      throw new Error(error);
    }

    return value;
  }

  /**
   * Check if a configuration key exists
   * @param key The configuration key to check
   */
  has(key: string): boolean {
    return this.envConfig[key] !== undefined || process.env[key] !== undefined;
  }
}

export const configService = new ConfigService();
