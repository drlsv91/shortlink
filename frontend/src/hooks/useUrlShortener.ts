import { useState } from "react";
import { api } from "../services/api";

export const useUrlShortener = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ originalUrl: string; shortUrl: string } | null>(null);

  const shortenUrl = async (originalUrl: string) => {
    try {
      setLoading(true);
      setError(null);

      const data = await api.shortenUrl(originalUrl);

      setResult(data);
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { shortenUrl, loading, error, result };
};
