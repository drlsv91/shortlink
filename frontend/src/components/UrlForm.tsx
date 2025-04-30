import React, { useState } from "react";
import { useUrlShortener } from "../hooks/useUrlShortener";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface UrlFormProps {
  onShortenSuccess: () => void;
}

const UrlForm: React.FC<UrlFormProps> = ({ onShortenSuccess }) => {
  const [url, setUrl] = useState<string>("");
  const { shortenUrl, loading, error, result } = useUrlShortener();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) return;

    const data = await shortenUrl(url);

    if (data) {
      setUrl("");
      onShortenSuccess();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Shorten a URL</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
            Enter a long URL
          </label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {loading ? "Shortening..." : "Shorten"}
        </Button>
      </form>

      {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}

      {result && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-medium text-gray-900">Your shortened URL:</h3>
          <div className="mt-2 break-all">
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-500"
            >
              {result.shortUrl}
            </a>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(result.shortUrl);
              toast("URL copied to clipboard!");
            }}
            className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
};

export default UrlForm;
