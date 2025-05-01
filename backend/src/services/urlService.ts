import { Prisma } from "../../generated/prisma";
import { configService } from "../config";
import prisma from "../db/prisma";
import { RetryOnCollision } from "../decorators/retry.decorator";
import { PaginatedResult, PaginationOptions, URLStatistics } from "../types/url";
import { logger } from "../utils/logger";

import { UrlEncoder } from "../utils/urlEncoder";

export class UrlService {
  private readonly baseUrl = configService.get("BASE_URL", "http://short.est");

  @RetryOnCollision(5, (attempt) => {
    logger.warn(`Collision detected when generating short URL. Retry attempt: ${attempt}`);
  })
  async createShortUrl(originalUrl: string): Promise<URLStatistics> {
    const shortPath = UrlEncoder.encode(originalUrl);
    logger.debug(`Generated short path: ${shortPath} for URL: ${originalUrl}`);

    const url = await prisma.$transaction(async (tx) => {
      const existingUrl = await tx.url.findFirst({
        where: { originalUrl },
      });

      if (existingUrl) {
        logger.info(`URL already exists: ${originalUrl}, returning existing record`);
        return existingUrl;
      }

      const existingPath = await tx.url.findUnique({
        where: { shortPath },
      });

      if (existingPath) {
        logger.warn(`Collision detected for path: ${shortPath}, rolling back transaction`);
        await tx.$queryRaw`ROLLBACK`;
        return null;
      }

      logger.debug(`Creating new URL record for: ${originalUrl} with path: ${shortPath}`);
      return tx.url.create({
        data: {
          originalUrl,
          shortPath,
          visitCount: 0,
        },
      });
    });

    if (!url) {
      throw new Error("Collision detected and transaction rolled back");
    }

    return {
      id: url.id,
      originalUrl: url.originalUrl,
      shortPath: url.shortPath,
      shortUrl: `${this.baseUrl}/${url.shortPath}`,
      createdAt: url.createdAt,
      visitCount: url.visitCount,
    };
  }

  async getOriginalUrl(shortPath: string): Promise<string> {
    const url = await prisma.$transaction(async (tx) => {
      const urlRecord = await tx.url.findUnique({
        where: { shortPath },
      });

      if (!urlRecord) {
        throw new Error("URL not found");
      }

      // Increment visit count
      const updatedUrl = await tx.url.update({
        where: { id: urlRecord.id },
        data: { visitCount: { increment: 1 } },
      });

      return updatedUrl;
    });

    return url.originalUrl;
  }

  async getUrlStatistics(shortPath: string): Promise<URLStatistics> {
    const url = await prisma.url.findUnique({
      where: { shortPath },
    });

    if (!url) {
      throw new Error("URL not found");
    }

    return {
      id: url.id,
      originalUrl: url.originalUrl,
      shortPath: url.shortPath,
      shortUrl: `${this.baseUrl}/${url.shortPath}`,
      createdAt: url.createdAt,
      visitCount: url.visitCount,
    };
  }

  async listUrls(searchTerm?: string, options: PaginationOptions = {}): Promise<PaginatedResult<URLStatistics>> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UrlWhereInput =
      searchTerm && searchTerm.length >= 3 ? { originalUrl: { contains: searchTerm, mode: "insensitive" } } : {};

    const total = await prisma.url.count({ where });

    const totalPages = Math.ceil(total / limit);

    const urls = await prisma.url.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const data = urls.map((url) => ({
      id: url.id,
      originalUrl: url.originalUrl,
      shortPath: url.shortPath,
      shortUrl: `${this.baseUrl}/${url.shortPath}`,
      createdAt: url.createdAt,
      visitCount: url.visitCount,
    }));

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
