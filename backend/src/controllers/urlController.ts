import { Request, Response } from "express";
import { Controller, Created, Redirect } from "../decorators/controller.decorator";
import { UrlService } from "../services/urlService";

export class UrlController {
  private readonly urlService: UrlService;

  constructor() {
    this.urlService = new UrlService();
  }

  /**
   * Encodes a long URL to a shortened URL
   */
  @Created()
  public async encode(req: Request, res: Response): Promise<any> {
    const { originalUrl } = req.body;

    const url = await this.urlService.createShortUrl(originalUrl);

    return {
      originalUrl: url.originalUrl,
      shortUrl: url.shortUrl,
    };
  }

  /**
   * Decodes a shortened URL to its original URL
   */
  @Controller()
  public async decode(req: Request, res: Response): Promise<any> {
    const { shortUrl } = req.body;

    const urlObj = new URL(shortUrl);
    const shortPath = urlObj.pathname.substring(1);

    const originalUrl = await this.urlService.getOriginalUrl(shortPath);

    return {
      shortUrl,
      originalUrl,
    };
  }

  /**
   * Redirects to the original URL
   */
  @Redirect()
  public async redirect(req: Request, res: Response): Promise<any> {
    const shortPath = req.params.url_path;
    return await this.urlService.getOriginalUrl(shortPath);
  }

  /**
   * Returns statistics for a short URL
   */
  @Controller()
  public async getStatistics(req: Request, res: Response): Promise<any> {
    const shortPath = req.params.url_path;
    return await this.urlService.getUrlStatistics(shortPath);
  }

  /**
   * Lists all URLs
   */
  @Controller()
  public async listUrls(req: Request, res: Response): Promise<any> {
    const searchTerm = req.query.search as string | undefined;
    return await this.urlService.listUrls(searchTerm);
  }
}
