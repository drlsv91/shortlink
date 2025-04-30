import axios from "axios";
import { URL } from "../types/url";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:9900";

export const api = {
  /**
   * Shortens a URL
   */
  shortenUrl: async (originalUrl: string): Promise<{ originalUrl: string; shortUrl: string }> => {
    const response = await axios.post(`${API_URL}/api/encode`, { originalUrl });
    return response.data.data;
  },

  /**
   * Gets the original URL from a short URL
   */
  getOriginalUrl: async (shortUrl: string): Promise<{ originalUrl: string; shortUrl: string }> => {
    const response = await axios.post(`${API_URL}/api/decode`, { shortUrl });
    return response.data.data;
  },

  /**
   * Gets statistics for a URL
   */
  getUrlStatistics: async (shortPath: string): Promise<URL> => {
    const response = await axios.get(`${API_URL}/api/statistic/${shortPath}`);
    return response.data.data;
  },

  /**
   * Lists all URLs
   */
  listUrls: async (searchTerm?: string): Promise<URL[]> => {
    const url =
      searchTerm && searchTerm.length >= 3
        ? `${API_URL}/api/list?search=${encodeURIComponent(searchTerm)}`
        : `${API_URL}/api/list`;

    const response = await axios.get(url);
    return response.data.data;
  },
};
