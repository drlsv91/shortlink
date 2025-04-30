import { useState, useEffect } from "react";
import { URL } from "../types/url";
import { api } from "../services/api";

export const useUrlList = () => {
  const [urls, setUrls] = useState<URL[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchUrls = async (search?: string) => {
    try {
      setLoading(true);
      setError(null);

      const data = await api.listUrls(search);

      setUrls(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUrls();
  }, []);

  // Search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm === "" || searchTerm.length >= 3) {
        fetchUrls(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return { urls, loading, error, searchTerm, setSearchTerm, refreshUrls: fetchUrls };
};
