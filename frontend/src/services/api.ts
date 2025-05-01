import axios from "axios";
import { Pagination, URL } from "../types/url";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:9900";

export const api = {
  /**
   * Shortens a URL
   */
  shortenUrl: async (originalUrl: string): Promise<{ originalUrl: string; shortUrl: string }> => {
    const response = await axios.post(`${API_URL}/api/encode`, { originalUrl });
    return response.data.metadata;
  },

  /**
   * Gets the original URL from a short URL
   */
  getOriginalUrl: async (shortUrl: string): Promise<{ originalUrl: string; shortUrl: string }> => {
    const response = await axios.post(`${API_URL}/api/decode`, { shortUrl });
    return response.data.metadata;
  },

  /**
   * Gets statistics for a URL
   */
  getUrlStatistics: async (shortPath: string): Promise<URL> => {
    const response = await axios.get(`${API_URL}/api/statistic/${shortPath}`);
    return response.data.metadata;
  },

  /**
   * Lists all URLs
   */
  listUrls: async (
    searchTerm?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: URL[]; pagination: Pagination }> => {
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };

    if (searchTerm && searchTerm.length >= 3) {
      params.search = searchTerm;
    }
    const url = `${API_URL}/api/list`;

    const response = await axios.get(url, { params });
    return response.data.metadata;
  },
};
