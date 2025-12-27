'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { ContentCard } from '@/components/content-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { Movie, TVShow } from '@/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (searchQuery: string, page: number = 1) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&page=${page}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      const filteredResults = data.results.filter((item: any) => 
        item.media_type === 'movie' || item.media_type === 'tv' || (!item.media_type && (item.title || item.name))
      );
      
      setResults(filteredResults);
      // Only set total pages if we have results, otherwise calculate based on filtered results
      if (filteredResults.length > 0) {
        setTotalPages(data.total_pages);
      } else {
        // If no filtered results, we might be on a page beyond what has valid content
        setTotalPages(Math.max(1, currentPage - 1));
      }
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message);
      setResults([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query.trim());
    }
  };

  const handlePageChange = (page: number) => {
    performSearch(query.trim(), page);
  };

  const getContentType = (item: any): 'movie' | 'tv' => {
    return item.media_type === 'tv' || item.name ? 'tv' : 'movie';
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              type="text"
              placeholder="Search movies and TV shows..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 h-12"
            />
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                  Search
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Results */}
        {error && (
          <div className="text-center py-12">
            <p className="text-blue-400 text-lg">{error}</p>
          </div>
        )}

        {!error && !isLoading && query && results.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">No Results Found</h2>
            <p className="text-gray-400 mb-4">
              No movies or TV shows found for "{query}" on page {currentPage}.
            </p>
            {currentPage > 1 && (
              <Button
                onClick={() => handlePageChange(1)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Go to first page
              </Button>
            )}
          </div>
        )}

        {results.length > 0 && (
          <div >
            <div className="mx-auto max-w-[1400px]">
              <h1 className="text-2xl font-bold text-white">
                Search Results for "{query}" 
                <span className="text-gray-400 text-lg ml-2">
                  (Page {currentPage} of {totalPages})
                </span>
              </h1>
              <p className="text-gray-400 mt-1">
                {results.length} results on this page
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-x-3 gap-y-6 md:gap-y-10 mb-12">
              {results.map((item) => (
                <ContentCard
                  key={`${getContentType(item)}-${item.id}`}
                  content={item}
                  contentType={getContentType(item)}
                  size="sm"
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 bg-gray-800/50 rounded-lg p-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {(() => {
                      const maxVisible = 5;
                      const startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                      const endPage = Math.min(totalPages, startPage + maxVisible - 1);
                      const adjustedStartPage = Math.max(1, endPage - maxVisible + 1);
                      
                      const pages = [];
                      
                      // Add first page if not in range
                      if (adjustedStartPage > 1) {
                        pages.push(
                          <Button
                            key={1}
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(1)}
                            disabled={isLoading}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            1
                          </Button>
                        );
                        if (adjustedStartPage > 2) {
                          pages.push(
                            <span key="ellipsis1" className="text-gray-500 px-2">
                              ...
                            </span>
                          );
                        }
                      }
                      
                      // Add visible range
                      for (let i = adjustedStartPage; i <= endPage; i++) {
                        pages.push(
                          <Button
                            key={i}
                            variant={i === currentPage ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(i)}
                            disabled={isLoading}
                            className={i === currentPage 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                              : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            }
                          >
                            {i}
                          </Button>
                        );
                      }
                      
                      // Add last page if not in range
                      if (endPage < totalPages) {
                        if (endPage < totalPages - 1) {
                          pages.push(
                            <span key="ellipsis2" className="text-gray-500 px-2">
                              ...
                            </span>
                          );
                        }
                        pages.push(
                          <Button
                            key={totalPages}
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={isLoading}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            {totalPages}
                          </Button>
                        );
                      }
                      
                      return pages;
                    })()}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
                
                <div className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}