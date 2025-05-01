import React from "react";
import { useUrlList } from "../hooks/useUrlList";
import UrlForm from "../components/UrlForm";
import UrlList from "../components/UrlList";

const HomePage: React.FC = () => {
  const { urls, pagination, loading, error, searchTerm, setSearchTerm, handlePageChange, refreshUrls } = useUrlList();

  return (
    <div className="mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">ShortLink</h1>
        <p className="mt-2 text-xl text-gray-600">A simple URL shortening service</p>
      </div>

      <div className="max-w-2xl mx-auto mb-8">
        <UrlForm onShortenSuccess={refreshUrls} />
      </div>

      <div className="max-w-4xl mx-auto">
        <UrlList
          urls={urls}
          pagination={pagination}
          loading={loading}
          error={error}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default HomePage;
