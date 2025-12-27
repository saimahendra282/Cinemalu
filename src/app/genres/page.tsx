'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { ContentCard } from '@/components/content-card';
import { Button } from '@/components/ui/button';
import { 
  FilmIcon, 
  TvIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import type { Genre, Movie, TVShow } from '@/types';

export default function GenresPage() {
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');
  const [content, setContent] = useState<(Movie | TVShow)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    // Fetch genres
    fetch('/api/genres')
      .then(res => res.json())
      .then(data => {
        setMovieGenres(data.movie || []);
        setTvGenres(data.tv || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading genres:', err);
        setIsLoading(false);
      });
  }, []);

  const fetchContentByGenre = async (genre: Genre, type: 'movie' | 'tv', page: number = 1) => {
    setIsLoadingContent(true);
    try {
      const endpoint = type === 'movie' 
        ? `/api/movies/popular?with_genres=${genre.id}&page=${page}`
        : `/api/tv/popular?with_genres=${genre.id}&page=${page}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      setContent(data.results || []);
      setTotalPages(data.total_pages || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading content:', err);
      setContent([]);
    } finally {
      setIsLoadingContent(false);
    }
  };

  const handleGenreSelect = (genre: Genre) => {
    setSelectedGenre(genre);
    setCurrentPage(1);
    fetchContentByGenre(genre, contentType, 1);
  };

  const handleContentTypeChange = (type: 'movie' | 'tv') => {
    setContentType(type);
    if (selectedGenre) {
      setCurrentPage(1);
      fetchContentByGenre(selectedGenre, type, 1);
    }
  };

  const handlePageChange = (page: number) => {
    if (selectedGenre) {
      fetchContentByGenre(selectedGenre, contentType, page);
    }
  };

  const getCurrentGenres = () => {
    return contentType === 'movie' ? movieGenres : tvGenres;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Browse by Genre</h1>
          <p className="text-gray-400">Discover movies and TV shows by genre</p>
        </div>

        {/* Content Type Toggle */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant={contentType === 'movie' ? 'default' : 'outline'}
            onClick={() => handleContentTypeChange('movie')}
            className={contentType === 'movie' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'border-gray-600 text-gray-300 hover:bg-gray-700'
            }
          >
            <FilmIcon className="w-4 h-4 mr-2" />
            Movies
          </Button>
          <Button
            variant={contentType === 'tv' ? 'default' : 'outline'}
            onClick={() => handleContentTypeChange('tv')}
            className={contentType === 'tv' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'border-gray-600 text-gray-300 hover:bg-gray-700'
            }
          >
            <TvIcon className="w-4 h-4 mr-2" />
            TV Shows
          </Button>
        </div>

        {/* Genre Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
          {getCurrentGenres().map((genre) => (
            <Button
              key={genre.id}
              variant={selectedGenre?.id === genre.id ? 'default' : 'outline'}
              onClick={() => handleGenreSelect(genre)}
              className={`h-auto p-4 text-left justify-start ${
                selectedGenre?.id === genre.id
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                  : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
              }`}
            >
              <span className="font-medium">{genre.name}</span>
            </Button>
          ))}
        </div>

        {/* Selected Genre Content */}
        {selectedGenre && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedGenre.name} {contentType === 'movie' ? 'Movies' : 'TV Shows'}
              </h2>
              <p className="text-gray-400">
                {isLoadingContent ? 'Loading...' : `${content.length} results on page ${currentPage}`}
              </p>
            </div>

            {isLoadingContent ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-500"></div>
              </div>
            ) : content.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-x-4 gap-y-10 mb-12">
                  {content.map((item) => (
                    <ContentCard
                      key={item.id}
                      content={item}
                      contentType={contentType}
                      size="sm"
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 bg-gray-800/50 rounded-lg p-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const startPage = Math.max(1, currentPage - 2);
                        const page = startPage + i;
                        if (page > totalPages) return null;

                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={page === currentPage
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            }
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
                <p className="text-gray-400">
                  No {contentType === 'movie' ? 'movies' : 'TV shows'} found for {selectedGenre.name} genre.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!selectedGenre && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              {contentType === 'movie' ? (
                <FilmIcon className="w-12 h-12 text-gray-600" />
              ) : (
                <TvIcon className="w-12 h-12 text-gray-600" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Choose a Genre</h3>
            <p className="text-gray-400 text-lg">
              Select a genre above to discover amazing {contentType === 'movie' ? 'movies' : 'TV shows'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}