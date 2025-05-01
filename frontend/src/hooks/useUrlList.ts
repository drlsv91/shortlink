import { useState, useEffect, useCallback, useRef } from "react";
import { Pagination, URL } from "../types/url";
import { api } from "../services/api";

export const useUrlList = () => {
  const [urls, setUrls] = useState<URL[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  //to track if this is the first render
  const isFirstRender = useRef(true);

  const fetchUrls = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.listUrls(searchTerm, page, 10);

      setUrls(response.data);
      setPagination(response.pagination);
    } catch (err: unknown) {
      console.error("Error fetching URLs:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      setUrls([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchUrls();
    isFirstRender.current = false;
  }, [fetchUrls]);

  // Only fetch when searchTerm or page changes, but not on initial render
  useEffect(() => {
    if (!isFirstRender.current) {
      fetchUrls();
    }
  }, [fetchUrls, searchTerm, page]);

  // Optimized search term handler with memoization
  const handleSearchChange = useCallback(
    (term: string) => {
      // If the new search term would trigger a search with the current implementation
      // (length >= 3 or empty) and the page isn't 1, reset the page first
      if ((term.length >= 3 || term.length === 0) && page !== 1) {
        setPage(1);
      } else {
        // Otherwise just update the search term
        setSearchTerm(term);
      }
    },
    [page]
  );

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const refreshUrls = useCallback(() => {
    fetchUrls();
  }, [fetchUrls]);

  return {
    urls,
    pagination,
    loading,
    error,
    searchTerm,
    setSearchTerm: handleSearchChange,
    page,
    handlePageChange,
    refreshUrls,
  };
};
