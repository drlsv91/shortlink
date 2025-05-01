import React, { useState, useCallback } from "react";
import { Pagination, URL } from "../types/url";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface UrlListProps {
  urls: URL[];
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
}

const UrlList: React.FC<UrlListProps> = ({
  urls,
  pagination,
  loading,
  error,
  searchTerm,
  onSearchChange,
  onPageChange,
}) => {
  // Local state for the input field to prevent re-renders on parent component
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Debounce handler to only update parent when user stops typing
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalSearchTerm(newValue);

      // Use the browser's requestAnimationFrame for better performance
      const timeoutId = setTimeout(() => {
        onSearchChange(newValue);
      }, 500);

      return () => clearTimeout(timeoutId);
    },
    [onSearchChange]
  );

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Memoize the copy function to prevent re-creation on renders
  const handleCopy = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    toast("URL copied to clipboard!");
  }, []);

  return (
    <Card className="bg-white rounded-lg shadow-md">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Your URLs</h2>

        <div className="mb-4">
          <Label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search URLs
          </Label>
          <Input
            type="text"
            id="search"
            value={localSearchTerm}
            onChange={handleSearchChange}
            placeholder="Enter at least 3 characters to search"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {loading && <div className="text-center py-4">Loading...</div>}
      {error && <div className="text-red-600 py-4">{error}</div>}
      {urls?.length === 0 ? (
        <div className="text-gray-500 py-4 text-center">No URLs found</div>
      ) : (
        <CardContent className="overflow-x-auto p-0">
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Original URL
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Short URL
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visits
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {urls?.map((url) => (
                <TableRow key={url.id}>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                    <a
                      href={url.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      {url.originalUrl}
                    </a>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a
                      href={url.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      {url.shortUrl}
                    </a>
                    <Button
                      variant="outline"
                      onClick={() => handleCopy(url.shortUrl)}
                      className="ml-4 px-2 py-0.5 text-xs"
                    >
                      Copy
                    </Button>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(url.createdAt)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{url.visitCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      )}

      {pagination && pagination.total > 0 && (
        <CardFooter className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
            <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{" "}
            <span className="font-medium">{pagination.total}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={!pagination.hasPrevPage}
              className="hidden sm:flex"
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.totalPages)}
              disabled={!pagination.hasNextPage}
              className="hidden sm:flex"
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default React.memo(UrlList);
